"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Building2,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Brain,
  Stethoscope,
  ExternalLink,
  Activity,
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

interface BiomarkerCard {
  code: string;
  name: string;
  value: number;
  unit: string;
  status: "normal" | "low" | "high" | "critical";
  refRange: string;
  interpretation: string;
}

const REPORT = {
  id: "demo-report-001",
  date: "March 15, 2026",
  labName: "HealthLab Diagnostics",
  fileName: "demo-blood-panel-2024.pdf",
  totalBiomarkers: 16,
  normalCount: 10,
  borderlineCount: 0,
  abnormalCount: 6,
  urgentCount: 0,
};

const BIOMARKERS: BiomarkerCard[] = [
  { code: "hemoglobin", name: "Hemoglobin", value: 14.2, unit: "g/dL", status: "normal", refRange: "12.0-17.5", interpretation: "Your hemoglobin is within the normal range, indicating adequate oxygen-carrying capacity." },
  { code: "wbc", name: "WBC", value: 6.8, unit: "x10^3/uL", status: "normal", refRange: "4.5-11.0", interpretation: "White blood cell count is normal, suggesting no active infection or immune issue." },
  { code: "platelets", name: "Platelets", value: 245, unit: "x10^3/uL", status: "normal", refRange: "150-400", interpretation: "Platelet count is healthy, indicating normal blood clotting ability." },
  { code: "glucose", name: "Glucose (Fasting)", value: 95, unit: "mg/dL", status: "normal", refRange: "70-100", interpretation: "Fasting glucose is normal. No indication of insulin resistance or diabetes." },
  { code: "creatinine", name: "Creatinine", value: 0.9, unit: "mg/dL", status: "normal", refRange: "0.7-1.3", interpretation: "Kidney function appears normal based on creatinine levels." },
  { code: "alt", name: "ALT", value: 22, unit: "U/L", status: "normal", refRange: "7-56", interpretation: "Liver enzyme ALT is within range. No sign of liver inflammation." },
  { code: "ast", name: "AST", value: 28, unit: "U/L", status: "normal", refRange: "10-40", interpretation: "AST is normal, supporting healthy liver function." },
  { code: "tsh", name: "TSH", value: 2.1, unit: "mIU/L", status: "normal", refRange: "0.4-4.0", interpretation: "Thyroid-stimulating hormone is optimal, indicating healthy thyroid function." },
  { code: "hdl", name: "HDL Cholesterol", value: 52, unit: "mg/dL", status: "normal", refRange: ">40", interpretation: "HDL ('good') cholesterol is adequate. Higher levels are protective against heart disease." },
  { code: "crp", name: "CRP", value: 0.4, unit: "mg/L", status: "normal", refRange: "<3.0", interpretation: "C-reactive protein is low, indicating no significant systemic inflammation." },
  { code: "ferritin", name: "Ferritin", value: 12, unit: "ng/mL", status: "low", refRange: "20-200", interpretation: "Ferritin is below range, indicating depleted iron stores. Action recommended." },
  { code: "vitamin-d", name: "Vitamin D", value: 18, unit: "ng/mL", status: "low", refRange: "30-100", interpretation: "Vitamin D is deficient. Supplementation and sun exposure recommended." },
  { code: "iron", name: "Serum Iron", value: 45, unit: "ug/dL", status: "low", refRange: "60-170", interpretation: "Serum iron is low, consistent with iron depletion seen in ferritin results." },
  { code: "cholesterol", name: "Total Cholesterol", value: 210, unit: "mg/dL", status: "high", refRange: "<200", interpretation: "Total cholesterol is mildly elevated. Dietary changes may help reduce it." },
  { code: "ldl", name: "LDL Cholesterol", value: 138, unit: "mg/dL", status: "high", refRange: "<100", interpretation: "LDL ('bad') cholesterol is elevated. Lifestyle modifications are recommended." },
  { code: "triglycerides", name: "Triglycerides", value: 155, unit: "mg/dL", status: "high", refRange: "<150", interpretation: "Triglycerides are mildly elevated. Reducing sugar, alcohol, and refined carbs can help." },
];

const PATTERNS = [
  {
    id: "p1",
    name: "Early Iron Depletion",
    description: "Low ferritin combined with low serum iron suggests early-stage iron deficiency. Hemoglobin is still normal, meaning anemia has not yet developed.",
    biomarkers: ["Ferritin", "Serum Iron", "Hemoglobin"],
    confidence: 0.92,
  },
  {
    id: "p2",
    name: "Atherogenic Lipid Profile",
    description: "Elevated LDL, total cholesterol, and triglycerides with borderline HDL suggest an increased cardiovascular risk profile that may benefit from lifestyle intervention.",
    biomarkers: ["LDL", "Total Cholesterol", "Triglycerides", "HDL"],
    confidence: 0.88,
  },
];

const ALERTS = [
  {
    id: "al1",
    severity: "warning" as const,
    biomarker: "Ferritin",
    message: "Ferritin is below normal range and has been declining over the past 9 months. Consider clinical evaluation.",
    action: "Schedule appointment with your physician to discuss iron studies.",
  },
  {
    id: "al2",
    severity: "warning" as const,
    biomarker: "Vitamin D",
    message: "Vitamin D is in the deficient range (<20 ng/mL). Supplementation is typically recommended at this level.",
    action: "Discuss vitamin D supplementation (4000-5000 IU/day) with your doctor.",
  },
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

export default function ResultsPage() {
  const params = useParams();
  const r = REPORT;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Results Overview</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              {r.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Building2 className="size-3.5" />
              {r.labName}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/trends">
            <Button variant="outline">
              <TrendingUp className="size-4" />
              View Trends
            </Button>
          </Link>
          <Link href="/actions">
            <Button>
              <Activity className="size-4" />
              Action Plan
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card size="sm">
          <CardContent className="flex items-center gap-3 py-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <Activity className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{r.totalBiomarkers}</p>
              <p className="text-xs text-muted-foreground">Total Biomarkers</p>
            </div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="flex items-center gap-3 py-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-health-normal/10">
              <CheckCircle2 className="size-5 text-health-normal" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums text-health-normal">{r.normalCount}</p>
              <p className="text-xs text-muted-foreground">In Range</p>
            </div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="flex items-center gap-3 py-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-health-warning/10">
              <AlertTriangle className="size-5 text-health-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums text-health-warning">{r.abnormalCount}</p>
              <p className="text-xs text-muted-foreground">Out of Range</p>
            </div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="flex items-center gap-3 py-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-health-teal/10">
              <Brain className="size-5 text-health-teal" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums text-health-teal">{PATTERNS.length}</p>
              <p className="text-xs text-muted-foreground">Patterns Detected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {ALERTS.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Alerts</h2>
          {ALERTS.map((alert) => (
            <Card key={alert.id} className="border-health-warning/30 bg-health-warning/5">
              <CardContent className="flex gap-3 p-4">
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-health-warning" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {alert.biomarker}
                    </span>
                    <Badge className="bg-health-warning/10 text-health-warning">
                      Warning
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                  <p className="text-sm">
                    <span className="font-medium text-foreground/70">Recommended: </span>
                    <span className="text-muted-foreground">{alert.action}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detected patterns */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Detected Patterns</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {PATTERNS.map((pattern) => (
            <Card key={pattern.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Brain className="size-4 text-health-teal" />
                    {pattern.name}
                  </CardTitle>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {Math.round(pattern.confidence * 100)}% confidence
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {pattern.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {pattern.biomarkers.map((b) => (
                    <Badge key={b} variant="secondary">
                      {b}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Biomarker grid */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">All Biomarkers</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BIOMARKERS.map((bm) => (
            <Link key={bm.code} href={`/biomarker/${bm.code}`}>
              <Card className="h-full transition-all hover:shadow-card-hover hover:border-primary/20 cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {bm.name}
                      </p>
                      <div className="mt-1 flex items-baseline gap-1.5">
                        <span className={`text-xl font-bold tabular-nums ${statusColor(bm.status)}`}>
                          {bm.value}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {bm.unit}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Ref: {bm.refRange}
                      </p>
                    </div>
                    <Badge className={statusBg(bm.status)}>
                      {bm.status === "normal"
                        ? "Normal"
                        : bm.status === "low"
                        ? "Low"
                        : bm.status === "high"
                        ? "High"
                        : "Critical"}
                    </Badge>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                    {bm.interpretation}
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-xs font-medium text-primary">
                    View details
                    <ExternalLink className="size-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Link to dashboard */}
      <div className="flex justify-center">
        <Link href="/dashboard">
          <Button variant="outline" size="lg">
            <ArrowRight className="size-4" />
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
