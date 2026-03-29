"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingDown,
  Stethoscope,
  Salad,
  AlertCircle,
  Info,
  Heart,
  Moon,
  Droplets,
  Dumbbell,
  Apple,
  Pill,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from "recharts";

// Demo data for Ferritin (low value example)
const BIOMARKER = {
  code: "ferritin",
  name: "Ferritin",
  value: 12,
  unit: "ng/mL",
  status: "low" as "normal" | "low" | "high" | "critical",
  refMin: 20,
  refMax: 200,
  absoluteMin: 0,
  absoluteMax: 400,
  whatItMeasures:
    "Ferritin is a protein that stores iron in your cells. It is the most reliable indicator of your body's total iron reserves. When ferritin is low, it means your iron stores are depleted, even if your hemoglobin or serum iron levels look normal.",
  whatResultMayMean:
    "Your ferritin level of 12 ng/mL is below the normal reference range (20-200 ng/mL). This indicates depleted iron stores. While not yet severe iron-deficiency anemia, it represents early-stage iron depletion that could progress if not addressed.",
  commonNonDangerousReasons: [
    "Heavy menstrual periods",
    "Dietary insufficiency (vegetarian/vegan diet without iron supplementation)",
    "Frequent blood donation",
    "Recent pregnancy or breastfeeding",
    "Intense endurance exercise (runner's anemia)",
    "Growth spurts in adolescents",
  ],
  whenItMatters:
    "Persistently low ferritin can lead to iron-deficiency anemia, causing fatigue, weakness, shortness of breath, brittle nails, and difficulty concentrating. In rare cases, very low ferritin may signal gastrointestinal bleeding, celiac disease, or other conditions affecting iron absorption.",
  dailyLifeActions: [
    { icon: Apple, category: "Diet", text: "Increase iron-rich foods: red meat, lentils, spinach, fortified cereals, tofu, and dark chocolate." },
    { icon: Droplets, category: "Absorption", text: "Pair iron-rich meals with vitamin C (citrus, bell peppers, strawberries) to boost absorption by up to 6x." },
    { icon: Salad, category: "Diet", text: "Avoid drinking tea or coffee with meals, as tannins can reduce iron absorption by 50-60%." },
    { icon: Pill, category: "Supplement", text: "Consider an iron supplement (ferrous bisglycinate is gentler on the stomach). Take on an empty stomach if tolerated." },
    { icon: Dumbbell, category: "Exercise", text: "If you do intense endurance training, consider periodizing and monitoring iron levels more frequently." },
    { icon: Moon, category: "Sleep", text: "Low ferritin can contribute to restless legs at night. Improving iron stores may improve sleep quality." },
  ],
  whenToSeeDoctor:
    "See your doctor if you experience persistent fatigue, shortness of breath, dizziness, pale skin, or heart palpitations. Also consult if ferritin remains low despite 3 months of dietary changes and supplementation, as further investigation may be needed.",
  relatedBiomarkers: [
    { code: "iron", name: "Serum Iron", value: "45 ug/dL", status: "low" },
    { code: "hemoglobin", name: "Hemoglobin", value: "14.2 g/dL", status: "normal" },
    { code: "tibc", name: "TIBC", value: "410 ug/dL", status: "high" },
    { code: "transferrin-sat", name: "Transferrin Sat.", value: "11%", status: "low" },
  ],
};

const TREND_DATA = [
  { date: "Sep 2025", value: 28, min: 20, max: 200 },
  { date: "Dec 2025", value: 22, min: 20, max: 200 },
  { date: "Mar 2026", value: 15, min: 20, max: 200 },
  { date: "Jun 2026", value: 12, min: 20, max: 200 },
];

function statusColor(status: string) {
  switch (status) {
    case "normal": return "text-health-normal";
    case "low": return "text-health-warning";
    case "high": return "text-health-abnormal";
    case "critical": return "text-health-critical";
    default: return "text-muted-foreground";
  }
}

function statusBg(status: string) {
  switch (status) {
    case "normal": return "bg-health-normal/10 text-health-normal";
    case "low": return "bg-health-warning/10 text-health-warning";
    case "high": return "bg-health-abnormal/10 text-health-abnormal";
    case "critical": return "bg-health-critical/10 text-health-critical";
    default: return "bg-muted text-muted-foreground";
  }
}

export default function BiomarkerDetailPage() {
  const params = useParams();
  const b = BIOMARKER;

  // Calculate position on range bar (0-100%)
  const rangeSpan = b.absoluteMax - b.absoluteMin;
  const valuePercent = Math.max(0, Math.min(100, ((b.value - b.absoluteMin) / rangeSpan) * 100));
  const refMinPercent = ((b.refMin - b.absoluteMin) / rangeSpan) * 100;
  const refMaxPercent = ((b.refMax - b.absoluteMin) / rangeSpan) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/results/demo-report-001">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{b.name}</h1>
            <Badge className={statusBg(b.status)}>
              {b.status === "low" ? "Below Range" : b.status === "high" ? "Above Range" : "Normal"}
            </Badge>
          </div>
          <p className="mt-1 text-muted-foreground">
            Iron storage marker | Category: Iron Studies
          </p>
        </div>
      </div>

      {/* Value display + range bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            {/* Large value */}
            <div className="text-center sm:text-left">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Your Result
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className={`text-5xl font-bold tabular-nums ${statusColor(b.status)}`}>
                  {b.value}
                </span>
                <span className="text-lg text-muted-foreground">{b.unit}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Reference: {b.refMin} - {b.refMax} {b.unit}
              </p>
            </div>

            {/* Range visualization */}
            <div className="flex-1 w-full">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Where your value sits
              </p>
              <div className="relative h-8 w-full rounded-full bg-muted overflow-hidden">
                {/* Low zone */}
                <div
                  className="absolute inset-y-0 left-0 bg-health-warning/20"
                  style={{ width: `${refMinPercent}%` }}
                />
                {/* Normal zone */}
                <div
                  className="absolute inset-y-0 bg-health-normal/20"
                  style={{ left: `${refMinPercent}%`, width: `${refMaxPercent - refMinPercent}%` }}
                />
                {/* High zone */}
                <div
                  className="absolute inset-y-0 right-0 bg-health-abnormal/20"
                  style={{ width: `${100 - refMaxPercent}%` }}
                />
                {/* Value marker */}
                <div
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${valuePercent}%` }}
                >
                  <div className={`size-5 rounded-full border-2 border-white shadow-md ${
                    b.status === "normal" ? "bg-health-normal" : b.status === "low" ? "bg-health-warning" : "bg-health-abnormal"
                  }`} />
                </div>
              </div>
              <div className="mt-1 flex justify-between text-[0.65rem] text-muted-foreground">
                <span>{b.absoluteMin}</span>
                <span>{b.refMin} (low)</span>
                <span>{b.refMax} (high)</span>
                <span>{b.absoluteMax}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trend chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="size-4 text-health-warning" />
            Trend Over Time
          </CardTitle>
          <CardDescription>
            Your ferritin has been declining over the past 9 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREND_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="ferritinGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-4)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--chart-4)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                <YAxis domain={[0, 60]} tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                />
                <ReferenceArea y1={20} y2={60} fill="var(--health-normal)" fillOpacity={0.08} />
                <ReferenceLine y={20} stroke="var(--health-normal)" strokeDasharray="4 4" label={{ value: "Min normal", position: "right", fontSize: 10 }} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--chart-4)"
                  strokeWidth={2}
                  fill="url(#ferritinGradient)"
                  dot={{ r: 4, fill: "var(--chart-4)" }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Information sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="size-4 text-primary" />
              What This Test Measures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {b.whatItMeasures}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="size-4 text-health-warning" />
              What Your Result May Mean
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {b.whatResultMayMean}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Heart className="size-4 text-health-teal" />
              Common Non-Dangerous Reasons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {b.commonNonDangerousReasons.map((reason, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-health-teal" />
                  {reason}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="size-4 text-health-abnormal" />
              When It Can Matter Clinically
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {b.whenItMatters}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lifestyle actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Salad className="size-4 text-health-normal" />
            What You Can Do in Daily Life
          </CardTitle>
          <CardDescription>
            Evidence-backed actions to help improve your ferritin levels. Discuss
            any changes with your clinician.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {b.dailyLifeActions.map((action, i) => (
              <div
                key={i}
                className="flex gap-3 rounded-lg border border-border/60 bg-muted/20 p-3"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <action.icon className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-primary">
                    {action.category}
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                    {action.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* When to see a doctor */}
      <Card className="border-health-warning/30 bg-health-warning/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="size-4 text-health-warning" />
            When to Speak to a Doctor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {b.whenToSeeDoctor}
          </p>
        </CardContent>
      </Card>

      {/* Related biomarkers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Related Biomarkers</CardTitle>
          <CardDescription>
            These markers are often evaluated together with ferritin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {b.relatedBiomarkers.map((rel) => (
              <Link
                key={rel.code}
                href={`/biomarker/${rel.code}`}
                className="flex flex-col gap-1 rounded-lg border border-border/60 p-3 transition-colors hover:bg-muted/30"
              >
                <span className="text-sm font-medium text-foreground">
                  {rel.name}
                </span>
                <span className={`text-lg font-bold tabular-nums ${statusColor(rel.status)}`}>
                  {rel.value}
                </span>
                <Badge className={`w-fit ${statusBg(rel.status)}`}>
                  {rel.status === "normal" ? "Normal" : rel.status === "low" ? "Low" : "High"}
                </Badge>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
