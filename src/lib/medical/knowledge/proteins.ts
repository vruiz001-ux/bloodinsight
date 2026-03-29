import type { BiomarkerKnowledge } from './types';

export const proteinBiomarkers: BiomarkerKnowledge[] = [
  {
    code: 'TP',
    name: 'Total Protein',
    aliases: ['total protein', 'serum protein', 'total serum protein'],
    category: 'protein',
    specimenType: 'serum',
    defaultUnit: 'g/dL',
    alternativeUnits: ['g/L'],
    referenceRanges: [
      { sex: 'any', min: 6.0, max: 8.3, unit: 'g/dL', source: 'CLSI' },
    ],
    redFlagThresholds: [
      { direction: 'high', value: 10.0, unit: 'g/dL', severity: 'warning', message: 'Elevated total protein may indicate multiple myeloma, chronic infection, or dehydration.', action: 'Discuss serum protein electrophoresis with your clinician.' },
      { direction: 'low', value: 5.0, unit: 'g/dL', severity: 'warning', message: 'Low total protein may indicate liver disease, nephrotic syndrome, or malnutrition.', action: 'See your clinician for evaluation.' },
    ],
    whatItMeasures: 'The total concentration of albumin and globulin proteins in the blood. Proteins serve as transporters, enzymes, antibodies, and maintain oncotic pressure that keeps fluid in blood vessels.',
    whatResultMayMean: {
      high: 'Elevated total protein may indicate dehydration (hemoconcentration), chronic infections (HIV, hepatitis), autoimmune disease, or plasma cell disorders such as multiple myeloma (monoclonal gammopathy).',
      low: 'Low total protein may indicate liver disease (decreased production), nephrotic syndrome (urinary loss), malabsorption, malnutrition, or protein-losing enteropathy.',
    },
    commonNonDangerousReasons: {
      high: ['Dehydration', 'Chronic mild infection', 'Upright posture during blood draw'],
      low: ['Overhydration', 'Pregnancy (hemodilution)', 'Low-protein diet', 'Older age'],
    },
    whenItMatters: 'Total protein is part of the comprehensive metabolic panel and helps screen for liver disease, kidney disease, nutritional status, and monoclonal gammopathies.',
    dailyLifeActions: {
      high: ['Stay well-hydrated', 'No specific dietary changes unless directed by your clinician'],
      low: ['Ensure adequate protein intake from diverse sources (meat, fish, eggs, dairy, legumes, soy)', 'Address underlying liver or kidney conditions with your clinician'],
    },
    whenToSeeDoctor: {
      high: 'See a clinician if total protein is above 9.0 g/dL for serum protein electrophoresis to evaluate for monoclonal gammopathy.',
      low: 'See a clinician if total protein is below 6.0 g/dL to evaluate for liver disease, kidney disease, or malnutrition.',
    },
    preAnalyticalConfounders: [
      'Dehydration (falsely elevated)',
      'Overhydration or IV fluids (falsely low)',
      'Prolonged tourniquet (hemoconcentration — falsely elevated)',
      'Posture (higher when standing)',
    ],
    medicationsAffecting: [
      'IV immunoglobulin (increase)',
      'Corticosteroids (may decrease albumin)',
      'Androgens (may increase)',
    ],
    relatedBiomarkers: ['ALB', 'GLOBULIN', 'TBIL', 'ALT', 'AST'],
    evidenceTier: 1,
    lastReviewed: '2026-03-01',
  },
  {
    code: 'ALB',
    name: 'Albumin',
    aliases: ['serum albumin', 'Alb'],
    category: 'protein',
    specimenType: 'serum',
    defaultUnit: 'g/dL',
    alternativeUnits: ['g/L'],
    referenceRanges: [
      { sex: 'any', min: 3.5, max: 5.5, unit: 'g/dL', source: 'CLSI' },
    ],
    redFlagThresholds: [
      { direction: 'low', value: 2.5, unit: 'g/dL', severity: 'critical', message: 'Severely low albumin — significant risk of edema, poor wound healing, and infection. Indicates serious underlying disease.', action: 'See your clinician urgently for evaluation.' },
      { direction: 'low', value: 3.0, unit: 'g/dL', severity: 'warning', message: 'Low albumin may indicate chronic liver disease, nephrotic syndrome, malnutrition, or chronic inflammation.', action: 'Discuss with your clinician.' },
    ],
    whatItMeasures: 'Albumin is the most abundant protein in the blood, produced by the liver. It maintains oncotic pressure (preventing fluid leakage into tissues), transports hormones, drugs, and fatty acids, and serves as a marker of liver synthetic function and nutritional status.',
    whatResultMayMean: {
      high: 'High albumin is almost always due to dehydration (hemoconcentration) rather than true overproduction.',
      low: 'Low albumin may indicate liver disease (cirrhosis — decreased production), nephrotic syndrome (kidney loss), malnutrition, chronic inflammation (albumin is a negative acute-phase reactant), or protein-losing enteropathy.',
    },
    commonNonDangerousReasons: {
      high: ['Dehydration'],
      low: [
        'Chronic inflammation (even mild — albumin drops as an acute-phase response)',
        'Pregnancy (hemodilution)',
        'Hospitalization and acute illness',
        'Older age',
        'Overhydration',
      ],
    },
    whenItMatters: 'Albumin is a key marker for liver function, nutritional status, and overall prognosis. It must be checked when interpreting total calcium and certain drug levels (many drugs bind to albumin).',
    dailyLifeActions: {
      high: ['Stay well-hydrated'],
      low: [
        'Ensure adequate protein intake (0.8-1.0 g/kg/day for most adults, more if recovering from illness)',
        'Address underlying liver or kidney conditions',
        'If malnourished, work with a dietitian to optimize caloric and protein intake',
        'Manage chronic inflammatory conditions',
      ],
    },
    whenToSeeDoctor: {
      high: 'High albumin from dehydration corrects with fluid intake. No specific follow-up needed unless dehydration is recurrent.',
      low: 'See a clinician if albumin is below 3.5 g/dL to evaluate for liver disease, kidney disease, or nutritional deficiency. See urgently if below 2.5 g/dL.',
    },
    preAnalyticalConfounders: [
      'Dehydration (falsely elevated)',
      'Overhydration or IV fluids (falsely low)',
      'Prolonged tourniquet (falsely elevated)',
      'Upright posture (slightly higher than supine)',
      'Acute illness and inflammation (negative acute-phase reactant — drops quickly)',
    ],
    medicationsAffecting: [
      'Anabolic steroids (may increase)',
      'IV albumin infusion (increase)',
      'Corticosteroids (may decrease with chronic use)',
      'Oral contraceptives (may slightly decrease)',
    ],
    relatedBiomarkers: ['TP', 'GLOBULIN', 'CA', 'TBIL', 'AST', 'ALT', 'CRP'],
    evidenceTier: 1,
    lastReviewed: '2026-03-01',
  },
  {
    code: 'GLOBULIN',
    name: 'Globulin',
    aliases: ['serum globulin', 'total globulin'],
    category: 'protein',
    specimenType: 'calculated (total protein minus albumin)',
    defaultUnit: 'g/dL',
    alternativeUnits: ['g/L'],
    referenceRanges: [
      { sex: 'any', min: 2.0, max: 3.5, unit: 'g/dL', source: 'CLSI' },
    ],
    redFlagThresholds: [
      { direction: 'high', value: 5.0, unit: 'g/dL', severity: 'warning', message: 'Elevated globulin may indicate monoclonal gammopathy (myeloma), chronic infection, or autoimmune disease.', action: 'Discuss serum protein electrophoresis with your clinician.' },
      { direction: 'low', value: 1.5, unit: 'g/dL', severity: 'warning', message: 'Low globulin may indicate immunodeficiency or nephrotic syndrome.', action: 'Discuss immunoglobulin levels with your clinician.' },
    ],
    whatItMeasures: 'The total concentration of globulin proteins, which include antibodies (immunoglobulins), transport proteins, and complement factors. Globulin is calculated by subtracting albumin from total protein.',
    whatResultMayMean: {
      high: 'Elevated globulin may indicate polyclonal gammopathy (chronic infection, autoimmune disease, liver disease) or monoclonal gammopathy (multiple myeloma, Waldenstrom macroglobulinemia). Serum protein electrophoresis (SPEP) helps differentiate.',
      low: 'Low globulin may indicate antibody deficiency (hypogammaglobulinemia), nephrotic syndrome, or malnutrition.',
    },
    commonNonDangerousReasons: {
      high: ['Chronic mild infection', 'Chronic inflammation', 'Dehydration', 'Liver disease'],
      low: ['Young age', 'Corticosteroid use', 'Malnutrition'],
    },
    whenItMatters: 'Globulin is important for screening for monoclonal gammopathies and assessing immune function. The albumin:globulin (A:G) ratio helps identify abnormal protein patterns.',
    dailyLifeActions: {
      high: ['Follow your clinician\'s recommendations for further testing if indicated'],
      low: ['Ensure adequate nutrition', 'Discuss immunoglobulin testing if experiencing recurrent infections'],
    },
    whenToSeeDoctor: {
      high: 'See a clinician if globulin is above 4.0 g/dL for SPEP and further evaluation.',
      low: 'See a clinician if globulin is below 2.0 g/dL, especially with recurrent infections.',
    },
    preAnalyticalConfounders: ['All confounders affecting total protein and albumin also affect calculated globulin', 'Dehydration (falsely elevated)'],
    medicationsAffecting: ['IV immunoglobulin (increase)', 'Immunosuppressants (may decrease)', 'Corticosteroids (may decrease immunoglobulins)'],
    relatedBiomarkers: ['TP', 'ALB', 'CRP', 'ESR'],
    evidenceTier: 1,
    lastReviewed: '2026-03-01',
  },
];
