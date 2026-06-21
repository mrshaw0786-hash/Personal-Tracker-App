"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, Dumbbell } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/misc";

interface SetRow {
  exerciseName: string;
  reps: string;
  weightKg: string;
}

export function WorkoutLogger({
  defaultName,
  exerciseNames,
}: {
  defaultName: string;
  exerciseNames: string[];
}) {
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [rows, setRows] = useState<SetRow[]>([{ exerciseName: "", reps: "", weightKg: "" }]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (i: number, k: keyof SetRow, v: string) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [k]: v } : row)));

  async function save() {
    const sets = rows
      .filter((r) => r.exerciseName.trim())
      .map((r, idx) => ({
        exerciseName: r.exerciseName.trim(),
        setNumber: idx + 1,
        reps: Number(r.reps) || 0,
        weightKg: Number(r.weightKg) || 0,
      }));
    setSaving(true);
    await fetch("/api/log/workout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name || "Workout", sets }),
    });
    setSaving(false);
    setSaved(true);
    setRows([{ exerciseName: "", reps: "", weightKg: "" }]);
    router.refresh();
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <Card>
      <CardHeader title="Log a workout" subtitle="Mark today's session and record your sets" />
      <div className="space-y-3">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Workout name" />
        <datalist id="exercise-options">
          {exerciseNames.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={i} className="flex gap-2">
              <input
                list="exercise-options"
                value={r.exerciseName}
                onChange={(e) => update(i, "exerciseName", e.target.value)}
                placeholder="Exercise"
                className="h-10 flex-1 rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
              />
              <Input className="h-10 w-16" value={r.reps} onChange={(e) => update(i, "reps", e.target.value)} placeholder="reps" inputMode="numeric" />
              <Input className="h-10 w-20" value={r.weightKg} onChange={(e) => update(i, "weightKg", e.target.value)} placeholder="kg" inputMode="decimal" />
              <button
                onClick={() => setRows((rr) => rr.filter((_, idx) => idx !== i))}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border text-muted hover:text-danger"
                aria-label="Remove set"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setRows((r) => [...r, { exerciseName: "", reps: "", weightKg: "" }])}>
          <Plus className="h-4 w-4" /> Add set
        </Button>
        <Button className="w-full" onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Dumbbell className="h-4 w-4" />}
          {saved ? "Workout logged ✓" : "Complete workout"}
        </Button>
      </div>
    </Card>
  );
}
