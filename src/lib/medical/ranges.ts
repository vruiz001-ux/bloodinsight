// Reference range comparison engine

import type {
  BiomarkerKnowledge,
  StatusLevel,
  Sex,
  ReferenceRange,
} from './knowledge/types';

export interface RangeResult {
  status: StatusLevel;
  value: number;
  unit: string;
  rangeMin: number | null;
  rangeMax: number | null;
  rangeSource: string;
  percentageFromMidpoint: number;
  deviationFromRange: number | null;
}

/**
 * Find the best matching reference range for sex and age.
 * Returns the most specific match (sex+age > sex > any).
 */
function findBestRange(
  ranges: ReferenceRange[],
  sex: Sex,
  age?: number
): ReferenceRange | null {
  // Score each range by specificity
  let bestRange: ReferenceRange | null = null;
  let bestScore = -1;

  for (const range of ranges) {
    let score = 0;

    // Sex match
    if (range.sex === sex) {
      score += 2;
    } else if (range.sex === 'any') {
      score += 1;
    } else {
      // Wrong sex, skip
      continue;
    }

    // Age match
    if (age !== undefined) {
      const ageMin = range.ageMin ?? 0;
      const ageMax = range.ageMax ?? 150;
      if (age >= ageMin && age <= ageMax) {
        score += 2;
      } else {
        // Age out of range, reduce priority but don't exclude
        score -= 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestRange = range;
    }
  }

  return bestRange;
}

/**
 * Calculate the percentage deviation from the midpoint of a range.
 * Returns 0 when value is at the midpoint, positive when above, negative when below.
 * For one-sided ranges (only min or only max), uses that boundary as reference.
 */
function calcPercentageFromMidpoint(
  value: number,
  min: number | null,
  max: number | null
): number {
  if (min !== null && max !== null) {
    const midpoint = (min + max) / 2;
    const halfRange = (max - min) / 2;
    if (halfRange === 0) return 0;
    return ((value - midpoint) / halfRange) * 100;
  }

  if (min !== null && max === null) {
    // Only lower bound: percentage above the min
    if (min === 0) return value > 0 ? 100 : 0;
    return ((value - min) / min) * 100;
  }

  if (min === null && max !== null) {
    // Only upper bound: percentage relative to max
    if (max === 0) return 0;
    return ((value - max) / max) * 100;
  }

  return 0;
}

/**
 * Calculate the percentage deviation outside the range.
 * Returns null if value is within range.
 * Positive value = above max, negative value = below min.
 */
function calcDeviationFromRange(
  value: number,
  min: number | null,
  max: number | null
): number | null {
  if (min !== null && value < min) {
    if (min === 0) return -100;
    return ((value - min) / min) * 100;
  }

  if (max !== null && value > max) {
    if (max === 0) return 100;
    return ((value - max) / max) * 100;
  }

  return null;
}

/**
 * Determine the status level based on value relative to range.
 * - normal: within range
 * - borderline: within 10% of a boundary but still inside
 * - abnormal: outside range
 * - urgent: hits a red flag threshold
 */
function determineStatus(
  value: number,
  min: number | null,
  max: number | null,
  biomarker: BiomarkerKnowledge
): StatusLevel {
  // Check red flags first (urgent takes priority)
  for (const flag of biomarker.redFlagThresholds) {
    if (flag.direction === 'high' && value >= flag.value) {
      return 'urgent';
    }
    if (flag.direction === 'low' && value <= flag.value) {
      return 'urgent';
    }
  }

  // Check if outside range
  const belowMin = min !== null && value < min;
  const aboveMax = max !== null && value > max;

  if (belowMin || aboveMax) {
    return 'abnormal';
  }

  // Check borderline: within 10% of a boundary
  if (min !== null && max !== null) {
    const rangeSpan = max - min;
    const borderZone = rangeSpan * 0.1;

    if (value <= min + borderZone || value >= max - borderZone) {
      return 'borderline';
    }
  }

  return 'normal';
}

/**
 * Evaluate a biomarker value against reference ranges.
 *
 * Priority:
 *  1. reportRange (from the actual lab report)
 *  2. Knowledge base range (matched by sex + age)
 *
 * Returns a RangeResult with status, deviation, and source info.
 */
export function evaluateAgainstRange(
  value: number,
  unit: string,
  biomarker: BiomarkerKnowledge,
  sex: Sex,
  age?: number,
  reportRange?: { min: number | null; max: number | null }
): RangeResult {
  let rangeMin: number | null = null;
  let rangeMax: number | null = null;
  let rangeSource = 'none';

  // Priority 1: use the range printed on the lab report
  if (reportRange && (reportRange.min !== null || reportRange.max !== null)) {
    rangeMin = reportRange.min;
    rangeMax = reportRange.max;
    rangeSource = 'lab_report';
  } else {
    // Priority 2: knowledge base
    const matched = findBestRange(biomarker.referenceRanges, sex, age);
    if (matched) {
      rangeMin = matched.min;
      rangeMax = matched.max;
      rangeSource = matched.source;
    }
  }

  const status = determineStatus(value, rangeMin, rangeMax, biomarker);
  const percentageFromMidpoint = calcPercentageFromMidpoint(value, rangeMin, rangeMax);
  const deviationFromRange = calcDeviationFromRange(value, rangeMin, rangeMax);

  return {
    status,
    value,
    unit,
    rangeMin,
    rangeMax,
    rangeSource,
    percentageFromMidpoint: Math.round(percentageFromMidpoint * 100) / 100,
    deviationFromRange:
      deviationFromRange !== null
        ? Math.round(deviationFromRange * 100) / 100
        : null,
  };
}
