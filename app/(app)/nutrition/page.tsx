import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Beef, Flame, Wheat, Droplet } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { MealLogger } from "@/components/app/meal-logger";
import { getProfile, getTodayStats } from "@/lib/server/dashboard";
import { startOfDay, dayOfProgram } from "@/lib/utils";
import type { PlanMeal } from "@/lib/types";

export const metadata = { title: "Nutrition" };

export default async function NutritionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const profile = await getProfile(userId);
  if (!profile) redirect("/onboarding");
  const stats = await getTodayStats(userId);
  const day = dayOfProgram(profile.programStartDate);

  const start = startOfDay(new Date());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const [library, todays, planDay] = await Promise.all([
    prisma.meal.findMany({ orderBy: { type: "asc" } }),
    prisma.mealLog.findMany({ where: { userId, date: { gte: start, lt: end } }, orderBy: { date: "asc" } }),
    prisma.planDay.findFirst({ where: { plan: { userId }, dayNumber: day } }),
  ]);

  const calTarget = Math.round(profile.calorieTarget ?? 2000);
  const proteinTarget = Math.round(profile.proteinTarget ?? 120);
  const carbTarget = Math.round((calTarget * 0.45) / 4);
  const fatTarget = Math.round((calTarget * 0.25) / 9);
  const calPct = Math.min(100, Math.round((stats.caloriesToday / calTarget) * 100));
  const planMeals: PlanMeal[] = planDay ? JSON.parse(planDay.meals) : [];

  const macroCards = [
    { label: "Protein", icon: Beef, value: stats.proteinToday, target: proteinTarget, unit: "g", tone: "var(--primary)" },
    { label: "Calories", icon: Flame, value: stats.caloriesToday, target: calTarget, unit: "", tone: "var(--warning)" },
    { label: "Carbs", icon: Wheat, value: stats.carbsToday, target: carbTarget, unit: "g", tone: "var(--accent)" },
    { label: "Fat", icon: Droplet, value: stats.fatToday, target: fatTarget, unit: "g", tone: "var(--muted)" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Nutrition</h1>
        <p className="text-sm text-muted">
          Goal: ~{calTarget} kcal · {proteinTarget}g protein per day
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {macroCards.map((m) => {
          const pct = m.target > 0 ? Math.min(100, Math.round((m.value / m.target) * 100)) : 0;
          return (
            <Card key={m.label} className="flex items-center gap-4">
              <ProgressRing value={pct} size={64} stroke={7} />
              <div>
                <p className="flex items-center gap-1.5 text-sm font-semibold"><m.icon className="h-4 w-4 text-primary" /> {m.label}</p>
                <p className="mt-0.5 text-sm text-muted">{m.value}{m.unit} / {m.target}{m.unit}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MealLogger
          library={library.map((m) => ({ name: m.name, type: m.type, calories: m.calories, protein: m.protein, carbs: m.carbs, fat: m.fat }))}
          todaysMeals={todays.map((m) => ({ id: m.id, name: m.name, type: m.type, calories: m.calories, protein: m.protein, carbs: m.carbs, fat: m.fat }))}
        />

        <Card>
          <CardHeader title="Today's recommended meals" subtitle={`Day ${day} of your plan`} />
          {planMeals.length ? (
            <ul className="space-y-2">
              {planMeals.map((m, i) => {
                const lib = library.find((x) => x.name === m.name);
                return (
                  <li key={i} className="flex items-center justify-between rounded-xl border border-border px-3.5 py-2.5">
                    <div>
                      <p className="text-sm font-medium">{m.name}</p>
                      <p className="text-xs capitalize text-muted">{m.type}</p>
                    </div>
                    {lib && <span className="text-xs text-muted">{lib.calories}kcal · {lib.protein}p</span>}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-muted">No meal plan for today.</p>
          )}
          <div className="mt-4 rounded-xl bg-muted-surface p-3 text-center">
            <p className="text-xs text-muted">Calories today</p>
            <p className="font-display text-xl font-bold">{stats.caloriesToday} <span className="text-sm font-normal text-muted">/ {calTarget} ({calPct}%)</span></p>
          </div>
        </Card>
      </div>
    </div>
  );
}
