// Template-based interpretation engine

import type { StatusLevel, Sex } from './knowledge/types';
import type { PatternResult } from './patterns';
import { detectPatterns } from './patterns';
import { BIOMARKER_KNOWLEDGE } from './knowledge/biomarkers';

export interface Interpretation {
  summary: string;
  explanation: string;
  significance: string;
  lifestyleActions: string[];
  followUpSuggestions: string[];
  doctorQuestions: string[];
  confidenceNote: string;
}

// ── Interpretation templates per biomarker code + status ──────────────────

interface InterpretationTemplate {
  summaryHigh: string;
  summaryLow: string;
  summaryNormal: string;
  explanationHigh: string;
  explanationLow: string;
  explanationNormal: string;
  significanceHigh: string;
  significanceLow: string;
  lifestyleHigh: string[];
  lifestyleLow: string[];
  followUpHigh: string[];
  followUpLow: string[];
  doctorQuestionsHigh: string[];
  doctorQuestionsLow: string[];
}

const DEFAULT_TEMPLATE: InterpretationTemplate = {
  summaryHigh: 'This value is above the expected range.',
  summaryLow: 'This value is below the expected range.',
  summaryNormal: 'This value is within the expected range.',
  explanationHigh: 'An elevated result may warrant further investigation. Many factors can influence this marker.',
  explanationLow: 'A lower-than-expected result may warrant further investigation. Many factors can influence this marker.',
  explanationNormal: 'This result falls within the normal reference range, suggesting this marker is at an expected level.',
  significanceHigh: 'Elevated values can have various causes and may benefit from clinical context.',
  significanceLow: 'Low values can have various causes and may benefit from clinical context.',
  lifestyleHigh: ['Maintain a balanced diet', 'Stay hydrated', 'Exercise regularly'],
  lifestyleLow: ['Maintain a balanced diet', 'Stay hydrated', 'Exercise regularly'],
  followUpHigh: ['Retest in 4-6 weeks if clinically indicated'],
  followUpLow: ['Retest in 4-6 weeks if clinically indicated'],
  doctorQuestionsHigh: ['What could be causing this elevated result?', 'Should I retest?'],
  doctorQuestionsLow: ['What could be causing this low result?', 'Should I retest?'],
};

const TEMPLATES: Record<string, InterpretationTemplate> = {
  HGB: {
    summaryHigh: 'Hemoglobin is above the expected range.',
    summaryLow: 'Hemoglobin is below the expected range, which may indicate anemia.',
    summaryNormal: 'Hemoglobin is within the normal range.',
    explanationHigh: 'Elevated hemoglobin can be seen with dehydration, living at high altitude, chronic lung disease, or polycythemia. It means the blood may be carrying more oxygen than usual.',
    explanationLow: 'Low hemoglobin suggests anemia, meaning the blood carries less oxygen to tissues. This can cause fatigue, weakness, and shortness of breath. Common causes include iron deficiency, chronic disease, or blood loss.',
    explanationNormal: 'Your hemoglobin level is healthy, indicating adequate oxygen-carrying capacity in your blood.',
    significanceHigh: 'Persistent elevation may require evaluation for underlying conditions.',
    significanceLow: 'Anemia affects energy levels and overall wellbeing. Identifying the cause is important for proper treatment.',
    lifestyleHigh: ['Stay well hydrated', 'Avoid smoking', 'Discuss altitude effects if relevant'],
    lifestyleLow: ['Increase iron-rich foods (red meat, spinach, lentils)', 'Pair iron-rich foods with vitamin C for better absorption', 'Avoid tea/coffee with meals as they reduce iron absorption'],
    followUpHigh: ['Recheck hemoglobin in 4-6 weeks', 'Consider erythropoietin level testing if persistently high'],
    followUpLow: ['Iron studies (ferritin, TIBC, serum iron)', 'Reticulocyte count', 'Vitamin B12 and folate levels'],
    doctorQuestionsHigh: ['Could dehydration or altitude be affecting my result?', 'Should I be tested for polycythemia?'],
    doctorQuestionsLow: ['What type of anemia might I have?', 'Should I start iron supplementation?', 'Could this be related to my diet?'],
  },

  GLUCOSE: {
    summaryHigh: 'Fasting glucose is elevated, which may indicate impaired glucose regulation.',
    summaryLow: 'Glucose is below the expected range, which may indicate hypoglycemia.',
    summaryNormal: 'Fasting glucose is within the normal range.',
    explanationHigh: 'Elevated fasting glucose can suggest pre-diabetes or diabetes. It may also be temporarily elevated by stress, medications, or recent food intake. Consistent elevation warrants further evaluation.',
    explanationLow: 'Low glucose (hypoglycemia) can cause dizziness, confusion, and fatigue. It may result from prolonged fasting, excessive exercise, certain medications, or rarely, underlying conditions.',
    explanationNormal: 'Your blood sugar regulation appears to be functioning normally. This is a positive indicator for metabolic health.',
    significanceHigh: 'Blood sugar control is central to preventing diabetes complications including heart disease, kidney damage, and nerve problems.',
    significanceLow: 'Recurrent hypoglycemia should be evaluated to identify the underlying cause.',
    lifestyleHigh: ['Reduce refined carbohydrates and sugary foods', 'Increase fiber intake', 'Exercise regularly (150 min/week moderate activity)', 'Maintain a healthy weight'],
    lifestyleLow: ['Eat regular, balanced meals', 'Include protein and complex carbs in each meal', 'Keep healthy snacks available'],
    followUpHigh: ['HbA1c test', 'Oral glucose tolerance test (OGTT)', 'Fasting insulin level', 'Recheck fasting glucose in 4-8 weeks'],
    followUpLow: ['Recheck glucose with a fasting sample', 'Insulin level if recurrent', 'Evaluate medication side effects'],
    doctorQuestionsHigh: ['Am I at risk for diabetes?', 'Should I get an HbA1c test?', 'What dietary changes would help the most?'],
    doctorQuestionsLow: ['What might be causing my low blood sugar?', 'Should I adjust any medications?'],
  },

  HBA1C: {
    summaryHigh: 'HbA1c is elevated, suggesting higher-than-optimal average blood sugar over the past 2-3 months.',
    summaryLow: 'HbA1c is lower than expected.',
    summaryNormal: 'HbA1c is within the normal range, indicating good blood sugar control.',
    explanationHigh: 'HbA1c reflects your average blood sugar over approximately 2-3 months. An elevated level can indicate pre-diabetes (5.7-6.4%) or diabetes (6.5% or higher). This is one of the most important markers for long-term glucose control.',
    explanationLow: 'A very low HbA1c may suggest frequent hypoglycemia or conditions affecting red blood cell lifespan. This is uncommon and may benefit from further evaluation.',
    explanationNormal: 'Your average blood sugar over the past 2-3 months has been well controlled. This is a positive sign for metabolic health.',
    significanceHigh: 'Long-term elevated HbA1c is associated with increased risk of cardiovascular disease, kidney disease, nerve damage, and eye problems.',
    significanceLow: 'Persistently low HbA1c in a diabetic patient may indicate overtreatment or hypoglycemia risk.',
    lifestyleHigh: ['Focus on low glycemic index foods', 'Regular physical activity', 'Weight management if overweight', 'Monitor carbohydrate intake'],
    lifestyleLow: ['Ensure adequate caloric intake', 'Regular meal timing'],
    followUpHigh: ['Fasting glucose', 'Oral glucose tolerance test', 'Lipid panel', 'Kidney function tests'],
    followUpLow: ['Review medications', 'Check for hemoglobin variants'],
    doctorQuestionsHigh: ['Am I pre-diabetic or diabetic?', 'What is my target HbA1c?', 'Should I see an endocrinologist?'],
    doctorQuestionsLow: ['Could my medications be lowering my blood sugar too much?'],
  },

  TOTAL_CHOLESTEROL: {
    summaryHigh: 'Total cholesterol is elevated.',
    summaryLow: 'Total cholesterol is lower than expected.',
    summaryNormal: 'Total cholesterol is within a desirable range.',
    explanationHigh: 'Elevated total cholesterol increases cardiovascular risk. However, the breakdown into LDL, HDL, and triglycerides is more informative than total cholesterol alone.',
    explanationLow: 'Very low cholesterol is uncommon and may be associated with certain medical conditions, malnutrition, or medication effects.',
    explanationNormal: 'Your total cholesterol is at a healthy level, which is positive for cardiovascular health.',
    significanceHigh: 'High cholesterol is a major risk factor for heart disease and stroke, but context from the full lipid panel is essential.',
    significanceLow: 'Cholesterol is needed for hormone production and cell membranes. Persistent very low levels may need evaluation.',
    lifestyleHigh: ['Reduce saturated and trans fats', 'Increase soluble fiber (oats, beans, fruits)', 'Exercise regularly', 'Consider plant sterols/stanols'],
    lifestyleLow: ['Ensure adequate healthy fat intake', 'Balanced diet with variety'],
    followUpHigh: ['Full lipid panel with LDL, HDL, triglycerides', 'Cardiovascular risk assessment', 'Thyroid function test'],
    followUpLow: ['Nutritional assessment', 'Liver function tests'],
    doctorQuestionsHigh: ['What is my cardiovascular risk score?', 'Do I need medication, or can lifestyle changes be enough?'],
    doctorQuestionsLow: ['Is my low cholesterol a concern?'],
  },

  LDL: {
    summaryHigh: 'LDL cholesterol is elevated, increasing cardiovascular risk.',
    summaryLow: 'LDL cholesterol is low, which is generally favorable.',
    summaryNormal: 'LDL cholesterol is within the optimal range.',
    explanationHigh: 'LDL (commonly called "bad cholesterol") deposits cholesterol in artery walls, contributing to plaque buildup. Elevated LDL is a primary target for cardiovascular risk reduction.',
    explanationLow: 'Low LDL is generally considered beneficial for heart health. Very low levels are rarely a concern unless caused by malnutrition.',
    explanationNormal: 'Your LDL level is at a healthy level, which supports cardiovascular health.',
    significanceHigh: 'LDL is the primary driver of atherosclerosis. Lowering LDL reduces heart attack and stroke risk.',
    significanceLow: 'Low LDL is protective. No action typically needed.',
    lifestyleHigh: ['Reduce saturated fat to less than 7% of calories', 'Increase soluble fiber to 10-25g/day', 'Add plant sterols/stanols', 'Regular aerobic exercise', 'Achieve and maintain healthy weight'],
    lifestyleLow: [],
    followUpHigh: ['Repeat lipid panel in 4-6 weeks after lifestyle changes', 'Cardiovascular risk calculation', 'Consider statin therapy discussion'],
    followUpLow: [],
    doctorQuestionsHigh: ['What is my target LDL?', 'Should I consider statin therapy?', 'How much can diet alone lower my LDL?'],
    doctorQuestionsLow: [],
  },

  HDL: {
    summaryHigh: 'HDL cholesterol is elevated, which is generally protective.',
    summaryLow: 'HDL cholesterol is low, which may increase cardiovascular risk.',
    summaryNormal: 'HDL cholesterol is within a healthy range.',
    explanationHigh: 'HDL ("good cholesterol") helps remove cholesterol from arteries. Higher levels are generally protective, though extremely high levels (>100 mg/dL) may rarely be associated with genetic conditions.',
    explanationLow: 'Low HDL reduces the body\'s ability to clear cholesterol from arteries, increasing cardiovascular risk. Common causes include physical inactivity, smoking, obesity, and poor diet.',
    explanationNormal: 'Your HDL level provides good cardiovascular protection.',
    significanceHigh: 'High HDL is cardioprotective. Values above 60 mg/dL are considered a negative risk factor for heart disease.',
    significanceLow: 'Low HDL is an independent risk factor for cardiovascular disease.',
    lifestyleHigh: ['Continue current healthy habits'],
    lifestyleLow: ['Regular aerobic exercise (strongest HDL booster)', 'Quit smoking if applicable', 'Lose weight if overweight', 'Choose healthy fats (olive oil, nuts, avocado)', 'Moderate alcohol if any (discuss with doctor)'],
    followUpHigh: [],
    followUpLow: ['Full cardiovascular risk assessment', 'Repeat in 3-6 months after lifestyle changes'],
    doctorQuestionsHigh: ['Is my very high HDL a concern?'],
    doctorQuestionsLow: ['What is the best way to raise my HDL?', 'Does my low HDL significantly increase my heart risk?'],
  },

  TRIGLYCERIDES: {
    summaryHigh: 'Triglycerides are elevated.',
    summaryLow: 'Triglycerides are low, which is generally favorable.',
    summaryNormal: 'Triglycerides are within the normal range.',
    explanationHigh: 'Elevated triglycerides are associated with increased cardiovascular risk and may indicate insulin resistance, excess caloric intake, or metabolic syndrome. Very high levels (>500 mg/dL) can increase the risk of pancreatitis.',
    explanationLow: 'Low triglycerides are generally a positive finding and not a cause for concern.',
    explanationNormal: 'Your triglyceride level is healthy, supporting good metabolic and cardiovascular health.',
    significanceHigh: 'High triglycerides combined with low HDL and high LDL is a particularly concerning pattern for heart health.',
    significanceLow: 'Low triglycerides are favorable and protective.',
    lifestyleHigh: ['Reduce sugar and refined carbohydrate intake', 'Limit alcohol consumption', 'Increase omega-3 fatty acids (fatty fish, flaxseed)', 'Regular exercise', 'Lose weight if overweight'],
    lifestyleLow: [],
    followUpHigh: ['Full lipid panel', 'Fasting glucose and HbA1c', 'Liver function tests', 'Thyroid function'],
    followUpLow: [],
    doctorQuestionsHigh: ['Are my triglycerides high enough to need medication?', 'Should I take omega-3 supplements?'],
    doctorQuestionsLow: [],
  },

  TSH: {
    summaryHigh: 'TSH is elevated, which may suggest an underactive thyroid (hypothyroidism).',
    summaryLow: 'TSH is low, which may suggest an overactive thyroid (hyperthyroidism).',
    summaryNormal: 'TSH is within the normal range, suggesting normal thyroid function.',
    explanationHigh: 'High TSH typically means the pituitary gland is working harder to stimulate an underperforming thyroid. This can cause fatigue, weight gain, cold intolerance, and dry skin.',
    explanationLow: 'Low TSH may indicate the thyroid is overproducing hormones, causing the pituitary to reduce stimulation. This can cause weight loss, rapid heartbeat, anxiety, and heat intolerance.',
    explanationNormal: 'Your thyroid-stimulating hormone level suggests the thyroid is functioning at an appropriate level.',
    significanceHigh: 'Hypothyroidism is common and treatable. Untreated, it can affect metabolism, cardiovascular health, and mental wellbeing.',
    significanceLow: 'Hyperthyroidism can affect the heart, bones, and overall metabolism. Early treatment is important.',
    lifestyleHigh: ['Ensure adequate iodine and selenium intake', 'Manage stress levels', 'Avoid excessive soy and cruciferous vegetables in large raw quantities'],
    lifestyleLow: ['Reduce caffeine intake', 'Stress management', 'Adequate calcium and vitamin D for bone health'],
    followUpHigh: ['Free T4 (FT4)', 'Free T3 (FT3)', 'Thyroid antibodies (TPO, TgAb)', 'Repeat TSH in 6-8 weeks'],
    followUpLow: ['Free T4 (FT4)', 'Free T3 (FT3)', 'TSH receptor antibodies', 'Thyroid ultrasound if indicated'],
    doctorQuestionsHigh: ['Do I have hypothyroidism?', 'Should I start thyroid hormone replacement?', 'Could this be Hashimoto\'s thyroiditis?'],
    doctorQuestionsLow: ['Could this be Graves\' disease?', 'Do I need further thyroid imaging?'],
  },

  CREATININE: {
    summaryHigh: 'Creatinine is elevated, which may indicate reduced kidney function.',
    summaryLow: 'Creatinine is lower than expected.',
    summaryNormal: 'Creatinine is within the normal range, suggesting healthy kidney function.',
    explanationHigh: 'Creatinine is a waste product from muscle metabolism filtered by the kidneys. Elevated levels can indicate the kidneys are not filtering as efficiently as expected. Causes include dehydration, high-protein diet, intense exercise, or kidney disease.',
    explanationLow: 'Low creatinine is usually not a concern and can be seen in people with lower muscle mass, such as older adults or those with a smaller body frame.',
    explanationNormal: 'Your kidneys appear to be filtering waste products effectively.',
    significanceHigh: 'Persistent elevation should be evaluated in context with eGFR, BUN, and urinalysis to assess kidney health.',
    significanceLow: 'Low creatinine alone is typically benign.',
    lifestyleHigh: ['Stay well hydrated', 'Moderate protein intake', 'Avoid excessive NSAID use', 'Control blood pressure and blood sugar if applicable'],
    lifestyleLow: ['Adequate protein intake', 'Regular strength exercise'],
    followUpHigh: ['eGFR calculation', 'BUN', 'Urinalysis', 'Kidney ultrasound if persistently elevated', 'Cystatin C'],
    followUpLow: [],
    doctorQuestionsHigh: ['How is my overall kidney function?', 'Could this be from dehydration or diet?', 'Should I see a nephrologist?'],
    doctorQuestionsLow: [],
  },

  ALT: {
    summaryHigh: 'ALT is elevated, which may indicate liver stress.',
    summaryLow: 'ALT is lower than expected.',
    summaryNormal: 'ALT is within the normal range.',
    explanationHigh: 'ALT is an enzyme primarily found in the liver. Elevated levels suggest liver cell damage. Common causes include fatty liver disease, medications (including acetaminophen), alcohol use, viral hepatitis, and obesity.',
    explanationLow: 'Low ALT is generally not a clinical concern.',
    explanationNormal: 'Your ALT level suggests the liver is functioning normally.',
    significanceHigh: 'Persistent ALT elevation (especially >2x normal) warrants investigation. It is one of the earliest markers of liver stress.',
    significanceLow: 'Low ALT is typically benign and not clinically significant.',
    lifestyleHigh: ['Limit alcohol consumption', 'Maintain healthy weight', 'Review all medications and supplements with doctor', 'Avoid acetaminophen overuse', 'Exercise regularly'],
    lifestyleLow: [],
    followUpHigh: ['AST', 'GGT', 'Alkaline phosphatase', 'Hepatitis B and C screening', 'Liver ultrasound if persistent'],
    followUpLow: [],
    doctorQuestionsHigh: ['What is likely causing my elevated ALT?', 'Should I get hepatitis testing?', 'Do I need a liver ultrasound?'],
    doctorQuestionsLow: [],
  },

  FERRITIN: {
    summaryHigh: 'Ferritin is elevated, which may indicate iron overload or inflammation.',
    summaryLow: 'Ferritin is low, which strongly suggests depleted iron stores.',
    summaryNormal: 'Ferritin is within the normal range, indicating adequate iron stores.',
    explanationHigh: 'Ferritin stores iron in the body. Elevated ferritin can indicate iron overload (hemochromatosis), inflammation, liver disease, or infection. Ferritin rises as an acute-phase reactant during illness.',
    explanationLow: 'Low ferritin is the most specific marker for iron deficiency. Iron stores may be depleted before anemia develops, making ferritin a valuable early indicator.',
    explanationNormal: 'Your iron stores appear adequate.',
    significanceHigh: 'Very high ferritin (>1000 ng/mL) should be urgently evaluated. Mild elevation may reflect inflammation rather than true iron overload.',
    significanceLow: 'Iron deficiency can cause fatigue, hair loss, poor concentration, and eventually anemia. It is the most common nutritional deficiency globally.',
    lifestyleHigh: ['Avoid iron supplements unless prescribed', 'Limit red meat intake', 'Avoid vitamin C supplements with meals (enhances iron absorption)', 'Avoid alcohol'],
    lifestyleLow: ['Increase iron-rich foods: red meat, poultry, fish, lentils, spinach', 'Pair iron foods with vitamin C', 'Avoid tea and coffee with meals', 'Cook in cast iron cookware'],
    followUpHigh: ['Serum iron and TIBC', 'Transferrin saturation', 'CRP (to check inflammation)', 'Genetic testing for hemochromatosis if indicated'],
    followUpLow: ['Complete blood count', 'Serum iron and TIBC', 'Transferrin saturation', 'Consider GI evaluation if cause unclear'],
    doctorQuestionsHigh: ['Is this from inflammation or true iron overload?', 'Should I be tested for hemochromatosis?'],
    doctorQuestionsLow: ['Should I start iron supplements?', 'What dose and form of iron is best?', 'Could there be an underlying cause of iron loss?'],
  },

  CRP: {
    summaryHigh: 'C-reactive protein is elevated, indicating active inflammation.',
    summaryLow: 'CRP is very low, suggesting minimal inflammation.',
    summaryNormal: 'CRP is within the normal range.',
    explanationHigh: 'CRP is produced by the liver in response to inflammation. Elevated levels can indicate infection, autoimmune disease, tissue injury, or chronic conditions. High-sensitivity CRP (hs-CRP) is also used to assess cardiovascular risk.',
    explanationLow: 'Very low CRP is a positive finding, suggesting no significant systemic inflammation.',
    explanationNormal: 'Your CRP level suggests no significant active inflammation.',
    significanceHigh: 'CRP is non-specific: it tells you there is inflammation but not where. Context from other markers and symptoms is essential.',
    significanceLow: 'Low CRP is reassuring for both inflammation and cardiovascular risk.',
    lifestyleHigh: ['Anti-inflammatory diet (omega-3, vegetables, whole grains)', 'Regular moderate exercise', 'Adequate sleep', 'Stress management', 'Maintain healthy weight'],
    lifestyleLow: [],
    followUpHigh: ['Repeat CRP in 2-4 weeks', 'ESR', 'Complete blood count', 'Evaluate for infection or autoimmune conditions'],
    followUpLow: [],
    doctorQuestionsHigh: ['What could be causing my inflammation?', 'Is this related to cardiovascular risk?', 'Should I see a specialist?'],
    doctorQuestionsLow: [],
  },

  WBC: {
    summaryHigh: 'White blood cell count is elevated, which may indicate infection or inflammation.',
    summaryLow: 'White blood cell count is low, which may affect immune function.',
    summaryNormal: 'White blood cell count is within the normal range.',
    explanationHigh: 'Elevated WBC (leukocytosis) commonly occurs with infections, inflammation, stress, or as a medication side effect. It reflects the immune system responding to a challenge.',
    explanationLow: 'Low WBC (leukopenia) can reduce the body\'s ability to fight infections. Causes include viral infections, certain medications, bone marrow conditions, or autoimmune diseases.',
    explanationNormal: 'Your immune cell count is at a healthy level.',
    significanceHigh: 'Persistent unexplained elevation should be evaluated. Very high counts (>30,000) require urgent assessment.',
    significanceLow: 'Persistent low WBC may increase infection susceptibility and warrants investigation.',
    lifestyleHigh: ['Rest if acutely ill', 'Stay hydrated', 'Manage stress'],
    lifestyleLow: ['Good hand hygiene', 'Avoid exposure to sick individuals', 'Adequate nutrition', 'Discuss vaccinations with doctor'],
    followUpHigh: ['WBC differential', 'Blood culture if fever present', 'Peripheral blood smear', 'Repeat in 2-4 weeks'],
    followUpLow: ['WBC differential', 'Peripheral blood smear', 'Vitamin B12 and folate', 'Evaluate medications'],
    doctorQuestionsHigh: ['Is this likely from infection or another cause?', 'Do I need a blood smear?'],
    doctorQuestionsLow: ['What might be causing my low white count?', 'Am I at increased risk for infections?'],
  },
};

// ── Core functions ────────────────────────────────────────────────────────

function getTemplate(code: string): InterpretationTemplate {
  return TEMPLATES[code] ?? DEFAULT_TEMPLATE;
}

function getDirection(
  code: string,
  value: number
): 'high' | 'low' | 'normal' {
  const bio = BIOMARKER_KNOWLEDGE.get(code);
  if (!bio || bio.referenceRanges.length === 0) return 'normal';

  // Use the first range's midpoint as a quick heuristic
  const range = bio.referenceRanges[0];
  if (range.min !== null && range.max !== null) {
    const mid = (range.min + range.max) / 2;
    if (value > range.max) return 'high';
    if (value < range.min) return 'low';
    return 'normal';
  }
  if (range.max !== null && value > range.max) return 'high';
  if (range.min !== null && value < range.min) return 'low';
  return 'normal';
}

/**
 * Generate an interpretation for a single biomarker result.
 */
export function interpretBiomarker(
  code: string,
  value: number,
  unit: string,
  status: StatusLevel,
  sex: Sex
): Interpretation {
  const template = getTemplate(code);
  const direction = status === 'normal' ? 'normal' : getDirection(code, value);
  const biomarkerName = BIOMARKER_KNOWLEDGE.get(code)?.name ?? code;

  let summary: string;
  let explanation: string;
  let significance: string;
  let lifestyleActions: string[];
  let followUpSuggestions: string[];
  let doctorQuestions: string[];

  switch (direction) {
    case 'high':
      summary = template.summaryHigh;
      explanation = template.explanationHigh;
      significance = template.significanceHigh;
      lifestyleActions = template.lifestyleHigh;
      followUpSuggestions = template.followUpHigh;
      doctorQuestions = template.doctorQuestionsHigh;
      break;
    case 'low':
      summary = template.summaryLow;
      explanation = template.explanationLow;
      significance = template.significanceLow;
      lifestyleActions = template.lifestyleLow;
      followUpSuggestions = template.followUpLow;
      doctorQuestions = template.doctorQuestionsLow;
      break;
    default:
      summary = template.summaryNormal;
      explanation = template.explanationNormal;
      significance = '';
      lifestyleActions = [];
      followUpSuggestions = [];
      doctorQuestions = [];
  }

  // Add status-specific prefix
  if (status === 'urgent') {
    summary = `URGENT: ${summary}`;
  } else if (status === 'borderline') {
    summary = `Borderline: ${summary}`;
  }

  const confidenceNote =
    'This interpretation is generated from reference ranges and general medical knowledge. ' +
    'It is not a diagnosis. Individual results should be interpreted by a healthcare professional ' +
    'who can consider your complete medical history, symptoms, and other test results.';

  return {
    summary,
    explanation,
    significance,
    lifestyleActions,
    followUpSuggestions,
    doctorQuestions,
    confidenceNote,
  };
}

/**
 * Generate a comprehensive interpretation for an entire lab report.
 */
export function interpretReport(
  results: Array<{ code: string; value: number; unit: string; status: StatusLevel }>,
  sex: Sex
): {
  overallSummary: string;
  patterns: PatternResult[];
  priorities: string[];
  interpretations: Map<string, Interpretation>;
} {
  // Generate individual interpretations
  const interpretations = new Map<string, Interpretation>();
  for (const r of results) {
    interpretations.set(r.code, interpretBiomarker(r.code, r.value, r.unit, r.status, sex));
  }

  // Detect patterns
  const patterns = detectPatterns(results);

  // Count by status
  const urgentResults = results.filter((r) => r.status === 'urgent');
  const abnormalResults = results.filter((r) => r.status === 'abnormal');
  const borderlineResults = results.filter((r) => r.status === 'borderline');
  const normalResults = results.filter((r) => r.status === 'normal');

  // Build overall summary
  const parts: string[] = [];
  parts.push(`${results.length} biomarkers analyzed.`);

  if (urgentResults.length > 0) {
    const names = urgentResults.map((r) => BIOMARKER_KNOWLEDGE.get(r.code)?.name ?? r.code);
    parts.push(
      `${urgentResults.length} result(s) require urgent attention: ${names.join(', ')}.`
    );
  }
  if (abnormalResults.length > 0) {
    parts.push(`${abnormalResults.length} result(s) are outside the reference range.`);
  }
  if (borderlineResults.length > 0) {
    parts.push(`${borderlineResults.length} result(s) are borderline.`);
  }
  if (normalResults.length === results.length) {
    parts.push('All results are within normal ranges. No immediate concerns identified.');
  }
  if (patterns.length > 0) {
    parts.push(
      `${patterns.length} clinical pattern(s) detected: ${patterns.map((p) => p.name).join('; ')}.`
    );
  }

  const overallSummary = parts.join(' ');

  // Determine priorities (ordered list of what to address first)
  const priorities: string[] = [];

  for (const r of urgentResults) {
    const name = BIOMARKER_KNOWLEDGE.get(r.code)?.name ?? r.code;
    priorities.push(`Urgent: Discuss ${name} result with your healthcare provider immediately.`);
  }
  for (const p of patterns) {
    priorities.push(`Pattern detected: ${p.name} - ${p.interpretation.split('.')[0]}.`);
  }
  for (const r of abnormalResults) {
    const name = BIOMARKER_KNOWLEDGE.get(r.code)?.name ?? r.code;
    priorities.push(`Follow up on abnormal ${name} result.`);
  }
  for (const r of borderlineResults) {
    const name = BIOMARKER_KNOWLEDGE.get(r.code)?.name ?? r.code;
    priorities.push(`Monitor borderline ${name} result.`);
  }

  return {
    overallSummary,
    patterns,
    priorities,
    interpretations,
  };
}
