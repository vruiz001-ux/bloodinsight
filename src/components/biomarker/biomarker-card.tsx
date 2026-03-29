"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RangeBar } from "@/components/charts/range-bar";
import { ChevronRight } from "lucide-react";
import type { StatusLevel } from "@/lib/medical/knowledge/types";

interface BiomarkerCardProps {
  name: string;
  code: string;
  value: number;
  unit: string;
  status: StatusLevel;
  rangeMin: number | null;
  rangeMax: number | null;
  explanation: string;
  onExpand?: () => void;
}

const statusBadgeConfig: Record<StatusLevel, { className: string; label: string }> = {
  normal: {
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800",
    label: "Normal",
  },
  borderline: {
    className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
    label: "Borderline",
  },
  abnormal: {
    className: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-800",
    label: "Abnormal",
  },
  urgent: {
    className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800",
    label: "Urgent",
  },
};

export function BiomarkerCard({
  name,
  value,
  unit,
  status,
  rangeMin,
  rangeMax,
  explanation,
  onExpand,
}: BiomarkerCardProps) {
  const badgeConfig = statusBadgeConfig[status];

  return (
    <Card className="transition-shadow hover:shadow-card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="text-sm font-medium">{name}</span>
          <Badge variant="outline" className={`text-[11px] ${badgeConfig.className}`}>
            {badgeConfig.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {/* Value */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold tracking-tight">{value}</span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>

        {/* Range bar */}
        <RangeBar
          value={value}
          min={rangeMin}
          max={rangeMax}
          unit={unit}
          status={status}
        />

        {/* Explanation */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          {explanation}
        </p>

        {/* Expand button */}
        {onExpand && (
          <button
            onClick={onExpand}
            className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
          >
            View details
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </CardContent>
    </Card>
  );
}
