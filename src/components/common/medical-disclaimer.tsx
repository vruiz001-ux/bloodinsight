import { ShieldAlert } from "lucide-react";

export function MedicalDisclaimer() {
  return (
    <footer className="border-t border-border bg-muted/50 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex gap-3 items-start">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground/70">
              Medical Disclaimer:
            </span>{" "}
            BloodInsight is for educational purposes only and does not provide
            medical advice, diagnosis, or treatment. Always consult a qualified
            healthcare provider. Lab reference ranges vary by laboratory, age,
            sex, and clinical context. If you have concerning symptoms or
            critical results, seek immediate medical attention.
          </p>
        </div>
      </div>
    </footer>
  );
}
