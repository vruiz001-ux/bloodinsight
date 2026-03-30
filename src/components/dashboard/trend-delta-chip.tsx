"use client";

import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { TrendDirection, TrendLabel } from "@/lib/medical/comparison";

interface TrendDeltaChipProps {
  trend: TrendDirection;
  label: TrendLabel;
  delta?: number | null;
  percentChange?: number | null;
  unit?: string;
  compact?: boolean;
}

const trendConfig: Record<string, { bg: string; text: string; Icon: typeof TrendingUp }> = {
  "Improved": { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-400", Icon: TrendingDown },
  "Worsened": { bg: "bg-red-50 dark:bg-red-950/40", text: "text-red-700 dark:text-red-400", Icon: TrendingUp },
  "Stable": { bg: "bg-slate-50 dark:bg-slate-800/40", text: "text-slate-600 dark:text-slate-400", Icon: Minus },
  "Back in range": { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-400", Icon: ArrowDownRight },
  "Newly abnormal": { bg: "bg-orange-50 dark:bg-orange-950/40", text: "text-orange-700 dark:text-orange-400", Icon: ArrowUpRight },
  "Still abnormal but improving": { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-400", Icon: TrendingDown },
  "New result": { bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-700 dark:text-blue-400", Icon: Minus },
};

export function TrendDeltaChip({
  label,
  delta,
  percentChange,
  compact = false,
}: TrendDeltaChipProps) {
  const config = trendConfig[label] ?? trendConfig["Stable"];
  const { bg, text, Icon } = config;

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${bg} ${text}`}>
        <Icon className="h-3 w-3" />
        {label}
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 ${bg}`}>
      <Icon className={`h-3.5 w-3.5 ${text}`} />
      <span className={`text-xs font-medium ${text}`}>{label}</span>
      {delta != null && (
        <span className={`text-[11px] ${text} opacity-70`}>
          {delta > 0 ? "+" : ""}{delta}
          {percentChange != null && (
            <span className="ml-0.5">({percentChange > 0 ? "+" : ""}{percentChange}%)</span>
          )}
        </span>
      )}
    </div>
  );
}
