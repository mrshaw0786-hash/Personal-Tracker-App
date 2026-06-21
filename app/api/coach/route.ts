import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCoachContext } from "@/lib/server/dashboard";
import { streamCoachReply, CoachTurn } from "@/lib/ai/coach";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }
  const userId = session.user.id;
  const { message } = await req.json();
  if (!message || typeof message !== "string") {
    return new Response("Invalid", { status: 400 });
  }

  // Persist the user's message.
  await prisma.coachMessage.create({ data: { userId, role: "user", content: message } });

  // Build context + recent history.
  const ctx = await getCoachContext(userId);
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
  ctx.name = user?.name ?? null;

  const recent = await prisma.coachMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 12,
  });
  const history: CoachTurn[] = recent
    .reverse()
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  const baseStream = await streamCoachReply(history, ctx);

  // Tee the stream so we can persist the full assistant reply when it finishes.
  const decoder = new TextDecoder();
  let full = "";
  const out = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = baseStream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
          controller.enqueue(value);
        }
      } finally {
        controller.close();
        if (full.trim()) {
          await prisma.coachMessage.create({
            data: { userId, role: "assistant", content: full },
          });
        }
      }
    },
  });

  return new Response(out, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
