"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArcMeter } from "@/components/charts/arc-meter";
import { TrendHistoryChart } from "@/components/charts/trend-history-chart";
import { TrendDeltaChip } from "@/components/dashboard/trend-delta-chip";
import type { BiomarkerComparison } from "@/lib/medical/comparison";
import type { StatusLevel } from "@/lib/medical/knowledge/types";
import {
  Stethoscope,
  HeartPulse,
  CalendarClock,
} from "lucide-react";

interface BiomarkerDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  comparison: BiomarkerComparison | null;
  explanation: string;
  lifestyleActions?: string[];
  followUp?: string[];
  doctorQuestions?: string[];
  trendData?: { date: string; value: number }[];
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

export function BiomarkerDetailDrawer({
  open,
  onClose,
  comparison,
  explanation,
  lifestyleActions = [],
  followUp = [],
  doctorQuestions = [],
  trendData = [],
}: BiomarkerDetailDrawerProps) {
  if (!comparison) return null;

  const { latest, previous, name, unit } = comparison;
  const status = latest.status;
  const badge = statusBadge[status];

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="overflow-y-auto w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {name}
            <Badge variant="outline" className={`text-[10px] ${badge.className}`}>
              {badge.label}
            </Badge>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-6">
          {/* Arc Meter */}
          <div className="flex justify-center">
            <ArcMeter
              value={latest.value}
              previousValue={previous?.value}
              rangeMin={latest.rangeMin}
              rangeMax={latest.rangeMax}
              unit={unit}
              status={status}
              size={240}
            />
          </div>

          {/* Comparison values */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-muted/50 p-3">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Latest</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-bold">{latest.value}</span>
                <span className="text-xs text-muted-foreground">{unit}</span>
              </div>
            </div>
            {previous && (
              <div className="rounded-xl bg-muted/50 p-3">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Previous</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-bold text-muted-foreground">{previous.value}</span>
                  <span className="text-xs text-muted-foreground">{unit}</span>
                </div>
              </div>
            )}
          </div>

          {/* Trend chip + summary */}
          <div className="space-y-2">
            <TrendDeltaChip
              trend={comparison.trend}
              label={comparison.trendLabel}
              delta={comparison.delta}
              percentChange={comparison.percentChange}
              unit={unit}
            />
            <p className="text-sm italic text-muted-foreground">{comparison.summary}</p>
          </div>

          <Separator />

          {/* Explanation */}
          <div>
            <h4 className="text-sm font-semibold mb-2">What this means</h4>
            <p className="text-sm leading-relaxed text-muted-foreground">{explanation}</p>
          </div>

          {/* Trend chart */}
          {trendData.length > 1 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">History</h4>
              <TrendHistoryChart
                data={trendData}
                rangeMin={latest.rangeMin}
                rangeMax={latest.rangeMax}
                unit={unit}
                status={status}
                height={140}
              />
            </div>
          )}

          {/* Lifestyle actions */}
          {lifestyleActions.length > 0 && (
            <div>
              <h4 className="flex items-center gap-1.5 text-sm font-semibold mb-2">
                <HeartPulse className="h-3.5 w-3.5 text-primary" />
                Lifestyle Actions
              </h4>
              <ul className="space-y-1.5">
                {lifestyleActions.map((action, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="shrink-0 text-primary">-</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Follow-up */}
          {followUp.length > 0 && (
            <div>
              <h4 className="flex items-center gap-1.5 text-sm font-semibold mb-2">
                <CalendarClock className="h-3.5 w-3.5 text-primary" />
                Follow-up
              </h4>
              <ul className="space-y-1.5">
                {followUp.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="shrink-0 text-primary">-</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Doctor questions */}
          {doctorQuestions.length > 0 && (
            <div>
              <h4 className="flex items-center gap-1.5 text-sm font-semibold mb-2">
                <Stethoscope className="h-3.5 w-3.5 text-primary" />
                Ask Your Doctor
              </h4>
              <ul className="space-y-1.5">
                {doctorQuestions.map((q, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="shrink-0 text-primary">{i + 1}.</span>
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5">
            <p className="text-[10px] text-muted-foreground text-center">
              This information is educational only. Always consult a qualified healthcare provider for medical decisions.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
