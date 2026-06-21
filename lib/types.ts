export interface PlanMeal {
  type: string; // breakfast | lunch | dinner | snack | pre-workout | post-workout
  name: string;
}

export interface GeneratedDay {
  dayNumber: number;
  phase: number;
  title: string;
  morning: string;
  workout: string;
  meals: PlanMeal[];
  tasks: string[];
  mindset: string;
  reflect: string;
}

export interface GeneratedPlan {
  source: "ai" | "rules";
  summary: string;
  days: GeneratedDay[];
}

export interface ProfileLike {
  name?: string | null;
  age: number;
  gender: string;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  fitnessLevel: string;
  lifestyleType: string;
  workSchedule: string;
  sleepTime: string;
  wakeTime: string;
  foodPreference: string;
  gymAvailable: boolean;
  activityLevel: string;
  fitnessGoals: string[];
  careerGoals?: string | null;
  injuries?: string | null;
  medicalNotes?: string | null;
}
