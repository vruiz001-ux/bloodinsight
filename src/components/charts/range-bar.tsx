"use client";

interface RangeBarProps {
  value: number;
  min: number | null;
  max: number | null;
  unit: string;
  status: "normal" | "borderline" | "abnormal" | "urgent";
}

const statusMarkerColors: Record<string, string> = {
  normal: "bg-emerald-500",
  borderline: "bg-amber-500",
  abnormal: "bg-orange-500",
  urgent: "bg-red-500",
};

export function RangeBar({ value, min, max, status }: RangeBarProps) {
  const effectiveMin = min ?? 0;
  const effectiveMax = max ?? value * 2;
  const rangeSpan = effectiveMax - effectiveMin;

  // Extend display range by 30% on each side to show out-of-range values
  const displayMin = effectiveMin - rangeSpan * 0.3;
  const displayMax = effectiveMax + rangeSpan * 0.3;
  const displaySpan = displayMax - displayMin;

  // Clamp marker position between 2% and 98%
  const rawPercent = ((value - displayMin) / displaySpan) * 100;
  const markerPercent = Math.max(2, Math.min(98, rawPercent));

  // Normal zone within display range
  const normalStart = ((effectiveMin - displayMin) / displaySpan) * 100;
  const normalWidth = (rangeSpan / displaySpan) * 100;

  return (
    <div className="w-full space-y-1">
      <div className="relative h-2.5 w-full rounded-full bg-muted overflow-hidden">
        {/* Normal range zone */}
        <div
          className="absolute top-0 h-full rounded-full bg-emerald-200 dark:bg-emerald-900/40"
          style={{ left: `${normalStart}%`, width: `${normalWidth}%` }}
        />
        {/* Value marker */}
        <div
          className={`absolute top-1/2 h-4 w-1.5 -translate-y-1/2 rounded-full ${statusMarkerColors[status]} ring-2 ring-white dark:ring-card shadow-sm`}
          style={{ left: `${markerPercent}%`, transform: `translate(-50%, -50%)` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        {min !== null && <span>{min}</span>}
        {min === null && <span />}
        {max !== null && <span>{max}</span>}
        {max === null && <span />}
      </div>
    </div>
  );
}
