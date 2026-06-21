"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HabitItem {
  id: string;
  name: string;
  done: boolean;
}

export function HabitChecklist({ habits }: { habits: HabitItem[] }) {
  const router = useRouter();
  const [state, setState] = useState(habits);
  const [, startTransition] = useTransition();

  async function toggle(id: string) {
    const next = state.map((h) => (h.id === id ? { ...h, done: !h.done } : h));
    setState(next);
    const done = next.find((h) => h.id === id)?.done ?? false;
    await fetch("/api/log/habit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitId: id, done }),
    });
    startTransition(() => router.refresh());
  }

  return (
    <ul className="space-y-2">
      {state.map((h) => (
        <li key={h.id}>
          <button
            onClick={() => toggle(h.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition",
              h.done
                ? "border-primary/30 bg-primary/5"
                : "border-border hover:bg-muted-surface",
            )}
          >
            <span
              className={cn(
                "grid h-5 w-5 place-items-center rounded-md border transition",
                h.done ? "border-primary bg-primary text-primary-foreground" : "border-border",
              )}
            >
              {h.done && <Check className="h-3.5 w-3.5" />}
            </span>
            <span className={cn("font-medium", h.done && "text-muted line-through")}>{h.name}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
