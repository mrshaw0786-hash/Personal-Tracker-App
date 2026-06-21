"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Sunrise, Utensils, ListChecks, Sparkles, NotebookPen, Lock, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/misc";
import { PHASES } from "@/lib/program";
import { cn } from "@/lib/utils";
import type { GeneratedDay } from "@/lib/types";

export function ProgramView({
  days,
  currentDay,
}: {
  days: GeneratedDay[];
  currentDay: number;
}) {
  const [phase, setPhase] = useState(PHASES.find((p) => currentDay >= p.range[0] && currentDay <= p.range[1])?.id ?? 1);
  const [selected, setSelected] = useState(currentDay);

  const phaseMeta = PHASES.find((p) => p.id === phase)!;
  const phaseDays = days.filter((d) => d.phase === phase);
  const day = days.find((d) => d.dayNumber === selected);

  return (
    <div className="space-y-6">
      {/* Phase tabs */}
      <div className="flex flex-wrap gap-2">
        {PHASES.map((p) => (
          <button
            key={p.id}
            onClick={() => setPhase(p.id)}
            className={cn(
              "rounded-xl border px-4 py-2 text-sm font-semibold transition",
              phase === p.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted hover:bg-muted-surface",
            )}
          >
            Phase {p.id}
            <span className="ml-2 hidden font-normal text-muted sm:inline">{p.name}</span>
          </button>
        ))}
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-bold">Phase {phaseMeta.id}: {phaseMeta.name}</h2>
            <p className="text-sm text-muted">Days {phaseMeta.range[0]}–{phaseMeta.range[1]} · {phaseMeta.focus}</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted">{phaseMeta.description}</p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Day grid */}
        <div>
          <div className="grid grid-cols-5 gap-2 lg:grid-cols-3">
            {phaseDays.map((d) => {
              const locked = d.dayNumber > currentDay;
              const done = d.dayNumber < currentDay;
              return (
                <button
                  key={d.dayNumber}
                  onClick={() => setSelected(d.dayNumber)}
                  className={cn(
                    "relative aspect-square rounded-xl border text-sm font-semibold transition",
                    selected === d.dayNumber
                      ? "border-primary bg-primary text-primary-foreground"
                      : d.dayNumber === currentDay
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted hover:bg-muted-surface",
                  )}
                >
                  {d.dayNumber}
                  {done && selected !== d.dayNumber && (
                    <CheckCircle2 className="absolute right-1 top-1 h-3 w-3 text-success" />
                  )}
                  {locked && selected !== d.dayNumber && (
                    <Lock className="absolute right-1 top-1 h-3 w-3 text-muted" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day detail */}
        {day && (
          <motion.div key={day.dayNumber} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-lg font-bold">{day.title}</h3>
                {day.dayNumber === currentDay && <Badge tone="primary">Today</Badge>}
              </div>

              <div className="mt-4 space-y-4">
                <Section icon={<Sunrise className="h-4 w-4" />} title="Morning routine">{day.morning}</Section>
                <Section icon={<Dumbbell className="h-4 w-4" />} title="Workout">{day.workout}</Section>
                <div className="rounded-xl border border-border p-4">
                  <p className="flex items-center gap-1.5 text-sm font-semibold"><Utensils className="h-4 w-4 text-accent" /> Meals</p>
                  <ul className="mt-2 grid gap-1 text-sm text-muted sm:grid-cols-2">
                    {day.meals.map((meal, i) => (
                      <li key={i}><span className="capitalize text-foreground">{meal.type}:</span> {meal.name}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <p className="flex items-center gap-1.5 text-sm font-semibold"><ListChecks className="h-4 w-4 text-primary" /> Tasks</p>
                  <ul className="mt-2 space-y-1 text-sm text-muted">
                    {day.tasks.map((t, i) => <li key={i}>• {t}</li>)}
                  </ul>
                </div>
                <Section icon={<Sparkles className="h-4 w-4 text-primary" />} title="Mindset" highlight>{day.mindset}</Section>
                <Section icon={<NotebookPen className="h-4 w-4" />} title="Reflection">{day.reflect}</Section>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
  highlight,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className={cn("rounded-xl p-4", highlight ? "border border-primary/20 bg-primary/5" : "bg-muted-surface")}>
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{icon} {title}</p>
      <p className="mt-1 text-sm">{children}</p>
    </div>
  );
}
