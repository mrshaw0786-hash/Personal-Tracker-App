import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Moon, Sparkles } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { TrendLine } from "@/components/dashboard/charts";
import { SleepLogger } from "@/components/app/sleep-logger";
import { getProfile } from "@/lib/server/dashboard";

export const metadata = { title: "Sleep" };

const RECS = [
  "Keep a consistent wake time — even on weekends. It's the fastest fix for a broken cycle.",
  "No screens 30 minutes before bed; keep the room cool and dark.",
  "Try box breathing (4-4-4-4) to down-regulate before sleep.",
  "Avoid caffeine after 2pm and heavy meals close to bedtime.",
  "Brain-dump tomorrow's tasks onto paper so your mind can switch off.",
];

export default async function SleepPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const profile = await getProfile(userId);
  if (!profile) redirect("/onboarding");

  const logs = await prisma.sleepLog.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 14,
  });
  const latest = logs[0];
  const avgScore = logs.length ? Math.round(logs.reduce((s, l) => s + l.score, 0) / logs.length) : 0;
  const avgHours = logs.length ? Math.round((logs.reduce((s, l) => s + l.hours, 0) / logs.length) * 10) / 10 : 0;

  const chartData = [...logs].reverse().map((l) => ({
    label: l.date.toLocaleDateString(undefined, { month: "numeric", day: "numeric" }),
    score: l.score,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Sleep Optimization</h1>
        <p className="text-sm text-muted">Fix the foundation — better sleep powers everything else.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="flex flex-col items-center justify-center text-center">
          <ProgressRing value={latest?.score ?? 0} size={120} stroke={10} label={`${latest?.score ?? 0}`} sublabel="last score" />
          <p className="mt-3 text-sm text-muted">
            {latest ? `${latest.hours}h · quality ${latest.quality}/5` : "No sleep logged yet"}
          </p>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Sleep score trend" subtitle={`Avg ${avgScore} · ${avgHours}h over last ${logs.length} nights`} />
          {chartData.length >= 2 ? (
            <TrendLine data={chartData} dataKey="score" />
          ) : (
            <div className="grid h-40 place-items-center text-sm text-muted">Log a few nights to see your trend.</div>
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SleepLogger defaultSleep={profile.sleepTime} defaultWake={profile.wakeTime} />

        <Card>
          <CardHeader title="Your sleep improvement plan" />
          <ul className="space-y-2.5">
            {RECS.map((r, i) => (
              <li key={i} className="flex gap-2.5 text-sm">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
          {logs.length > 0 && (
            <div className="mt-4 space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Recent nights</p>
              {logs.slice(0, 5).map((l) => (
                <div key={l.id} className="flex items-center justify-between rounded-lg bg-muted-surface px-3 py-1.5 text-sm">
                  <span className="flex items-center gap-1.5"><Moon className="h-3.5 w-3.5 text-muted" /> {l.date.toLocaleDateString()}</span>
                  <span>{l.hours}h · score {l.score}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
