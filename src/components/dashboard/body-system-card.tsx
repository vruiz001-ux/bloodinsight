import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { StatusLevel } from "@/lib/medical/knowledge/types";
import type { LucideIcon } from "lucide-react";

interface BodySystemCardProps {
  name: string;
  icon: LucideIcon;
  status: StatusLevel;
  biomarkerCount: number;
  flaggedCount: number;
  summary: string;
}

const statusConfig: Record<StatusLevel, { bg: string; border: string; text: string; dot: string; label: string }> = {
  normal: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
    label: "Normal",
  },
  borderline: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
    label: "Borderline",
  },
  abnormal: {
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-200 dark:border-orange-800",
    text: "text-orange-700 dark:text-orange-400",
    dot: "bg-orange-500",
    label: "Abnormal",
  },
  urgent: {
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-700 dark:text-red-400",
    dot: "bg-red-500",
    label: "Urgent",
  },
};

export function BodySystemCard({
  name,
  icon: Icon,
  status,
  biomarkerCount,
  flaggedCount,
  summary,
}: BodySystemCardProps) {
  const config = statusConfig[status];

  return (
    <Card className={`border ${config.border} ${config.bg} transition-shadow hover:shadow-card-hover`}>
      <CardHeader className="pb-2">
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
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground leading-relaxed">{summary}</p>
        <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>{biomarkerCount} markers</span>
          {flaggedCount > 0 && (
            <>
              <span className="text-border">|</span>
              <span className={config.text}>{flaggedCount} flagged</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
