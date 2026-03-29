// Normalization engine: maps raw OCR extractions to standard biomarker codes and units

import { getBiomarkerByAlias, biomarkersByCode } from '@/lib/medical/knowledge';
import type { BiomarkerKnowledge } from '@/lib/medical/knowledge/types';
import type { ParsedBiomarkerRow, ReportMetadata } from './parser';

export interface NormalizedBiomarker {
  // Raw data (as extracted)
  rawName: string;
  rawValue: string;
  rawUnit: string | null;
  rawRange: string | null;
  rawFlag: string | null;

  // Normalized data
  normalizedCode: string | null;
  normalizedName: string | null;
  normalizedValue: number | null;
  normalizedUnit: string | null;
  referenceMin: number | null;
  referenceMax: number | null;

  // Match quality
  confidence: number;
  matchMethod: 'exact' | 'alias' | 'fuzzy' | 'none';
  warnings: string[];
}

export interface NormalizationResult {
  biomarkers: NormalizedBiomarker[];
  metadata: ReportMetadata;
  overallConfidence: number;
  warnings: string[];
}

// ── Unit normalization ───────────────────────────────────────────────────

/**
 * Map of common OCR-mangled or non-standard unit strings to their canonical form.
 */
const UNIT_ALIASES: Record<string, string> = {
  // Case normalization
  'g/dl': 'g/dL',
  'g/DL': 'g/dL',
  'G/DL': 'g/dL',
  'mg/dl': 'mg/dL',
  'mg/DL': 'mg/dL',
  'MG/DL': 'mg/dL',
  'ng/ml': 'ng/mL',
  'ng/ML': 'ng/mL',
  'NG/ML': 'ng/mL',
  'pg/ml': 'pg/mL',
  'PG/ML': 'pg/mL',
  'ug/dl': 'µg/dL',
  'ug/dL': 'µg/dL',
  'UG/DL': 'µg/dL',
  'µg/dl': 'µg/dL',

  // Micro symbol variants
  'umol/L': 'µmol/L',
  'umol/l': 'µmol/L',
  'UMOL/L': 'µmol/L',
  'uIU/mL': 'µIU/mL',
  'uIU/ml': 'µIU/mL',
  'UIU/ML': 'µIU/mL',
  'ug/L': 'µg/L',
  'ug/l': 'µg/L',
  'UG/L': 'µg/L',

  // mIU/L variants
  'miu/l': 'mIU/L',
  'MIU/L': 'mIU/L',
  'mIU/l': 'mIU/L',

  // Cell count units
  '10^3/ul': '10^3/µL',
  '10^3/uL': '10^3/µL',
  'k/uL': '10^3/µL',
  'K/UL': '10^3/µL',
  'thou/uL': '10^3/µL',
  'x10^3/uL': '10^3/µL',
  'x10^3/ul': '10^3/µL',
  '10^6/ul': '10^6/µL',
  '10^6/uL': '10^6/µL',
  'm/uL': '10^6/µL',
  'M/UL': '10^6/µL',
  'mil/uL': '10^6/µL',
  'x10^6/uL': '10^6/µL',

  // ESR
  'mm/hr': 'mm/hr',
  'mm/h': 'mm/hr',
  'MM/HR': 'mm/hr',

  // eGFR
  'mL/min': 'mL/min/1.73m²',
  'ml/min': 'mL/min/1.73m²',
  'mL/min/1.73m2': 'mL/min/1.73m²',
  'ml/min/1.73m2': 'mL/min/1.73m²',

  // Simple units
  'fl': 'fL',
  'FL': 'fL',
  'u/l': 'U/L',
  'u/L': 'U/L',
  'U/l': 'U/L',
  'iu/l': 'IU/L',
  'IU/l': 'IU/L',
  'meq/l': 'mEq/L',
  'MEQ/L': 'mEq/L',
  'mEq/l': 'mEq/L',
  'mmol/l': 'mmol/L',
  'MMOL/L': 'mmol/L',
  'mg/l': 'mg/L',
  'mg/L': 'mg/L',
  'MG/L': 'mg/L',
};

/**
 * Normalize a unit string to its canonical form.
 */
export function normalizeUnitString(unit: string | null): string | null {
  if (!unit) return null;
  const trimmed = unit.trim();
  if (trimmed.length === 0) return null;

  // Check the alias map first
  if (UNIT_ALIASES[trimmed]) {
    return UNIT_ALIASES[trimmed];
  }

  // Try lowercase lookup
  const lower = trimmed.toLowerCase();
  for (const [key, value] of Object.entries(UNIT_ALIASES)) {
    if (key.toLowerCase() === lower) {
      return value;
    }
  }

  // Return as-is if we don't have a mapping
  return trimmed;
}

// ── Reference range parsing ──────────────────────────────────────────────

export interface ParsedRange {
  min: number | null;
  max: number | null;
}

/**
 * Parse a reference range string into min and max values.
 * Handles formats: "12.0-16.0", "12.0 - 16.0", "< 5.0", "> 40", "<= 200", ">= 1.0"
 */
export function parseReferenceRange(range: string | null): ParsedRange {
  if (!range) return { min: null, max: null };

  const trimmed = range.trim();

  // Format: "12.0-16.0" or "12.0 - 16.0" or "12.0 – 16.0"
  const dashMatch = trimmed.match(/(\d+\.?\d*)\s*[-–]\s*(\d+\.?\d*)/);
  if (dashMatch) {
    return {
      min: parseFloat(dashMatch[1]),
      max: parseFloat(dashMatch[2]),
    };
  }

  // Format: "< 5.0" or "<5.0" or "<= 5.0" or "≤ 5.0"
  const lessThanMatch = trimmed.match(/[<≤]\s*=?\s*(\d+\.?\d*)/);
  if (lessThanMatch) {
    return {
      min: null,
      max: parseFloat(lessThanMatch[1]),
    };
  }

  // Format: "> 40" or ">40" or ">= 40" or "≥ 40"
  const greaterThanMatch = trimmed.match(/[>≥]\s*=?\s*(\d+\.?\d*)/);
  if (greaterThanMatch) {
    return {
      min: parseFloat(greaterThanMatch[1]),
      max: null,
    };
  }

  return { min: null, max: null };
}

// ── Name normalization ───────────────────────────────────────────────────

/**
 * Clean a raw biomarker name for better matching.
 */
function cleanName(raw: string): string {
  return raw
    .trim()
    .replace(/[,.:;]+$/, '') // trailing punctuation
    .replace(/\s+/g, ' ') // collapse spaces
    .replace(/\(.*?\)/g, '') // remove parentheticals
    .trim();
}

/**
 * Try to match a raw biomarker name to a known biomarker code.
 */
function matchBiomarkerName(
  rawName: string
): { biomarker: BiomarkerKnowledge; method: 'exact' | 'alias' | 'fuzzy' } | null {
  const cleaned = cleanName(rawName);

  // Try exact code match (case-insensitive)
  const byCode = biomarkersByCode.get(cleaned.toUpperCase());
  if (byCode) {
    return { biomarker: byCode, method: 'exact' };
  }

  // Try alias match through the knowledge base
  const byAlias = getBiomarkerByAlias(cleaned);
  if (byAlias) {
    return { biomarker: byAlias, method: 'alias' };
  }

  // Try common name transformations
  const variants = generateNameVariants(cleaned);
  for (const variant of variants) {
    const match = getBiomarkerByAlias(variant);
    if (match) {
      return { biomarker: match, method: 'fuzzy' };
    }
  }

  return null;
}

/**
 * Generate name variants to handle OCR artifacts and naming differences.
 */
function generateNameVariants(name: string): string[] {
  const variants: string[] = [];
  const lower = name.toLowerCase();

  // Remove common prefixes
  const prefixes = ['serum ', 'plasma ', 'blood ', 'total ', 'fasting '];
  for (const prefix of prefixes) {
    if (lower.startsWith(prefix)) {
      variants.push(name.slice(prefix.length).trim());
    }
  }

  // Add common abbreviation patterns
  const abbreviations: Record<string, string[]> = {
    hemoglobin: ['HGB', 'Hgb', 'Hb'],
    hematocrit: ['HCT', 'Hct'],
    platelets: ['PLT', 'Plt'],
    'white blood cell': ['WBC'],
    'white blood cells': ['WBC'],
    'red blood cell': ['RBC'],
    'red blood cells': ['RBC'],
    glucose: ['GLU', 'Glucose', 'fasting glucose', 'fasting blood sugar'],
    'glucose, fasting': ['GLU', 'fasting glucose'],
    'fasting glucose': ['GLU', 'glucose'],
    creatinine: ['CREAT', 'Creatinine'],
    'total cholesterol': ['TC', 'total cholesterol'],
    'ldl cholesterol': ['LDL'],
    'hdl cholesterol': ['HDL'],
    triglycerides: ['TRIG', 'Triglycerides'],
    'alk phos': ['ALP', 'alkaline phosphatase'],
    'alkaline phosphatase': ['ALP'],
    'vitamin d': ['VITD', 'Vitamin D', '25-OH Vitamin D'],
    'vitamin b12': ['B12'],
    'free t4': ['FT4', 'Free T4'],
    'free t3': ['FT3', 'Free T3'],
    'transferrin sat': ['TSAT', 'Transferrin Saturation'],
    'transferrin saturation': ['TSAT'],
    'c-reactive protein': ['CRP'],
    'sed rate': ['ESR'],
    'sedimentation rate': ['ESR'],
    iron: ['FE', 'Serum Iron', 'Iron'],
    egfr: ['EGFR', 'eGFR', 'GFR'],
    'est. gfr': ['EGFR', 'eGFR'],
    bun: ['BUN', 'Blood Urea Nitrogen'],
    'blood urea nitrogen': ['BUN'],
    sodium: ['NA', 'Sodium'],
    potassium: ['K', 'Potassium'],
    calcium: ['CA', 'Calcium'],
    folate: ['FOLATE', 'Folic Acid'],
    'folic acid': ['FOLATE'],
    hba1c: ['HBA1C', 'HbA1c', 'Hemoglobin A1c', 'A1C'],
    'hemoglobin a1c': ['HBA1C', 'HbA1c'],
    a1c: ['HBA1C'],
  };

  const key = lower;
  if (abbreviations[key]) {
    variants.push(...abbreviations[key]);
  }

  // Try without trailing "s"
  if (lower.endsWith('s') && lower.length > 3) {
    variants.push(name.slice(0, -1));
  }

  return variants;
}

// ── Value normalization ──────────────────────────────────────────────────

/**
 * Parse a raw value string into a number.
 * Handles: "11.2", "<5.0", ">40", "1,200", "<=200"
 */
function parseValue(raw: string): number | null {
  const cleaned = raw
    .trim()
    .replace(/[<>≤≥]/g, '')
    .replace(/,/g, '')
    .trim();

  const num = parseFloat(cleaned);
  return isFinite(num) ? num : null;
}

// ── Normalization pipeline ───────────────────────────────────────────────

/**
 * Normalize a single parsed biomarker row.
 */
function normalizeRow(row: ParsedBiomarkerRow): NormalizedBiomarker {
  const warnings: string[] = [];

  // 1. Match biomarker name
  const match = matchBiomarkerName(row.rawName);
  const normalizedCode = match?.biomarker.code ?? null;
  const normalizedName = match?.biomarker.name ?? null;
  const matchMethod = match?.method ?? 'none';

  if (!match) {
    warnings.push(`Could not match biomarker name: "${row.rawName}"`);
  }

  // 2. Parse value
  const normalizedValue = parseValue(row.rawValue);
  if (normalizedValue === null) {
    warnings.push(`Could not parse value: "${row.rawValue}"`);
  }

  // 3. Normalize unit
  const normalizedUnit = normalizeUnitString(row.rawUnit);

  // 4. Parse reference range
  const range = parseReferenceRange(row.rawRange);

  // 5. Calculate confidence
  let confidence = row.confidence;
  if (!match) confidence *= 0.5;
  if (normalizedValue === null) confidence *= 0.3;
  if (matchMethod === 'fuzzy') confidence *= 0.85;
  confidence = Math.round(confidence * 1000) / 1000;

  return {
    rawName: row.rawName,
    rawValue: row.rawValue,
    rawUnit: row.rawUnit,
    rawRange: row.rawRange,
    rawFlag: row.rawFlag,
    normalizedCode,
    normalizedName,
    normalizedValue,
    normalizedUnit,
    referenceMin: range.min,
    referenceMax: range.max,
    confidence,
    matchMethod,
    warnings,
  };
}

/**
 * Normalize all parsed biomarker rows and compute overall confidence.
 */
export function normalizeReport(
  rows: ParsedBiomarkerRow[],
  metadata: ReportMetadata
): NormalizationResult {
  const biomarkers = rows.map(normalizeRow);
  const warnings: string[] = [];

  // Compute overall confidence
  const totalConfidence =
    biomarkers.length > 0
      ? biomarkers.reduce((sum, b) => sum + b.confidence, 0) / biomarkers.length
      : 0;

  // Warn about unmatched biomarkers
  const unmatched = biomarkers.filter((b) => b.normalizedCode === null);
  if (unmatched.length > 0) {
    warnings.push(
      `${unmatched.length} biomarker(s) could not be matched: ${unmatched.map((b) => b.rawName).join(', ')}`
    );
  }

  // Warn about duplicate codes
  const codeCounts = new Map<string, number>();
  for (const b of biomarkers) {
    if (b.normalizedCode) {
      codeCounts.set(b.normalizedCode, (codeCounts.get(b.normalizedCode) ?? 0) + 1);
    }
  }
  for (const [code, count] of codeCounts) {
    if (count > 1) {
      warnings.push(`Duplicate biomarker code detected: ${code} (${count} occurrences)`);
    }
  }

  return {
    biomarkers,
    metadata,
    overallConfidence: Math.round(totalConfidence * 1000) / 1000,
    warnings,
  };
}
