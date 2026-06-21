// Deterministic nutrition math — single source of truth for macro targets,
// used whether the plan is AI-generated or rule-based.

export type Gender = "male" | "female" | "other";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "very" | "extra";

export interface MacroInput {
  age: number;
  gender: string;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  activityLevel: string;
  fitnessGoals: string[];
}

export interface MacroTargets {
  bmr: number;
  tdee: number;
  calorieTarget: number;
  proteinTarget: number; // grams
  carbTarget: number; // grams
  fatTarget: number; // grams
  goal: "fat-loss" | "muscle-gain" | "maintenance";
}

const ACTIVITY_MULTIPLIER: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  extra: 1.9,
};

// Mifflin-St Jeor
export function calcBMR(input: MacroInput): number {
  const { weightKg, heightCm, age, gender } = input;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const adj = gender === "male" ? 5 : gender === "female" ? -161 : -78;
  return Math.round(base + adj);
}

export function inferGoal(input: MacroInput): MacroTargets["goal"] {
  const goals = (input.fitnessGoals || []).map((g) => g.toLowerCase());
  const wantsLoss =
    input.targetWeightKg < input.weightKg - 1 ||
    goals.some((g) => g.includes("fat") || g.includes("weight") || g.includes("lean"));
  const wantsGain =
    input.targetWeightKg > input.weightKg + 1 ||
    goals.some((g) => g.includes("muscle") || g.includes("strength") || g.includes("bulk"));
  if (wantsLoss && !wantsGain) return "fat-loss";
  if (wantsGain && !wantsLoss) return "muscle-gain";
  return "maintenance";
}

export function calcMacros(input: MacroInput): MacroTargets {
  const bmr = calcBMR(input);
  const mult = ACTIVITY_MULTIPLIER[input.activityLevel] ?? 1.375;
  const tdee = Math.round(bmr * mult);
  const goal = inferGoal(input);

  let calorieTarget = tdee;
  if (goal === "fat-loss") calorieTarget = Math.round(tdee * 0.8); // ~20% deficit
  if (goal === "muscle-gain") calorieTarget = Math.round(tdee * 1.1); // ~10% surplus

  // Protein: 1.8 g/kg (fat-loss/gain) else 1.6 g/kg, capped to sensible range.
  const proteinPerKg = goal === "maintenance" ? 1.6 : 1.8;
  const proteinTarget = Math.round(input.weightKg * proteinPerKg);

  // Fat: ~25% of calories. Carbs: remainder.
  const fatTarget = Math.round((calorieTarget * 0.25) / 9);
  const remainingCals = calorieTarget - proteinTarget * 4 - fatTarget * 9;
  const carbTarget = Math.max(0, Math.round(remainingCals / 4));

  return { bmr, tdee, calorieTarget, proteinTarget, carbTarget, fatTarget, goal };
}

export function sleepScore(hours: number, quality: number): number {
  // Duration component (max 70): peak at 7-9h.
  let dur = 0;
  if (hours >= 7 && hours <= 9) dur = 70;
  else if (hours >= 6 && hours < 7) dur = 55;
  else if (hours > 9 && hours <= 10) dur = 58;
  else if (hours >= 5 && hours < 6) dur = 38;
  else dur = 22;
  // Quality component (max 30): quality is 1-5.
  const q = Math.round((Math.min(Math.max(quality, 1), 5) / 5) * 30);
  return Math.min(100, dur + q);
}
