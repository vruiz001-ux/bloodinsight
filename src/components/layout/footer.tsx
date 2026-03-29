import { ShieldAlert } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30 px-4 py-5 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-3">
        <div className="flex gap-3 items-start">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            BloodInsight is for educational purposes only and does not provide
            medical advice, diagnosis, or treatment. Always consult a qualified
            healthcare provider.
          </p>
        </div>
        <p className="text-xs text-muted-foreground/60 text-center">
          &copy; {year} BloodInsight. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
