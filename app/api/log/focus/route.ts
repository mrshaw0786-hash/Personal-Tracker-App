import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { label, minutes } = await req.json();
  if (!minutes || minutes <= 0) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  await prisma.focusSession.create({
    data: { userId: session.user.id, label: label || "Deep Work", minutes: Math.round(minutes) },
  });
  return NextResponse.json({ ok: true });
}
