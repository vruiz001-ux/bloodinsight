import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface UrgentAlertCardProps {
  biomarkerName: string;
  value: number;
  unit: string;
  message: string;
  action: string;
}

export function UrgentAlertCard({
  biomarkerName,
  value,
  unit,
  message,
  action,
}: UrgentAlertCardProps) {
  return (
    <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
      <CardContent className="flex items-start gap-3 pt-1">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="font-medium text-red-800 dark:text-red-300">
              {biomarkerName}
            </span>
            <span className="text-sm font-semibold text-red-700 dark:text-red-400">
              {value} {unit}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-red-700/80 dark:text-red-400/80">
            {message}
          </p>
          <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
            {action}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
