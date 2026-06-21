"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/misc";
import { cn } from "@/lib/utils";

export interface ExerciseLite {
  id: string;
  name: string;
  muscleGroup: string;
  category: string;
  level: string;
  instructions: string;
  defaultSets: number;
  defaultReps: string;
  restSec: number;
}

const CATEGORIES = ["all", "strength", "cardio", "mobility", "recovery"];

export function ExerciseLibrary({ exercises }: { exercises: ExerciseLite[] }) {
  const [cat, setCat] = useState("all");
  const [open, setOpen] = useState<string | null>(null);
  const filtered = cat === "all" ? exercises : exercises.filter((e) => e.category === cat);

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-display text-base font-semibold">Exercise library</h3>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium capitalize transition",
                cat === c ? "bg-primary text-primary-foreground" : "bg-muted-surface text-muted hover:text-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {filtered.map((e) => (
          <div key={e.id} className="rounded-xl border border-border">
            <button
              onClick={() => setOpen(open === e.id ? null : e.id)}
              className="flex w-full items-center justify-between gap-2 px-3.5 py-3 text-left"
            >
              <div>
                <p className="text-sm font-semibold">{e.name}</p>
                <p className="text-xs text-muted">{e.muscleGroup} · {e.defaultSets}×{e.defaultReps}</p>
              </div>
              <Badge tone={e.category === "strength" ? "primary" : e.category === "cardio" ? "warning" : "default"}>
                {e.level}
              </Badge>
            </button>
            {open === e.id && (
              <div className="border-t border-border px-3.5 py-3 text-sm text-muted">
                <p>{e.instructions}</p>
                <div className="mt-2 flex gap-4 text-xs">
                  <span>Sets: <b className="text-foreground">{e.defaultSets}</b></span>
                  <span>Reps: <b className="text-foreground">{e.defaultReps}</b></span>
                  <span>Rest: <b className="text-foreground">{e.restSec}s</b></span>
                </div>
                <div className="mt-3 grid h-24 place-items-center rounded-lg bg-muted-surface text-xs text-muted">
                  ▶ demo video placeholder
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
