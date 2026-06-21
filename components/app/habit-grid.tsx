"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Flame } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface HabitRow {
  id: string;
  name: string;
  streak: number;
  // cells indexed by day key (YYYY-MM-DD) -> done
  cells: Record<string, boolean>;
}

export function HabitGrid({
  habits,
  days,
}: {
  habits: HabitRow[];
  days: { key: string; label: string; weekday: string; isToday: boolean }[];
}) {
  const router = useRouter();
  const [state, setState] = useState(habits);

  async function toggle(habitId: string, dayKey: string) {
    let nextDone = false;
    setState((rows) =>
      rows.map((r) => {
        if (r.id !== habitId) return r;
        nextDone = !r.cells[dayKey];
        return { ...r, cells: { ...r.cells, [dayKey]: nextDone } };
      }),
    );
    await fetch("/api/log/habit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitId, done: nextDone, date: dayKey }),
    });
    router.refresh();
  }

  return (
    <Card>
      <CardHeader title="Weekly habit tracker" subtitle="Tap any cell to mark it done" />
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="w-40 text-left text-xs font-medium text-muted" />
              {days.map((d) => (
                <th key={d.key} className="px-1 text-center">
                  <div className="text-[10px] uppercase text-muted">{d.weekday}</div>
                  <div className={cn("text-xs font-semibold", d.isToday && "text-primary")}>{d.label}</div>
                </th>
              ))}
              <th className="px-1 text-center text-[10px] uppercase text-muted">🔥</th>
            </tr>
          </thead>
          <tbody>
            {state.map((h) => (
              <tr key={h.id}>
                <td className="py-1 pr-2 text-sm font-medium">{h.name}</td>
                {days.map((d) => {
                  const done = h.cells[d.key];
                  return (
                    <td key={d.key} className="text-center">
                      <button
                        onClick={() => toggle(h.id, d.key)}
                        className={cn(
                          "grid h-8 w-8 place-items-center rounded-lg border transition",
                          done
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:bg-muted-surface",
                        )}
                        aria-label={`${h.name} ${d.key}`}
                      >
                        {done && <Check className="h-4 w-4" />}
                      </button>
                    </td>
                  );
                })}
                <td className="text-center text-sm font-semibold text-primary">{h.streak}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {state.length === 0 && <p className="text-sm text-muted">No habits configured.</p>}
      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
        <Flame className="h-3.5 w-3.5 text-primary" /> Streak = consecutive days completed up to today.
      </p>
    </Card>
  );
}
