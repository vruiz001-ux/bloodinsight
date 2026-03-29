// Clinical pattern detection engine
// All language uses careful phrasing: "may suggest", "can be consistent with"

import type { StatusLevel } from './knowledge/types';

export interface PatternResult {
  id: string;
  name: string;
  description: string;
  confidence: number; // 0-1
  matchedBiomarkers: string[];
  interpretation: string;
}

interface BiomarkerInput {
  code: string;
  value: number;
  unit: string;
  status: StatusLevel;
}

interface PatternRule {
  id: string;
  name: string;
  description: string;
  interpretation: string;
  evaluate: (biomarkers: Map<string, BiomarkerInput>) => PatternResult | null;
}

// ── Helper functions ──────────────────────────────────────────────────────

function isLow(b: BiomarkerInput | undefined): boolean {
  return b !== undefined && (b.status === 'abnormal' || b.status === 'urgent' || b.status === 'borderline') && isStatusDirectionLow(b);
}

function isHigh(b: BiomarkerInput | undefined): boolean {
  return b !== undefined && (b.status === 'abnormal' || b.status === 'urgent' || b.status === 'borderline') && !isStatusDirectionLow(b);
}

function isAbnormal(b: BiomarkerInput | undefined): boolean {
  return b !== undefined && b.status !== 'normal';
}

/**
 * Heuristic: for "low" detection, we check known biomarkers with typical thresholds.
 * Since we only have status (not range info) in this context,
 * we use the status + code to infer direction.
 * A borderline/abnormal value for a code known to be typically elevated
 * when high is considered "high"; otherwise "low" if the context makes sense.
 *
 * In practice we rely on the status being set correctly by the range evaluator.
 * Here we use a simple rule: if the biomarker has an abnormal status,
 * we need the value relative to the typical midpoint. Since we don't have ranges here,
 * we use code-specific known midpoints.
 */
const TYPICAL_MIDPOINTS: Record<string, number> = {
  HGB: 14, MCV: 88, FERRITIN: 100, RBC: 4.7,
  B12: 500, FOLATE: 12,
  CRP: 3, ESR: 12, WBC: 7.5, NEUTROPHILS: 4.5,
  GLUCOSE: 90, HBA1C: 5.4, TRIGLYCERIDES: 120, HDL: 55, LDL: 100,
  HCT: 43, SODIUM: 140, ALBUMIN: 4.2, BUN: 15,
  CREATININE: 1.0, EGFR: 90, POTASSIUM: 4.2,
  AST: 25, ALT: 25, GGT: 30, BILIRUBIN: 0.8,
  TSH: 2.5, FT4: 1.2, FT3: 3.0,
  TOTAL_CHOLESTEROL: 190,
};

function isStatusDirectionLow(b: BiomarkerInput): boolean {
  const mid = TYPICAL_MIDPOINTS[b.code];
  if (mid === undefined) return b.value < 0; // fallback
  return b.value < mid;
}

function get(map: Map<string, BiomarkerInput>, code: string): BiomarkerInput | undefined {
  return map.get(code);
}

// ── Pattern definitions ───────────────────────────────────────────────────

const PATTERNS: PatternRule[] = [
  // 1. Iron deficiency
  {
    id: 'iron_deficiency',
    name: 'Possible Iron Deficiency',
    description: 'Low ferritin combined with low hemoglobin and low MCV may suggest iron deficiency.',
    interpretation:
      'This combination of results can be consistent with iron deficiency anemia. ' +
      'Iron deficiency is the most common nutritional deficiency worldwide. ' +
      'Consider discussing iron-rich foods, supplementation, and further testing with your healthcare provider.',
    evaluate(biomarkers) {
      const ferritin = get(biomarkers, 'FERRITIN');
      const hgb = get(biomarkers, 'HGB');
      const mcv = get(biomarkers, 'MCV');

      const matched: string[] = [];
      let score = 0;
      const required = 2;

      if (isLow(ferritin)) { matched.push('FERRITIN'); score++; }
      if (isLow(hgb)) { matched.push('HGB'); score++; }
      if (isLow(mcv)) { matched.push('MCV'); score++; }

      if (score < required) return null;

      return {
        id: this.id,
        name: this.name,
        description: this.description,
        confidence: Math.min(score / 3, 1),
        matchedBiomarkers: matched,
        interpretation: this.interpretation,
      };
    },
  },

  // 2. B12 / Folate deficiency
  {
    id: 'b12_folate_deficiency',
    name: 'Possible B12 or Folate Deficiency',
    description: 'Low B12 or folate with high MCV may suggest megaloblastic anemia.',
    interpretation:
      'These results can be consistent with vitamin B12 or folate deficiency, ' +
      'which may lead to megaloblastic anemia. This pattern may warrant further evaluation ' +
      'including methylmalonic acid and homocysteine levels. Consider discussing supplementation with your doctor.',
    evaluate(biomarkers) {
      const b12 = get(biomarkers, 'B12');
      const folate = get(biomarkers, 'FOLATE');
      const mcv = get(biomarkers, 'MCV');
      const rbc = get(biomarkers, 'RBC');

      const matched: string[] = [];
      let score = 0;

      if (isLow(b12)) { matched.push('B12'); score++; }
      if (isLow(folate)) { matched.push('FOLATE'); score++; }
      if (isHigh(mcv)) { matched.push('MCV'); score++; }
      if (isLow(rbc)) { matched.push('RBC'); score += 0.5; }

      // Need at least one of B12/folate low AND high MCV
      const hasVitaminLow = isLow(b12) || isLow(folate);
      if (!hasVitaminLow || !isHigh(mcv)) return null;
      if (score < 2) return null;

      return {
        id: this.id,
        name: this.name,
        description: this.description,
        confidence: Math.min(score / 3.5, 1),
        matchedBiomarkers: matched,
        interpretation: this.interpretation,
      };
    },
  },

  // 3. Inflammation / Infection
  {
    id: 'inflammation_infection',
    name: 'Possible Inflammation or Infection',
    description: 'Elevated inflammatory markers with high WBC may suggest an active inflammatory process.',
    interpretation:
      'This combination of results may be consistent with an active inflammatory or infectious process. ' +
      'Elevated CRP, ESR, and WBC together can suggest the body is responding to inflammation, infection, or tissue damage. ' +
      'It is recommended to discuss these findings with your healthcare provider for further evaluation.',
    evaluate(biomarkers) {
      const crp = get(biomarkers, 'CRP');
      const esr = get(biomarkers, 'ESR');
      const wbc = get(biomarkers, 'WBC');
      const neutrophils = get(biomarkers, 'NEUTROPHILS');

      const matched: string[] = [];
      let score = 0;

      if (isHigh(crp)) { matched.push('CRP'); score++; }
      if (isHigh(esr)) { matched.push('ESR'); score++; }
      if (isHigh(wbc)) { matched.push('WBC'); score++; }
      if (isHigh(neutrophils)) { matched.push('NEUTROPHILS'); score += 0.5; }

      if (score < 2) return null;

      return {
        id: this.id,
        name: this.name,
        description: this.description,
        confidence: Math.min(score / 3.5, 1),
        matchedBiomarkers: matched,
        interpretation: this.interpretation,
      };
    },
  },

  // 4. Insulin resistance
  {
    id: 'insulin_resistance',
    name: 'Possible Insulin Resistance Pattern',
    description: 'Elevated glucose, HbA1c, and triglycerides with low HDL may suggest insulin resistance.',
    interpretation:
      'These findings can be consistent with insulin resistance or metabolic syndrome. ' +
      'This pattern may increase cardiovascular risk over time. ' +
      'Consider discussing dietary changes, exercise, and further metabolic testing with your healthcare provider.',
    evaluate(biomarkers) {
      const glucose = get(biomarkers, 'GLUCOSE');
      const hba1c = get(biomarkers, 'HBA1C');
      const trig = get(biomarkers, 'TRIGLYCERIDES');
      const hdl = get(biomarkers, 'HDL');

      const matched: string[] = [];
      let score = 0;

      if (isHigh(glucose)) { matched.push('GLUCOSE'); score++; }
      if (isHigh(hba1c)) { matched.push('HBA1C'); score++; }
      if (isHigh(trig)) { matched.push('TRIGLYCERIDES'); score++; }
      if (isLow(hdl)) { matched.push('HDL'); score++; }

      if (score < 2) return null;

      return {
        id: this.id,
        name: this.name,
        description: this.description,
        confidence: Math.min(score / 4, 1),
        matchedBiomarkers: matched,
        interpretation: this.interpretation,
      };
    },
  },

  // 5. Dehydration
  {
    id: 'dehydration',
    name: 'Possible Dehydration',
    description: 'Elevated hematocrit, sodium, albumin, and BUN may suggest dehydration.',
    interpretation:
      'This combination of elevated values can be consistent with dehydration or reduced fluid intake. ' +
      'When the body is dehydrated, blood becomes more concentrated, raising multiple markers simultaneously. ' +
      'Consider discussing hydration status and fluid intake with your healthcare provider.',
    evaluate(biomarkers) {
      const hct = get(biomarkers, 'HCT');
      const sodium = get(biomarkers, 'SODIUM');
      const albumin = get(biomarkers, 'ALBUMIN');
      const bun = get(biomarkers, 'BUN');

      const matched: string[] = [];
      let score = 0;

      if (isHigh(hct)) { matched.push('HCT'); score++; }
      if (isHigh(sodium)) { matched.push('SODIUM'); score++; }
      if (isHigh(albumin)) { matched.push('ALBUMIN'); score++; }
      if (isHigh(bun)) { matched.push('BUN'); score++; }

      if (score < 2) return null;

      return {
        id: this.id,
        name: this.name,
        description: this.description,
        confidence: Math.min(score / 4, 1),
        matchedBiomarkers: matched,
        interpretation: this.interpretation,
      };
    },
  },

  // 6. Kidney stress
  {
    id: 'kidney_stress',
    name: 'Possible Kidney Stress',
    description: 'Elevated creatinine with low eGFR and high BUN may suggest reduced kidney function.',
    interpretation:
      'These results may suggest the kidneys are under stress or not filtering as efficiently as expected. ' +
      'This pattern can be seen in dehydration, medication effects, or kidney disease. ' +
      'It is important to discuss these findings with your healthcare provider for proper evaluation and monitoring.',
    evaluate(biomarkers) {
      const creatinine = get(biomarkers, 'CREATININE');
      const egfr = get(biomarkers, 'EGFR');
      const bun = get(biomarkers, 'BUN');
      const potassium = get(biomarkers, 'POTASSIUM');

      const matched: string[] = [];
      let score = 0;

      if (isHigh(creatinine)) { matched.push('CREATININE'); score++; }
      if (isLow(egfr)) { matched.push('EGFR'); score++; }
      if (isHigh(bun)) { matched.push('BUN'); score++; }
      if (isHigh(potassium)) { matched.push('POTASSIUM'); score += 0.5; }

      if (score < 2) return null;

      return {
        id: this.id,
        name: this.name,
        description: this.description,
        confidence: Math.min(score / 3.5, 1),
        matchedBiomarkers: matched,
        interpretation: this.interpretation,
      };
    },
  },

  // 7. Liver stress
  {
    id: 'liver_stress',
    name: 'Possible Liver Stress',
    description: 'Elevated AST, ALT, and GGT may suggest liver stress or damage.',
    interpretation:
      'Elevated liver enzymes can indicate that the liver is under stress. ' +
      'This may be related to medication, alcohol use, fatty liver disease, or other conditions. ' +
      'Consider discussing these results with your healthcare provider for appropriate follow-up.',
    evaluate(biomarkers) {
      const ast = get(biomarkers, 'AST');
      const alt = get(biomarkers, 'ALT');
      const ggt = get(biomarkers, 'GGT');
      const bilirubin = get(biomarkers, 'BILIRUBIN');

      const matched: string[] = [];
      let score = 0;

      if (isHigh(ast)) { matched.push('AST'); score++; }
      if (isHigh(alt)) { matched.push('ALT'); score++; }
      if (isHigh(ggt)) { matched.push('GGT'); score++; }
      if (isHigh(bilirubin)) { matched.push('BILIRUBIN'); score += 0.5; }

      if (score < 2) return null;

      return {
        id: this.id,
        name: this.name,
        description: this.description,
        confidence: Math.min(score / 3.5, 1),
        matchedBiomarkers: matched,
        interpretation: this.interpretation,
      };
    },
  },

  // 8. Thyroid imbalance
  {
    id: 'thyroid_imbalance',
    name: 'Possible Thyroid Imbalance',
    description: 'Abnormal TSH with abnormal FT4 or FT3 may suggest thyroid dysfunction.',
    interpretation:
      'These results may be consistent with a thyroid imbalance. ' +
      'An abnormal TSH combined with abnormal free thyroid hormone levels can suggest hypothyroidism or hyperthyroidism. ' +
      'Thyroid disorders are common and treatable. Please discuss these findings with your healthcare provider.',
    evaluate(biomarkers) {
      const tsh = get(biomarkers, 'TSH');
      const ft4 = get(biomarkers, 'FT4');
      const ft3 = get(biomarkers, 'FT3');

      const matched: string[] = [];
      let score = 0;

      if (isAbnormal(tsh)) { matched.push('TSH'); score++; }
      if (isAbnormal(ft4)) { matched.push('FT4'); score++; }
      if (isAbnormal(ft3)) { matched.push('FT3'); score++; }

      // TSH must be abnormal, plus at least one of FT4/FT3
      if (!isAbnormal(tsh)) return null;
      if (!isAbnormal(ft4) && !isAbnormal(ft3)) return null;

      return {
        id: this.id,
        name: this.name,
        description: this.description,
        confidence: Math.min(score / 3, 1),
        matchedBiomarkers: matched,
        interpretation: this.interpretation,
      };
    },
  },

  // 9. Dyslipidemia
  {
    id: 'dyslipidemia',
    name: 'Possible Dyslipidemia',
    description: 'High LDL, high triglycerides, low HDL, and high total cholesterol may suggest dyslipidemia.',
    interpretation:
      'This lipid pattern may be consistent with dyslipidemia, a condition that can increase cardiovascular risk. ' +
      'Lifestyle modifications including diet, exercise, and weight management are typically first-line interventions. ' +
      'Discuss these results with your healthcare provider to determine if further evaluation or treatment is needed.',
    evaluate(biomarkers) {
      const ldl = get(biomarkers, 'LDL');
      const trig = get(biomarkers, 'TRIGLYCERIDES');
      const hdl = get(biomarkers, 'HDL');
      const tc = get(biomarkers, 'TOTAL_CHOLESTEROL');

      const matched: string[] = [];
      let score = 0;

      if (isHigh(ldl)) { matched.push('LDL'); score++; }
      if (isHigh(trig)) { matched.push('TRIGLYCERIDES'); score++; }
      if (isLow(hdl)) { matched.push('HDL'); score++; }
      if (isHigh(tc)) { matched.push('TOTAL_CHOLESTEROL'); score++; }

      if (score < 2) return null;

      return {
        id: this.id,
        name: this.name,
        description: this.description,
        confidence: Math.min(score / 4, 1),
        matchedBiomarkers: matched,
        interpretation: this.interpretation,
      };
    },
  },
];

/**
 * Detect clinical patterns from a set of biomarker results.
 * Returns all patterns that match with a confidence score.
 */
export function detectPatterns(
  results: Array<{ code: string; value: number; unit: string; status: StatusLevel }>
): PatternResult[] {
  const biomarkerMap = new Map<string, BiomarkerInput>();
  for (const r of results) {
    biomarkerMap.set(r.code, r);
  }

  const detected: PatternResult[] = [];

  for (const pattern of PATTERNS) {
    const result = pattern.evaluate(biomarkerMap);
    if (result) {
      detected.push(result);
    }
  }

  // Sort by confidence descending
  detected.sort((a, b) => b.confidence - a.confidence);

  return detected;
}
