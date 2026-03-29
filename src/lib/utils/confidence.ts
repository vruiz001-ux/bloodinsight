// Confidence scoring for OCR extraction results

/**
 * Confidence scoring evaluates how reliable an OCR-extracted biomarker result is.
 * Scores range from 0.0 (no confidence) to 1.0 (full confidence).
 *
 * Factors that affect confidence:
 * - Value parsability: can the raw value be parsed as a number?
 * - Name recognition: does the raw name match a known biomarker?
 * - Unit recognition: is the unit a known biomarker unit?
 * - Range presence: does the result include a reference range?
 * - Flag consistency: does the flag match the value vs range relationship?
 * - Value plausibility: is the value within a biologically possible range?
 */

export interface ConfidenceBreakdown {
  overall: number;
  valueParsability: number;
  nameRecognition: number;
  unitRecognition: number;
  rangePresence: number;
  flagConsistency: number;
  valuePlausibility: number;
}

export interface ExtractionInput {
  rawName: string;
  rawValue: string;
  rawUnit: string | null;
  rawRange: string | null;
  rawFlag: string | null;
  normalizedCode: string | null;
  normalizedValue: number | null;
  normalizedUnit: string | null;
}

// Known units that OCR might extract
const KNOWN_UNITS = new Set([
  'mg/dl', 'mg/l', 'g/dl', 'g/l', 'mmol/l', 'µmol/l', 'umol/l',
  'ng/ml', 'ng/dl', 'pg/ml', 'pmol/l', 'nmol/l',
  'miu/l', 'µiu/ml', 'uiu/ml', 'iu/l', 'u/l',
  'mm/hr', 'mm/h',
  '%',
  'fl', 'pg',
  '10^3/µl', '10^3/ul', 'k/ul', 'x10^3/ul', 'thou/ul',
  '10^6/µl', '10^6/ul', 'm/ul', 'x10^6/ul', 'mil/ul',
  'meq/l',
  'ml/min/1.73m²', 'ml/min/1.73m2',
  'µg/l', 'ug/l',
  'ratio',
  'cells/µl', 'cells/ul',
  'sec', 'seconds',
  'mg/24h', 'g/24h',
  'mmol/mol',
]);

// Biologically impossible values per biomarker code
// These represent absolute extremes that cannot occur in a living person
const PLAUSIBILITY_BOUNDS: Record<string, { min: number; max: number }> = {
  HGB: { min: 1, max: 30 },
  HCT: { min: 5, max: 80 },
  RBC: { min: 0.5, max: 10 },
  WBC: { min: 0.1, max: 500 },
  MCV: { min: 40, max: 150 },
  GLUCOSE: { min: 10, max: 1000 },
  HBA1C: { min: 2, max: 20 },
  TOTAL_CHOLESTEROL: { min: 30, max: 600 },
  LDL: { min: 5, max: 500 },
  HDL: { min: 5, max: 200 },
  TRIGLYCERIDES: { min: 10, max: 5000 },
  CREATININE: { min: 0.1, max: 30 },
  BUN: { min: 1, max: 200 },
  EGFR: { min: 1, max: 200 },
  ALT: { min: 1, max: 10000 },
  AST: { min: 1, max: 10000 },
  GGT: { min: 1, max: 5000 },
  BILIRUBIN: { min: 0.01, max: 50 },
  TSH: { min: 0.001, max: 200 },
  FT4: { min: 0.1, max: 10 },
  FT3: { min: 0.5, max: 20 },
  FERRITIN: { min: 1, max: 10000 },
  B12: { min: 50, max: 5000 },
  FOLATE: { min: 0.5, max: 50 },
  CRP: { min: 0, max: 500 },
  ESR: { min: 0, max: 200 },
  SODIUM: { min: 100, max: 180 },
  POTASSIUM: { min: 1.5, max: 10 },
  CALCIUM: { min: 4, max: 18 },
  ALBUMIN: { min: 0.5, max: 8 },
  NEUTROPHILS: { min: 0.1, max: 50 },
};

/**
 * Score how well the raw value can be parsed as a numeric value.
 */
function scoreValueParsability(rawValue: string, normalizedValue: number | null): number {
  if (normalizedValue !== null && isFinite(normalizedValue)) {
    return 1.0;
  }

  // Check if the raw value looks somewhat numeric
  const cleaned = rawValue.replace(/[<>≤≥,\s]/g, '').trim();
  if (/^\d+\.?\d*$/.test(cleaned)) {
    return 0.8; // Parsable but wasn't normalized for some reason
  }
  if (/\d/.test(rawValue)) {
    return 0.4; // Contains digits but messy
  }

  return 0.0; // Not parsable at all
}

/**
 * Score how well the raw name matches a known biomarker.
 */
function scoreNameRecognition(rawName: string, normalizedCode: string | null): number {
  if (normalizedCode) {
    return 1.0;
  }

  // Even if not normalized, score based on name quality
  const name = rawName.trim();
  if (name.length === 0) return 0.0;
  if (name.length < 2) return 0.2;
  if (/^[A-Za-z]/.test(name)) return 0.4; // At least starts with a letter
  return 0.2;
}

/**
 * Score whether the unit is a recognized biomarker unit.
 */
function scoreUnitRecognition(rawUnit: string | null, normalizedUnit: string | null): number {
  if (normalizedUnit && KNOWN_UNITS.has(normalizedUnit.toLowerCase())) {
    return 1.0;
  }
  if (rawUnit) {
    const lower = rawUnit.toLowerCase().trim();
    if (KNOWN_UNITS.has(lower)) return 0.9;
    if (lower.length > 0 && lower.length < 20) return 0.5; // Unknown but present
    return 0.2;
  }
  return 0.0; // No unit at all
}

/**
 * Score whether a reference range was provided.
 */
function scoreRangePresence(rawRange: string | null): number {
  if (!rawRange) return 0.0;

  const range = rawRange.trim();
  if (range.length === 0) return 0.0;

  // Check for common range patterns: "4.0 - 10.0", "4.0-10.0", "< 200", "> 1.0"
  if (/\d+\.?\d*\s*[-–]\s*\d+\.?\d*/.test(range)) return 1.0;
  if (/[<>≤≥]\s*\d+\.?\d*/.test(range)) return 0.9;
  if (/\d/.test(range)) return 0.6;

  return 0.3;
}

/**
 * Score whether the flag (H/L/N) is consistent with the value relative to the range.
 */
function scoreFlagConsistency(
  rawFlag: string | null,
  normalizedValue: number | null,
  rawRange: string | null
): number {
  // No flag is not necessarily bad
  if (!rawFlag) return 0.7;

  const flag = rawFlag.trim().toUpperCase();

  // If we can't check consistency, give a neutral score
  if (normalizedValue === null || !rawRange) return 0.7;

  // Try to parse the range
  const rangeMatch = rawRange.match(/(\d+\.?\d*)\s*[-–]\s*(\d+\.?\d*)/);
  if (!rangeMatch) return 0.7;

  const min = parseFloat(rangeMatch[1]);
  const max = parseFloat(rangeMatch[2]);

  const isHigh = normalizedValue > max;
  const isLow = normalizedValue < min;
  const isNormal = !isHigh && !isLow;

  // Check flag consistency
  if ((flag === 'H' || flag === 'HIGH') && isHigh) return 1.0;
  if ((flag === 'L' || flag === 'LOW') && isLow) return 1.0;
  if ((flag === 'N' || flag === 'NORMAL' || flag === '') && isNormal) return 1.0;

  // Flag contradicts the value/range relationship
  if ((flag === 'H' || flag === 'HIGH') && isLow) return 0.2;
  if ((flag === 'L' || flag === 'LOW') && isHigh) return 0.2;
  if ((flag === 'H' || flag === 'HIGH') && isNormal) return 0.4;
  if ((flag === 'L' || flag === 'LOW') && isNormal) return 0.4;

  return 0.6;
}

/**
 * Score whether the value falls within biologically plausible bounds.
 */
function scoreValuePlausibility(
  normalizedCode: string | null,
  normalizedValue: number | null
): number {
  if (normalizedValue === null || normalizedCode === null) return 0.5;

  const bounds = PLAUSIBILITY_BOUNDS[normalizedCode];
  if (!bounds) return 0.7; // Unknown biomarker, assume plausible

  if (normalizedValue >= bounds.min && normalizedValue <= bounds.max) {
    return 1.0;
  }

  // Slightly outside bounds might be real (extreme cases)
  const rangeSpan = bounds.max - bounds.min;
  if (normalizedValue < bounds.min) {
    const deviation = (bounds.min - normalizedValue) / rangeSpan;
    if (deviation < 0.1) return 0.6;
    return 0.1;
  }
  if (normalizedValue > bounds.max) {
    const deviation = (normalizedValue - bounds.max) / rangeSpan;
    if (deviation < 0.1) return 0.6;
    return 0.1;
  }

  return 0.5;
}

/**
 * Calculate overall confidence score for an extracted biomarker.
 * Returns a breakdown of all confidence factors.
 */
export function calculateConfidence(input: ExtractionInput): ConfidenceBreakdown {
  const valueParsability = scoreValueParsability(input.rawValue, input.normalizedValue);
  const nameRecognition = scoreNameRecognition(input.rawName, input.normalizedCode);
  const unitRecognition = scoreUnitRecognition(input.rawUnit, input.normalizedUnit);
  const rangePresence = scoreRangePresence(input.rawRange);
  const flagConsistency = scoreFlagConsistency(
    input.rawFlag,
    input.normalizedValue,
    input.rawRange
  );
  const valuePlausibility = scoreValuePlausibility(
    input.normalizedCode,
    input.normalizedValue
  );

  // Weighted average — value and name recognition are most important
  const weights = {
    valueParsability: 0.25,
    nameRecognition: 0.25,
    unitRecognition: 0.15,
    rangePresence: 0.10,
    flagConsistency: 0.10,
    valuePlausibility: 0.15,
  };

  const overall =
    valueParsability * weights.valueParsability +
    nameRecognition * weights.nameRecognition +
    unitRecognition * weights.unitRecognition +
    rangePresence * weights.rangePresence +
    flagConsistency * weights.flagConsistency +
    valuePlausibility * weights.valuePlausibility;

  return {
    overall: Math.round(overall * 1000) / 1000,
    valueParsability,
    nameRecognition,
    unitRecognition,
    rangePresence,
    flagConsistency,
    valuePlausibility,
  };
}

/**
 * Determine if an extraction result is reliable enough to use.
 * Threshold of 0.6 means we need at least moderate confidence.
 */
export function isReliableExtraction(
  input: ExtractionInput,
  threshold: number = 0.6
): boolean {
  const confidence = calculateConfidence(input);
  return confidence.overall >= threshold;
}

/**
 * Get a human-readable label for a confidence score.
 */
export function confidenceLabel(score: number): string {
  if (score >= 0.9) return 'Very High';
  if (score >= 0.75) return 'High';
  if (score >= 0.6) return 'Moderate';
  if (score >= 0.4) return 'Low';
  return 'Very Low';
}
