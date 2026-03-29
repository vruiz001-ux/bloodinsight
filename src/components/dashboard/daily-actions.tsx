import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HeartPulse, CheckCircle2 } from "lucide-react";

interface Action {
  text: string;
  priority: "high" | "medium" | "low";
  category: string;
}

interface DailyActionsProps {
  actions: Action[];
}

const priorityConfig = {
  high: {
    dot: "bg-red-500",
    text: "text-red-700 dark:text-red-400",
  },
  medium: {
    dot: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-400",
  },
  low: {
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
  },
};

export function DailyActions({ actions }: DailyActionsProps) {
  const grouped = {
    high: actions.filter((a) => a.priority === "high"),
    medium: actions.filter((a) => a.priority === "medium"),
    low: actions.filter((a) => a.priority === "low"),
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <HeartPulse className="h-4 w-4 text-primary" />
          Daily Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {(["high", "medium", "low"] as const).map((priority) => {
            const items = grouped[priority];
            if (items.length === 0) return null;
            const config = priorityConfig[priority];
            const label = priority === "high" ? "Priority" : priority === "medium" ? "Recommended" : "Helpful";
            return (
              <div key={priority}>
                <div className="mb-1.5 flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                  <span className={`text-xs font-semibold uppercase tracking-wide ${config.text}`}>
                    {label}
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {items.map((action, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                      <div>
                        <span>{action.text}</span>
                        <span className="ml-1.5 text-[11px] text-muted-foreground">
                          ({action.category})
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
