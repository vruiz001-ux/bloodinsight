import Link from "next/link";
import {
  FileSearch,
  Brain,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  Salad,
  Upload,
  ClipboardCheck,
  Lightbulb,
  ArrowRight,
  Shield,
  Lock,
  Stethoscope,
  ChevronRight,
} from "lucide-react";

const features = [
  {
    icon: FileSearch,
    title: "Smart Parsing",
    description:
      "Upload PDFs or photos of your lab results. Our AI reads and extracts every biomarker automatically.",
  },
  {
    icon: Brain,
    title: "Medical Knowledge",
    description:
      "Built on peer-reviewed medical literature. Understand what each marker means for your health.",
  },
  {
    icon: BookOpen,
    title: "Clear Explanations",
    description:
      "No more confusing lab jargon. Get plain-language summaries anyone can understand.",
  },
  {
    icon: TrendingUp,
    title: "Trend Tracking",
    description:
      "Track your biomarkers over time. Spot patterns and see how lifestyle changes impact your results.",
  },
  {
    icon: AlertTriangle,
    title: "Urgent Alerts",
    description:
      "Critical values are flagged immediately with clear guidance on what action to take.",
  },
  {
    icon: Salad,
    title: "Lifestyle Actions",
    description:
      "Receive personalized diet, exercise, and supplement suggestions backed by research.",
  },
];

const steps = [
  {
    step: "01",
    icon: Upload,
    title: "Upload",
    description: "Upload a PDF, photo, or enter your lab results manually.",
  },
  {
    step: "02",
    icon: ClipboardCheck,
    title: "Review",
    description: "We parse every biomarker and verify against reference ranges.",
  },
  {
    step: "03",
    icon: Lightbulb,
    title: "Understand",
    description:
      "Get clear explanations of what each result means for your health.",
  },
  {
    step: "04",
    icon: ArrowRight,
    title: "Act",
    description:
      "Follow personalized action items to improve or maintain your health.",
  },
];

const trustItems = [
  {
    icon: Shield,
    title: "Educational Only",
    description:
      "BloodInsight helps you understand your results but is not a substitute for professional medical advice.",
  },
  {
    icon: Lock,
    title: "Your Data, Your Control",
    description:
      "Lab results are encrypted and never shared. You can delete your data at any time.",
  },
  {
    icon: Stethoscope,
    title: "Talk to Your Doctor",
    description:
      "We encourage you to share insights with your healthcare provider for the best care.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col flex-1">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">
                B
              </span>
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              BloodInsight
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero px-4 py-20 sm:px-6 sm:py-28 lg:py-36">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(0,102,204,0.08),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(13,148,136,0.06),_transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            AI-Powered Blood Test Analysis
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Understand Your Blood Tests{" "}
            <span className="bg-gradient-to-r from-primary to-[#0d9488] bg-clip-text text-transparent">
              in Minutes
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Upload your lab results and get clear, personalized explanations.
            Track trends, spot issues early, and take action — all backed by
            medical knowledge.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/upload"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-8 text-base font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <Upload className="size-5" />
              Upload Your Results
            </Link>
            <Link
              href="/demo"
              className="inline-flex h-12 items-center justify-center gap-1 rounded-lg border border-border bg-card px-8 text-base font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
            >
              Try Demo
              <ChevronRight className="size-4" />
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Free to start. No credit card required.
          </p>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything You Need to Decode Your Lab Work
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              From parsing your PDF to actionable lifestyle recommendations —
              BloodInsight covers every step.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-border/60 bg-card p-6 shadow-card transition-all duration-200 hover:shadow-card-hover hover:border-primary/20"
              >
                <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="size-5" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y border-border bg-muted/30 px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              Four simple steps from lab report to understanding.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <item.icon className="size-6" />
                </div>
                <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-primary/60">
                  Step {item.step}
                </span>
                <h3 className="text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Built on Trust and Transparency
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              Your health data deserves the highest standard of care.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {trustItems.map((item) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
                  <item.icon className="size-5 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-gradient-hero px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Ready to Understand Your Results?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Upload your blood test and get insights in minutes. It&apos;s free
            to start.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/upload"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-8 text-base font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <Upload className="size-5" />
              Upload Your Results
            </Link>
            <Link
              href="/demo"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-card px-8 text-base font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
            >
              Try Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
