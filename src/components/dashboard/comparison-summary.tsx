"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import type { ComparisonSummaryData } from "@/lib/medical/comparison";

interface ComparisonSummaryProps {
  data: ComparisonSummaryData;
}

export function ComparisonSummary({ data }: ComparisonSummaryProps) {
  const items = [
    {
      label: "Improved",
      count: data.improved,
      icon: TrendingUp,
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      border: "border-emerald-200 dark:border-emerald-800",
      text: "text-emerald-700 dark:text-emerald-400",
      iconColor: "text-emerald-500",
    },
    {
      label: "Worsened",
      count: data.worsened,
      icon: TrendingDown,
      bg: "bg-red-50 dark:bg-red-950/30",
      border: "border-red-200 dark:border-red-800",
      text: "text-red-700 dark:text-red-400",
      iconColor: "text-red-500",
    },
    {
      label: "Stable",
      count: data.stable,
      icon: Minus,
      bg: "bg-slate-50 dark:bg-slate-800/30",
      border: "border-slate-200 dark:border-slate-700",
      text: "text-slate-700 dark:text-slate-400",
      iconColor: "text-slate-500",
    },
    {
      label: "Back in Range",
      count: data.backToNormal,
      icon: CheckCircle2,
      bg: "bg-teal-50 dark:bg-teal-950/30",
      border: "border-teal-200 dark:border-teal-800",
      text: "text-teal-700 dark:text-teal-400",
      iconColor: "text-teal-500",
    },
    {
      label: "Newly Abnormal",
      count: data.newlyAbnormal,
      icon: AlertTriangle,
      bg: "bg-orange-50 dark:bg-orange-950/30",
      border: "border-orange-200 dark:border-orange-800",
      text: "text-orange-700 dark:text-orange-400",
      iconColor: "text-orange-500",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-primary" />
          Latest vs Previous
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 ${item.bg} ${item.border}`}
              >
                <Icon className={`h-4 w-4 ${item.iconColor}`} />
                <span className={`text-xl font-bold ${item.text}`}>{item.count}</span>
                <span className="text-[10px] font-medium text-muted-foreground text-center leading-tight">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
