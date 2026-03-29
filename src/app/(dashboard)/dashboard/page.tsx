"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatusSummary } from "@/components/dashboard/status-summary";
import { BodySystemCard } from "@/components/dashboard/body-system-card";
import { UrgentAlertCard } from "@/components/dashboard/urgent-alert-card";
import { DoctorQuestions } from "@/components/dashboard/doctor-questions";
import { DailyActions } from "@/components/dashboard/daily-actions";
import { BiomarkerCard } from "@/components/biomarker/biomarker-card";
import { Sparkline } from "@/components/charts/sparkline";
import {
  AlertTriangle,
  CalendarDays,
  Droplets,
  FlaskConical,
  Heart,
  Pill,
  Flame,
  Brain,
  Shield,
  Upload,
  Clock,
  FileText,
  TrendingUp,
} from "lucide-react";
import type { StatusLevel } from "@/lib/medical/knowledge/types";

// ── Demo Data ────────────────────────────────────────────────────────────────

const DEMO_USER = {
  name: "Sarah",
  sex: "female" as const,
  lastReportDate: "March 22, 2026",
  lastLabName: "LifeLabs Toronto",
};

const DEMO_ALERTS = [
  {
    biomarkerName: "Triglycerides",
    value: 220,
    unit: "mg/dL",
    message: "Your triglycerides are significantly elevated, increasing cardiovascular risk.",
    action: "Discuss lipid-lowering strategies with your physician.",
  },
  {
    biomarkerName: "LDL Cholesterol",
    value: 165,
    unit: "mg/dL",
    message: "LDL is well above optimal range, contributing to arterial plaque buildup.",
    action: "Review dietary fat intake and consider a statin evaluation.",
  },
];

interface DemoBiomarker {
  name: string;
  code: string;
  value: number;
  unit: string;
  status: StatusLevel;
  rangeMin: number | null;
  rangeMax: number | null;
  explanation: string;
  trendData?: number[];
  trendColor?: string;
}

const DEMO_OUT_OF_RANGE: DemoBiomarker[] = [
  {
    name: "Ferritin",
    code: "FERR",
    value: 15,
    unit: "ng/mL",
    status: "abnormal",
    rangeMin: 20,
    rangeMax: 200,
    explanation: "Low ferritin indicates depleted iron stores, common in menstruating women. May cause fatigue and weakness.",
    trendData: [28, 22, 19, 15],
    trendColor: "#f97316",
  },
  {
    name: "Hemoglobin",
    code: "HGB",
    value: 11.2,
    unit: "g/dL",
    status: "borderline",
    rangeMin: 12.0,
    rangeMax: 16.0,
    explanation: "Slightly below normal for females. Combined with low ferritin, may suggest iron-deficiency anemia developing.",
    trendData: [12.8, 12.1, 11.6, 11.2],
    trendColor: "#f59e0b",
  },
  {
    name: "LDL Cholesterol",
    code: "LDL",
    value: 165,
    unit: "mg/dL",
    status: "abnormal",
    rangeMin: 0,
    rangeMax: 130,
    explanation: "Elevated LDL increases cardiovascular disease risk. Diet, exercise, and possibly medication can help.",
    trendData: [138, 145, 158, 165],
    trendColor: "#f97316",
  },
  {
    name: "Triglycerides",
    code: "TRIG",
    value: 220,
    unit: "mg/dL",
    status: "urgent",
    rangeMin: 0,
    rangeMax: 150,
    explanation: "Significantly elevated. High triglycerides contribute to arterial hardening and increase pancreatitis risk.",
    trendData: [160, 180, 195, 220],
    trendColor: "#ef4444",
  },
  {
    name: "Vitamin D (25-OH)",
    code: "VITD",
    value: 18,
    unit: "ng/mL",
    status: "abnormal",
    rangeMin: 30,
    rangeMax: 100,
    explanation: "Deficient. Low vitamin D affects bone health, immune function, and mood. Supplementation recommended.",
    trendData: [24, 21, 19, 18],
    trendColor: "#f97316",
  },
  {
    name: "HbA1c",
    code: "HBA1C",
    value: 5.8,
    unit: "%",
    status: "borderline",
    rangeMin: 4.0,
    rangeMax: 5.7,
    explanation: "Prediabetic range. Indicates average blood sugar has been slightly elevated over the past 2-3 months.",
    trendData: [5.4, 5.5, 5.7, 5.8],
    trendColor: "#f59e0b",
  },
  {
    name: "C-Reactive Protein (hsCRP)",
    code: "CRP",
    value: 4.5,
    unit: "mg/L",
    status: "borderline",
    rangeMin: 0,
    rangeMax: 3.0,
    explanation: "Mildly elevated. Indicates low-grade inflammation which may be related to metabolic or cardiovascular factors.",
    trendData: [2.1, 2.8, 3.5, 4.5],
    trendColor: "#f59e0b",
  },
];

const DEMO_BODY_SYSTEMS = [
  { name: "Hematology", icon: Droplets, status: "abnormal" as StatusLevel, count: 6, flagged: 2, summary: "Low ferritin and borderline hemoglobin suggest developing iron deficiency." },
  { name: "Metabolic", icon: Flame, status: "borderline" as StatusLevel, count: 5, flagged: 1, summary: "HbA1c is in the prediabetic range. Fasting glucose within normal limits." },
  { name: "Lipids", icon: Heart, status: "urgent" as StatusLevel, count: 4, flagged: 2, summary: "Both LDL and triglycerides are elevated. HDL is adequate at 52 mg/dL." },
  { name: "Liver", icon: FlaskConical, status: "normal" as StatusLevel, count: 4, flagged: 0, summary: "ALT, AST, bilirubin, and ALP are all within normal ranges." },
  { name: "Kidney", icon: Shield, status: "normal" as StatusLevel, count: 3, flagged: 0, summary: "Creatinine, BUN, and eGFR all normal. Kidney function is healthy." },
  { name: "Thyroid", icon: Brain, status: "normal" as StatusLevel, count: 2, flagged: 0, summary: "TSH and free T4 within normal limits. Thyroid function is stable." },
  { name: "Vitamins & Minerals", icon: Pill, status: "abnormal" as StatusLevel, count: 3, flagged: 1, summary: "Vitamin D is deficient. B12 and folate are within normal ranges." },
  { name: "Inflammation", icon: AlertTriangle, status: "borderline" as StatusLevel, count: 2, flagged: 1, summary: "hsCRP mildly elevated. ESR within normal range." },
];

const DEMO_QUESTIONS = [
  {
    question: "Should I start iron supplementation given my low ferritin and borderline hemoglobin?",
    context: "Ferritin is 15 ng/mL (below 20) and hemoglobin is 11.2 g/dL (below 12.0 for females).",
  },
  {
    question: "What dietary changes would help lower my triglycerides and LDL together?",
    context: "Triglycerides 220 mg/dL and LDL 165 mg/dL are both significantly elevated.",
  },
  {
    question: "Given my HbA1c of 5.8%, should I be screened for insulin resistance?",
    context: "HbA1c in prediabetic range (5.7-6.4%). Early intervention may prevent progression.",
  },
  {
    question: "What vitamin D dose should I take, and should I retest in 3 months?",
    context: "Vitamin D at 18 ng/mL is deficient (optimal >30). Supplementation typically 2000-5000 IU daily.",
  },
  {
    question: "Could my elevated CRP be related to my lipid profile, and should I investigate further?",
    context: "hsCRP 4.5 mg/L combined with high lipids may indicate elevated cardiovascular risk.",
  },
];

const DEMO_ACTIONS = [
  { text: "Take iron-rich foods with vitamin C to boost absorption (spinach + citrus, red meat)", priority: "high" as const, category: "Nutrition" },
  { text: "Reduce refined carbohydrates and added sugars to help lower triglycerides", priority: "high" as const, category: "Nutrition" },
  { text: "Take vitamin D3 supplement (2000 IU daily) with a fatty meal", priority: "high" as const, category: "Supplement" },
  { text: "Walk 30 minutes daily to help insulin sensitivity and lipid levels", priority: "medium" as const, category: "Exercise" },
  { text: "Add omega-3 rich foods (salmon, walnuts, flaxseed) 2-3 times per week", priority: "medium" as const, category: "Nutrition" },
  { text: "Limit alcohol to reduce triglycerides and support liver health", priority: "medium" as const, category: "Lifestyle" },
  { text: "Get 7-8 hours of sleep to reduce inflammation markers", priority: "low" as const, category: "Lifestyle" },
  { text: "Spend 15 minutes outdoors midday for natural vitamin D synthesis", priority: "low" as const, category: "Lifestyle" },
];

const DEMO_UPLOAD_HISTORY = [
  { date: "March 22, 2026", lab: "LifeLabs Toronto", fileName: "bloodwork_march2026.pdf", biomarkers: 29, status: "interpreted" },
  { date: "December 10, 2025", lab: "LifeLabs Toronto", fileName: "annual_checkup_dec2025.pdf", biomarkers: 24, status: "interpreted" },
  { date: "June 5, 2025", lab: "Dynacare", fileName: "dynacare_results_june.pdf", biomarkers: 18, status: "interpreted" },
];

// ── Page Component ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back, {DEMO_USER.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Last report analyzed on {DEMO_USER.lastReportDate} from {DEMO_USER.lastLabName}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          <span>March 29, 2026</span>
        </div>
      </div>

      {/* Urgent Alerts */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <h2 className="text-base font-semibold text-red-700 dark:text-red-400">
            Urgent Attention Required
          </h2>
          <Badge variant="destructive" className="text-[11px]">
            {DEMO_ALERTS.length} alerts
          </Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {DEMO_ALERTS.map((alert, i) => (
            <UrgentAlertCard key={i} {...alert} />
          ))}
        </div>
      </section>

      {/* Status Summary */}
      <StatusSummary normal={18} borderline={4} abnormal={3} urgent={1} />

      {/* Body Systems Grid */}
      <section>
        <h2 className="mb-3 text-base font-semibold">Body Systems</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DEMO_BODY_SYSTEMS.map((system) => (
            <BodySystemCard
              key={system.name}
              name={system.name}
              icon={system.icon}
              status={system.status}
              biomarkerCount={system.count}
              flaggedCount={system.flagged}
              summary={system.summary}
            />
          ))}
        </div>
      </section>

      {/* Out-of-Range Biomarkers */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold">Out-of-Range Results</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DEMO_OUT_OF_RANGE.map((biomarker) => (
            <BiomarkerCard
              key={biomarker.code}
              name={biomarker.name}
              code={biomarker.code}
              value={biomarker.value}
              unit={biomarker.unit}
              status={biomarker.status}
              rangeMin={biomarker.rangeMin}
              rangeMax={biomarker.rangeMax}
              explanation={biomarker.explanation}
            />
          ))}
        </div>
      </section>

      {/* Trend Sparklines */}
      <section>
        <h2 className="mb-3 text-base font-semibold">Recent Trends</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DEMO_OUT_OF_RANGE.filter((b) => b.trendData).map((biomarker) => (
            <Card key={biomarker.code} size="sm">
              <CardHeader className="pb-1">
                <CardTitle className="flex items-center justify-between text-xs">
                  <span>{biomarker.name}</span>
                  <span className="text-sm font-semibold">
                    {biomarker.value} <span className="text-[10px] font-normal text-muted-foreground">{biomarker.unit}</span>
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Sparkline
                  data={biomarker.trendData!}
                  color={biomarker.trendColor}
                  height={36}
                />
                <p className="mt-1 text-[10px] text-muted-foreground text-right">
                  Last 4 results
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* Doctor Questions & Daily Actions — side by side */}
      <div className="grid gap-6 lg:grid-cols-2">
        <DoctorQuestions questions={DEMO_QUESTIONS} />
        <DailyActions actions={DEMO_ACTIONS} />
      </div>

      <Separator />

      {/* Upload History */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-semibold">Upload History</h2>
        </div>
        <Card>
          <CardContent className="pt-2">
            <div className="space-y-0">
              {DEMO_UPLOAD_HISTORY.map((upload, i) => (
                <div key={i}>
                  <div className="flex items-center gap-4 py-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{upload.fileName}</span>
                        <Badge variant="secondary" className="text-[10px] shrink-0">
                          {upload.biomarkers} markers
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {upload.lab} &middot; {upload.date}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800">
                      Analyzed
                    </Badge>
                  </div>
                  {i < DEMO_UPLOAD_HISTORY.length - 1 && (
                    <Separator />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Disclaimer */}
      <div className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-center">
        <p className="text-xs text-muted-foreground">
          BloodInsight provides educational health information only. It does not replace professional medical advice, diagnosis, or treatment.
          Always consult a qualified healthcare provider for medical decisions.
        </p>
      </div>
    </div>
  );
}
