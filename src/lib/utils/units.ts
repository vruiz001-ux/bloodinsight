// Unit conversion utilities for common biomarker units

/**
 * Conversion factors and formulas for biomarker unit conversions.
 *
 * Common conversions:
 *   Glucose:      mg/dL <-> mmol/L  (factor: 18.018)
 *   Cholesterol:  mg/dL <-> mmol/L  (factor: 38.67)
 *   Triglycerides: mg/dL <-> mmol/L (factor: 88.57)
 *   Creatinine:   mg/dL <-> µmol/L  (factor: 88.4)
 *   BUN/Urea:     mg/dL <-> mmol/L  (factor: 2.8)
 *   Bilirubin:    mg/dL <-> µmol/L  (factor: 17.1)
 *   Calcium:      mg/dL <-> mmol/L  (factor: 4.008)
 *   Uric acid:    mg/dL <-> µmol/L  (factor: 59.48)
 *   Hemoglobin:   g/dL  <-> g/L     (factor: 10)
 *   HbA1c:        % <-> mmol/mol    (IFCC formula)
 */

export type ConvertibleUnit =
  | 'mg/dL'
  | 'mmol/L'
  | 'µmol/L'
  | 'umol/L'
  | 'g/dL'
  | 'g/L'
  | '%'
  | 'mmol/mol'
  | 'ng/mL'
  | 'pmol/L'
  | 'pg/mL'
  | 'mIU/L'
  | 'µIU/mL'
  | 'uIU/mL';

interface ConversionRule {
  from: string;
  to: string;
  convert: (value: number) => number;
}

// All conversion rules indexed by biomarker code
const CONVERSION_RULES: Record<string, ConversionRule[]> = {
  GLUCOSE: [
    { from: 'mg/dL', to: 'mmol/L', convert: (v) => v / 18.018 },
    { from: 'mmol/L', to: 'mg/dL', convert: (v) => v * 18.018 },
  ],
  TOTAL_CHOLESTEROL: [
    { from: 'mg/dL', to: 'mmol/L', convert: (v) => v / 38.67 },
    { from: 'mmol/L', to: 'mg/dL', convert: (v) => v * 38.67 },
  ],
  LDL: [
    { from: 'mg/dL', to: 'mmol/L', convert: (v) => v / 38.67 },
    { from: 'mmol/L', to: 'mg/dL', convert: (v) => v * 38.67 },
  ],
  HDL: [
    { from: 'mg/dL', to: 'mmol/L', convert: (v) => v / 38.67 },
    { from: 'mmol/L', to: 'mg/dL', convert: (v) => v * 38.67 },
  ],
  TRIGLYCERIDES: [
    { from: 'mg/dL', to: 'mmol/L', convert: (v) => v / 88.57 },
    { from: 'mmol/L', to: 'mg/dL', convert: (v) => v * 88.57 },
  ],
  CREATININE: [
    { from: 'mg/dL', to: 'µmol/L', convert: (v) => v * 88.4 },
    { from: 'µmol/L', to: 'mg/dL', convert: (v) => v / 88.4 },
    { from: 'mg/dL', to: 'umol/L', convert: (v) => v * 88.4 },
    { from: 'umol/L', to: 'mg/dL', convert: (v) => v / 88.4 },
  ],
  BUN: [
    { from: 'mg/dL', to: 'mmol/L', convert: (v) => v / 2.8 },
    { from: 'mmol/L', to: 'mg/dL', convert: (v) => v * 2.8 },
  ],
  BILIRUBIN: [
    { from: 'mg/dL', to: 'µmol/L', convert: (v) => v * 17.1 },
    { from: 'µmol/L', to: 'mg/dL', convert: (v) => v / 17.1 },
    { from: 'mg/dL', to: 'umol/L', convert: (v) => v * 17.1 },
    { from: 'umol/L', to: 'mg/dL', convert: (v) => v / 17.1 },
  ],
  CALCIUM: [
    { from: 'mg/dL', to: 'mmol/L', convert: (v) => v / 4.008 },
    { from: 'mmol/L', to: 'mg/dL', convert: (v) => v * 4.008 },
  ],
  URIC_ACID: [
    { from: 'mg/dL', to: 'µmol/L', convert: (v) => v * 59.48 },
    { from: 'µmol/L', to: 'mg/dL', convert: (v) => v / 59.48 },
    { from: 'mg/dL', to: 'umol/L', convert: (v) => v * 59.48 },
    { from: 'umol/L', to: 'mg/dL', convert: (v) => v / 59.48 },
  ],
  HGB: [
    { from: 'g/dL', to: 'g/L', convert: (v) => v * 10 },
    { from: 'g/L', to: 'g/dL', convert: (v) => v / 10 },
  ],
  HBA1C: [
    // NGSP (%) to IFCC (mmol/mol): IFCC = (NGSP - 2.15) * 10.929
    { from: '%', to: 'mmol/mol', convert: (v) => (v - 2.15) * 10.929 },
    // IFCC (mmol/mol) to NGSP (%): NGSP = (IFCC / 10.929) + 2.15
    { from: 'mmol/mol', to: '%', convert: (v) => v / 10.929 + 2.15 },
  ],
  B12: [
    // pg/mL <-> pmol/L (factor: 0.7378)
    { from: 'pg/mL', to: 'pmol/L', convert: (v) => v * 0.7378 },
    { from: 'pmol/L', to: 'pg/mL', convert: (v) => v / 0.7378 },
  ],
  FOLATE: [
    // ng/mL <-> nmol/L (factor: 2.266)
    { from: 'ng/mL', to: 'nmol/L', convert: (v) => v * 2.266 },
    { from: 'nmol/L', to: 'ng/mL', convert: (v) => v / 2.266 },
  ],
  FERRITIN: [
    // ng/mL and µg/L are equivalent (1:1)
    { from: 'ng/mL', to: 'µg/L', convert: (v) => v },
    { from: 'µg/L', to: 'ng/mL', convert: (v) => v },
  ],
  TSH: [
    // mIU/L and µIU/mL are equivalent
    { from: 'mIU/L', to: 'µIU/mL', convert: (v) => v },
    { from: 'µIU/mL', to: 'mIU/L', convert: (v) => v },
    { from: 'mIU/L', to: 'uIU/mL', convert: (v) => v },
    { from: 'uIU/mL', to: 'mIU/L', convert: (v) => v },
  ],
  SODIUM: [
    // mEq/L and mmol/L are equivalent for sodium
    { from: 'mEq/L', to: 'mmol/L', convert: (v) => v },
    { from: 'mmol/L', to: 'mEq/L', convert: (v) => v },
  ],
  POTASSIUM: [
    { from: 'mEq/L', to: 'mmol/L', convert: (v) => v },
    { from: 'mmol/L', to: 'mEq/L', convert: (v) => v },
  ],
};

/**
 * Convert a biomarker value from one unit to another.
 * Returns null if no conversion rule exists for the given biomarker + unit pair.
 */
export function convertUnit(
  biomarkerCode: string,
  value: number,
  fromUnit: string,
  toUnit: string
): number | null {
  // Normalize unit strings
  const from = normalizeUnit(fromUnit);
  const to = normalizeUnit(toUnit);

  // Same unit, no conversion needed
  if (from === to) return value;

  const rules = CONVERSION_RULES[biomarkerCode];
  if (!rules) return null;

  const rule = rules.find((r) => normalizeUnit(r.from) === from && normalizeUnit(r.to) === to);
  if (!rule) return null;

  return roundToDecimal(rule.convert(value), 4);
}

/**
 * Normalize a unit value to a standardized target unit for the given biomarker.
 * Returns the converted value and target unit, or the original if no conversion is needed.
 */
export function normalizeToStandardUnit(
  biomarkerCode: string,
  value: number,
  unit: string
): { value: number; unit: string } {
  const standardUnits = getStandardUnit(biomarkerCode);
  if (!standardUnits) return { value, unit };

  const normalizedUnit = normalizeUnit(unit);
  if (normalizedUnit === normalizeUnit(standardUnits)) return { value, unit: standardUnits };

  const converted = convertUnit(biomarkerCode, value, unit, standardUnits);
  if (converted === null) return { value, unit };

  return { value: converted, unit: standardUnits };
}

/**
 * Get the standard (preferred) unit for a biomarker code.
 * Uses conventional US units as the default standard.
 */
export function getStandardUnit(biomarkerCode: string): string | null {
  const standards: Record<string, string> = {
    GLUCOSE: 'mg/dL',
    TOTAL_CHOLESTEROL: 'mg/dL',
    LDL: 'mg/dL',
    HDL: 'mg/dL',
    TRIGLYCERIDES: 'mg/dL',
    CREATININE: 'mg/dL',
    BUN: 'mg/dL',
    BILIRUBIN: 'mg/dL',
    CALCIUM: 'mg/dL',
    URIC_ACID: 'mg/dL',
    HGB: 'g/dL',
    HBA1C: '%',
    B12: 'pg/mL',
    FOLATE: 'ng/mL',
    FERRITIN: 'ng/mL',
    TSH: 'mIU/L',
    SODIUM: 'mmol/L',
    POTASSIUM: 'mmol/L',
    CRP: 'mg/L',
    ESR: 'mm/hr',
    WBC: '10^3/µL',
    RBC: '10^6/µL',
    HCT: '%',
    MCV: 'fL',
    ALT: 'U/L',
    AST: 'U/L',
    GGT: 'U/L',
    ALBUMIN: 'g/dL',
    EGFR: 'mL/min/1.73m²',
    FT4: 'ng/dL',
    FT3: 'pg/mL',
    NEUTROPHILS: '10^3/µL',
  };

  return standards[biomarkerCode] ?? null;
}

/**
 * Normalize a unit string to a canonical form for comparison.
 */
export function normalizeUnit(unit: string): string {
  return unit
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/μ/g, 'µ') // normalize micro signs
    .replace(/u(?=mol|iu|g\/)/g, 'µ') // uIU -> µIU, umol -> µmol, ug -> µg
    .replace(/\^(\d)/g, '^$1') // normalize exponents
    .replace(/×/g, '*')
    .replace(/³/g, '^3')
    .replace(/²/g, '^2');
}

/**
 * Check if two units are equivalent (same unit, different notation).
 */
export function unitsAreEquivalent(unit1: string, unit2: string): boolean {
  return normalizeUnit(unit1) === normalizeUnit(unit2);
}

/**
 * Round a number to a specific number of decimal places.
 */
function roundToDecimal(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
