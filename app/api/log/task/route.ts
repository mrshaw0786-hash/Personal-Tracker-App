import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { title, category } = await req.json();
  if (!title) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  await prisma.task.create({ data: { userId: session.user.id, title, category: category || "general" } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, done } = await req.json();
  await prisma.task.updateMany({ where: { id, userId: session.user.id }, data: { done: !!done } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await prisma.task.deleteMany({ where: { id, userId: session.user.id } });
  return NextResponse.json({ ok: true });
}
