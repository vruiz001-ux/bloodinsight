"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { HealthSnapshot } from "@/components/dashboard/health-snapshot";
import { ComparisonSummary } from "@/components/dashboard/comparison-summary";
import { UrgentAlertBanner } from "@/components/dashboard/urgent-alert-banner";
import { BiomarkerPriorityCard } from "@/components/dashboard/biomarker-priority-card";
import { SystemHealthPanel } from "@/components/dashboard/system-health-panel";
import { DoctorQuestions } from "@/components/dashboard/doctor-questions";
import { DailyActions } from "@/components/dashboard/daily-actions";
import { BiomarkerDetailDrawer } from "@/components/dashboard/biomarker-detail-drawer";
import { TrendHistoryChart } from "@/components/charts/trend-history-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  Droplets,
  FlaskConical,
  Heart,
  Pill,
  Flame,
  Brain,
  Shield,
  AlertTriangle,
  TrendingUp,
  Clock,
  FileText,
} from "lucide-react";
import {
  compareBiomarker,
  generateComparisonSummary,
  enhanceInterpretation,
} from "@/lib/medical/comparison";
import type { BiomarkerComparison } from "@/lib/medical/comparison";
import type { StatusLevel } from "@/lib/medical/knowledge/types";

// ═══════════════════════════════════════════════════════════════════════════
// DEMO DATA — Latest Report (March 2026) vs Previous Report (September 2025)
// ═══════════════════════════════════════════════════════════════════════════

const DEMO_USER = {
  name: "Sarah",
  sex: "female" as const,
  lastReportDate: "March 22, 2026",
  previousReportDate: "September 15, 2025",
  lastLabName: "LifeLabs Toronto",
};

// Each biomarker: [code, name, unit, latestValue, latestStatus, rangeMin, rangeMax, prevValue, prevStatus, explanation, trendData]
type DemoBiomarkerRow = [
  string, string, string, number, StatusLevel, number | null, number | null,
  number | null, StatusLevel | null, string,
  { date: string; value: number }[]?,
];

const DEMO_BIOMARKERS: DemoBiomarkerRow[] = [
  // ── Urgent / Abnormal ──────────────────────────────────────────────────
  ["TRIG", "Triglycerides", "mg/dL", 220, "urgent", 0, 150,
    195, "abnormal",
    "Significantly elevated. High triglycerides contribute to arterial hardening and increase pancreatitis risk.",
    [{ date: "Jun 25", value: 160 }, { date: "Sep 25", value: 195 }, { date: "Mar 26", value: 220 }],
  ],
  ["LDL", "LDL Cholesterol", "mg/dL", 165, "abnormal", 0, 130,
    158, "abnormal",
    "Elevated LDL increases cardiovascular disease risk. Diet, exercise, and possibly medication can help.",
    [{ date: "Jun 25", value: 138 }, { date: "Sep 25", value: 158 }, { date: "Mar 26", value: 165 }],
  ],
  ["FERR", "Ferritin", "ng/mL", 15, "abnormal", 20, 200,
    19, "borderline",
    "Low ferritin indicates depleted iron stores, common in menstruating women. May cause fatigue and weakness.",
    [{ date: "Jun 25", value: 28 }, { date: "Sep 25", value: 19 }, { date: "Mar 26", value: 15 }],
  ],
  ["VITD", "Vitamin D (25-OH)", "ng/mL", 18, "abnormal", 30, 100,
    21, "abnormal",
    "Deficient. Low vitamin D affects bone health, immune function, and mood. Supplementation recommended.",
    [{ date: "Jun 25", value: 24 }, { date: "Sep 25", value: 21 }, { date: "Mar 26", value: 18 }],
  ],

  // ── Borderline ─────────────────────────────────────────────────────────
  ["HGB", "Hemoglobin", "g/dL", 11.2, "borderline", 12.0, 16.0,
    11.6, "borderline",
    "Slightly below normal for females. Combined with low ferritin, may suggest iron-deficiency anemia developing.",
    [{ date: "Jun 25", value: 12.8 }, { date: "Sep 25", value: 11.6 }, { date: "Mar 26", value: 11.2 }],
  ],
  ["HBA1C", "HbA1c", "%", 5.8, "borderline", 4.0, 5.7,
    5.5, "normal",
    "Prediabetic range. Indicates average blood sugar has been slightly elevated over the past 2-3 months.",
    [{ date: "Jun 25", value: 5.4 }, { date: "Sep 25", value: 5.5 }, { date: "Mar 26", value: 5.8 }],
  ],
  ["CRP", "C-Reactive Protein (hsCRP)", "mg/L", 4.5, "borderline", 0, 3.0,
    3.5, "borderline",
    "Mildly elevated. Indicates low-grade inflammation which may be related to metabolic or cardiovascular factors.",
    [{ date: "Jun 25", value: 2.1 }, { date: "Sep 25", value: 3.5 }, { date: "Mar 26", value: 4.5 }],
  ],
  ["HDL", "HDL Cholesterol", "mg/dL", 48, "borderline", 50, 80,
    52, "normal",
    "Slightly below optimal. HDL is protective — higher levels help clear LDL from arteries.",
    [{ date: "Jun 25", value: 56 }, { date: "Sep 25", value: 52 }, { date: "Mar 26", value: 48 }],
  ],

  // ── Normal ─────────────────────────────────────────────────────────────
  ["GLU", "Fasting Glucose", "mg/dL", 95, "normal", 70, 100,
    89, "normal",
    "Within normal range. Fasting glucose is a key marker for diabetes risk.",
    [{ date: "Jun 25", value: 86 }, { date: "Sep 25", value: 89 }, { date: "Mar 26", value: 95 }],
  ],
  ["TC", "Total Cholesterol", "mg/dL", 235, "borderline", 0, 200,
    228, "borderline",
    "Above optimal. Primarily driven by elevated LDL and triglycerides.",
    [{ date: "Jun 25", value: 210 }, { date: "Sep 25", value: 228 }, { date: "Mar 26", value: 235 }],
  ],
  ["WBC", "White Blood Cells", "10^3/µL", 6.8, "normal", 4.0, 11.0,
    7.1, "normal",
    "Normal white blood cell count indicating healthy immune function.",
  ],
  ["RBC", "Red Blood Cells", "10^6/µL", 4.1, "normal", 3.8, 5.1,
    4.3, "normal",
    "Within normal range for females.",
  ],
  ["PLT", "Platelets", "10^3/µL", 245, "normal", 150, 400,
    260, "normal",
    "Normal platelet count. Important for blood clotting.",
  ],
  ["ALT", "Alanine Aminotransferase", "U/L", 22, "normal", 7, 35,
    20, "normal",
    "Normal liver enzyme. No signs of liver stress.",
  ],
  ["AST", "Aspartate Aminotransferase", "U/L", 25, "normal", 8, 33,
    23, "normal",
    "Within normal range. Liver function appears healthy.",
  ],
  ["ALP", "Alkaline Phosphatase", "U/L", 65, "normal", 44, 147,
    62, "normal",
    "Normal. No indication of liver or bone disease.",
  ],
  ["CREATININE", "Creatinine", "mg/dL", 0.85, "normal", 0.59, 1.04,
    0.82, "normal",
    "Normal kidney function marker.",
  ],
  ["BUN", "Blood Urea Nitrogen", "mg/dL", 14, "normal", 6, 20,
    13, "normal",
    "Within normal range indicating healthy kidney function.",
  ],
  ["EGFR", "eGFR", "mL/min/1.73m²", 98, "normal", 90, null,
    101, "normal",
    "Excellent kidney filtration rate. No signs of kidney impairment.",
  ],
  ["TSH", "Thyroid Stimulating Hormone", "mIU/L", 2.1, "normal", 0.4, 4.0,
    1.9, "normal",
    "Thyroid function is normal and stable.",
  ],
  ["FT4", "Free T4", "ng/dL", 1.2, "normal", 0.8, 1.8,
    1.3, "normal",
    "Normal thyroid hormone level.",
  ],
  ["B12", "Vitamin B12", "pg/mL", 450, "normal", 200, 900,
    430, "normal",
    "Adequate B12 levels supporting nerve and blood cell health.",
  ],
  ["FOLATE", "Folate", "ng/mL", 12, "normal", 3, 20,
    11, "normal",
    "Normal folate levels.",
  ],
  ["ESR", "Erythrocyte Sedimentation Rate", "mm/hr", 12, "normal", 0, 20,
    10, "normal",
    "Normal inflammatory marker.",
  ],
  ["SODIUM", "Sodium", "mEq/L", 140, "normal", 136, 145,
    141, "normal",
    "Normal electrolyte balance.",
  ],
  ["POTASSIUM", "Potassium", "mEq/L", 4.2, "normal", 3.5, 5.0,
    4.1, "normal",
    "Normal potassium level.",
  ],
];

// ── Build comparisons from demo data ─────────────────────────────────────

function buildComparisons(): BiomarkerComparison[] {
  return DEMO_BIOMARKERS.map(([code, name, unit, latest, latestStatus, rMin, rMax, prev, prevStatus, _explanation]) =>
    compareBiomarker(code, name, unit, latest, latestStatus, rMin, rMax, prev, prevStatus, rMin, rMax)
  );
}

// ── Demo urgent alerts ───────────────────────────────────────────────────

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

// ── Demo body systems ────────────────────────────────────────────────────

const DEMO_SYSTEMS = [
  {
    name: "Hematology",
    icon: Droplets,
    status: "abnormal" as StatusLevel,
    summary: "Low ferritin and borderline hemoglobin suggest developing iron deficiency.",
    biomarkers: [
      { name: "Hemoglobin", value: 11.2, unit: "g/dL", status: "borderline" as StatusLevel, rangeMin: 12.0, rangeMax: 16.0 },
      { name: "White Blood Cells", value: 6.8, unit: "10³/µL", status: "normal" as StatusLevel, rangeMin: 4.0, rangeMax: 11.0 },
      { name: "Red Blood Cells", value: 4.1, unit: "10⁶/µL", status: "normal" as StatusLevel, rangeMin: 3.8, rangeMax: 5.1 },
      { name: "Platelets", value: 245, unit: "10³/µL", status: "normal" as StatusLevel, rangeMin: 150, rangeMax: 400 },
      { name: "Ferritin", value: 15, unit: "ng/mL", status: "abnormal" as StatusLevel, rangeMin: 20, rangeMax: 200 },
    ],
  },
  {
    name: "Lipids & Heart",
    icon: Heart,
    status: "urgent" as StatusLevel,
    summary: "Both LDL and triglycerides are elevated. HDL is below optimal.",
    biomarkers: [
      { name: "Total Cholesterol", value: 235, unit: "mg/dL", status: "borderline" as StatusLevel, rangeMin: 0, rangeMax: 200 },
      { name: "LDL", value: 165, unit: "mg/dL", status: "abnormal" as StatusLevel, rangeMin: 0, rangeMax: 130 },
      { name: "HDL", value: 48, unit: "mg/dL", status: "borderline" as StatusLevel, rangeMin: 50, rangeMax: 80 },
      { name: "Triglycerides", value: 220, unit: "mg/dL", status: "urgent" as StatusLevel, rangeMin: 0, rangeMax: 150 },
    ],
  },
  {
    name: "Metabolism",
    icon: Flame,
    status: "borderline" as StatusLevel,
    summary: "HbA1c is in the prediabetic range. Fasting glucose within normal limits.",
    biomarkers: [
      { name: "Fasting Glucose", value: 95, unit: "mg/dL", status: "normal" as StatusLevel, rangeMin: 70, rangeMax: 100 },
      { name: "HbA1c", value: 5.8, unit: "%", status: "borderline" as StatusLevel, rangeMin: 4.0, rangeMax: 5.7 },
    ],
  },
  {
    name: "Liver",
    icon: FlaskConical,
    status: "normal" as StatusLevel,
    summary: "ALT, AST, and ALP are all within normal ranges.",
    biomarkers: [
      { name: "ALT", value: 22, unit: "U/L", status: "normal" as StatusLevel, rangeMin: 7, rangeMax: 35 },
      { name: "AST", value: 25, unit: "U/L", status: "normal" as StatusLevel, rangeMin: 8, rangeMax: 33 },
      { name: "ALP", value: 65, unit: "U/L", status: "normal" as StatusLevel, rangeMin: 44, rangeMax: 147 },
    ],
  },
  {
    name: "Kidney",
    icon: Shield,
    status: "normal" as StatusLevel,
    summary: "Creatinine, BUN, and eGFR all normal. Kidney function is healthy.",
    biomarkers: [
      { name: "Creatinine", value: 0.85, unit: "mg/dL", status: "normal" as StatusLevel, rangeMin: 0.59, rangeMax: 1.04 },
      { name: "BUN", value: 14, unit: "mg/dL", status: "normal" as StatusLevel, rangeMin: 6, rangeMax: 20 },
      { name: "eGFR", value: 98, unit: "mL/min", status: "normal" as StatusLevel, rangeMin: 90, rangeMax: null },
    ],
  },
  {
    name: "Thyroid",
    icon: Brain,
    status: "normal" as StatusLevel,
    summary: "TSH and free T4 within normal limits. Thyroid function is stable.",
    biomarkers: [
      { name: "TSH", value: 2.1, unit: "mIU/L", status: "normal" as StatusLevel, rangeMin: 0.4, rangeMax: 4.0 },
      { name: "Free T4", value: 1.2, unit: "ng/dL", status: "normal" as StatusLevel, rangeMin: 0.8, rangeMax: 1.8 },
    ],
  },
  {
    name: "Vitamins & Iron",
    icon: Pill,
    status: "abnormal" as StatusLevel,
    summary: "Vitamin D is deficient. B12 and folate are within normal ranges.",
    biomarkers: [
      { name: "Vitamin D", value: 18, unit: "ng/mL", status: "abnormal" as StatusLevel, rangeMin: 30, rangeMax: 100 },
      { name: "Vitamin B12", value: 450, unit: "pg/mL", status: "normal" as StatusLevel, rangeMin: 200, rangeMax: 900 },
      { name: "Folate", value: 12, unit: "ng/mL", status: "normal" as StatusLevel, rangeMin: 3, rangeMax: 20 },
    ],
  },
  {
    name: "Inflammation",
    icon: AlertTriangle,
    status: "borderline" as StatusLevel,
    summary: "hsCRP mildly elevated. ESR within normal range.",
    biomarkers: [
      { name: "hsCRP", value: 4.5, unit: "mg/L", status: "borderline" as StatusLevel, rangeMin: 0, rangeMax: 3.0 },
      { name: "ESR", value: 12, unit: "mm/hr", status: "normal" as StatusLevel, rangeMin: 0, rangeMax: 20 },
    ],
  },
];

// ── Doctor questions ─────────────────────────────────────────────────────

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

// ── Daily actions ────────────────────────────────────────────────────────

const DEMO_ACTIONS = [
  { text: "Take iron-rich foods with vitamin C to boost absorption (spinach + citrus, red meat)", priority: "high" as const, category: "Nutrition" },
  { text: "Reduce refined carbohydrates and added sugars to help lower triglycerides", priority: "high" as const, category: "Nutrition" },
  { text: "Take vitamin D3 supplement (2000 IU daily) with a fatty meal", priority: "high" as const, category: "Supplement" },
  { text: "Walk 30 minutes daily to help insulin sensitivity and lipid levels", priority: "medium" as const, category: "Exercise" },
  { text: "Add omega-3 rich foods (salmon, walnuts, flaxseed) 2-3 times per week", priority: "medium" as const, category: "Nutrition" },
  { text: "Limit alcohol to reduce triglycerides and support liver health", priority: "medium" as const, category: "Lifestyle" },
  { text: "Stay hydrated — aim for 2L of water daily for kidney and metabolic health", priority: "medium" as const, category: "Hydration" },
  { text: "Get 7-8 hours of sleep to reduce inflammation markers", priority: "low" as const, category: "Sleep" },
  { text: "Spend 15 minutes outdoors midday for natural vitamin D synthesis", priority: "low" as const, category: "Lifestyle" },
];

// ── Upload History ───────────────────────────────────────────────────────

const DEMO_UPLOAD_HISTORY = [
  { date: "March 22, 2026", lab: "LifeLabs Toronto", fileName: "bloodwork_march2026.pdf", biomarkers: 26, status: "interpreted" },
  { date: "September 15, 2025", lab: "LifeLabs Toronto", fileName: "follow_up_sep2025.pdf", biomarkers: 24, status: "interpreted" },
  { date: "June 5, 2025", lab: "Dynacare", fileName: "dynacare_results_june.pdf", biomarkers: 18, status: "interpreted" },
];

// ═══════════════════════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function DashboardPage() {
  const [drawerBiomarker, setDrawerBiomarker] = useState<string | null>(null);

  // Build comparisons
  const comparisons = buildComparisons();
  const comparisonSummary = generateComparisonSummary(comparisons);

  // Count by status
  const normal = comparisons.filter((c) => c.latest.status === "normal").length;
  const borderline = comparisons.filter((c) => c.latest.status === "borderline").length;
  const abnormal = comparisons.filter((c) => c.latest.status === "abnormal").length;
  const urgent = comparisons.filter((c) => c.latest.status === "urgent").length;

  // Out-of-range for priority grid
  const outOfRange = comparisons.filter((c) => c.latest.status !== "normal");
  // Sort: urgent first, then abnormal, then borderline
  const statusOrder: Record<StatusLevel, number> = { urgent: 0, abnormal: 1, borderline: 2, normal: 3 };
  outOfRange.sort((a, b) => statusOrder[a.latest.status] - statusOrder[b.latest.status]);

  // Trending biomarkers for the trend section (those with trend data)
  const trendingBiomarkers = DEMO_BIOMARKERS.filter((b) => b[10] && b[10]!.length > 1);

  // Find comparison + demo row for drawer
  const drawerComparison = drawerBiomarker
    ? comparisons.find((c) => c.code === drawerBiomarker) ?? null
    : null;
  const drawerRow = drawerBiomarker
    ? DEMO_BIOMARKERS.find((b) => b[0] === drawerBiomarker)
    : null;

  // Build plain-text summary
  const plaintextSummary =
    urgent > 0 || abnormal > 0
      ? `Your latest blood work shows ${urgent + abnormal} marker${urgent + abnormal > 1 ? "s" : ""} outside the normal range that ${urgent > 0 ? "need" : "deserve"} attention. ${comparisonSummary.improved > 0 ? `${comparisonSummary.improved} marker${comparisonSummary.improved > 1 ? "s" : ""} improved since your last test. ` : ""}Focus on the flagged areas below and discuss with your healthcare provider.`
      : `Great news — most of your markers are within the normal range. ${comparisonSummary.improved > 0 ? `${comparisonSummary.improved} marker${comparisonSummary.improved > 1 ? "s have" : " has"} improved. ` : ""}Keep up your current lifestyle habits.`;

  return (
    <div className="space-y-8">
      {/* ── Welcome Header ─────────────────────────────────────────────── */}
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
          <span>March 30, 2026</span>
        </div>
      </div>

      {/* ── 1. Urgent Alert Banner (always visible) ────────────────────── */}
      <UrgentAlertBanner alerts={DEMO_ALERTS} />

      {/* ── 2. Health Snapshot + Comparison Summary ────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <HealthSnapshot
          normal={normal}
          borderline={borderline}
          abnormal={abnormal}
          urgent={urgent}
          comparison={comparisonSummary}
          lastReportDate={DEMO_USER.lastReportDate}
          plaintextSummary={plaintextSummary}
        />
        <ComparisonSummary data={comparisonSummary} />
      </div>

      {/* ── 3. Biomarker Priority Grid (out-of-range with arc meters) ── */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold">Priority Results</h2>
          <Badge variant="secondary" className="text-[10px]">
            {outOfRange.length} out of range
          </Badge>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {outOfRange.map((comparison) => {
            const row = DEMO_BIOMARKERS.find((b) => b[0] === comparison.code);
            const baseExplanation = row ? row[9] : "";
            const enhanced = enhanceInterpretation(baseExplanation, comparison);
            return (
              <div
                key={comparison.code}
                className="cursor-pointer"
                onClick={() => setDrawerBiomarker(comparison.code)}
              >
                <BiomarkerPriorityCard
                  comparison={comparison}
                  explanation={enhanced}
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 4. System Health Modules ───────────────────────────────────── */}
      <section>
        <h2 className="mb-4 text-base font-semibold">Body Systems</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DEMO_SYSTEMS.map((system) => (
            <SystemHealthPanel
              key={system.name}
              name={system.name}
              icon={system.icon}
              status={system.status}
              summary={system.summary}
              biomarkers={system.biomarkers}
            />
          ))}
        </div>
      </section>

      {/* ── 5. Trends & History ────────────────────────────────────────── */}
      <section>
        <h2 className="mb-4 text-base font-semibold">Trends Over Time</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trendingBiomarkers.slice(0, 6).map((row) => {
            const [code, name, unit, _val, status, rMin, rMax, _prev, _prevS, _expl, trendData] = row;
            return (
              <Card key={code} className="overflow-hidden">
                <CardHeader className="pb-1">
                  <CardTitle className="flex items-center justify-between text-xs">
                    <span>{name}</span>
                    <Badge variant="outline" className="text-[9px]">
                      {status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-1">
                  <TrendHistoryChart
                    data={trendData!}
                    rangeMin={rMin}
                    rangeMax={rMax}
                    unit={unit}
                    status={status}
                    height={100}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <Separator />

      {/* ── 6 & 7. Doctor Questions + Daily Actions ────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <DoctorQuestions questions={DEMO_QUESTIONS} />
        <DailyActions actions={DEMO_ACTIONS} />
      </div>

      <Separator />

      {/* ── 8. Upload History ──────────────────────────────────────────── */}
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
                  {i < DEMO_UPLOAD_HISTORY.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── Disclaimer ─────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-muted/50 px-4 py-3 text-center">
        <p className="text-xs text-muted-foreground">
          BloodInsight provides educational health information only. It does not replace professional medical advice, diagnosis, or treatment.
          Always consult a qualified healthcare provider for medical decisions.
        </p>
      </div>

      {/* ── Biomarker Detail Drawer ────────────────────────────────────── */}
      <BiomarkerDetailDrawer
        open={drawerBiomarker !== null}
        onClose={() => setDrawerBiomarker(null)}
        comparison={drawerComparison}
        explanation={
          drawerRow
            ? enhanceInterpretation(drawerRow[9], drawerComparison!)
            : ""
        }
        lifestyleActions={
          drawerRow
            ? [
                "Consult your healthcare provider about this result",
                "Track lifestyle changes and re-test in 3 months",
              ]
            : []
        }
        followUp={["Re-test in 3 months", "Discuss with your doctor at next visit"]}
        trendData={drawerRow?.[10] ?? []}
      />
    </div>
  );
}
