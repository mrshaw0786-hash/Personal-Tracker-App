"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/misc";
import { cn } from "@/lib/utils";

const GOAL_OPTIONS = [
  "Lose fat",
  "Build muscle",
  "Get lean / toned",
  "Increase strength",
  "Better energy",
  "Improve discipline",
  "Fix sleep",
  "Boost productivity",
];

interface FormState {
  age: string;
  gender: string;
  heightCm: string;
  weightKg: string;
  targetWeightKg: string;
  fitnessLevel: string;
  gymAvailable: string;
  activityLevel: string;
  lifestyleType: string;
  fitnessGoals: string[];
  careerGoals: string;
  workSchedule: string;
  sleepTime: string;
  wakeTime: string;
  foodPreference: string;
  injuries: string;
  medicalNotes: string;
}

const initial: FormState = {
  age: "",
  gender: "male",
  heightCm: "",
  weightKg: "",
  targetWeightKg: "",
  fitnessLevel: "beginner",
  gymAvailable: "false",
  activityLevel: "light",
  lifestyleType: "busy",
  fitnessGoals: [],
  careerGoals: "",
  workSchedule: "9-5",
  sleepTime: "23:00",
  wakeTime: "07:00",
  foodPreference: "non-vegetarian",
  injuries: "",
  medicalNotes: "",
};

const STEPS = ["About you", "Fitness", "Goals", "Schedule & food", "Health", "Review"];

export function OnboardingWizard({ name }: { name: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof FormState, v: string | string[]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleGoal = (g: string) =>
    setForm((f) => ({
      ...f,
      fitnessGoals: f.fitnessGoals.includes(g)
        ? f.fitnessGoals.filter((x) => x !== g)
        : [...f.fitnessGoals, g],
    }));

  function validStep(): boolean {
    if (step === 0) return !!(form.age && form.heightCm && form.weightKg && form.targetWeightKg);
    return true;
  }

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: Number(form.age),
          gender: form.gender,
          heightCm: Number(form.heightCm),
          weightKg: Number(form.weightKg),
          targetWeightKg: Number(form.targetWeightKg),
          fitnessLevel: form.fitnessLevel,
          lifestyleType: form.lifestyleType,
          workSchedule: form.workSchedule,
          sleepTime: form.sleepTime,
          wakeTime: form.wakeTime,
          foodPreference: form.foodPreference,
          gymAvailable: form.gymAvailable === "true",
          activityLevel: form.activityLevel,
          fitnessGoals: form.fitnessGoals,
          careerGoals: form.careerGoals,
          injuries: form.injuries,
          medicalNotes: form.medicalNotes,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to build your plan.");
      }
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setLoading(false);
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  if (loading) {
    return (
      <div className="mx-auto max-w-md pt-20 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary"
        >
          <Sparkles className="h-8 w-8" />
        </motion.div>
        <h2 className="mt-6 font-display text-2xl font-bold">Building your 45-day plan…</h2>
        <p className="mt-2 text-muted">
          Calculating your targets and designing your routine, workouts, meals, and tasks.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-bold">Let&apos;s personalize your plan, {name.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-muted">Step {step + 1} of {STEPS.length} · {STEPS[step]}</p>
        <div className="mx-auto mt-4 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted-surface">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <Card className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {step === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Age</Label>
                    <Input type="number" value={form.age} onChange={(e) => set("age", e.target.value)} placeholder="28" />
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <Select value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Height (cm)</Label>
                  <Input type="number" value={form.heightCm} onChange={(e) => set("heightCm", e.target.value)} placeholder="175" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Current weight (kg)</Label>
                    <Input type="number" value={form.weightKg} onChange={(e) => set("weightKg", e.target.value)} placeholder="80" />
                  </div>
                  <div>
                    <Label>Target weight (kg)</Label>
                    <Input type="number" value={form.targetWeightKg} onChange={(e) => set("targetWeightKg", e.target.value)} placeholder="72" />
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label>Fitness level</Label>
                  <Select value={form.fitnessLevel} onChange={(e) => set("fitnessLevel", e.target.value)}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </Select>
                </div>
                <div>
                  <Label>Do you have gym access?</Label>
                  <Select value={form.gymAvailable} onChange={(e) => set("gymAvailable", e.target.value)}>
                    <option value="false">No — home / bodyweight</option>
                    <option value="true">Yes — full gym</option>
                  </Select>
                </div>
                <div>
                  <Label>Activity level</Label>
                  <Select value={form.activityLevel} onChange={(e) => set("activityLevel", e.target.value)}>
                    <option value="sedentary">Sedentary (desk job, little exercise)</option>
                    <option value="light">Lightly active</option>
                    <option value="moderate">Moderately active</option>
                    <option value="very">Very active</option>
                    <option value="extra">Extremely active</option>
                  </Select>
                </div>
                <div>
                  <Label>Lifestyle</Label>
                  <Select value={form.lifestyleType} onChange={(e) => set("lifestyleType", e.target.value)}>
                    <option value="sedentary">Sedentary</option>
                    <option value="busy">Busy / time-poor</option>
                    <option value="active">Active</option>
                  </Select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label>What are your goals? (pick any)</Label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {GOAL_OPTIONS.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => toggleGoal(g)}
                        className={cn(
                          "rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
                          form.fitnessGoals.includes(g)
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted hover:border-primary/40",
                        )}
                      >
                        {form.fitnessGoals.includes(g) && <Check className="mr-1 inline h-3.5 w-3.5" />}
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Career / learning goals (optional)</Label>
                  <Textarea rows={3} value={form.careerGoals} onChange={(e) => set("careerGoals", e.target.value)} placeholder="e.g. land a new job, learn data analysis, ship a side project" />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <Label>Work schedule</Label>
                  <Select value={form.workSchedule} onChange={(e) => set("workSchedule", e.target.value)}>
                    <option value="9-5">9-5</option>
                    <option value="shift">Shift work</option>
                    <option value="flexible">Flexible</option>
                    <option value="student">Student</option>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Usual sleep time</Label>
                    <Input type="time" value={form.sleepTime} onChange={(e) => set("sleepTime", e.target.value)} />
                  </div>
                  <div>
                    <Label>Usual wake time</Label>
                    <Input type="time" value={form.wakeTime} onChange={(e) => set("wakeTime", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Food preference</Label>
                  <Select value={form.foodPreference} onChange={(e) => set("foodPreference", e.target.value)}>
                    <option value="non-vegetarian">Non-vegetarian</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                  </Select>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <Label>Injuries or physical limitations (optional)</Label>
                  <Textarea rows={3} value={form.injuries} onChange={(e) => set("injuries", e.target.value)} placeholder="e.g. lower back pain, bad knees" />
                </div>
                <div>
                  <Label>Medical notes (optional)</Label>
                  <Textarea rows={3} value={form.medicalNotes} onChange={(e) => set("medicalNotes", e.target.value)} placeholder="Anything your plan should account for" />
                </div>
                <p className="text-xs text-muted">
                  This isn&apos;t medical advice. Consult a professional before starting any new program.
                </p>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-3">
                <h3 className="font-display text-lg font-semibold">Ready to build your plan</h3>
                <p className="text-sm text-muted">We&apos;ll calculate your calorie & protein targets and generate your full 45-day system.</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ["Age", form.age],
                    ["Height", `${form.heightCm} cm`],
                    ["Weight → target", `${form.weightKg} → ${form.targetWeightKg} kg`],
                    ["Level", form.fitnessLevel],
                    ["Gym", form.gymAvailable === "true" ? "Yes" : "No"],
                    ["Food", form.foodPreference],
                    ["Goals", form.fitnessGoals.length ? form.fitnessGoals.join(", ") : "General"],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-lg bg-muted-surface px-3 py-2">
                      <div className="text-xs text-muted">{k}</div>
                      <div className="font-medium">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {error && <p className="mt-4 text-sm text-danger">{error}</p>}

        <div className="mt-6 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button size="sm" onClick={() => validStep() && setStep((s) => s + 1)} disabled={!validStep()}>
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="sm" onClick={submit}>
              <Sparkles className="h-4 w-4" /> Build my plan
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
