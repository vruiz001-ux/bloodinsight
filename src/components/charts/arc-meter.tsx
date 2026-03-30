"use client";

import { useMemo } from "react";
import type { StatusLevel } from "@/lib/medical/knowledge/types";

// ── Types ────────────────────────────────────────────────────────────────

interface ArcMeterProps {
  /** Current value */
  value: number;
  /** Previous value (optional — shows second marker) */
  previousValue?: number | null;
  /** Lower bound of normal range */
  rangeMin: number | null;
  /** Upper bound of normal range */
  rangeMax: number | null;
  /** Unit of measurement */
  unit: string;
  /** Current status */
  status: StatusLevel;
  /** Component size in px (default: 160) */
  size?: number;
  /** Show previous value marker */
  showPrevious?: boolean;
}

// ── Constants ────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<StatusLevel, string> = {
  normal: "#22c55e",
  borderline: "#f59e0b",
  abnormal: "#f97316",
  urgent: "#ef4444",
};

const STATUS_GLOW: Record<StatusLevel, string> = {
  normal: "rgba(34,197,94,0.3)",
  borderline: "rgba(245,158,11,0.3)",
  abnormal: "rgba(249,115,22,0.3)",
  urgent: "rgba(239,68,68,0.4)",
};

// Arc spans 240 degrees (from -210° to 30° in standard math,
// or from 150° to 390° clockwise from top)
const ARC_START_ANGLE = 150; // degrees (clockwise from 12 o'clock)
const ARC_SWEEP = 240;
const ARC_END_ANGLE = ARC_START_ANGLE + ARC_SWEEP;

// ── Geometry helpers ─────────────────────────────────────────────────────

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

function valueToAngle(
  value: number,
  displayMin: number,
  displayMax: number
): number {
  const fraction = Math.max(0, Math.min(1, (value - displayMin) / (displayMax - displayMin)));
  return ARC_START_ANGLE + fraction * ARC_SWEEP;
}

// ── Component ────────────────────────────────────────────────────────────

export function ArcMeter({
  value,
  previousValue,
  rangeMin,
  rangeMax,
  unit,
  status,
  size = 160,
  showPrevious = true,
}: ArcMeterProps) {
  const cx = size / 2;
  const cy = size / 2;
  const strokeWidth = size * 0.065;
  const radius = size / 2 - strokeWidth - 4;
  const innerRadius = radius - strokeWidth * 0.3;

  const geometry = useMemo(() => {
    const effectiveMin = rangeMin ?? 0;
    const effectiveMax = rangeMax ?? value * 2;
    const rangeSpan = effectiveMax - effectiveMin;

    // Display range extends 35% beyond normal range on each side
    const displayMin = effectiveMin - rangeSpan * 0.35;
    const displayMax = effectiveMax + rangeSpan * 0.35;

    // Zone angles
    const normalStartAngle = valueToAngle(effectiveMin, displayMin, displayMax);
    const normalEndAngle = valueToAngle(effectiveMax, displayMin, displayMax);

    // Borderline zones (10% of range beyond boundaries)
    const borderlineWidth = rangeSpan * 0.1;
    const lowBorderlineStart = valueToAngle(effectiveMin - borderlineWidth, displayMin, displayMax);
    const highBorderlineEnd = valueToAngle(effectiveMax + borderlineWidth, displayMin, displayMax);

    // Value marker
    const clampedValue = Math.max(displayMin, Math.min(displayMax, value));
    const valueAngle = valueToAngle(clampedValue, displayMin, displayMax);

    // Previous marker
    let prevAngle: number | null = null;
    if (previousValue != null && showPrevious) {
      const clampedPrev = Math.max(displayMin, Math.min(displayMax, previousValue));
      prevAngle = valueToAngle(clampedPrev, displayMin, displayMax);
    }

    return {
      displayMin,
      displayMax,
      normalStartAngle,
      normalEndAngle,
      lowBorderlineStart,
      highBorderlineEnd,
      valueAngle,
      prevAngle,
    };
  }, [value, previousValue, rangeMin, rangeMax, showPrevious]);

  const {
    normalStartAngle,
    normalEndAngle,
    lowBorderlineStart,
    highBorderlineEnd,
    valueAngle,
    prevAngle,
  } = geometry;

  const statusColor = STATUS_COLORS[status];
  const glowColor = STATUS_GLOW[status];

  // Value marker position
  const markerPos = polarToCartesian(cx, cy, radius, valueAngle);
  const markerSize = strokeWidth * 0.9;

  // Previous marker position
  const prevPos = prevAngle != null ? polarToCartesian(cx, cy, radius, prevAngle) : null;

  // Format value for display
  const displayValue = value >= 100 ? Math.round(value) : value;

  return (
    <div className="relative inline-flex flex-col items-center" style={{ width: size, height: size * 0.78 }}>
      <svg
        width={size}
        height={size * 0.78}
        viewBox={`0 0 ${size} ${size * 0.78}`}
        className="overflow-visible"
      >
        <defs>
          {/* Glow filter for the value marker */}
          <filter id={`glow-${status}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feFlood floodColor={glowColor} result="color" />
            <feComposite in="color" in2="blur" operator="in" result="shadow" />
            <feMerge>
              <feMergeNode in="shadow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Gradient for normal zone */}
          <linearGradient id="normal-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#16a34a" stopOpacity="0.9" />
          </linearGradient>
          {/* Gradient for amber zone */}
          <linearGradient id="amber-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        {/* Background track */}
        <path
          d={describeArc(cx, cy, radius, ARC_START_ANGLE, ARC_END_ANGLE)}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="text-muted/60"
          opacity={0.3}
        />

        {/* Red zone — low end */}
        <path
          d={describeArc(cx, cy, radius, ARC_START_ANGLE, lowBorderlineStart)}
          fill="none"
          stroke="#ef4444"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity={0.35}
        />

        {/* Amber zone — low borderline */}
        <path
          d={describeArc(cx, cy, radius, lowBorderlineStart, normalStartAngle)}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={strokeWidth}
          opacity={0.4}
        />

        {/* Green zone — normal range */}
        <path
          d={describeArc(cx, cy, radius, normalStartAngle, normalEndAngle)}
          fill="none"
          stroke="url(#normal-grad)"
          strokeWidth={strokeWidth}
        />

        {/* Amber zone — high borderline */}
        <path
          d={describeArc(cx, cy, radius, normalEndAngle, highBorderlineEnd)}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={strokeWidth}
          opacity={0.4}
        />

        {/* Red zone — high end */}
        <path
          d={describeArc(cx, cy, radius, highBorderlineEnd, ARC_END_ANGLE)}
          fill="none"
          stroke="#ef4444"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity={0.35}
        />

        {/* Previous value marker (subtle ring) */}
        {prevPos && (
          <circle
            cx={prevPos.x}
            cy={prevPos.y}
            r={markerSize * 0.65}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="text-muted-foreground/40"
            strokeDasharray="2 2"
          />
        )}

        {/* Current value marker (glowing dot) */}
        <circle
          cx={markerPos.x}
          cy={markerPos.y}
          r={markerSize}
          fill={statusColor}
          filter={`url(#glow-${status})`}
          className="transition-all duration-700 ease-out"
        />
        <circle
          cx={markerPos.x}
          cy={markerPos.y}
          r={markerSize * 0.45}
          fill="white"
          opacity={0.9}
        />

        {/* Center value text */}
        <text
          x={cx}
          y={cy - 2}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-foreground font-semibold"
          style={{ fontSize: size * 0.17 }}
        >
          {displayValue}
        </text>
        <text
          x={cx}
          y={cy + size * 0.11}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-muted-foreground"
          style={{ fontSize: size * 0.075 }}
        >
          {unit}
        </text>
      </svg>
    </div>
  );
}

// ── Mini Arc (for compact cards) ─────────────────────────────────────────

interface MiniArcProps {
  value: number;
  rangeMin: number | null;
  rangeMax: number | null;
  status: StatusLevel;
  size?: number;
}

export function MiniArc({ value, rangeMin, rangeMax, status, size = 48 }: MiniArcProps) {
  const cx = size / 2;
  const cy = size / 2;
  const strokeWidth = size * 0.1;
  const radius = size / 2 - strokeWidth - 2;

  const effectiveMin = rangeMin ?? 0;
  const effectiveMax = rangeMax ?? value * 2;
  const rangeSpan = effectiveMax - effectiveMin;
  const displayMin = effectiveMin - rangeSpan * 0.35;
  const displayMax = effectiveMax + rangeSpan * 0.35;

  const valueAngle = valueToAngle(
    Math.max(displayMin, Math.min(displayMax, value)),
    displayMin,
    displayMax
  );

  const statusColor = STATUS_COLORS[status];

  return (
    <svg width={size} height={size * 0.7} viewBox={`0 0 ${size} ${size * 0.7}`} className="overflow-visible">
      {/* Track */}
      <path
        d={describeArc(cx, cy, radius, ARC_START_ANGLE, ARC_END_ANGLE)}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className="text-muted/40"
        opacity={0.3}
      />
      {/* Filled arc up to value */}
      <path
        d={describeArc(cx, cy, radius, ARC_START_ANGLE, valueAngle)}
        fill="none"
        stroke={statusColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        opacity={0.8}
      />
    </svg>
  );
}
