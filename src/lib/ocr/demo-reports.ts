// Pre-extracted demo report data for 3 sample reports
// Used for demonstration and testing without requiring actual OCR

import type { NormalizedBiomarker } from './normalizer';

export interface DemoReport {
  id: string;
  metadata: {
    patientName: string;
    reportDate: string;
    labName: string;
    patientSex: 'male' | 'female';
    patientAge: number;
  };
  biomarkers: NormalizedBiomarker[];
}

// ── Helper to build a normalized biomarker entry ─────────────────────────

function bm(
  rawName: string,
  code: string,
  name: string,
  value: number,
  unit: string,
  rangeStr: string | null,
  refMin: number | null,
  refMax: number | null,
  flag: string | null = null
): NormalizedBiomarker {
  return {
    rawName,
    rawValue: String(value),
    rawUnit: unit,
    rawRange: rangeStr,
    rawFlag: flag,
    normalizedCode: code,
    normalizedName: name,
    normalizedValue: value,
    normalizedUnit: unit,
    referenceMin: refMin,
    referenceMax: refMax,
    confidence: 0.95,
    matchMethod: 'exact',
    warnings: [],
  };
}

// ── Report 1: Sarah, 35F — first visit ──────────────────────────────────
// Iron deficiency profile, dyslipidemia, borderline metabolic, low vitamin D

export const DEMO_REPORT_1: DemoReport = {
  id: 'demo-report-1',
  metadata: {
    patientName: 'Sarah Johnson',
    reportDate: '2024-03-15',
    labName: 'HealthFirst Lab',
    patientSex: 'female',
    patientAge: 35,
  },
  biomarkers: [
    // CBC
    bm('WBC', 'WBC', 'White Blood Cells', 6.2, '10^3/µL', '4.0-11.0', 4.0, 11.0),
    bm('RBC', 'RBC', 'Red Blood Cells', 4.1, '10^6/µL', '3.8-5.1', 3.8, 5.1),
    bm('Hemoglobin', 'HGB', 'Hemoglobin', 11.2, 'g/dL', '12.0-16.0', 12.0, 16.0, 'L'),
    bm('Hematocrit', 'HCT', 'Hematocrit', 34.5, '%', '36.0-46.0', 36.0, 46.0, 'L'),
    bm('MCV', 'MCV', 'Mean Corpuscular Volume', 84, 'fL', '80-100', 80, 100),
    bm('Platelets', 'PLT', 'Platelets', 245, '10^3/µL', '150-400', 150, 400),

    // Iron panel
    bm('Ferritin', 'FERRITIN', 'Ferritin', 15, 'ng/mL', '15-200', 15, 200),
    bm('Iron', 'FE', 'Serum Iron', 45, 'µg/dL', '60-170', 60, 170, 'L'),
    bm('TIBC', 'TIBC', 'Total Iron Binding Capacity', 420, 'µg/dL', '250-400', 250, 400, 'H'),
    bm('Transferrin Sat', 'TSAT', 'Transferrin Saturation', 11, '%', '20-50', 20, 50, 'L'),

    // Metabolic
    bm('Glucose, Fasting', 'GLU', 'Fasting Glucose', 95, 'mg/dL', '70-99', 70, 99),
    bm('HbA1c', 'HBA1C', 'Hemoglobin A1c', 5.8, '%', '4.0-5.6', 4.0, 5.6, 'H'),

    // Lipid panel
    bm('Total Cholesterol', 'TC', 'Total Cholesterol', 235, 'mg/dL', '<200', null, 200, 'H'),
    bm('LDL Cholesterol', 'LDL', 'LDL Cholesterol', 165, 'mg/dL', '<100', null, 100, 'H'),
    bm('HDL Cholesterol', 'HDL', 'HDL Cholesterol', 48, 'mg/dL', '>50', 50, null, 'L'),
    bm('Triglycerides', 'TRIG', 'Triglycerides', 220, 'mg/dL', '<150', null, 150, 'H'),

    // Liver
    bm('AST', 'AST', 'Aspartate Aminotransferase', 22, 'U/L', '10-40', 10, 40),
    bm('ALT', 'ALT', 'Alanine Aminotransferase', 19, 'U/L', '7-56', 7, 56),
    bm('Alk Phos', 'ALP', 'Alkaline Phosphatase', 65, 'U/L', '44-147', 44, 147),
    bm('GGT', 'GGT', 'Gamma-Glutamyl Transferase', 18, 'U/L', '9-48', 9, 48),

    // Kidney
    bm('Creatinine', 'CREAT', 'Creatinine', 0.8, 'mg/dL', '0.6-1.2', 0.6, 1.2),
    bm('BUN', 'BUN', 'Blood Urea Nitrogen', 14, 'mg/dL', '7-20', 7, 20),
    bm('eGFR', 'EGFR', 'Estimated GFR', 95, 'mL/min/1.73m²', '>60', 60, null),

    // Thyroid
    bm('TSH', 'TSH', 'Thyroid Stimulating Hormone', 2.1, 'mIU/L', '0.4-4.0', 0.4, 4.0),
    bm('Free T4', 'FT4', 'Free Thyroxine', 1.2, 'ng/dL', '0.8-1.8', 0.8, 1.8),

    // Inflammation
    bm('CRP', 'CRP', 'C-Reactive Protein', 4.5, 'mg/L', '<3.0', null, 3.0, 'H'),
    bm('ESR', 'ESR', 'Erythrocyte Sedimentation Rate', 18, 'mm/hr', '0-20', 0, 20),

    // Vitamins
    bm('Vitamin D', 'VITD', 'Vitamin D (25-OH)', 18, 'ng/mL', '30-100', 30, 100, 'L'),
    bm('Vitamin B12', 'B12', 'Vitamin B12', 450, 'pg/mL', '200-900', 200, 900),
    bm('Folate', 'FOLATE', 'Folate', 12, 'ng/mL', '3.0-20.0', 3.0, 20.0),

    // Electrolytes
    bm('Sodium', 'NA', 'Sodium', 140, 'mmol/L', '136-145', 136, 145),
    bm('Potassium', 'K', 'Potassium', 4.2, 'mmol/L', '3.5-5.0', 3.5, 5.0),
    bm('Calcium', 'CA', 'Calcium', 9.4, 'mg/dL', '8.5-10.5', 8.5, 10.5),
  ],
};

// ── Report 2: Sarah, 6 months later — partial re-test ───────────────────
// Some values improved (iron, lipids, vitamin D), HbA1c slightly worse

export const DEMO_REPORT_2: DemoReport = {
  id: 'demo-report-2',
  metadata: {
    patientName: 'Sarah Johnson',
    reportDate: '2024-09-15',
    labName: 'HealthFirst Lab',
    patientSex: 'female',
    patientAge: 35,
  },
  biomarkers: [
    // CBC — improved
    bm('Hemoglobin', 'HGB', 'Hemoglobin', 12.0, 'g/dL', '12.0-16.0', 12.0, 16.0),
    bm('Hematocrit', 'HCT', 'Hematocrit', 36.2, '%', '36.0-46.0', 36.0, 46.0),
    bm('MCV', 'MCV', 'Mean Corpuscular Volume', 86, 'fL', '80-100', 80, 100),

    // Iron — improved after supplementation
    bm('Ferritin', 'FERRITIN', 'Ferritin', 28, 'ng/mL', '15-200', 15, 200),
    bm('Iron', 'FE', 'Serum Iron', 72, 'µg/dL', '60-170', 60, 170),
    bm('TIBC', 'TIBC', 'Total Iron Binding Capacity', 380, 'µg/dL', '250-400', 250, 400),
    bm('Transferrin Sat', 'TSAT', 'Transferrin Saturation', 19, '%', '20-50', 20, 50, 'L'),

    // Metabolic — HbA1c slightly worse
    bm('Glucose, Fasting', 'GLU', 'Fasting Glucose', 98, 'mg/dL', '70-99', 70, 99),
    bm('HbA1c', 'HBA1C', 'Hemoglobin A1c', 5.9, '%', '4.0-5.6', 4.0, 5.6, 'H'),

    // Lipids — improved with diet changes
    bm('Total Cholesterol', 'TC', 'Total Cholesterol', 210, 'mg/dL', '<200', null, 200, 'H'),
    bm('LDL Cholesterol', 'LDL', 'LDL Cholesterol', 145, 'mg/dL', '<100', null, 100, 'H'),
    bm('HDL Cholesterol', 'HDL', 'HDL Cholesterol', 52, 'mg/dL', '>50', 50, null),
    bm('Triglycerides', 'TRIG', 'Triglycerides', 180, 'mg/dL', '<150', null, 150, 'H'),

    // Inflammation — improved
    bm('CRP', 'CRP', 'C-Reactive Protein', 2.1, 'mg/L', '<3.0', null, 3.0),

    // Vitamins — Vitamin D improved after supplementation
    bm('Vitamin D', 'VITD', 'Vitamin D (25-OH)', 32, 'ng/mL', '30-100', 30, 100),

    // Kidney — stable
    bm('Creatinine', 'CREAT', 'Creatinine', 0.8, 'mg/dL', '0.6-1.2', 0.6, 1.2),
    bm('eGFR', 'EGFR', 'Estimated GFR', 96, 'mL/min/1.73m²', '>60', 60, null),

    // Thyroid — stable
    bm('TSH', 'TSH', 'Thyroid Stimulating Hormone', 2.3, 'mIU/L', '0.4-4.0', 0.4, 4.0),
  ],
};

// ── Report 3: John, 55M — critical case for urgent alerts demo ──────────
// Severe kidney failure, critical hyperkalemia, uncontrolled diabetes

export const DEMO_REPORT_3: DemoReport = {
  id: 'demo-report-3',
  metadata: {
    patientName: 'John Martinez',
    reportDate: '2024-03-20',
    labName: 'CityMed Diagnostics',
    patientSex: 'male',
    patientAge: 55,
  },
  biomarkers: [
    // Electrolytes — critical potassium
    bm('Potassium', 'K', 'Potassium', 6.2, 'mmol/L', '3.5-5.0', 3.5, 5.0, 'H'),
    bm('Sodium', 'NA', 'Sodium', 137, 'mmol/L', '136-145', 136, 145),

    // Kidney — critical
    bm('Creatinine', 'CREAT', 'Creatinine', 3.8, 'mg/dL', '0.7-1.3', 0.7, 1.3, 'H'),
    bm('eGFR', 'EGFR', 'Estimated GFR', 18, 'mL/min/1.73m²', '>60', 60, null, 'L'),
    bm('BUN', 'BUN', 'Blood Urea Nitrogen', 52, 'mg/dL', '7-20', 7, 20, 'H'),

    // CBC — severe anemia (anemia of chronic kidney disease)
    bm('Hemoglobin', 'HGB', 'Hemoglobin', 8.5, 'g/dL', '13.5-17.5', 13.5, 17.5, 'L'),
    bm('Hematocrit', 'HCT', 'Hematocrit', 26, '%', '40-54', 40, 54, 'L'),
    bm('RBC', 'RBC', 'Red Blood Cells', 3.0, '10^6/µL', '4.5-5.5', 4.5, 5.5, 'L'),
    bm('WBC', 'WBC', 'White Blood Cells', 8.8, '10^3/µL', '4.0-11.0', 4.0, 11.0),
    bm('Platelets', 'PLT', 'Platelets', 198, '10^3/µL', '150-400', 150, 400),

    // Metabolic — uncontrolled diabetes
    bm('Glucose, Fasting', 'GLU', 'Fasting Glucose', 320, 'mg/dL', '70-99', 70, 99, 'H'),
    bm('HbA1c', 'HBA1C', 'Hemoglobin A1c', 9.2, '%', '4.0-5.6', 4.0, 5.6, 'H'),

    // Lipids
    bm('Total Cholesterol', 'TC', 'Total Cholesterol', 260, 'mg/dL', '<200', null, 200, 'H'),
    bm('LDL Cholesterol', 'LDL', 'LDL Cholesterol', 175, 'mg/dL', '<100', null, 100, 'H'),
    bm('HDL Cholesterol', 'HDL', 'HDL Cholesterol', 35, 'mg/dL', '>40', 40, null, 'L'),
    bm('Triglycerides', 'TRIG', 'Triglycerides', 280, 'mg/dL', '<150', null, 150, 'H'),

    // Inflammation — elevated from chronic disease
    bm('CRP', 'CRP', 'C-Reactive Protein', 12.5, 'mg/L', '<3.0', null, 3.0, 'H'),
    bm('ESR', 'ESR', 'Erythrocyte Sedimentation Rate', 45, 'mm/hr', '0-15', 0, 15, 'H'),

    // Liver — mildly elevated
    bm('AST', 'AST', 'Aspartate Aminotransferase', 48, 'U/L', '10-40', 10, 40, 'H'),
    bm('ALT', 'ALT', 'Alanine Aminotransferase', 52, 'U/L', '7-56', 7, 56),
    bm('ALP', 'ALP', 'Alkaline Phosphatase', 110, 'U/L', '44-147', 44, 147),

    // Calcium — low (kidney-related)
    bm('Calcium', 'CA', 'Calcium', 7.8, 'mg/dL', '8.5-10.5', 8.5, 10.5, 'L'),

    // Phosphorus would be high in CKD, but we use what we have
  ],
};

// ── All demo reports ─────────────────────────────────────────────────────

export const DEMO_REPORTS: DemoReport[] = [
  DEMO_REPORT_1,
  DEMO_REPORT_2,
  DEMO_REPORT_3,
];

/**
 * Get a demo report by ID.
 */
export function getDemoReport(id: string): DemoReport | undefined {
  return DEMO_REPORTS.find((r) => r.id === id);
}

/**
 * Get all demo reports.
 */
export function getAllDemoReports(): DemoReport[] {
  return DEMO_REPORTS;
}
