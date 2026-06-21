import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sleepScore } from "@/lib/nutrition/calc";

export const runtime = "nodejs";

const schema = z.object({
  sleepTime: z.string(),
  wakeTime: z.string(),
  hours: z.coerce.number().min(0).max(16),
  quality: z.coerce.number().min(1).max(5),
  notes: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const d = parsed.data;
  const score = sleepScore(d.hours, d.quality);
  await prisma.sleepLog.create({ data: { userId: session.user.id, ...d, score } });
  return NextResponse.json({ ok: true, score });
}
