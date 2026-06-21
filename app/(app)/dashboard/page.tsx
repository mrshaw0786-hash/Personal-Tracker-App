import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Dumbbell,
  Flame,
  Moon,
  Droplets,
  Beef,
  TrendingDown,
  TrendingUp,
  Minus,
  ArrowRight,
  Bot,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/ui/progress-ring";
import { StatCard } from "@/components/ui/stat-card";
import { HabitChecklist } from "@/components/dashboard/habit-checklist";
import { WeightChart } from "@/components/dashboard/charts";
import { getProfile, getTodayStats } from "@/lib/server/dashboard";
import { dayOfProgram, startOfDay } from "@/lib/utils";
import { phaseForDay } from "@/lib/program";
import type { PlanMeal } from "@/lib/types";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const profile = await getProfile(userId);
  if (!profile) redirect("/onboarding");
  const stats = await getTodayStats(userId);
  const day = dayOfProgram(profile.programStartDate);
  const phase = phaseForDay(day);

  const planDay = await prisma.planDay.findFirst({
    where: { plan: { userId }, dayNumber: day },
  });

  const start = startOfDay(new Date());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const habits = await prisma.habit.findMany({
    where: { userId },
    include: { logs: { where: { date: { gte: start, lt: end } } } },
    orderBy: { createdAt: "asc" },
  });
  const habitItems = habits.map((h) => ({
    id: h.id,
    name: h.name,
    done: h.logs.some((l) => l.done),
  }));

  const calTarget = Math.round(profile.calorieTarget ?? 2000);
  const proteinTarget = Math.round(profile.proteinTarget ?? 120);
  const habitPct = stats.habitsTotal
    ? Math.round((stats.habitsDoneToday / stats.habitsTotal) * 100)
    : 0;
  const meals: PlanMeal[] = planDay ? JSON.parse(planDay.meals) : [];
  const TrendIcon =
    stats.weightTrend === "down" ? TrendingDown : stats.weightTrend === "up" ? TrendingUp : Minus;

  const firstName = (session.user.name ?? "there").split(" ")[0];
  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  })();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{greeting},</p>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">{firstName} 👋</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="primary">Day {day} of 45</Badge>
          <Badge>Phase {phase.id}: {phase.name}</Badge>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Flame className="h-5 w-5" />} label="Day streak" value={stats.streak} suffix=" days" />
        <StatCard icon={<Beef className="h-5 w-5" />} label={`Protein (target ${proteinTarget}g)`} value={stats.proteinToday} suffix="g" tone="accent" />
        <StatCard icon={<Flame className="h-5 w-5" />} label={`Calories (target ${calTarget})`} value={stats.caloriesToday} tone="warning" />
        <StatCard icon={<Dumbbell className="h-5 w-5" />} label="Workout today" value={stats.workoutDoneToday ? 1 : 0} suffix={stats.workoutDoneToday ? " ✓" : " ✗"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's plan */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Today's plan"
            subtitle={planDay?.title ?? "Your plan day"}
            action={
              <Button asChild variant="ghost" size="sm">
                <Link href="/program">View program <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            }
          />
          {planDay ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-muted-surface p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Morning routine</p>
                <p className="mt-1 text-sm">{planDay.morning}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Dumbbell className="h-4.5 w-4.5" />
                    <span className="text-sm font-semibold">Workout</span>
                  </div>
                  <p className="mt-1.5 text-sm text-muted">{planDay.workout}</p>
                  <Button asChild size="sm" variant="outline" className="mt-3">
                    <Link href="/fitness">Log workout</Link>
                  </Button>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 text-accent">
                    <Beef className="h-4.5 w-4.5" />
                    <span className="text-sm font-semibold">Meals</span>
                  </div>
                  <ul className="mt-1.5 space-y-1 text-sm text-muted">
                    {meals.slice(0, 5).map((m, i) => (
                      <li key={i}>
                        <span className="capitalize text-foreground">{m.type}:</span> {m.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> Mindset
                </p>
                <p className="mt-1 text-sm">{planDay.mindset}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">No plan day found. Visit the program to view your schedule.</p>
          )}
        </Card>

        {/* Today's habits */}
        <Card>
          <CardHeader
            title="Today's habits"
            action={<ProgressRing value={habitPct} size={56} stroke={6} />}
          />
          {habitItems.length ? (
            <HabitChecklist habits={habitItems} />
          ) : (
            <p className="text-sm text-muted">No habits yet.</p>
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Weight progress */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Weight progress"
            subtitle={
              stats.latestWeight != null
                ? `${stats.latestWeight}kg now · target ${profile.targetWeightKg}kg`
                : "Start logging your weight"
            }
            action={
              <Badge tone={stats.weightTrend === "down" ? "success" : stats.weightTrend === "up" ? "warning" : "default"}>
                <TrendIcon className="h-3.5 w-3.5" /> {stats.weightTrend}
              </Badge>
            }
          />
          <WeightChart data={stats.weightSeries} />
        </Card>

        {/* Macro snapshot */}
        <Card>
          <CardHeader title="Macros today" />
          <div className="space-y-4">
            <MacroBar label="Protein" value={stats.proteinToday} target={proteinTarget} unit="g" icon={<Beef className="h-4 w-4" />} />
            <MacroBar label="Calories" value={stats.caloriesToday} target={calTarget} unit="" icon={<Flame className="h-4 w-4" />} />
            <MacroBar label="Carbs" value={stats.carbsToday} target={Math.round((calTarget * 0.45) / 4)} unit="g" icon={<Droplets className="h-4 w-4" />} />
            <MacroBar label="Fat" value={stats.fatToday} target={Math.round((calTarget * 0.25) / 9)} unit="g" icon={<Moon className="h-4 w-4" />} />
          </div>
        </Card>
      </div>

      {/* AI coach prompt */}
      <Card className="relative overflow-hidden">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
              <Bot className="h-6 w-6" />
            </span>
            <div>
              <h3 className="font-display font-semibold">Talk to your AI coach</h3>
              <p className="text-sm text-muted">Missed a workout? Low energy? Ask for an adjustment.</p>
            </div>
          </div>
          <Button asChild>
            <Link href="/coach">Open coach <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}

function MacroBar({
  label,
  value,
  target,
  unit,
  icon,
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
  icon: React.ReactNode;
}) {
  const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-muted">{icon} {label}</span>
        <span className="font-medium">
          {value}
          {unit} <span className="text-muted">/ {target}{unit}</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted-surface">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
