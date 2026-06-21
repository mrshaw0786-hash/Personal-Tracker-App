import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { startOfDay } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { habitId, done, date: dateStr } = await req.json();
  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId: session.user.id } });
  if (!habit) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Optional date (YYYY-MM-DD); default today. Never allow future dates.
  let date = startOfDay(new Date());
  if (typeof dateStr === "string") {
    const parsed = startOfDay(new Date(dateStr + "T00:00:00"));
    if (!Number.isNaN(parsed.getTime()) && parsed <= date) date = parsed;
  }
  await prisma.habitLog.upsert({
    where: { habitId_date: { habitId, date } },
    update: { done: !!done },
    create: { habitId, date, done: !!done },
  });
  return NextResponse.json({ ok: true });
}
