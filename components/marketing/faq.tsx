"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "How does the AI build my plan?",
    a: "During onboarding we collect your body stats, goals, schedule, food preference, and limitations. Ascend computes your calorie and protein targets and generates a structured 45-day plan — daily routine, workouts, meals, tasks, and mindset cues. With an AI key configured it uses Claude; otherwise a built-in coaching engine produces an equally complete plan.",
  },
  {
    q: "Do I need a gym?",
    a: "No. Tell us whether you have gym access during onboarding and your workouts adapt to home/bodyweight or full equipment automatically.",
  },
  {
    q: "What if I miss a day or a workout?",
    a: "The AI coach is built for exactly that. Tell it what happened and it diagnoses the cause, adjusts your plan, and gives you the next right action — no guilt, just momentum.",
  },
  {
    q: "Is my data private and secure?",
    a: "Your account is protected with hashed passwords and authenticated sessions. Your data lives in your own database and is never sold. Everything is yours.",
  },
  {
    q: "Why 45 days?",
    a: "45 days is long enough to rewire habits and see real physical change, but short enough to stay committed. It runs in three phases: Foundation Reset, Transformation, and Optimization.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. There are no lock-ins. Start free, and upgrade only if the system is working for you.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-3xl divide-y divide-border rounded-2xl border border-border bg-card">
      {faqs.map((f, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
          >
            <span className="font-medium">{f.q}</span>
            <ChevronDown
              className={cn(
                "h-5 w-5 shrink-0 text-muted transition-transform",
                open === i && "rotate-180",
              )}
            />
          </button>
          <div
            className={cn(
              "grid overflow-hidden px-5 transition-all duration-300",
              open === i ? "grid-rows-[1fr] pb-4" : "grid-rows-[0fr]",
            )}
          >
            <p className="min-h-0 text-sm leading-relaxed text-muted">{f.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
