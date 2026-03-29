// Report parser: extracts biomarker rows and metadata from OCR text

export interface ParsedBiomarkerRow {
  rawName: string;
  rawValue: string;
  rawUnit: string | null;
  rawRange: string | null;
  rawFlag: string | null;
  lineNumber: number;
  confidence: number;
}

export interface ReportMetadata {
  patientName: string | null;
  reportDate: string | null;
  labName: string | null;
  patientSex: string | null;
  patientAge: number | null;
}

export interface ParseResult {
  metadata: ReportMetadata;
  rows: ParsedBiomarkerRow[];
  rawText: string;
  warnings: string[];
}

// ── Metadata extraction ──────────────────────────────────────────────────

function extractMetadata(text: string): ReportMetadata {
  const lines = text.split('\n');
  let patientName: string | null = null;
  let reportDate: string | null = null;
  let labName: string | null = null;
  let patientSex: string | null = null;
  let patientAge: number | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Patient name: "Patient: John Doe" or "Patient Name: John Doe"
    if (!patientName) {
      const nameMatch = trimmed.match(/patient\s*(?:name)?\s*[:]\s*(.+)/i);
      if (nameMatch) {
        patientName = nameMatch[1].trim();
      }
    }

    // Date: "Date: 03/15/2024" or "Report Date: 2024-03-15"
    if (!reportDate) {
      const dateMatch = trimmed.match(/(?:report\s+)?date\s*[:]\s*(.+)/i);
      if (dateMatch) {
        reportDate = dateMatch[1].trim();
      }
    }

    // Lab name: typically the first line or a line with "Lab" in it
    if (!labName) {
      const labMatch = trimmed.match(/^(.+(?:lab|laboratory|medical|diagnostics|health).*)$/i);
      if (labMatch) {
        // Strip off anything after a dash that looks like a report title
        labName = labMatch[1].replace(/\s*[-–]\s*(complete|blood|panel|report|test).*/i, '').trim();
      }
    }

    // Sex: "Sex: Female" or "Gender: M"
    if (!patientSex) {
      const sexMatch = trimmed.match(/(?:sex|gender)\s*[:]\s*(male|female|m|f)\b/i);
      if (sexMatch) {
        const raw = sexMatch[1].toLowerCase();
        patientSex = raw === 'm' || raw === 'male' ? 'male' : 'female';
      }
    }

    // Age: "Age: 35" or embedded in sex line "Sex: Female  Age: 35"
    if (patientAge === null) {
      const ageMatch = trimmed.match(/age\s*[:]\s*(\d{1,3})/i);
      if (ageMatch) {
        patientAge = parseInt(ageMatch[1], 10);
      }
    }
  }

  return { patientName, reportDate, labName, patientSex, patientAge };
}

// ── Biomarker row parsing ────────────────────────────────────────────────

// Common unit patterns
const UNIT_PATTERN =
  /(?:10\^[36]\/[uµ]L|[mkµun]?(?:g|mol|IU|U|eq)\/(?:d?L|mL|hr|h|min(?:\/1\.73m[²2])?)|%|fL|pg|mm\/hr?|mIU\/L|sec|seconds|cells\/[uµ]L|ratio)/i;

// Reference range patterns
const RANGE_PATTERNS = [
  // "12.0-16.0" or "12.0 - 16.0"
  /(\d+\.?\d*)\s*[-–]\s*(\d+\.?\d*)/,
  // "<200" or "< 200"
  /([<>≤≥])\s*(\d+\.?\d*)/,
  // ">60" or "> 60"
  /([<>])\s*(\d+\.?\d*)/,
];

// Flag patterns
const FLAG_PATTERN = /\b([HLhl*]|HIGH|LOW|high|low|CRITICAL|critical|ABNORMAL|abnormal)\s*$/;

// Lines to skip (headers, footers, etc.)
const SKIP_PATTERNS = [
  /^\s*test\s+(name\s+)?result/i,
  /^\s*$/, // empty
  /^\s*[-=]+\s*$/, // dividers
  /^\s*patient/i,
  /^\s*date/i,
  /^\s*sex/i,
  /^\s*age/i,
  /^\s*lab/i,
  /^\s*page\s+\d/i,
  /^\s*(?:reference|normal)\s+(?:range|interval)/i,
  /^\s*specimen/i,
  /^\s*collected/i,
  /^\s*reported/i,
  /^\s*ordered/i,
  /^\s*physician/i,
  /^\s*doctor/i,
];

function isSkipLine(line: string): boolean {
  return SKIP_PATTERNS.some((p) => p.test(line));
}

/**
 * Try to parse a single line as a biomarker result row.
 * Handles tab-separated, multi-space-separated, and mixed formats.
 */
function parseBiomarkerLine(
  line: string,
  lineNumber: number
): ParsedBiomarkerRow | null {
  const trimmed = line.trim();
  if (trimmed.length < 3) return null;
  if (isSkipLine(trimmed)) return null;

  // Strategy 1: Tab-separated columns
  if (trimmed.includes('\t')) {
    return parseTabSeparated(trimmed, lineNumber);
  }

  // Strategy 2: Multi-space separated (2+ spaces as delimiter)
  return parseSpaceSeparated(trimmed, lineNumber);
}

function parseTabSeparated(line: string, lineNumber: number): ParsedBiomarkerRow | null {
  const parts = line.split('\t').map((p) => p.trim()).filter((p) => p.length > 0);
  if (parts.length < 2) return null;

  const rawName = parts[0];
  const rawValue = parts[1];

  // Validate: value should contain a number
  if (!/\d/.test(rawValue)) return null;

  let rawUnit: string | null = null;
  let rawRange: string | null = null;
  let rawFlag: string | null = null;

  for (let i = 2; i < parts.length; i++) {
    const part = parts[i];
    if (!rawUnit && UNIT_PATTERN.test(part)) {
      rawUnit = part;
    } else if (!rawRange && RANGE_PATTERNS.some((p) => p.test(part))) {
      rawRange = part;
    } else if (!rawFlag && FLAG_PATTERN.test(part)) {
      rawFlag = part;
    }
  }

  return {
    rawName,
    rawValue,
    rawUnit,
    rawRange,
    rawFlag,
    lineNumber,
    confidence: calculateLineConfidence(rawName, rawValue, rawUnit, rawRange),
  };
}

function parseSpaceSeparated(line: string, lineNumber: number): ParsedBiomarkerRow | null {
  // Split on 2+ spaces
  const parts = line.split(/\s{2,}/).map((p) => p.trim()).filter((p) => p.length > 0);

  if (parts.length < 2) {
    // Try alternate: name might contain spaces, value is last numeric token
    return parseFreeForm(line, lineNumber);
  }

  const rawName = parts[0];
  const rawValue = parts[1];

  // Validate: value should contain a number
  if (!/\d/.test(rawValue)) return null;

  // Name should start with a letter (not a number or symbol)
  if (!/^[A-Za-z]/.test(rawName)) return null;

  let rawUnit: string | null = null;
  let rawRange: string | null = null;
  let rawFlag: string | null = null;

  for (let i = 2; i < parts.length; i++) {
    const part = parts[i];
    if (!rawUnit && UNIT_PATTERN.test(part)) {
      rawUnit = part;
    } else if (!rawRange && RANGE_PATTERNS.some((p) => p.test(part))) {
      rawRange = part;
    } else if (!rawFlag && /^[HLhl*]$|^(?:HIGH|LOW|CRITICAL|ABNORMAL)$/i.test(part)) {
      rawFlag = part;
    }
  }

  return {
    rawName,
    rawValue,
    rawUnit,
    rawRange,
    rawFlag,
    lineNumber,
    confidence: calculateLineConfidence(rawName, rawValue, rawUnit, rawRange),
  };
}

function parseFreeForm(line: string, lineNumber: number): ParsedBiomarkerRow | null {
  // Last resort: find the first number and split around it
  const match = line.match(/^(.+?)\s+(\d+\.?\d*)\s*(.*)/);
  if (!match) return null;

  const rawName = match[1].trim();
  const rawValue = match[2];
  const remainder = match[3].trim();

  if (rawName.length === 0 || !/^[A-Za-z]/.test(rawName)) return null;

  let rawUnit: string | null = null;
  let rawRange: string | null = null;
  let rawFlag: string | null = null;

  // Try to extract unit from remainder
  const unitMatch = remainder.match(UNIT_PATTERN);
  if (unitMatch) {
    rawUnit = unitMatch[0];
  }

  // Try to extract range from remainder
  for (const pattern of RANGE_PATTERNS) {
    const rangeMatch = remainder.match(pattern);
    if (rangeMatch) {
      rawRange = rangeMatch[0];
      break;
    }
  }

  // Try to extract flag from remainder
  const flagMatch = remainder.match(FLAG_PATTERN);
  if (flagMatch) {
    rawFlag = flagMatch[1];
  }

  return {
    rawName,
    rawValue,
    rawUnit,
    rawRange,
    rawFlag,
    lineNumber,
    confidence: calculateLineConfidence(rawName, rawValue, rawUnit, rawRange) * 0.8, // lower confidence for freeform
  };
}

function calculateLineConfidence(
  name: string,
  value: string,
  unit: string | null,
  range: string | null
): number {
  let score = 0;
  let factors = 0;

  // Name quality
  factors++;
  if (name.length >= 2 && /^[A-Za-z]/.test(name)) {
    score += 1.0;
  } else {
    score += 0.3;
  }

  // Value is numeric
  factors++;
  if (/^\d+\.?\d*$/.test(value.replace(/[<>,\s]/g, ''))) {
    score += 1.0;
  } else if (/\d/.test(value)) {
    score += 0.5;
  }

  // Unit present and recognized
  factors++;
  if (unit && UNIT_PATTERN.test(unit)) {
    score += 1.0;
  } else if (unit) {
    score += 0.5;
  } else {
    score += 0.2;
  }

  // Range present
  factors++;
  if (range && RANGE_PATTERNS.some((p) => p.test(range))) {
    score += 1.0;
  } else if (range) {
    score += 0.4;
  } else {
    score += 0.1;
  }

  return Math.round((score / factors) * 1000) / 1000;
}

// ── Main parse function ──────────────────────────────────────────────────

/**
 * Parse raw OCR text and extract biomarker rows + metadata.
 */
export function parseReport(text: string): ParseResult {
  const metadata = extractMetadata(text);
  const lines = text.split('\n');
  const rows: ParsedBiomarkerRow[] = [];
  const warnings: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const parsed = parseBiomarkerLine(line, i + 1);
    if (parsed) {
      rows.push(parsed);
    }
  }

  if (rows.length === 0) {
    warnings.push('No biomarker rows could be extracted from the text.');
  }
  if (!metadata.patientName) {
    warnings.push('Patient name could not be identified.');
  }
  if (!metadata.reportDate) {
    warnings.push('Report date could not be identified.');
  }

  return {
    metadata,
    rows,
    rawText: text,
    warnings,
  };
}
