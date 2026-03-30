"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, CheckCircle2, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import type { ComparisonSummaryData } from "@/lib/medical/comparison";

interface HealthSnapshotProps {
  normal: number;
  borderline: number;
  abnormal: number;
  urgent: number;
  comparison: ComparisonSummaryData;
  lastReportDate: string;
  plaintextSummary: string;
}

const ringData = [
  { key: "normal" as const, label: "Normal", color: "#22c55e", trackColor: "rgba(34,197,94,0.15)" },
  { key: "borderline" as const, label: "Borderline", color: "#f59e0b", trackColor: "rgba(245,158,11,0.15)" },
  { key: "abnormal" as const, label: "Abnormal", color: "#f97316", trackColor: "rgba(249,115,22,0.15)" },
  { key: "urgent" as const, label: "Urgent", color: "#ef4444", trackColor: "rgba(239,68,68,0.15)" },
];

function StatusRing({
  count,
  total,
  color,
  trackColor,
  label,
}: {
  count: number;
  total: number;
  color: string;
  trackColor: string;
  label: string;
}) {
  const size = 72;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const fraction = total > 0 ? count / total : 0;
  const dashOffset = circumference * (1 - fraction);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={trackColor}
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-lg font-bold"
          style={{ color }}
        >
          {count}
        </span>
      </div>
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

export function HealthSnapshot({
  normal,
  borderline,
  abnormal,
  urgent,
  comparison,
  lastReportDate,
  plaintextSummary,
}: HealthSnapshotProps) {
  const total = normal + borderline + abnormal + urgent;
  const counts: Record<string, number> = { normal, borderline, abnormal, urgent };
  const inRange = normal;
  const outOfRange = total - normal;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Health Snapshot
          <span className="ml-auto text-xs font-normal text-muted-foreground">
            {lastReportDate}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Status Rings */}
        <div className="flex items-center justify-around">
          {ringData.map((ring) => (
            <StatusRing
              key={ring.key}
              count={counts[ring.key]}
              total={total}
              color={ring.color}
              trackColor={ring.trackColor}
              label={ring.label}
            />
          ))}
        </div>

        {/* Summary stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center rounded-xl bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2.5">
            <CheckCircle2 className="mb-1 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{inRange}</span>
            <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">In Range</span>
          </div>
          <div className="flex flex-col items-center rounded-xl bg-orange-50 dark:bg-orange-950/30 px-3 py-2.5">
            <AlertTriangle className="mb-1 h-4 w-4 text-orange-600 dark:text-orange-400" />
            <span className="text-lg font-bold text-orange-700 dark:text-orange-400">{outOfRange}</span>
            <span className="text-[10px] text-orange-600/80 dark:text-orange-400/80">Out of Range</span>
          </div>
          <div className="flex flex-col items-center rounded-xl bg-blue-50 dark:bg-blue-950/30 px-3 py-2.5">
            <Activity className="mb-1 h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-lg font-bold text-blue-700 dark:text-blue-400">{total}</span>
            <span className="text-[10px] text-blue-600/80 dark:text-blue-400/80">Total Markers</span>
          </div>
        </div>

        {/* Change since last report */}
        {comparison.total > 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2.5">
            <div className="flex gap-4 text-xs">
              {comparison.improved > 0 && (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {comparison.improved} improved
                </span>
              )}
              {comparison.worsened > 0 && (
                <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                  <TrendingDown className="h-3.5 w-3.5" />
                  {comparison.worsened} worsened
                </span>
              )}
              {comparison.stable > 0 && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  {comparison.stable} stable
                </span>
              )}
              {comparison.backToNormal > 0 && (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {comparison.backToNormal} back in range
                </span>
              )}
            </div>
          </div>
        )}

        {/* Plain text summary */}
        <p className="text-sm leading-relaxed text-muted-foreground">
          {plaintextSummary}
        </p>
      </CardContent>
    </Card>
  );
}
