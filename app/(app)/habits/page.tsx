import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Flame, TrendingUp, CalendarCheck } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { HabitGrid, HabitRow } from "@/components/app/habit-grid";
import { startOfDay } from "@/lib/utils";

export const metadata = { title: "Habits" };

function dayKey(d: Date) {
  return startOfDay(d).toLocaleDateString("en-CA"); // YYYY-MM-DD local
}

export default async function HabitsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  // Build the last 7 days (oldest → today).
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      date: startOfDay(d),
      key: dayKey(d),
      label: String(d.getDate()),
      weekday: d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2),
      isToday: i === 6,
    };
  });
  const windowStart = days[0].date;

  const habits = await prisma.habit.findMany({
    where: { userId },
    include: { logs: { where: { date: { gte: windowStart }, done: true } } },
    orderBy: { createdAt: "asc" },
  });

  // Build rows with cell map + streak.
  const rows: HabitRow[] = habits.map((h) => {
    const cells: Record<string, boolean> = {};
    const doneSet = new Set(h.logs.map((l) => dayKey(l.date)));
    for (const d of days) cells[d.key] = doneSet.has(d.key);
    // streak from today backwards
    let streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (cells[days[i].key]) streak++;
      else if (i === days.length - 1) continue; // allow today empty
      else break;
    }
    return { id: h.id, name: h.name, streak, cells };
  });

  // Weekly completion %.
  const totalCells = rows.length * days.length;
  const doneCells = rows.reduce((s, r) => s + Object.values(r.cells).filter(Boolean).length, 0);
  const weeklyPct = totalCells ? Math.round((doneCells / totalCells) * 100) : 0;
  const bestStreak = rows.reduce((m, r) => Math.max(m, r.streak), 0);
  const todayKeyStr = days[6].key;
  const doneToday = rows.filter((r) => r.cells[todayKeyStr]).length;

  // Per-habit completion for the weekly report.
  const report = rows
    .map((r) => ({
      name: r.name,
      pct: Math.round((Object.values(r.cells).filter(Boolean).length / days.length) * 100),
    }))
    .sort((a, b) => b.pct - a.pct);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Habit System</h1>
        <p className="text-sm text-muted">Nine keystone habits. Small reps, every day.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<CalendarCheck className="h-5 w-5" />} label="Done today" value={doneToday} suffix={`/${rows.length}`} />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="7-day completion" value={weeklyPct} suffix="%" tone="accent" />
        <StatCard icon={<Flame className="h-5 w-5" />} label="Best streak" value={bestStreak} suffix=" days" tone="warning" />
      </div>

      <HabitGrid habits={rows} days={days.map((d) => ({ key: d.key, label: d.label, weekday: d.weekday, isToday: d.isToday }))} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="flex flex-col items-center justify-center text-center">
          <ProgressRing value={weeklyPct} size={120} stroke={10} />
          <p className="mt-3 text-sm text-muted">Weekly consistency</p>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="Weekly report" subtitle="Completion by habit (last 7 days)" />
          <div className="space-y-2.5">
            {report.map((r) => (
              <div key={r.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{r.name}</span>
                  <span className="font-medium">{r.pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted-surface">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
            {report.length === 0 && <p className="text-sm text-muted">No habits to report.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
