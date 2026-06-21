import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calcMacros } from "@/lib/nutrition/calc";
import { generatePlan } from "@/lib/ai/plan-generator";
import { CORE_HABITS } from "@/lib/program";
import type { ProfileLike } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;

const schema = z.object({
  age: z.coerce.number().int().min(13).max(100),
  gender: z.string(),
  heightCm: z.coerce.number().min(120).max(230),
  weightKg: z.coerce.number().min(35).max(300),
  targetWeightKg: z.coerce.number().min(35).max(300),
  fitnessLevel: z.string(),
  lifestyleType: z.string(),
  workSchedule: z.string(),
  sleepTime: z.string(),
  wakeTime: z.string(),
  foodPreference: z.string(),
  gymAvailable: z.coerce.boolean(),
  activityLevel: z.string(),
  fitnessGoals: z.array(z.string()).default([]),
  careerGoals: z.string().optional().nullable(),
  injuries: z.string().optional().nullable(),
  medicalNotes: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  const d = parsed.data;
  const macros = calcMacros(d);

  const user = await prisma.user.findUnique({ where: { id: userId } });

  // Upsert profile with computed targets.
  await prisma.profile.upsert({
    where: { userId },
    update: {
      ...d,
      fitnessGoals: JSON.stringify(d.fitnessGoals),
      bmr: macros.bmr,
      tdee: macros.tdee,
      calorieTarget: macros.calorieTarget,
      proteinTarget: macros.proteinTarget,
      onboardingDone: true,
    },
    create: {
      userId,
      ...d,
      fitnessGoals: JSON.stringify(d.fitnessGoals),
      bmr: macros.bmr,
      tdee: macros.tdee,
      calorieTarget: macros.calorieTarget,
      proteinTarget: macros.proteinTarget,
      onboardingDone: true,
      programStartDate: new Date(),
    },
  });

  // Build the plan.
  const profileLike: ProfileLike = { ...d, name: user?.name ?? null };
  const meals = await prisma.meal.findMany({ select: { name: true, type: true, pref: true } });
  const plan = await generatePlan(profileLike, meals);

  // Replace any existing plan.
  await prisma.transformationPlan.deleteMany({ where: { userId } });
  await prisma.transformationPlan.create({
    data: {
      userId,
      source: plan.source,
      summary: plan.summary,
      days: {
        create: plan.days.map((day) => ({
          dayNumber: day.dayNumber,
          phase: day.phase,
          title: day.title,
          morning: day.morning,
          workout: day.workout,
          meals: JSON.stringify(day.meals),
          tasks: JSON.stringify(day.tasks),
          mindset: day.mindset,
          reflect: day.reflect,
        })),
      },
    },
  });

  // Seed core habits (once).
  const habitCount = await prisma.habit.count({ where: { userId } });
  if (habitCount === 0) {
    await prisma.habit.createMany({
      data: CORE_HABITS.map((h) => ({ userId, name: h.name, icon: h.icon, isCore: true })),
    });
  }

  // Initial weight log.
  await prisma.weightLog.create({ data: { userId, weightKg: d.weightKg } });

  return NextResponse.json({ ok: true, source: plan.source });
}
