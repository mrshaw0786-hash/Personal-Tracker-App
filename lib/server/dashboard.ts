import { prisma } from "@/lib/db";
import { startOfDay, dayOfProgram } from "@/lib/utils";
import { phaseForDay } from "@/lib/program";
import { inferGoal } from "@/lib/nutrition/calc";

function dayRange(d = new Date()) {
  const start = startOfDay(d);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

export async function getProfile(userId: string) {
  const p = await prisma.profile.findUnique({ where: { userId } });
  if (!p) return null;
  return { ...p, fitnessGoalsArr: safeArr(p.fitnessGoals) };
}

function safeArr(s: string | null): string[] {
  try {
    const v = JSON.parse(s ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export async function getTodayStats(userId: string) {
  const { start, end } = dayRange();

  const [habits, habitLogsToday, mealsToday, workoutToday, sleepLast, weights] =
    await Promise.all([
      prisma.habit.findMany({ where: { userId } }),
      prisma.habitLog.findMany({
        where: { habit: { userId }, date: { gte: start, lt: end }, done: true },
      }),
      prisma.mealLog.findMany({ where: { userId, date: { gte: start, lt: end } } }),
      prisma.workoutLog.findFirst({
        where: { userId, date: { gte: start, lt: end }, completed: true },
      }),
      prisma.sleepLog.findFirst({ where: { userId }, orderBy: { date: "desc" } }),
      prisma.weightLog.findMany({ where: { userId }, orderBy: { date: "asc" } }),
    ]);

  const proteinToday = mealsToday.reduce((s, m) => s + m.protein, 0);
  const caloriesToday = mealsToday.reduce((s, m) => s + m.calories, 0);
  const carbsToday = mealsToday.reduce((s, m) => s + m.carbs, 0);
  const fatToday = mealsToday.reduce((s, m) => s + m.fat, 0);

  const habitsTotal = habits.length;
  const habitsDoneToday = new Set(habitLogsToday.map((l) => l.habitId)).size;

  const firstWeight = weights[0]?.weightKg ?? null;
  const latestWeight = weights[weights.length - 1]?.weightKg ?? null;
  let weightTrend: "down" | "up" | "flat" | "unknown" = "unknown";
  if (weights.length >= 2 && firstWeight != null && latestWeight != null) {
    const diff = latestWeight - firstWeight;
    weightTrend = diff < -0.3 ? "down" : diff > 0.3 ? "up" : "flat";
  }

  const streak = await computeStreak(userId);

  return {
    habitsTotal,
    habitsDoneToday,
    proteinToday,
    caloriesToday,
    carbsToday,
    fatToday,
    workoutDoneToday: !!workoutToday,
    sleepLast,
    streak,
    firstWeight,
    latestWeight,
    weightTrend,
    weightSeries: weights.map((w) => ({
      date: w.date.toISOString().slice(5, 10),
      weight: w.weightKg,
    })),
  };
}

// Streak = consecutive days (counting back from today, or yesterday if today
// is still empty) on which the user completed at least one habit.
async function computeStreak(userId: string): Promise<number> {
  const since = new Date();
  since.setDate(since.getDate() - 60);
  const logs = await prisma.habitLog.findMany({
    where: { habit: { userId }, done: true, date: { gte: startOfDay(since) } },
    select: { date: true },
  });
  const days = new Set(logs.map((l) => startOfDay(l.date).getTime()));
  let streak = 0;
  const cursor = startOfDay(new Date());
  // allow today to be empty without breaking the streak
  if (!days.has(cursor.getTime())) cursor.setDate(cursor.getDate() - 1);
  while (days.has(cursor.getTime())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export async function getCoachContext(userId: string) {
  const profile = await getProfile(userId);
  const stats = await getTodayStats(userId);
  const day = profile ? dayOfProgram(profile.programStartDate) : 1;
  const phase = phaseForDay(day);
  const goal = profile
    ? inferGoal({
        age: profile.age,
        gender: profile.gender,
        heightCm: profile.heightCm,
        weightKg: profile.weightKg,
        targetWeightKg: profile.targetWeightKg,
        activityLevel: profile.activityLevel,
        fitnessGoals: profile.fitnessGoalsArr,
      })
    : "maintenance";

  return {
    name: null as string | null,
    dayNumber: day,
    phaseName: phase.name,
    habitsDoneToday: stats.habitsDoneToday,
    habitsTotal: stats.habitsTotal,
    workoutDoneToday: stats.workoutDoneToday,
    proteinTarget: Math.round(profile?.proteinTarget ?? 0),
    proteinToday: stats.proteinToday,
    streak: stats.streak,
    weightTrend: stats.weightTrend,
    goal,
  };
}
