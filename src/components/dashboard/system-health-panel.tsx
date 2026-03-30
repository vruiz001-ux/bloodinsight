"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MiniArc } from "@/components/charts/arc-meter";
import type { StatusLevel } from "@/lib/medical/knowledge/types";
import type { LucideIcon } from "lucide-react";

interface SystemBiomarker {
  name: string;
  value: number;
  unit: string;
  status: StatusLevel;
  rangeMin: number | null;
  rangeMax: number | null;
}

interface SystemHealthPanelProps {
  name: string;
  icon: LucideIcon;
  status: StatusLevel;
  summary: string;
  biomarkers: SystemBiomarker[];
}

const statusConfig: Record<StatusLevel, { dot: string; text: string; label: string; border: string; headerBg: string }> = {
  normal: {
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
    label: "Normal",
    border: "border-emerald-100 dark:border-emerald-900/40",
    headerBg: "bg-gradient-to-r from-emerald-50/80 to-transparent dark:from-emerald-950/20",
  },
  borderline: {
    dot: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-400",
    label: "Borderline",
    border: "border-amber-100 dark:border-amber-900/40",
    headerBg: "bg-gradient-to-r from-amber-50/80 to-transparent dark:from-amber-950/20",
  },
  abnormal: {
    dot: "bg-orange-500",
    text: "text-orange-700 dark:text-orange-400",
    label: "Abnormal",
    border: "border-orange-100 dark:border-orange-900/40",
    headerBg: "bg-gradient-to-r from-orange-50/80 to-transparent dark:from-orange-950/20",
  },
  urgent: {
    dot: "bg-red-500",
    text: "text-red-700 dark:text-red-400",
    label: "Urgent",
    border: "border-red-100 dark:border-red-900/40",
    headerBg: "bg-gradient-to-r from-red-50/80 to-transparent dark:from-red-950/20",
  },
};

const biomarkerStatusDot: Record<StatusLevel, string> = {
  normal: "text-emerald-500",
  borderline: "text-amber-500",
  abnormal: "text-orange-500",
  urgent: "text-red-500",
};

export function SystemHealthPanel({
  name,
  icon: Icon,
  status,
  summary,
  biomarkers,
}: SystemHealthPanelProps) {
  const config = statusConfig[status];
  const flagged = biomarkers.filter((b) => b.status !== "normal").length;

  return (
    <Card className={`overflow-hidden border ${config.border}`}>
      <CardHeader className={`pb-2 ${config.headerBg}`}>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm">
            <Icon className="h-4 w-4 text-muted-foreground" />
            {name}
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${config.dot}`} />
            <span className={`text-xs font-medium ${config.text}`}>{config.label}</span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-1">
        <p className="text-xs text-muted-foreground leading-relaxed">{summary}</p>

        {/* Biomarker list with mini arcs */}
        <div className="space-y-1.5">
          {biomarkers.map((b) => (
            <div
              key={b.name}
              className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-muted/40 transition-colors"
            >
              <MiniArc
                value={b.value}
                rangeMin={b.rangeMin}
                rangeMax={b.rangeMax}
                status={b.status}
                size={28}
              />
              <span className="flex-1 text-xs font-medium truncate">{b.name}</span>
              <span className={`text-xs font-semibold ${biomarkerStatusDot[b.status]}`}>
                {b.value}
              </span>
              <span className="text-[10px] text-muted-foreground">{b.unit}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1 border-t border-border/50">
          <span>{biomarkers.length} markers</span>
          {flagged > 0 && (
            <>
              <span className="text-border">|</span>
              <span className={config.text}>{flagged} flagged</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
