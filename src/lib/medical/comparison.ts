// ── Comparison Engine ─────────────────────────────────────────────────────
// Compares latest vs previous biomarker results and generates
// trend labels, delta values, and human-readable summaries.

import type { StatusLevel } from "@/lib/medical/knowledge/types";

// ── Types ────────────────────────────────────────────────────────────────

export type ComparisonCategory =
  | "stable_normal"
  | "stable_abnormal"
  | "newly_abnormal"
  | "back_to_normal"
  | "improving_still_abnormal"
  | "worsening_within_abnormal"
  | "rising_within_normal"
  | "falling_within_normal"
  | "no_previous";

export type TrendDirection = "up" | "down" | "stable";

export type TrendLabel =
  | "Improved"
  | "Worsened"
  | "Stable"
  | "Back in range"
  | "Newly abnormal"
  | "Still abnormal but improving"
  | "New result";

export interface BiomarkerComparison {
  code: string;
  name: string;
  unit: string;
  latest: {
    value: number;
    status: StatusLevel;
    rangeMin: number | null;
    rangeMax: number | null;
  };
  previous: {
    value: number;
    status: StatusLevel;
    rangeMin: number | null;
    rangeMax: number | null;
  } | null;
  delta: number | null;
  percentChange: number | null;
  trend: TrendDirection;
  trendLabel: TrendLabel;
  category: ComparisonCategory;
  summary: string;
}

export interface ComparisonSummaryData {
  total: number;
  improved: number;
  worsened: number;
  stable: number;
  newlyAbnormal: number;
  backToNormal: number;
  noChange: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────

function isNormalStatus(status: StatusLevel): boolean {
  return status === "normal";
}

function isAbnormalStatus(status: StatusLevel): boolean {
  return status === "borderline" || status === "abnormal" || status === "urgent";
}

/**
 * Determine if a value moved closer to or further from the normal range.
 * Returns positive if improving (closer to range), negative if worsening.
 */
function rangeProximityChange(
  latestValue: number,
  previousValue: number,
  rangeMin: number | null,
  rangeMax: number | null
): number {
  const min = rangeMin ?? 0;
  const max = rangeMax ?? latestValue * 2;
  const mid = (min + max) / 2;

  const prevDist = Math.abs(previousValue - mid);
  const currDist = Math.abs(latestValue - mid);

  return prevDist - currDist; // positive = improved (closer to midpoint)
}

// ── Core Comparison Logic ────────────────────────────────────────────────

export function compareBiomarker(
  code: string,
  name: string,
  unit: string,
  latestValue: number,
  latestStatus: StatusLevel,
  latestRangeMin: number | null,
  latestRangeMax: number | null,
  previousValue?: number | null,
  previousStatus?: StatusLevel | null,
  previousRangeMin?: number | null,
  previousRangeMax?: number | null
): BiomarkerComparison {
  const latest = {
    value: latestValue,
    status: latestStatus,
    rangeMin: latestRangeMin,
    rangeMax: latestRangeMax,
  };

  // No previous result
  if (previousValue == null || previousStatus == null) {
    return {
      code,
      name,
      unit,
      latest,
      previous: null,
      delta: null,
      percentChange: null,
      trend: "stable",
      trendLabel: "New result",
      category: "no_previous",
      summary: isNormalStatus(latestStatus)
        ? "First result — within normal range"
        : "First result — outside the usual range",
    };
  }

  const previous = {
    value: previousValue,
    status: previousStatus,
    rangeMin: previousRangeMin ?? latestRangeMin,
    rangeMax: previousRangeMax ?? latestRangeMax,
  };

  const delta = latestValue - previousValue;
  const absDelta = Math.abs(delta);
  const percentChange =
    previousValue !== 0
      ? Math.round(((latestValue - previousValue) / Math.abs(previousValue)) * 1000) / 10
      : null;

  // Trend direction (with 1% dead zone for "stable")
  const threshold = Math.abs(previousValue) * 0.01 || 0.01;
  const trend: TrendDirection =
    absDelta <= threshold ? "stable" : delta > 0 ? "up" : "down";

  // Determine category
  const latestNormal = isNormalStatus(latestStatus);
  const prevNormal = isNormalStatus(previousStatus);
  const proximity = rangeProximityChange(
    latestValue,
    previousValue,
    latestRangeMin,
    latestRangeMax
  );

  let category: ComparisonCategory;
  let trendLabel: TrendLabel;
  let summary: string;

  if (latestNormal && prevNormal) {
    // Both normal
    if (trend === "stable") {
      category = "stable_normal";
      trendLabel = "Stable";
      summary = "Stable and within range";
    } else if (delta > 0) {
      category = "rising_within_normal";
      trendLabel = "Stable";
      summary = "Rising slightly but still within range";
    } else {
      category = "falling_within_normal";
      trendLabel = "Stable";
      summary = "Falling slightly but still within range";
    }
  } else if (latestNormal && !prevNormal) {
    // Was abnormal, now normal
    category = "back_to_normal";
    trendLabel = "Back in range";
    summary = "Now back in range";
  } else if (!latestNormal && prevNormal) {
    // Was normal, now abnormal
    category = "newly_abnormal";
    trendLabel = "Newly abnormal";
    summary = "Newly out of range compared with your last test";
  } else {
    // Both abnormal
    if (proximity > 0) {
      category = "improving_still_abnormal";
      trendLabel = "Still abnormal but improving";
      summary = "Still outside the usual range, but improving";
    } else if (proximity < 0) {
      category = "worsening_within_abnormal";
      trendLabel = "Worsened";
      summary = "Further from the usual range than before";
    } else {
      category = "stable_abnormal";
      trendLabel = "Stable";
      summary = "Still outside the usual range, with no significant change";
    }
  }

  return {
    code,
    name,
    unit,
    latest,
    previous,
    delta: Math.round(delta * 100) / 100,
    percentChange,
    trend,
    trendLabel,
    category,
    summary,
  };
}

// ── Batch Comparison ─────────────────────────────────────────────────────

export function generateComparisonSummary(
  comparisons: BiomarkerComparison[]
): ComparisonSummaryData {
  let improved = 0;
  let worsened = 0;
  let stable = 0;
  let newlyAbnormal = 0;
  let backToNormal = 0;
  let noChange = 0;

  for (const c of comparisons) {
    switch (c.category) {
      case "back_to_normal":
        backToNormal++;
        improved++;
        break;
      case "improving_still_abnormal":
        improved++;
        break;
      case "newly_abnormal":
        newlyAbnormal++;
        worsened++;
        break;
      case "worsening_within_abnormal":
        worsened++;
        break;
      case "stable_normal":
      case "stable_abnormal":
        stable++;
        noChange++;
        break;
      case "rising_within_normal":
      case "falling_within_normal":
        stable++;
        break;
      case "no_previous":
        noChange++;
        break;
    }
  }

  return {
    total: comparisons.length,
    improved,
    worsened,
    stable,
    newlyAbnormal,
    backToNormal,
    noChange,
  };
}

// ── Trend-Aware Interpretation Enhancement ───────────────────────────────

export function enhanceInterpretation(
  baseExplanation: string,
  comparison: BiomarkerComparison
): string {
  if (!comparison.previous) {
    return baseExplanation;
  }

  const parts = [baseExplanation];

  switch (comparison.category) {
    case "back_to_normal":
      parts.push(
        `Good news — this result has returned to the normal range since your last test (was ${comparison.previous.value} ${comparison.unit}).`
      );
      break;
    case "newly_abnormal":
      parts.push(
        `This is a new finding — your previous result of ${comparison.previous.value} ${comparison.unit} was within range. Worth discussing with your doctor.`
      );
      break;
    case "improving_still_abnormal":
      parts.push(
        `While still outside the usual range, this has improved from your previous result of ${comparison.previous.value} ${comparison.unit}. Keep up the progress.`
      );
      break;
    case "worsening_within_abnormal":
      parts.push(
        `This has moved further from the usual range compared with your previous result of ${comparison.previous.value} ${comparison.unit}. Consider following up with your healthcare provider.`
      );
      break;
    case "stable_abnormal":
      parts.push(
        `This remains outside the usual range with little change from your previous result of ${comparison.previous.value} ${comparison.unit}.`
      );
      break;
    case "stable_normal":
    case "rising_within_normal":
    case "falling_within_normal":
      parts.push(
        `Consistent with your previous result of ${comparison.previous.value} ${comparison.unit} — still within the normal range.`
      );
      break;
  }

  return parts.join(" ");
}
