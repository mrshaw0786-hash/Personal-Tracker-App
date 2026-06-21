import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import {
  TaskManager,
  DeepWorkTimer,
  GoalManager,
  FocusSummary,
} from "@/components/app/productivity";
import { startOfDay } from "@/lib/utils";

export const metadata = { title: "Productivity" };

export default async function ProductivityPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const start = startOfDay(new Date());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const weekStart = new Date(start);
  weekStart.setDate(weekStart.getDate() - 6);

  const [tasks, goals, focusToday, focusWeek] = await Promise.all([
    prisma.task.findMany({ where: { userId, date: { gte: start, lt: end } }, orderBy: { createdAt: "asc" } }),
    prisma.goal.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
    prisma.focusSession.findMany({ where: { userId, date: { gte: start, lt: end } } }),
    prisma.focusSession.findMany({ where: { userId, date: { gte: weekStart } } }),
  ]);

  const todayMins = focusToday.reduce((s, f) => s + f.minutes, 0);
  const weekMins = focusWeek.reduce((s, f) => s + f.minutes, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Productivity & Career</h1>
        <p className="text-sm text-muted">Deep work, daily planning, and the goals that move your life forward.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <TaskManager initial={tasks.map((t) => ({ id: t.id, title: t.title, category: t.category, done: t.done }))} />
          <GoalManager initial={goals.map((g) => ({ id: g.id, title: g.title, type: g.type, progress: g.progress, done: g.done }))} />
        </div>
        <div className="space-y-6">
          <DeepWorkTimer />
          <FocusSummary today={todayMins} week={weekMins} />
        </div>
      </div>
    </div>
  );
}
