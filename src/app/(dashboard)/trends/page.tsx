"use client";

import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";

interface BiomarkerTrend {
  code: string;
  name: string;
  unit: string;
  category: string;
  currentStatus: "normal" | "low" | "high";
  trend: "up" | "down" | "stable";
  refMin: number;
  refMax: number;
  chartMin: number;
  chartMax: number;
  data: { date: string; value: number }[];
}

const DEMO_TRENDS: BiomarkerTrend[] = [
  {
    code: "hemoglobin", name: "Hemoglobin", unit: "g/dL", category: "hematology",
    currentStatus: "normal", trend: "stable", refMin: 12, refMax: 17.5, chartMin: 8, chartMax: 20,
    data: [
      { date: "Sep '25", value: 14.5 }, { date: "Dec '25", value: 14.3 },
      { date: "Mar '26", value: 14.1 }, { date: "Jun '26", value: 14.2 },
    ],
  },
  {
    code: "ferritin", name: "Ferritin", unit: "ng/mL", category: "iron",
    currentStatus: "low", trend: "down", refMin: 20, refMax: 200, chartMin: 0, chartMax: 80,
    data: [
      { date: "Sep '25", value: 28 }, { date: "Dec '25", value: 22 },
      { date: "Mar '26", value: 15 }, { date: "Jun '26", value: 12 },
    ],
  },
  {
    code: "vitamin-d", name: "Vitamin D", unit: "ng/mL", category: "vitamin",
    currentStatus: "low", trend: "down", refMin: 30, refMax: 100, chartMin: 0, chartMax: 60,
    data: [
      { date: "Sep '25", value: 32 }, { date: "Dec '25", value: 25 },
      { date: "Mar '26", value: 20 }, { date: "Jun '26", value: 18 },
    ],
  },
  {
    code: "glucose", name: "Glucose (Fasting)", unit: "mg/dL", category: "metabolic",
    currentStatus: "normal", trend: "stable", refMin: 70, refMax: 100, chartMin: 50, chartMax: 130,
    data: [
      { date: "Sep '25", value: 92 }, { date: "Dec '25", value: 94 },
      { date: "Mar '26", value: 93 }, { date: "Jun '26", value: 95 },
    ],
  },
  {
    code: "cholesterol", name: "Total Cholesterol", unit: "mg/dL", category: "lipid",
    currentStatus: "high", trend: "up", refMin: 0, refMax: 200, chartMin: 150, chartMax: 250,
    data: [
      { date: "Sep '25", value: 185 }, { date: "Dec '25", value: 192 },
      { date: "Mar '26", value: 201 }, { date: "Jun '26", value: 210 },
    ],
  },
  {
    code: "ldl", name: "LDL Cholesterol", unit: "mg/dL", category: "lipid",
    currentStatus: "high", trend: "up", refMin: 0, refMax: 100, chartMin: 60, chartMax: 160,
    data: [
      { date: "Sep '25", value: 110 }, { date: "Dec '25", value: 118 },
      { date: "Mar '26", value: 128 }, { date: "Jun '26", value: 138 },
    ],
  },
  {
    code: "hdl", name: "HDL Cholesterol", unit: "mg/dL", category: "lipid",
    currentStatus: "normal", trend: "stable", refMin: 40, refMax: 200, chartMin: 20, chartMax: 80,
    data: [
      { date: "Sep '25", value: 55 }, { date: "Dec '25", value: 54 },
      { date: "Mar '26", value: 53 }, { date: "Jun '26", value: 52 },
    ],
  },
  {
    code: "triglycerides", name: "Triglycerides", unit: "mg/dL", category: "lipid",
    currentStatus: "high", trend: "up", refMin: 0, refMax: 150, chartMin: 80, chartMax: 200,
    data: [
      { date: "Sep '25", value: 120 }, { date: "Dec '25", value: 132 },
      { date: "Mar '26", value: 145 }, { date: "Jun '26", value: 155 },
    ],
  },
  {
    code: "tsh", name: "TSH", unit: "mIU/L", category: "thyroid",
    currentStatus: "normal", trend: "stable", refMin: 0.4, refMax: 4.0, chartMin: 0, chartMax: 6,
    data: [
      { date: "Sep '25", value: 1.8 }, { date: "Dec '25", value: 2.0 },
      { date: "Mar '26", value: 1.9 }, { date: "Jun '26", value: 2.1 },
    ],
  },
  {
    code: "creatinine", name: "Creatinine", unit: "mg/dL", category: "kidney",
    currentStatus: "normal", trend: "stable", refMin: 0.7, refMax: 1.3, chartMin: 0.3, chartMax: 1.8,
    data: [
      { date: "Sep '25", value: 0.88 }, { date: "Dec '25", value: 0.91 },
      { date: "Mar '26", value: 0.89 }, { date: "Jun '26", value: 0.9 },
    ],
  },
  {
    code: "alt", name: "ALT", unit: "U/L", category: "liver",
    currentStatus: "normal", trend: "stable", refMin: 7, refMax: 56, chartMin: 0, chartMax: 70,
    data: [
      { date: "Sep '25", value: 20 }, { date: "Dec '25", value: 24 },
      { date: "Mar '26", value: 21 }, { date: "Jun '26", value: 22 },
    ],
  },
  {
    code: "crp", name: "CRP", unit: "mg/L", category: "inflammation",
    currentStatus: "normal", trend: "stable", refMin: 0, refMax: 3, chartMin: 0, chartMax: 6,
    data: [
      { date: "Sep '25", value: 0.5 }, { date: "Dec '25", value: 0.3 },
      { date: "Mar '26", value: 0.6 }, { date: "Jun '26", value: 0.4 },
    ],
  },
];

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "hematology", label: "Hematology" },
  { value: "iron", label: "Iron" },
  { value: "lipid", label: "Lipids" },
  { value: "metabolic", label: "Metabolic" },
  { value: "thyroid", label: "Thyroid" },
  { value: "kidney", label: "Kidney" },
  { value: "liver", label: "Liver" },
  { value: "vitamin", label: "Vitamins" },
  { value: "inflammation", label: "Inflammation" },
];

function statusBg(status: string) {
  switch (status) {
    case "normal": return "bg-health-normal/10 text-health-normal";
    case "low": return "bg-health-warning/10 text-health-warning";
    case "high": return "bg-health-abnormal/10 text-health-abnormal";
    default: return "bg-muted text-muted-foreground";
  }
}

function trendIcon(trend: string) {
  switch (trend) {
    case "up": return <TrendingUp className="size-3.5" />;
    case "down": return <TrendingDown className="size-3.5" />;
    default: return <Minus className="size-3.5" />;
  }
}

function chartColor(status: string) {
  switch (status) {
    case "normal": return "var(--health-normal)";
    case "low": return "var(--health-warning)";
    case "high": return "var(--health-abnormal)";
    default: return "var(--chart-1)";
  }
}

function MiniTrendChart({ trend }: { trend: BiomarkerTrend }) {
  const color = chartColor(trend.currentStatus);
  return (
    <div className="h-32">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={trend.data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${trend.code}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
          <YAxis domain={[trend.chartMin, trend.chartMax]} tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value) => [`${value} ${trend.unit}`, trend.name]}
          />
          <ReferenceArea
            y1={Math.max(trend.refMin, trend.chartMin)}
            y2={Math.min(trend.refMax, trend.chartMax)}
            fill="var(--health-normal)"
            fillOpacity={0.08}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#grad-${trend.code})`}
            dot={{ r: 3, fill: color }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function TrendsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Trends & History</h1>
        <p className="mt-1 text-muted-foreground">
          Track your biomarkers over time across 4 reports spanning 9 months.
        </p>
      </div>

      {/* Reports timeline */}
      <div className="flex flex-wrap gap-2">
        {["Sep 2025", "Dec 2025", "Mar 2026", "Jun 2026"].map((d, i) => (
          <div
            key={d}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
              i === 3 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            }`}
          >
            <Calendar className="size-3" />
            {d}
          </div>
        ))}
      </div>

      <Tabs defaultValue="all">
        <TabsList variant="line" className="flex-wrap">
          {CATEGORIES.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value}>
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map((cat) => (
          <TabsContent key={cat.value} value={cat.value}>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {DEMO_TRENDS.filter(
                (t) => cat.value === "all" || t.category === cat.value
              ).map((trend) => (
                <Link key={trend.code} href={`/biomarker/${trend.code}`}>
                  <Card className="transition-all hover:shadow-card-hover hover:border-primary/20 cursor-pointer">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{trend.name}</CardTitle>
                        <Badge className={statusBg(trend.currentStatus)}>
                          {trend.currentStatus === "normal" ? "Normal" : trend.currentStatus === "low" ? "Low" : "High"}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-1.5">
                        <span className="tabular-nums font-medium text-foreground">
                          {trend.data[trend.data.length - 1].value}
                        </span>
                        <span>{trend.unit}</span>
                        <span className="ml-auto flex items-center gap-0.5">
                          {trendIcon(trend.trend)}
                          {trend.trend}
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <MiniTrendChart trend={trend} />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
