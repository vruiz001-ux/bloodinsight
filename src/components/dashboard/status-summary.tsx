import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity } from "lucide-react";

interface StatusSummaryProps {
  normal: number;
  borderline: number;
  abnormal: number;
  urgent: number;
}

const statuses = [
  { key: "normal" as const, label: "Normal", bg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-700 dark:text-emerald-400", ring: "ring-emerald-200 dark:ring-emerald-800" },
  { key: "borderline" as const, label: "Borderline", bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-700 dark:text-amber-400", ring: "ring-amber-200 dark:ring-amber-800" },
  { key: "abnormal" as const, label: "Abnormal", bg: "bg-orange-100 dark:bg-orange-900/40", text: "text-orange-700 dark:text-orange-400", ring: "ring-orange-200 dark:ring-orange-800" },
  { key: "urgent" as const, label: "Urgent", bg: "bg-red-100 dark:bg-red-900/40", text: "text-red-700 dark:text-red-400", ring: "ring-red-200 dark:ring-red-800" },
] as const;

export function StatusSummary(props: StatusSummaryProps) {
  const total = props.normal + props.borderline + props.abnormal + props.urgent;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Results Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-3">
          {statuses.map((s) => (
            <div key={s.key} className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${s.bg} ${s.text} ring-1 ${s.ring} text-lg font-semibold`}
              >
                {props[s.key]}
              </div>
              <span className={`text-xs font-medium ${s.text}`}>{s.label}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {total} biomarkers analyzed
        </p>
      </CardContent>
    </Card>
  );
}
