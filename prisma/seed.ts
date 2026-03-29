import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';

const dbPath = path.join(__dirname, 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

// ── Helpers ──────────────────────────────────────────────────────────────

function date(iso: string) {
  return new Date(iso);
}

async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

// ── Biomarker template builder ───────────────────────────────────────────

interface BiomarkerInput {
  rawName: string;
  rawValue: string;
  rawUnit: string;
  rawRange: string;
  normalizedCode: string;
  normalizedValue: number;
  normalizedUnit: string;
  statusLevel: 'normal' | 'borderline' | 'abnormal' | 'urgent';
  rawFlag?: string;
}

function biomarker(reportId: string, input: BiomarkerInput) {
  return {
    reportId,
    rawName: input.rawName,
    rawValue: input.rawValue,
    rawUnit: input.rawUnit,
    rawRange: input.rawRange,
    rawFlag: input.rawFlag ?? null,
    confidence: 0.95,
    normalizedCode: input.normalizedCode,
    normalizedValue: input.normalizedValue,
    normalizedUnit: input.normalizedUnit,
    statusLevel: input.statusLevel,
    userCorrected: false,
  };
}

// ── Seed ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding BloodInsight database...');

  // Clean existing data
  await prisma.interpretation.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.clinicalPattern.deleteMany();
  await prisma.extractedBiomarker.deleteMany();
  await prisma.labReport.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await hashPassword('demo123');

  // ── Users ────────────────────────────────────────────────────────────

  const sarah = await prisma.user.create({
    data: {
      email: 'demo@bloodinsight.app',
      name: 'Sarah Chen',
      passwordHash,
      sex: 'female',
      dateOfBirth: date('1989-05-15'),
    },
  });

  const john = await prisma.user.create({
    data: {
      email: 'john@bloodinsight.app',
      name: 'John Martinez',
      passwordHash,
      sex: 'male',
      dateOfBirth: date('1969-08-22'),
    },
  });

  console.log(`  ✓ Users: ${sarah.name}, ${john.name}`);

  // ── Lab Reports ──────────────────────────────────────────────────────

  const sarahReport1 = await prisma.labReport.create({
    data: {
      userId: sarah.id,
      labName: 'HealthFirst Laboratory',
      reportDate: date('2024-03-15'),
      uploadDate: date('2024-03-16'),
      fileName: 'healthfirst-march-2024.pdf',
      fileType: 'pdf',
      status: 'interpreted',
    },
  });

  const sarahReport2 = await prisma.labReport.create({
    data: {
      userId: sarah.id,
      labName: 'HealthFirst Laboratory',
      reportDate: date('2024-06-10'),
      uploadDate: date('2024-06-11'),
      fileName: 'healthfirst-june-2024.pdf',
      fileType: 'pdf',
      status: 'interpreted',
    },
  });

  const sarahReport3 = await prisma.labReport.create({
    data: {
      userId: sarah.id,
      labName: 'HealthFirst Laboratory',
      reportDate: date('2024-09-20'),
      uploadDate: date('2024-09-21'),
      fileName: 'healthfirst-september-2024.pdf',
      fileType: 'pdf',
      status: 'interpreted',
    },
  });

  const johnReport1 = await prisma.labReport.create({
    data: {
      userId: john.id,
      labName: 'CityMed Labs',
      reportDate: date('2024-03-22'),
      uploadDate: date('2024-03-23'),
      fileName: 'citymed-march-2024.pdf',
      fileType: 'pdf',
      status: 'interpreted',
    },
  });

  console.log('  ✓ Lab reports: 3 for Sarah, 1 for John');

  // ── Sarah Report 1 (March) — several abnormalities ──────────────────

  const sarahR1Biomarkers: BiomarkerInput[] = [
    { rawName: 'Ferritin', rawValue: '15', rawUnit: 'ng/mL', rawRange: '20-200', normalizedCode: 'FERRITIN', normalizedValue: 15, normalizedUnit: 'ng/mL', statusLevel: 'abnormal', rawFlag: 'L' },
    { rawName: 'Hemoglobin', rawValue: '11.2', rawUnit: 'g/dL', rawRange: '12.0-16.0', normalizedCode: 'HGB', normalizedValue: 11.2, normalizedUnit: 'g/dL', statusLevel: 'abnormal', rawFlag: 'L' },
    { rawName: 'LDL Cholesterol', rawValue: '165', rawUnit: 'mg/dL', rawRange: '<130', normalizedCode: 'LDL', normalizedValue: 165, normalizedUnit: 'mg/dL', statusLevel: 'abnormal', rawFlag: 'H' },
    { rawName: 'Triglycerides', rawValue: '220', rawUnit: 'mg/dL', rawRange: '<150', normalizedCode: 'TRIG', normalizedValue: 220, normalizedUnit: 'mg/dL', statusLevel: 'abnormal', rawFlag: 'H' },
    { rawName: 'Vitamin D, 25-OH', rawValue: '18', rawUnit: 'ng/mL', rawRange: '30-100', normalizedCode: 'VIT_D', normalizedValue: 18, normalizedUnit: 'ng/mL', statusLevel: 'abnormal', rawFlag: 'L' },
    { rawName: 'HbA1c', rawValue: '5.8', rawUnit: '%', rawRange: '<5.7', normalizedCode: 'HBA1C', normalizedValue: 5.8, normalizedUnit: '%', statusLevel: 'borderline', rawFlag: 'H' },
    { rawName: 'C-Reactive Protein', rawValue: '4.5', rawUnit: 'mg/L', rawRange: '<3.0', normalizedCode: 'CRP', normalizedValue: 4.5, normalizedUnit: 'mg/L', statusLevel: 'abnormal', rawFlag: 'H' },
    { rawName: 'White Blood Cells', rawValue: '6.8', rawUnit: 'K/uL', rawRange: '4.5-11.0', normalizedCode: 'WBC', normalizedValue: 6.8, normalizedUnit: 'K/uL', statusLevel: 'normal' },
    { rawName: 'Platelets', rawValue: '245', rawUnit: 'K/uL', rawRange: '150-400', normalizedCode: 'PLT', normalizedValue: 245, normalizedUnit: 'K/uL', statusLevel: 'normal' },
    { rawName: 'Glucose, Fasting', rawValue: '92', rawUnit: 'mg/dL', rawRange: '70-100', normalizedCode: 'GLUCOSE', normalizedValue: 92, normalizedUnit: 'mg/dL', statusLevel: 'normal' },
    { rawName: 'Creatinine', rawValue: '0.8', rawUnit: 'mg/dL', rawRange: '0.6-1.2', normalizedCode: 'CREATININE', normalizedValue: 0.8, normalizedUnit: 'mg/dL', statusLevel: 'normal' },
    { rawName: 'TSH', rawValue: '2.1', rawUnit: 'mIU/L', rawRange: '0.4-4.0', normalizedCode: 'TSH', normalizedValue: 2.1, normalizedUnit: 'mIU/L', statusLevel: 'normal' },
  ];

  const createdR1 = await prisma.extractedBiomarker.createManyAndReturn({
    data: sarahR1Biomarkers.map((b) => biomarker(sarahReport1.id, b)),
  });

  // ── Sarah Report 2 (June) — improving ──────────────────────────────

  const sarahR2Biomarkers: BiomarkerInput[] = [
    { rawName: 'Ferritin', rawValue: '28', rawUnit: 'ng/mL', rawRange: '20-200', normalizedCode: 'FERRITIN', normalizedValue: 28, normalizedUnit: 'ng/mL', statusLevel: 'normal' },
    { rawName: 'Hemoglobin', rawValue: '12.0', rawUnit: 'g/dL', rawRange: '12.0-16.0', normalizedCode: 'HGB', normalizedValue: 12.0, normalizedUnit: 'g/dL', statusLevel: 'normal' },
    { rawName: 'LDL Cholesterol', rawValue: '145', rawUnit: 'mg/dL', rawRange: '<130', normalizedCode: 'LDL', normalizedValue: 145, normalizedUnit: 'mg/dL', statusLevel: 'borderline', rawFlag: 'H' },
    { rawName: 'Triglycerides', rawValue: '180', rawUnit: 'mg/dL', rawRange: '<150', normalizedCode: 'TRIG', normalizedValue: 180, normalizedUnit: 'mg/dL', statusLevel: 'borderline', rawFlag: 'H' },
    { rawName: 'Vitamin D, 25-OH', rawValue: '32', rawUnit: 'ng/mL', rawRange: '30-100', normalizedCode: 'VIT_D', normalizedValue: 32, normalizedUnit: 'ng/mL', statusLevel: 'normal' },
    { rawName: 'HbA1c', rawValue: '5.9', rawUnit: '%', rawRange: '<5.7', normalizedCode: 'HBA1C', normalizedValue: 5.9, normalizedUnit: '%', statusLevel: 'borderline', rawFlag: 'H' },
    { rawName: 'C-Reactive Protein', rawValue: '2.1', rawUnit: 'mg/L', rawRange: '<3.0', normalizedCode: 'CRP', normalizedValue: 2.1, normalizedUnit: 'mg/L', statusLevel: 'normal' },
    { rawName: 'White Blood Cells', rawValue: '7.1', rawUnit: 'K/uL', rawRange: '4.5-11.0', normalizedCode: 'WBC', normalizedValue: 7.1, normalizedUnit: 'K/uL', statusLevel: 'normal' },
    { rawName: 'Platelets', rawValue: '238', rawUnit: 'K/uL', rawRange: '150-400', normalizedCode: 'PLT', normalizedValue: 238, normalizedUnit: 'K/uL', statusLevel: 'normal' },
    { rawName: 'Glucose, Fasting', rawValue: '95', rawUnit: 'mg/dL', rawRange: '70-100', normalizedCode: 'GLUCOSE', normalizedValue: 95, normalizedUnit: 'mg/dL', statusLevel: 'normal' },
    { rawName: 'Creatinine', rawValue: '0.7', rawUnit: 'mg/dL', rawRange: '0.6-1.2', normalizedCode: 'CREATININE', normalizedValue: 0.7, normalizedUnit: 'mg/dL', statusLevel: 'normal' },
    { rawName: 'TSH', rawValue: '1.9', rawUnit: 'mIU/L', rawRange: '0.4-4.0', normalizedCode: 'TSH', normalizedValue: 1.9, normalizedUnit: 'mIU/L', statusLevel: 'normal' },
  ];

  await prisma.extractedBiomarker.createMany({
    data: sarahR2Biomarkers.map((b) => biomarker(sarahReport2.id, b)),
  });

  // ── Sarah Report 3 (September) — mostly normalized ─────────────────

  const sarahR3Biomarkers: BiomarkerInput[] = [
    { rawName: 'Ferritin', rawValue: '45', rawUnit: 'ng/mL', rawRange: '20-200', normalizedCode: 'FERRITIN', normalizedValue: 45, normalizedUnit: 'ng/mL', statusLevel: 'normal' },
    { rawName: 'Hemoglobin', rawValue: '13.1', rawUnit: 'g/dL', rawRange: '12.0-16.0', normalizedCode: 'HGB', normalizedValue: 13.1, normalizedUnit: 'g/dL', statusLevel: 'normal' },
    { rawName: 'LDL Cholesterol', rawValue: '128', rawUnit: 'mg/dL', rawRange: '<130', normalizedCode: 'LDL', normalizedValue: 128, normalizedUnit: 'mg/dL', statusLevel: 'normal' },
    { rawName: 'Triglycerides', rawValue: '155', rawUnit: 'mg/dL', rawRange: '<150', normalizedCode: 'TRIG', normalizedValue: 155, normalizedUnit: 'mg/dL', statusLevel: 'borderline', rawFlag: 'H' },
    { rawName: 'Vitamin D, 25-OH', rawValue: '38', rawUnit: 'ng/mL', rawRange: '30-100', normalizedCode: 'VIT_D', normalizedValue: 38, normalizedUnit: 'ng/mL', statusLevel: 'normal' },
    { rawName: 'HbA1c', rawValue: '5.7', rawUnit: '%', rawRange: '<5.7', normalizedCode: 'HBA1C', normalizedValue: 5.7, normalizedUnit: '%', statusLevel: 'borderline' },
    { rawName: 'C-Reactive Protein', rawValue: '1.2', rawUnit: 'mg/L', rawRange: '<3.0', normalizedCode: 'CRP', normalizedValue: 1.2, normalizedUnit: 'mg/L', statusLevel: 'normal' },
    { rawName: 'White Blood Cells', rawValue: '6.5', rawUnit: 'K/uL', rawRange: '4.5-11.0', normalizedCode: 'WBC', normalizedValue: 6.5, normalizedUnit: 'K/uL', statusLevel: 'normal' },
    { rawName: 'Platelets', rawValue: '250', rawUnit: 'K/uL', rawRange: '150-400', normalizedCode: 'PLT', normalizedValue: 250, normalizedUnit: 'K/uL', statusLevel: 'normal' },
    { rawName: 'Glucose, Fasting', rawValue: '88', rawUnit: 'mg/dL', rawRange: '70-100', normalizedCode: 'GLUCOSE', normalizedValue: 88, normalizedUnit: 'mg/dL', statusLevel: 'normal' },
    { rawName: 'Creatinine', rawValue: '0.8', rawUnit: 'mg/dL', rawRange: '0.6-1.2', normalizedCode: 'CREATININE', normalizedValue: 0.8, normalizedUnit: 'mg/dL', statusLevel: 'normal' },
    { rawName: 'TSH', rawValue: '2.3', rawUnit: 'mIU/L', rawRange: '0.4-4.0', normalizedCode: 'TSH', normalizedValue: 2.3, normalizedUnit: 'mIU/L', statusLevel: 'normal' },
  ];

  await prisma.extractedBiomarker.createMany({
    data: sarahR3Biomarkers.map((b) => biomarker(sarahReport3.id, b)),
  });

  // ── John Report 1 (March) — CRITICAL kidney/diabetes ───────────────

  const johnR1Biomarkers: BiomarkerInput[] = [
    { rawName: 'Potassium', rawValue: '6.2', rawUnit: 'mEq/L', rawRange: '3.5-5.0', normalizedCode: 'K', normalizedValue: 6.2, normalizedUnit: 'mEq/L', statusLevel: 'urgent', rawFlag: 'HH' },
    { rawName: 'Creatinine', rawValue: '3.8', rawUnit: 'mg/dL', rawRange: '0.7-1.3', normalizedCode: 'CREATININE', normalizedValue: 3.8, normalizedUnit: 'mg/dL', statusLevel: 'urgent', rawFlag: 'HH' },
    { rawName: 'eGFR', rawValue: '18', rawUnit: 'mL/min/1.73m2', rawRange: '>60', normalizedCode: 'EGFR', normalizedValue: 18, normalizedUnit: 'mL/min/1.73m2', statusLevel: 'urgent', rawFlag: 'LL' },
    { rawName: 'BUN', rawValue: '52', rawUnit: 'mg/dL', rawRange: '7-20', normalizedCode: 'BUN', normalizedValue: 52, normalizedUnit: 'mg/dL', statusLevel: 'abnormal', rawFlag: 'H' },
    { rawName: 'Hemoglobin', rawValue: '8.5', rawUnit: 'g/dL', rawRange: '13.5-17.5', normalizedCode: 'HGB', normalizedValue: 8.5, normalizedUnit: 'g/dL', statusLevel: 'abnormal', rawFlag: 'L' },
    { rawName: 'Glucose, Fasting', rawValue: '320', rawUnit: 'mg/dL', rawRange: '70-100', normalizedCode: 'GLUCOSE', normalizedValue: 320, normalizedUnit: 'mg/dL', statusLevel: 'urgent', rawFlag: 'HH' },
    { rawName: 'HbA1c', rawValue: '9.2', rawUnit: '%', rawRange: '<5.7', normalizedCode: 'HBA1C', normalizedValue: 9.2, normalizedUnit: '%', statusLevel: 'abnormal', rawFlag: 'H' },
    { rawName: 'Sodium', rawValue: '138', rawUnit: 'mEq/L', rawRange: '136-145', normalizedCode: 'NA', normalizedValue: 138, normalizedUnit: 'mEq/L', statusLevel: 'normal' },
    { rawName: 'White Blood Cells', rawValue: '8.2', rawUnit: 'K/uL', rawRange: '4.5-11.0', normalizedCode: 'WBC', normalizedValue: 8.2, normalizedUnit: 'K/uL', statusLevel: 'normal' },
    { rawName: 'Platelets', rawValue: '198', rawUnit: 'K/uL', rawRange: '150-400', normalizedCode: 'PLT', normalizedValue: 198, normalizedUnit: 'K/uL', statusLevel: 'normal' },
  ];

  const createdJR1 = await prisma.extractedBiomarker.createManyAndReturn({
    data: johnR1Biomarkers.map((b) => biomarker(johnReport1.id, b)),
  });

  console.log('  ✓ Biomarkers: 12+12+12 for Sarah, 10 for John');

  // ── Interpretations (key abnormal biomarkers) ──────────────────────

  // Helper to find biomarker by code from created records
  const findBiomarker = (records: typeof createdR1, code: string) =>
    records.find((r) => r.normalizedCode === code)!;

  // Sarah Report 1 interpretations
  const sarahR1Ferritin = findBiomarker(createdR1, 'FERRITIN');
  const sarahR1HGB = findBiomarker(createdR1, 'HGB');
  const sarahR1LDL = findBiomarker(createdR1, 'LDL');
  const sarahR1CRP = findBiomarker(createdR1, 'CRP');
  const sarahR1VitD = findBiomarker(createdR1, 'VIT_D');

  await prisma.interpretation.createMany({
    data: [
      {
        biomarkerId: sarahR1Ferritin.id,
        summary: 'Low ferritin indicates depleted iron stores',
        explanation: 'Ferritin at 15 ng/mL is below the optimal range of 20-200 ng/mL. This indicates your body\'s iron reserves are significantly depleted, which is a common finding in premenopausal women.',
        significance: 'Iron deficiency can cause fatigue, weakness, and impaired cognitive function. Combined with low hemoglobin, this suggests iron-deficiency anemia.',
        lifestyleActions: JSON.stringify(['Increase iron-rich foods: red meat, spinach, lentils, fortified cereals', 'Pair iron foods with vitamin C to enhance absorption', 'Avoid tea/coffee within 1 hour of iron-rich meals', 'Consider iron supplementation after discussing with your doctor']),
        followUp: JSON.stringify(['Recheck ferritin and CBC in 3 months', 'Consider iron studies panel if not improving']),
      },
      {
        biomarkerId: sarahR1HGB.id,
        summary: 'Hemoglobin below normal range — mild anemia',
        explanation: 'Hemoglobin at 11.2 g/dL is below the female reference range of 12.0-16.0 g/dL. Combined with low ferritin, this confirms iron-deficiency anemia.',
        significance: 'Mild anemia may cause fatigue, shortness of breath during exertion, and pallor. This is likely due to iron deficiency.',
        lifestyleActions: JSON.stringify(['Follow iron supplementation plan', 'Moderate exercise — avoid overexertion until resolved', 'Monitor energy levels and report worsening symptoms']),
        followUp: JSON.stringify(['Recheck CBC in 3 months', 'If not improving, consider further workup for causes of iron loss']),
      },
      {
        biomarkerId: sarahR1LDL.id,
        summary: 'Elevated LDL cholesterol increases cardiovascular risk',
        explanation: 'LDL at 165 mg/dL is above the desirable level of <130 mg/dL. Combined with elevated triglycerides (220 mg/dL), this indicates dyslipidemia.',
        significance: 'Elevated LDL contributes to arterial plaque buildup and increases risk of heart disease and stroke over time.',
        lifestyleActions: JSON.stringify(['Reduce saturated fat intake (red meat, full-fat dairy, fried foods)', 'Increase soluble fiber (oats, beans, fruits)', 'Exercise 150+ minutes/week of moderate aerobic activity', 'Consider Mediterranean-style diet']),
        followUp: JSON.stringify(['Recheck lipid panel in 3-6 months after lifestyle changes', 'Discuss statin therapy if not improving']),
      },
      {
        biomarkerId: sarahR1CRP.id,
        summary: 'Elevated CRP suggests systemic inflammation',
        explanation: 'CRP at 4.5 mg/L is above the normal range of <3.0 mg/L. This is a non-specific marker of inflammation and may be related to the iron deficiency or other factors.',
        significance: 'Chronic low-grade inflammation is associated with increased cardiovascular risk and may indicate an underlying condition.',
        lifestyleActions: JSON.stringify(['Anti-inflammatory diet: omega-3 rich fish, colorful vegetables, turmeric', 'Regular exercise to reduce inflammation', 'Ensure adequate sleep (7-9 hours)', 'Manage stress through meditation or relaxation techniques']),
        followUp: JSON.stringify(['Recheck CRP in 3 months', 'If persistently elevated, investigate underlying causes']),
      },
      {
        biomarkerId: sarahR1VitD.id,
        summary: 'Vitamin D deficiency detected',
        explanation: 'Vitamin D at 18 ng/mL is below the sufficient range of 30-100 ng/mL. This is a common deficiency, especially in individuals with limited sun exposure.',
        significance: 'Low vitamin D is linked to weakened bones, impaired immune function, fatigue, and mood disturbances.',
        lifestyleActions: JSON.stringify(['Vitamin D3 supplementation (2000-4000 IU daily — confirm with doctor)', 'Increase sun exposure 10-15 minutes daily when possible', 'Include vitamin D rich foods: fatty fish, egg yolks, fortified milk']),
        followUp: JSON.stringify(['Recheck vitamin D in 3 months after supplementation']),
      },
    ],
  });

  // John Report 1 interpretations (critical)
  const johnR1K = findBiomarker(createdJR1, 'K');
  const johnR1Creat = findBiomarker(createdJR1, 'CREATININE');
  const johnR1EGFR = findBiomarker(createdJR1, 'EGFR');
  const johnR1Glucose = findBiomarker(createdJR1, 'GLUCOSE');
  const johnR1HBA1C = findBiomarker(createdJR1, 'HBA1C');

  await prisma.interpretation.createMany({
    data: [
      {
        biomarkerId: johnR1K.id,
        summary: 'CRITICAL: Dangerously elevated potassium',
        explanation: 'Potassium at 6.2 mEq/L is critically above the normal range of 3.5-5.0 mEq/L. This is likely related to severely impaired kidney function (eGFR 18).',
        significance: 'Hyperkalemia at this level can cause life-threatening cardiac arrhythmias. This requires immediate medical attention.',
        lifestyleActions: JSON.stringify(['URGENT: Contact your physician immediately', 'Avoid high-potassium foods until cleared by doctor', 'Do not take potassium supplements or salt substitutes']),
        followUp: JSON.stringify(['Immediate physician consultation required', 'ECG recommended to assess cardiac effects', 'Repeat potassium level within 24-48 hours']),
      },
      {
        biomarkerId: johnR1Creat.id,
        summary: 'Severely elevated creatinine — advanced kidney impairment',
        explanation: 'Creatinine at 3.8 mg/dL is nearly 3x the upper limit of normal (1.3 mg/dL). Combined with eGFR of 18, this indicates Stage 4 chronic kidney disease.',
        significance: 'Severe kidney impairment affects the body\'s ability to filter waste, regulate electrolytes, and maintain fluid balance.',
        lifestyleActions: JSON.stringify(['Follow nephrologist dietary recommendations strictly', 'Limit protein, sodium, potassium, and phosphorus intake', 'Stay well hydrated but follow fluid restrictions if prescribed', 'Avoid NSAIDs and nephrotoxic medications']),
        followUp: JSON.stringify(['Urgent nephrology referral if not already established', 'Monitor kidney function every 1-3 months', 'Discuss kidney disease management plan']),
      },
      {
        biomarkerId: johnR1EGFR.id,
        summary: 'CRITICAL: eGFR indicates Stage 4 kidney disease',
        explanation: 'eGFR at 18 mL/min/1.73m2 is severely below normal (>60). Stage 4 CKD means the kidneys are functioning at approximately 15-29% capacity.',
        significance: 'At this stage, preparation for possible dialysis or transplant should be discussed. Strict management is essential to slow progression.',
        lifestyleActions: JSON.stringify(['Follow renal diet strictly', 'Monitor blood pressure daily — target <130/80', 'Avoid nephrotoxic substances including OTC pain relievers', 'Maintain regular nephrology appointments']),
        followUp: JSON.stringify(['Nephrology follow-up every 1-2 months', 'Discuss renal replacement therapy planning', 'Monitor for uremic symptoms']),
      },
      {
        biomarkerId: johnR1Glucose.id,
        summary: 'CRITICAL: Severely elevated fasting glucose',
        explanation: 'Fasting glucose at 320 mg/dL is more than 3x the normal upper limit of 100 mg/dL. Combined with HbA1c of 9.2%, this indicates poorly controlled diabetes mellitus.',
        significance: 'Uncontrolled diabetes at this level causes ongoing damage to blood vessels, kidneys, nerves, and eyes. This is likely contributing to the kidney disease.',
        lifestyleActions: JSON.stringify(['URGENT: Contact your physician for medication adjustment', 'Monitor blood glucose multiple times daily', 'Follow strict diabetic diet with carbohydrate counting', 'Regular physical activity as tolerated']),
        followUp: JSON.stringify(['Urgent endocrinology or primary care follow-up', 'Medication review and adjustment needed', 'Check for diabetic complications: eye exam, foot exam, urine albumin']),
      },
      {
        biomarkerId: johnR1HBA1C.id,
        summary: 'HbA1c confirms poorly controlled diabetes',
        explanation: 'HbA1c at 9.2% reflects an average blood glucose of approximately 220 mg/dL over the past 3 months. The target for most adults with diabetes is <7%.',
        significance: 'Persistently elevated HbA1c significantly increases risk of diabetic complications including neuropathy, retinopathy, and nephropathy.',
        lifestyleActions: JSON.stringify(['Work with healthcare team to intensify diabetes management', 'Consider diabetes education program', 'Regular meal timing and consistent carbohydrate intake', 'Daily foot inspection for sores or changes']),
        followUp: JSON.stringify(['Recheck HbA1c in 3 months after treatment adjustment', 'Annual diabetic eye exam', 'Regular kidney function monitoring']),
      },
    ],
  });

  console.log('  ✓ Interpretations: 5 for Sarah R1, 5 for John R1');

  // ── Alerts ─────────────────────────────────────────────────────────

  // Sarah alerts (warning level)
  await prisma.alert.createMany({
    data: [
      {
        reportId: sarahReport1.id,
        biomarkerCode: 'FERRITIN',
        severity: 'warning',
        value: 15,
        unit: 'ng/mL',
        message: 'Low ferritin indicates depleted iron stores. Combined with low hemoglobin, iron-deficiency anemia is likely.',
        action: 'Schedule appointment to discuss iron supplementation. Recheck in 3 months.',
      },
      {
        reportId: sarahReport1.id,
        biomarkerCode: 'TRIG',
        severity: 'warning',
        value: 220,
        unit: 'mg/dL',
        message: 'Triglycerides significantly elevated. Combined with high LDL, cardiovascular risk is increased.',
        action: 'Dietary modifications and exercise recommended. Follow up in 3-6 months.',
      },
    ],
  });

  // John alerts (critical)
  await prisma.alert.createMany({
    data: [
      {
        reportId: johnReport1.id,
        biomarkerCode: 'K',
        severity: 'critical',
        value: 6.2,
        unit: 'mEq/L',
        message: 'CRITICAL: Potassium at 6.2 mEq/L poses immediate risk of cardiac arrhythmia.',
        action: 'Seek immediate medical attention. ECG and repeat potassium needed urgently.',
      },
      {
        reportId: johnReport1.id,
        biomarkerCode: 'EGFR',
        severity: 'critical',
        value: 18,
        unit: 'mL/min/1.73m2',
        message: 'CRITICAL: eGFR of 18 indicates Stage 4 chronic kidney disease. Kidneys functioning at ~18% capacity.',
        action: 'Urgent nephrology referral required. Discuss renal replacement therapy planning.',
      },
      {
        reportId: johnReport1.id,
        biomarkerCode: 'GLUCOSE',
        severity: 'critical',
        value: 320,
        unit: 'mg/dL',
        message: 'CRITICAL: Fasting glucose severely elevated at 320 mg/dL. Poorly controlled diabetes.',
        action: 'Urgent physician contact for medication adjustment. Monitor glucose frequently.',
      },
      {
        reportId: johnReport1.id,
        biomarkerCode: 'CREATININE',
        severity: 'critical',
        value: 3.8,
        unit: 'mg/dL',
        message: 'Creatinine nearly 3x upper limit. Confirms severe kidney impairment consistent with Stage 4 CKD.',
        action: 'Nephrology management essential. Avoid nephrotoxic medications.',
      },
      {
        reportId: johnReport1.id,
        biomarkerCode: 'HGB',
        severity: 'warning',
        value: 8.5,
        unit: 'g/dL',
        message: 'Moderate anemia likely secondary to chronic kidney disease (anemia of CKD).',
        action: 'Discuss erythropoiesis-stimulating agent (ESA) therapy with nephrologist.',
      },
    ],
  });

  console.log('  ✓ Alerts: 2 for Sarah, 5 for John');

  // ── Clinical Patterns ──────────────────────────────────────────────

  await prisma.clinicalPattern.createMany({
    data: [
      // Sarah patterns
      {
        reportId: sarahReport1.id,
        patternType: 'iron_deficiency_anemia',
        description: 'Low ferritin combined with low hemoglobin is consistent with iron-deficiency anemia, common in premenopausal women.',
        confidence: 0.92,
        biomarkerCodes: JSON.stringify(['FERRITIN', 'HGB']),
      },
      {
        reportId: sarahReport1.id,
        patternType: 'dyslipidemia',
        description: 'Elevated LDL and triglycerides together indicate mixed dyslipidemia with increased cardiovascular risk.',
        confidence: 0.88,
        biomarkerCodes: JSON.stringify(['LDL', 'TRIG']),
      },
      {
        reportId: sarahReport1.id,
        patternType: 'metabolic_prediabetes_risk',
        description: 'Borderline HbA1c with elevated triglycerides and CRP suggests early metabolic syndrome risk.',
        confidence: 0.75,
        biomarkerCodes: JSON.stringify(['HBA1C', 'TRIG', 'CRP']),
      },
      // John patterns
      {
        reportId: johnReport1.id,
        patternType: 'diabetic_nephropathy',
        description: 'Severely elevated glucose and HbA1c combined with Stage 4 CKD (eGFR 18, creatinine 3.8) strongly suggests diabetic nephropathy as the primary etiology.',
        confidence: 0.94,
        biomarkerCodes: JSON.stringify(['GLUCOSE', 'HBA1C', 'CREATININE', 'EGFR']),
      },
      {
        reportId: johnReport1.id,
        patternType: 'anemia_of_ckd',
        description: 'Moderate anemia (HGB 8.5) in the context of Stage 4 CKD is consistent with anemia of chronic kidney disease due to reduced erythropoietin production.',
        confidence: 0.89,
        biomarkerCodes: JSON.stringify(['HGB', 'CREATININE', 'EGFR']),
      },
      {
        reportId: johnReport1.id,
        patternType: 'hyperkalemia_renal',
        description: 'Critical hyperkalemia (K+ 6.2) is a dangerous complication of severe CKD, requiring immediate management.',
        confidence: 0.96,
        biomarkerCodes: JSON.stringify(['K', 'CREATININE', 'EGFR']),
      },
    ],
  });

  console.log('  ✓ Clinical patterns: 3 for Sarah, 3 for John');

  console.log('\n✅ Seed complete!');
  console.log('   Demo login: demo@bloodinsight.app / demo123');
  console.log('   Second user: john@bloodinsight.app / demo123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
