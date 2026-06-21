import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/app/app-shell";
import { dayOfProgram } from "@/lib/utils";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { onboardingDone: true, programStartDate: true },
  });

  if (!profile?.onboardingDone) redirect("/onboarding");

  const day = dayOfProgram(profile.programStartDate);

  return (
    <AppShell name={session.user.name ?? "Athlete"} day={day}>
      {children}
    </AppShell>
  );
}
