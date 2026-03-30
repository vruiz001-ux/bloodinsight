"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArcMeter } from "@/components/charts/arc-meter";
import { TrendDeltaChip } from "@/components/dashboard/trend-delta-chip";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { BiomarkerComparison } from "@/lib/medical/comparison";
import type { StatusLevel } from "@/lib/medical/knowledge/types";

interface BiomarkerPriorityCardProps {
  comparison: BiomarkerComparison;
  explanation: string;
  trendData?: number[];
}

const statusBadge: Record<StatusLevel, { className: string; label: string }> = {
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
    label: "Out of Range",
  },
  urgent: {
    className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800",
    label: "Urgent",
  },
};

export function BiomarkerPriorityCard({
  comparison,
  explanation,
}: BiomarkerPriorityCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { latest, previous, name, unit, status } = {
    ...comparison,
    status: comparison.latest.status,
  };
  const badge = statusBadge[status];

  return (
    <Card className="group transition-all duration-200 hover:shadow-card-hover">
      <CardContent className="p-4 space-y-3">
        {/* Header row: name + status badge */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">{name}</h3>
          <Badge variant="outline" className={`text-[10px] ${badge.className}`}>
            {badge.label}
          </Badge>
        </div>

        {/* Arc meter + comparison values */}
        <div className="flex items-center gap-4">
          {/* Arc meter */}
          <div className="shrink-0">
            <ArcMeter
              value={latest.value}
              previousValue={previous?.value}
              rangeMin={latest.rangeMin}
              rangeMax={latest.rangeMax}
              unit={unit}
              status={status}
              size={130}
            />
          </div>

          {/* Values & comparison */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Latest */}
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Latest</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold tracking-tight">{latest.value}</span>
                <span className="text-xs text-muted-foreground">{unit}</span>
              </div>
            </div>

            {/* Previous */}
            {previous && (
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Previous</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-medium text-muted-foreground">{previous.value}</span>
                  <span className="text-[10px] text-muted-foreground">{unit}</span>
                </div>
              </div>
            )}

            {/* Trend chip */}
            <TrendDeltaChip
              trend={comparison.trend}
              label={comparison.trendLabel}
              delta={comparison.delta}
              percentChange={comparison.percentChange}
              unit={unit}
              compact
            />

            {/* Reference range */}
            {latest.rangeMin != null && latest.rangeMax != null && (
              <p className="text-[10px] text-muted-foreground">
                Range: {latest.rangeMin}–{latest.rangeMax} {unit}
              </p>
            )}
          </div>
        </div>

        {/* One-line summary */}
        <p className="text-xs text-muted-foreground italic">
          {comparison.summary}
        </p>

        {/* Expandable explanation */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
        >
          {expanded ? "Hide details" : "View details"}
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>

        {expanded && (
          <div className="rounded-lg bg-muted/40 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
            {explanation}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
