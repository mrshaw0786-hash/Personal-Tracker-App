import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Dumbbell, Trophy, CalendarCheck } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/misc";
import { StatCard } from "@/components/ui/stat-card";
import { WorkoutLogger } from "@/components/app/workout-logger";
import { ExerciseLibrary } from "@/components/app/exercise-library";
import { dayOfProgram } from "@/lib/utils";
import { getProfile } from "@/lib/server/dashboard";

export const metadata = { title: "Fitness" };

export default async function FitnessPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const profile = await getProfile(userId);
  if (!profile) redirect("/onboarding");
  const day = dayOfProgram(profile.programStartDate);

  const [exercises, planDay, recent, prs, totalWorkouts] = await Promise.all([
    prisma.exercise.findMany({ orderBy: { category: "asc" } }),
    prisma.planDay.findFirst({ where: { plan: { userId }, dayNumber: day } }),
    prisma.workoutLog.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 6,
      include: { sets: true },
    }),
    prisma.setLog.findMany({
      where: { workoutLog: { userId }, isPR: true },
      orderBy: { weightKg: "desc" },
      take: 5,
    }),
    prisma.workoutLog.count({ where: { userId } }),
  ]);

  const defaultName = planDay?.workout?.split(":")[0]?.trim() || "Workout";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Fitness</h1>
        <p className="text-sm text-muted">Today: {planDay?.workout ?? "Train hard, recover well."}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<CalendarCheck className="h-5 w-5" />} label="Total workouts" value={totalWorkouts} />
        <StatCard icon={<Trophy className="h-5 w-5" />} label="Personal records" value={prs.length} tone="warning" />
        <StatCard icon={<Dumbbell className="h-5 w-5" />} label="Program day" value={day} suffix="/45" tone="accent" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <WorkoutLogger defaultName={defaultName} exerciseNames={exercises.map((e) => e.name)} />

        <Card>
          <CardHeader title="Recent workouts" subtitle="Your latest sessions & PRs" />
          {recent.length ? (
            <div className="space-y-2">
              {recent.map((w) => (
                <div key={w.id} className="rounded-xl border border-border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{w.name}</p>
                    <span className="text-xs text-muted">{w.date.toLocaleDateString()}</span>
                  </div>
                  {w.sets.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {w.sets.map((s) => (
                        <span key={s.id} className="rounded-md bg-muted-surface px-2 py-0.5 text-xs">
                          {s.exerciseName} {s.weightKg > 0 ? `${s.weightKg}kg` : ""}×{s.reps}
                          {s.isPR && <Trophy className="ml-1 inline h-3 w-3 text-warning" />}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">No workouts logged yet. Complete your first session!</p>
          )}
          {prs.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Top PRs</p>
              <div className="flex flex-wrap gap-2">
                {prs.map((p) => (
                  <Badge key={p.id} tone="warning">
                    <Trophy className="h-3 w-3" /> {p.exerciseName} {p.weightKg}kg
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      <ExerciseLibrary exercises={exercises} />
    </div>
  );
}
