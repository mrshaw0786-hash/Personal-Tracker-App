import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { OnboardingWizard } from "@/components/app/onboarding-wizard";

export const metadata = { title: "Onboarding" };

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { onboardingDone: true },
  });
  if (profile?.onboardingDone) redirect("/dashboard");

  return (
    <div className="relative min-h-screen px-4 py-10">
      <div className="absolute left-1/2 top-0 -z-10 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
      <OnboardingWizard name={session.user.name ?? "there"} />
    </div>
  );
}
