"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/misc";

export interface MealOption {
  name: string;
  type: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface LoggedMeal extends MealOption {
  id: string;
}

const TYPES = ["breakfast", "lunch", "dinner", "snack", "pre-workout", "post-workout"];

export function MealLogger({
  library,
  todaysMeals,
}: {
  library: MealOption[];
  todaysMeals: LoggedMeal[];
}) {
  const router = useRouter();
  const [type, setType] = useState("breakfast");
  const [name, setName] = useState("");
  const [cal, setCal] = useState("");
  const [pro, setPro] = useState("");
  const [carb, setCarb] = useState("");
  const [fat, setFat] = useState("");
  const [saving, setSaving] = useState(false);

  function pickLibrary(value: string) {
    const m = library.find((x) => x.name === value);
    if (m) {
      setName(m.name);
      setType(m.type);
      setCal(String(m.calories));
      setPro(String(m.protein));
      setCarb(String(m.carbs));
      setFat(String(m.fat));
    }
  }

  async function add() {
    if (!name.trim()) return;
    setSaving(true);
    await fetch("/api/log/meal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        name: name.trim(),
        calories: Number(cal) || 0,
        protein: Number(pro) || 0,
        carbs: Number(carb) || 0,
        fat: Number(fat) || 0,
      }),
    });
    setSaving(false);
    setName(""); setCal(""); setPro(""); setCarb(""); setFat("");
    router.refresh();
  }

  async function remove(id: string) {
    await fetch("/api/log/meal", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }

  return (
    <Card>
      <CardHeader title="Log a meal" subtitle="Pick from your plan or enter your own" />
      <div className="space-y-3">
        <div>
          <Label>Quick add from library</Label>
          <Select defaultValue="" onChange={(e) => pickLibrary(e.target.value)}>
            <option value="" disabled>Choose a meal…</option>
            {TYPES.map((t) => (
              <optgroup key={t} label={t}>
                {library.filter((m) => m.type === t).map((m) => (
                  <option key={m.name} value={m.name}>{m.name} · {m.calories}kcal</option>
                ))}
              </optgroup>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Type</Label>
            <Select value={type} onChange={(e) => setType(e.target.value)}>
              {TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
            </Select>
          </div>
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Meal name" />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div><Label>Kcal</Label><Input value={cal} onChange={(e) => setCal(e.target.value)} inputMode="numeric" /></div>
          <div><Label>Protein</Label><Input value={pro} onChange={(e) => setPro(e.target.value)} inputMode="numeric" /></div>
          <div><Label>Carbs</Label><Input value={carb} onChange={(e) => setCarb(e.target.value)} inputMode="numeric" /></div>
          <div><Label>Fat</Label><Input value={fat} onChange={(e) => setFat(e.target.value)} inputMode="numeric" /></div>
        </div>

        <Button className="w-full" onClick={add} disabled={saving || !name.trim()}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add meal
        </Button>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Today&apos;s meals</p>
        {todaysMeals.length ? (
          <ul className="space-y-1.5">
            {todaysMeals.map((m) => (
              <li key={m.id} className="flex items-center justify-between rounded-lg bg-muted-surface px-3 py-2 text-sm">
                <span>
                  <span className="capitalize text-muted">{m.type}:</span> {m.name}
                  <span className="ml-2 text-xs text-muted">{m.calories}kcal · {m.protein}p</span>
                </span>
                <button onClick={() => remove(m.id)} aria-label="Remove" className="text-muted hover:text-danger">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">No meals logged yet today.</p>
        )}
      </div>
    </Card>
  );
}
