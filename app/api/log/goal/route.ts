import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { title, type, target } = await req.json();
  if (!title) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  await prisma.goal.create({
    data: { userId: session.user.id, title, type: type || "career", target: target || null },
  });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, progress, done } = await req.json();
  await prisma.goal.updateMany({
    where: { id, userId: session.user.id },
    data: {
      ...(progress != null ? { progress: Math.max(0, Math.min(100, progress)) } : {}),
      ...(done != null ? { done: !!done } : {}),
    },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await prisma.goal.deleteMany({ where: { id, userId: session.user.id } });
  return NextResponse.json({ ok: true });
}
