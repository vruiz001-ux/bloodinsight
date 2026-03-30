"use client";

import { AlertTriangle, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UrgentAlert {
  biomarkerName: string;
  value: number;
  unit: string;
  message: string;
  action: string;
}

interface UrgentAlertBannerProps {
  alerts: UrgentAlert[];
}

export function UrgentAlertBanner({ alerts }: UrgentAlertBannerProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="rounded-2xl border-2 border-red-200 dark:border-red-800/60 bg-gradient-to-r from-red-50 via-red-50/80 to-orange-50/50 dark:from-red-950/40 dark:via-red-950/30 dark:to-orange-950/20 p-4 sm:p-5">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-base font-bold text-red-800 dark:text-red-300">
          Urgent Attention Required
        </h2>
        <Badge variant="destructive" className="ml-1 text-[10px]">
          {alerts.length} {alerts.length === 1 ? "alert" : "alerts"}
        </Badge>
      </div>

      {/* Alert cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        {alerts.map((alert, i) => (
          <div
            key={i}
            className="rounded-xl border border-red-200/80 dark:border-red-800/40 bg-white/70 dark:bg-red-950/20 p-3.5 backdrop-blur-sm"
          >
            <div className="flex items-baseline gap-2 mb-1.5">
              <span className="text-sm font-semibold text-red-800 dark:text-red-300">
                {alert.biomarkerName}
              </span>
              <span className="text-sm font-bold text-red-700 dark:text-red-400">
                {alert.value} {alert.unit}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-red-700/80 dark:text-red-400/80">
              {alert.message}
            </p>
            <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400">
              <ChevronRight className="h-3 w-3" />
              {alert.action}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
