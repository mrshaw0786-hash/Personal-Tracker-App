import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().min(1),
  notes: z.string().optional().nullable(),
  sets: z
    .array(
      z.object({
        exerciseId: z.string().optional().nullable(),
        exerciseName: z.string().min(1),
        setNumber: z.coerce.number().min(1),
        reps: z.coerce.number().min(0),
        weightKg: z.coerce.number().min(0),
      }),
    )
    .default([]),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const { name, notes, sets } = parsed.data;

  // PR detection: best previous weight per exercise for this user.
  const setsWithPR = await Promise.all(
    sets.map(async (s) => {
      if (s.weightKg <= 0) return { ...s, isPR: false };
      const prev = await prisma.setLog.findFirst({
        where: { workoutLog: { userId: session.user!.id }, exerciseName: s.exerciseName },
        orderBy: { weightKg: "desc" },
      });
      return { ...s, isPR: !prev || s.weightKg > prev.weightKg };
    }),
  );

  await prisma.workoutLog.create({
    data: {
      userId: session.user.id,
      name,
      notes: notes ?? undefined,
      completed: true,
      sets: { create: setsWithPR },
    },
  });
  return NextResponse.json({ ok: true });
}
