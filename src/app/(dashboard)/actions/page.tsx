"use client";

import {
  Apple,
  Droplets,
  Dumbbell,
  Moon,
  Brain,
  Stethoscope,
  AlertTriangle,
  ArrowUp,
  Minus,
  Pill,
  Sun,
  Fish,
  Salad,
  HeartPulse,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Action {
  id: string;
  title: string;
  description: string;
  category: "diet" | "hydration" | "exercise" | "sleep" | "stress" | "supplement" | "follow-up";
  priority: "urgent" | "high" | "medium";
  relatedBiomarker: string;
  relatedValue: string;
  clinicianNote: string;
}

const ACTIONS: Action[] = [
  // Urgent
  {
    id: "a1",
    title: "Investigate declining ferritin levels",
    description: "Your ferritin has dropped from 28 to 12 ng/mL over 9 months. This sustained decline warrants clinical evaluation to rule out chronic blood loss or absorption issues.",
    category: "follow-up",
    priority: "urgent",
    relatedBiomarker: "Ferritin",
    relatedValue: "12 ng/mL (ref: 20-200)",
    clinicianNote: "Discuss requesting a complete iron panel including serum iron, TIBC, and transferrin saturation. Consider GI evaluation if no obvious cause.",
  },
  {
    id: "a2",
    title: "Address vitamin D deficiency",
    description: "Your vitamin D at 18 ng/mL is well below the sufficient threshold of 30 ng/mL. Low vitamin D affects bone health, immune function, and mood.",
    category: "supplement",
    priority: "urgent",
    relatedBiomarker: "Vitamin D",
    relatedValue: "18 ng/mL (ref: 30-100)",
    clinicianNote: "Ask about high-dose vitamin D supplementation (e.g., 4000-5000 IU/day) and retesting in 3 months.",
  },
  // High priority
  {
    id: "a3",
    title: "Increase iron-rich foods in your diet",
    description: "Add red meat 2-3x per week, or plant-based sources like lentils, spinach, and fortified cereals. Pair with vitamin C to enhance absorption.",
    category: "diet",
    priority: "high",
    relatedBiomarker: "Ferritin",
    relatedValue: "12 ng/mL (ref: 20-200)",
    clinicianNote: "If dietary changes don't improve levels in 3 months, consider iron supplementation under medical guidance.",
  },
  {
    id: "a4",
    title: "Consider an iron supplement",
    description: "Ferrous bisglycinate (25-30 mg elemental iron) is well-absorbed and gentle on the stomach. Take on an empty stomach with vitamin C for best results.",
    category: "supplement",
    priority: "high",
    relatedBiomarker: "Ferritin",
    relatedValue: "12 ng/mL (ref: 20-200)",
    clinicianNote: "Confirm with your doctor before starting supplementation. Excess iron can be harmful.",
  },
  {
    id: "a5",
    title: "Get 15-20 minutes of midday sun exposure",
    description: "Sunlight is the most effective way to produce vitamin D. Aim for 15-20 minutes of sun on arms and face during midday, 3-4 times per week.",
    category: "exercise",
    priority: "high",
    relatedBiomarker: "Vitamin D",
    relatedValue: "18 ng/mL (ref: 30-100)",
    clinicianNote: "Sun exposure recommendations vary by skin type, latitude, and season. Discuss with your clinician.",
  },
  {
    id: "a6",
    title: "Reduce saturated fat intake",
    description: "Your LDL and total cholesterol are elevated. Limit red meat to 2x/week, reduce cheese and butter, and replace with olive oil, nuts, and avocado.",
    category: "diet",
    priority: "high",
    relatedBiomarker: "LDL Cholesterol",
    relatedValue: "138 mg/dL (ref: <100)",
    clinicianNote: "If lipids remain elevated after 3-6 months of lifestyle changes, discuss statin therapy with your physician.",
  },
  {
    id: "a7",
    title: "Add omega-3 rich fish to your diet",
    description: "Fatty fish like salmon, mackerel, and sardines (2-3 servings/week) can help lower triglycerides and improve HDL. Consider fish oil if you don't eat fish.",
    category: "diet",
    priority: "high",
    relatedBiomarker: "Triglycerides",
    relatedValue: "155 mg/dL (ref: <150)",
    clinicianNote: "Fish oil supplements (1-2g EPA+DHA) may help if dietary changes are insufficient.",
  },
  // Medium priority
  {
    id: "a8",
    title: "Increase soluble fiber intake",
    description: "Oats, beans, flaxseed, and psyllium husk can help lower LDL cholesterol by 5-10%. Aim for 25-30g of total fiber daily.",
    category: "diet",
    priority: "medium",
    relatedBiomarker: "Total Cholesterol",
    relatedValue: "210 mg/dL (ref: <200)",
    clinicianNote: "Soluble fiber is a well-established, low-risk intervention. Increase gradually to avoid GI discomfort.",
  },
  {
    id: "a9",
    title: "Aim for 150 minutes of moderate exercise weekly",
    description: "Regular aerobic exercise (brisk walking, cycling, swimming) can improve cholesterol profile, lower triglycerides, and boost HDL by 5-10%.",
    category: "exercise",
    priority: "medium",
    relatedBiomarker: "LDL Cholesterol",
    relatedValue: "138 mg/dL (ref: <100)",
    clinicianNote: "Exercise benefits are well-documented for cardiovascular health. Start gradually if you have been sedentary.",
  },
  {
    id: "a10",
    title: "Reduce refined sugar and alcohol intake",
    description: "Excess sugar and alcohol are major drivers of elevated triglycerides. Limit sugary drinks, sweets, and alcohol to help bring triglycerides below 150.",
    category: "diet",
    priority: "medium",
    relatedBiomarker: "Triglycerides",
    relatedValue: "155 mg/dL (ref: <150)",
    clinicianNote: "Even modest reductions in sugar and alcohol can significantly impact triglyceride levels within weeks.",
  },
  {
    id: "a11",
    title: "Prioritize 7-9 hours of quality sleep",
    description: "Poor sleep is linked to insulin resistance, elevated lipids, and impaired iron absorption. Create a consistent sleep schedule and dark, cool environment.",
    category: "sleep",
    priority: "medium",
    relatedBiomarker: "Multiple markers",
    relatedValue: "Overall health optimization",
    clinicianNote: "If you experience restless legs (common with low ferritin), discuss with your doctor.",
  },
  {
    id: "a12",
    title: "Practice stress management techniques",
    description: "Chronic stress elevates cortisol, which can raise cholesterol and blood sugar. Try 10-15 minutes of meditation, deep breathing, or yoga daily.",
    category: "stress",
    priority: "medium",
    relatedBiomarker: "Multiple markers",
    relatedValue: "Overall health optimization",
    clinicianNote: "Stress management complements dietary and exercise interventions for cardiovascular risk reduction.",
  },
];

function categoryIcon(category: string) {
  switch (category) {
    case "diet": return Apple;
    case "hydration": return Droplets;
    case "exercise": return Dumbbell;
    case "sleep": return Moon;
    case "stress": return Brain;
    case "supplement": return Pill;
    case "follow-up": return Stethoscope;
    default: return HeartPulse;
  }
}

function categoryColor(category: string) {
  switch (category) {
    case "diet": return "bg-health-normal/10 text-health-normal";
    case "hydration": return "bg-primary/10 text-primary";
    case "exercise": return "bg-health-teal/10 text-health-teal";
    case "sleep": return "bg-chart-4/10 text-chart-4";
    case "stress": return "bg-chart-3/10 text-chart-3";
    case "supplement": return "bg-health-abnormal/10 text-health-abnormal";
    case "follow-up": return "bg-health-critical/10 text-health-critical";
    default: return "bg-muted text-muted-foreground";
  }
}

function priorityBadge(priority: string) {
  switch (priority) {
    case "urgent":
      return (
        <Badge className="bg-health-critical/10 text-health-critical">
          <AlertTriangle className="mr-1 size-3" />
          Urgent
        </Badge>
      );
    case "high":
      return (
        <Badge className="bg-health-warning/10 text-health-warning">
          <ArrowUp className="mr-1 size-3" />
          High Priority
        </Badge>
      );
    case "medium":
      return (
        <Badge className="bg-primary/10 text-primary">
          <Minus className="mr-1 size-3" />
          Medium
        </Badge>
      );
    default:
      return null;
  }
}

function ActionCard({ action }: { action: Action }) {
  const Icon = categoryIcon(action.category);
  return (
    <Card className="transition-all hover:shadow-card-hover">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${categoryColor(action.category)}`}>
            <Icon className="size-5" />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground leading-snug">
                {action.title}
              </h3>
              {priorityBadge(action.priority)}
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {action.description}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded bg-muted px-1.5 py-0.5 font-medium">
                {action.relatedBiomarker}
              </span>
              <span className="tabular-nums">{action.relatedValue}</span>
            </div>
            <div className="rounded-lg border border-dashed border-health-teal/30 bg-health-teal/5 p-2.5">
              <p className="flex gap-1.5 text-xs leading-relaxed text-muted-foreground">
                <Stethoscope className="mt-0.5 size-3 shrink-0 text-health-teal" />
                <span>
                  <span className="font-medium text-foreground/70">
                    Discuss with your clinician:
                  </span>{" "}
                  {action.clinicianNote}
                </span>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ActionsPage() {
  const urgent = ACTIONS.filter((a) => a.priority === "urgent");
  const high = ACTIONS.filter((a) => a.priority === "high");
  const medium = ACTIONS.filter((a) => a.priority === "medium");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Lifestyle Actions</h1>
        <p className="mt-1 text-muted-foreground">
          Personalized recommendations based on your latest blood work. Always
          discuss changes with your healthcare provider.
        </p>
      </div>

      {/* Summary */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-health-critical/10 px-3 py-1.5 text-sm font-medium text-health-critical">
          <AlertTriangle className="size-4" />
          {urgent.length} urgent
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-health-warning/10 px-3 py-1.5 text-sm font-medium text-health-warning">
          <ArrowUp className="size-4" />
          {high.length} high priority
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
          <Minus className="size-4" />
          {medium.length} medium
        </div>
      </div>

      {/* Urgent */}
      {urgent.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-health-critical">
            <AlertTriangle className="size-5" />
            Urgent Actions
          </h2>
          <div className="space-y-4">
            {urgent.map((a) => (
              <ActionCard key={a.id} action={a} />
            ))}
          </div>
        </section>
      )}

      {/* High */}
      {high.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-health-warning">
            <ArrowUp className="size-5" />
            High Priority
          </h2>
          <div className="space-y-4">
            {high.map((a) => (
              <ActionCard key={a.id} action={a} />
            ))}
          </div>
        </section>
      )}

      {/* Medium */}
      {medium.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-primary">
            <Minus className="size-5" />
            Medium Priority
          </h2>
          <div className="space-y-4">
            {medium.map((a) => (
              <ActionCard key={a.id} action={a} />
            ))}
          </div>
        </section>
      )}

      {/* Disclaimer */}
      <Card className="border-border/60 bg-muted/30">
        <CardContent className="p-4">
          <p className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
            <Stethoscope className="mt-0.5 size-4 shrink-0" />
            <span>
              These recommendations are generated based on your biomarker values
              and are for educational purposes only. They do not constitute
              medical advice. Always consult your healthcare provider before
              making changes to your diet, exercise, or supplementation routine.
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
