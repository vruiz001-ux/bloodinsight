"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  CheckCircle2,
  AlertTriangle,
  Edit3,
  ArrowRight,
  ShieldCheck,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ExtractedRow {
  id: string;
  name: string;
  value: string;
  unit: string;
  refRange: string;
  flag: "normal" | "low" | "high" | "critical";
  confidence: number;
  editing: boolean;
}

const DEMO_DATA: ExtractedRow[] = [
  { id: "1", name: "Hemoglobin", value: "14.2", unit: "g/dL", refRange: "12.0-17.5", flag: "normal", confidence: 0.98, editing: false },
  { id: "2", name: "WBC", value: "6.8", unit: "x10^3/uL", refRange: "4.5-11.0", flag: "normal", confidence: 0.97, editing: false },
  { id: "3", name: "Platelets", value: "245", unit: "x10^3/uL", refRange: "150-400", flag: "normal", confidence: 0.96, editing: false },
  { id: "4", name: "Glucose (Fasting)", value: "95", unit: "mg/dL", refRange: "70-100", flag: "normal", confidence: 0.99, editing: false },
  { id: "5", name: "Creatinine", value: "0.9", unit: "mg/dL", refRange: "0.7-1.3", flag: "normal", confidence: 0.95, editing: false },
  { id: "6", name: "ALT", value: "22", unit: "U/L", refRange: "7-56", flag: "normal", confidence: 0.94, editing: false },
  { id: "7", name: "AST", value: "28", unit: "U/L", refRange: "10-40", flag: "normal", confidence: 0.93, editing: false },
  { id: "8", name: "TSH", value: "2.1", unit: "mIU/L", refRange: "0.4-4.0", flag: "normal", confidence: 0.97, editing: false },
  { id: "9", name: "Ferritin", value: "12", unit: "ng/mL", refRange: "20-200", flag: "low", confidence: 0.96, editing: false },
  { id: "10", name: "Vitamin D", value: "18", unit: "ng/mL", refRange: "30-100", flag: "low", confidence: 0.92, editing: false },
  { id: "11", name: "Total Cholesterol", value: "210", unit: "mg/dL", refRange: "<200", flag: "high", confidence: 0.98, editing: false },
  { id: "12", name: "LDL Cholesterol", value: "138", unit: "mg/dL", refRange: "<100", flag: "high", confidence: 0.97, editing: false },
  { id: "13", name: "HDL Cholesterol", value: "52", unit: "mg/dL", refRange: ">40", flag: "normal", confidence: 0.96, editing: false },
  { id: "14", name: "Triglycerides", value: "155", unit: "mg/dL", refRange: "<150", flag: "high", confidence: 0.95, editing: false },
  { id: "15", name: "Iron", value: "45", unit: "ug/dL", refRange: "60-170", flag: "low", confidence: 0.91, editing: false },
  { id: "16", name: "CRP", value: "0.4", unit: "mg/L", refRange: "<3.0", flag: "normal", confidence: 0.94, editing: false },
];

function flagColor(flag: string) {
  switch (flag) {
    case "normal": return "text-health-normal";
    case "low": return "text-health-warning";
    case "high": return "text-health-abnormal";
    case "critical": return "text-health-critical";
    default: return "text-muted-foreground";
  }
}

function flagBadge(flag: string) {
  switch (flag) {
    case "normal": return "secondary" as const;
    case "low": return "destructive" as const;
    case "high": return "destructive" as const;
    case "critical": return "destructive" as const;
    default: return "secondary" as const;
  }
}

function confidenceLabel(c: number) {
  if (c >= 0.95) return { text: "High", color: "text-health-normal" };
  if (c >= 0.85) return { text: "Medium", color: "text-health-warning" };
  return { text: "Low", color: "text-health-critical" };
}

export default function ReviewPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params.id as string;
  const [rows, setRows] = useState<ExtractedRow[]>(DEMO_DATA);
  const [confirming, setConfirming] = useState(false);

  function toggleEdit(id: string) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, editing: !r.editing } : r))
    );
  }

  function updateField(id: string, field: keyof ExtractedRow, value: string) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  }

  function handleConfirm() {
    setConfirming(true);
    setTimeout(() => {
      router.push(`/results/${reportId}`);
    }, 1000);
  }

  const abnormalCount = rows.filter((r) => r.flag !== "normal").length;
  const lowConfidenceCount = rows.filter((r) => r.confidence < 0.9).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Review Extracted Data
          </h1>
          <p className="mt-1 text-muted-foreground">
            Verify the extracted biomarkers below. Click any row to correct OCR
            mistakes.
          </p>
        </div>
        <Button onClick={handleConfirm} disabled={confirming} size="lg">
          {confirming ? (
            <span className="flex items-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              Analyzing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-4" />
              Confirm & Analyze
            </span>
          )}
        </Button>
      </div>

      {/* Summary bar */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-1.5 text-sm">
          <CheckCircle2 className="size-4 text-health-normal" />
          <span className="font-medium">{rows.length}</span> biomarkers found
        </div>
        {abnormalCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-health-warning/10 px-3 py-1.5 text-sm">
            <AlertTriangle className="size-4 text-health-warning" />
            <span className="font-medium">{abnormalCount}</span> outside range
          </div>
        )}
        {lowConfidenceCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-sm">
            <Info className="size-4 text-primary" />
            <span className="font-medium">{lowConfidenceCount}</span> need review
          </div>
        )}
      </div>

      {/* Biomarker table */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Extracted Biomarkers</CardTitle>
          <CardDescription>
            Report ID: {reportId}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Biomarker</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Unit</th>
                  <th className="px-4 py-3">Reference Range</th>
                  <th className="px-4 py-3">Flag</th>
                  <th className="px-4 py-3 text-center">Confidence</th>
                  <th className="px-4 py-3 text-right">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className={`transition-colors hover:bg-muted/20 ${
                      row.confidence < 0.9 ? "bg-health-warning/5" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-medium">
                      {row.editing ? (
                        <Input
                          value={row.name}
                          onChange={(e) => updateField(row.id, "name", e.target.value)}
                          className="h-7 text-sm"
                        />
                      ) : (
                        row.name
                      )}
                    </td>
                    <td className={`px-4 py-3 text-sm font-semibold tabular-nums ${flagColor(row.flag)}`}>
                      {row.editing ? (
                        <Input
                          value={row.value}
                          onChange={(e) => updateField(row.id, "value", e.target.value)}
                          className="h-7 w-20 text-sm"
                        />
                      ) : (
                        row.value
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {row.editing ? (
                        <Input
                          value={row.unit}
                          onChange={(e) => updateField(row.id, "unit", e.target.value)}
                          className="h-7 w-24 text-sm"
                        />
                      ) : (
                        row.unit
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {row.editing ? (
                        <Input
                          value={row.refRange}
                          onChange={(e) => updateField(row.id, "refRange", e.target.value)}
                          className="h-7 w-28 text-sm"
                        />
                      ) : (
                        row.refRange
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={flagBadge(row.flag)}>
                        {row.flag.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-medium ${confidenceLabel(row.confidence).color}`}>
                        {Math.round(row.confidence * 100)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => toggleEdit(row.id)}
                      >
                        {row.editing ? (
                          <CheckCircle2 className="size-3.5 text-health-normal" />
                        ) : (
                          <Edit3 className="size-3.5" />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="divide-y md:hidden">
            {rows.map((row) => (
              <div key={row.id} className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{row.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={flagBadge(row.flag)}>
                      {row.flag.toUpperCase()}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => toggleEdit(row.id)}
                    >
                      <Edit3 className="size-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-lg font-bold tabular-nums ${flagColor(row.flag)}`}>
                    {row.editing ? (
                      <Input
                        value={row.value}
                        onChange={(e) => updateField(row.id, "value", e.target.value)}
                        className="h-7 w-20 text-sm"
                      />
                    ) : (
                      row.value
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground">{row.unit}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Ref: {row.refRange}</span>
                  <span className={confidenceLabel(row.confidence).color}>
                    Confidence: {Math.round(row.confidence * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bottom action */}
      <div className="flex justify-end">
        <Button onClick={handleConfirm} disabled={confirming} size="lg">
          {confirming ? (
            <span className="flex items-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              Analyzing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Confirm & Analyze
              <ArrowRight className="size-4" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
