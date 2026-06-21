import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { ProgramView } from "@/components/app/program-view";
import { getProfile } from "@/lib/server/dashboard";
import { dayOfProgram } from "@/lib/utils";
import type { GeneratedDay } from "@/lib/types";

export const metadata = { title: "45-Day Program" };

export default async function ProgramPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await getProfile(session.user.id);
  if (!profile) redirect("/onboarding");
  const currentDay = dayOfProgram(profile.programStartDate);

  const plan = await prisma.transformationPlan.findUnique({
    where: { userId: session.user.id },
    include: { days: { orderBy: { dayNumber: "asc" } } },
  });

  const days: GeneratedDay[] = (plan?.days ?? []).map((d) => ({
    dayNumber: d.dayNumber,
    phase: d.phase,
    title: d.title,
    morning: d.morning,
    workout: d.workout,
    meals: JSON.parse(d.meals),
    tasks: JSON.parse(d.tasks),
    mindset: d.mindset,
    reflect: d.reflect,
  }));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Your 45-Day Program</h1>
        <p className="text-sm text-muted">{plan?.summary}</p>
      </div>
      {days.length ? (
        <ProgramView days={days} currentDay={currentDay} />
      ) : (
        <p className="text-muted">No plan found.</p>
      )}
    </div>
  );
}
