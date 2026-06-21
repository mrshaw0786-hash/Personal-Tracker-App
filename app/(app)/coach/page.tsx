import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { CoachChat } from "@/components/app/coach-chat";
import { aiEnabled } from "@/lib/ai/client";

export const metadata = { title: "AI Coach" };

export default async function CoachPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const history = await prisma.coachMessage.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 font-display text-2xl font-bold">AI Coach</h1>
      <CoachChat
        initial={history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content }))}
        aiEnabled={aiEnabled()}
      />
    </div>
  );
}
