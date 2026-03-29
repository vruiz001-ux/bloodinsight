import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Stethoscope } from "lucide-react";

interface DoctorQuestionsProps {
  questions: { question: string; context: string }[];
}

export function DoctorQuestions({ questions }: DoctorQuestionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Stethoscope className="h-4 w-4 text-primary" />
          Questions to Ask Your Doctor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {questions.map((q, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-medium leading-snug">{q.question}</p>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                  {q.context}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
