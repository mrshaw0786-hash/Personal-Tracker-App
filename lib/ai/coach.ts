import { getAnthropic, AI_MODEL } from "@/lib/ai/client";
import { CoachContext, ruleBasedCoachReply } from "@/lib/ai/rules-engine";

export interface CoachTurn {
  role: "user" | "assistant";
  content: string;
}

function systemPrompt(ctx: CoachContext): string {
  return `You are the user's personal AI transformation coach — part trainer, nutritionist, sleep advisor, productivity mentor, and accountability partner. You are warm, direct, and practical. Keep replies focused and motivating (3-6 sentences). Always end with one concrete next action or a question that moves them forward. Never be preachy.

CURRENT CONTEXT:
- Name: ${ctx.name ?? "the user"}
- Day ${ctx.dayNumber} of 45 (${ctx.phaseName} phase)
- Goal: ${ctx.goal}
- Today's habits: ${ctx.habitsDoneToday}/${ctx.habitsTotal} done
- Workout today: ${ctx.workoutDoneToday ? "completed" : "not yet done"}
- Protein today: ${ctx.proteinToday}/${ctx.proteinTarget}g
- Current streak: ${ctx.streak} days
- Weight trend: ${ctx.weightTrend}

Use this context to give specific, personalized advice. If they missed something, diagnose the cause and adjust the plan rather than scolding.`;
}

/**
 * Streaming coach reply. Returns a ReadableStream of text chunks.
 * Falls back to a deterministic reply (delivered as a single chunk) when the
 * Claude API is unavailable or errors.
 */
export async function streamCoachReply(
  history: CoachTurn[],
  ctx: CoachContext,
): Promise<ReadableStream<Uint8Array>> {
  const client = getAnthropic();
  const encoder = new TextEncoder();
  const lastUser = [...history].reverse().find((m) => m.role === "user")?.content ?? "";

  if (!client) {
    const reply = ruleBasedCoachReply(lastUser, ctx);
    return new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(reply));
        controller.close();
      },
    });
  }

  try {
    const stream = client.messages.stream({
      model: AI_MODEL,
      max_tokens: 1024,
      system: systemPrompt(ctx),
      messages: history.map((m) => ({ role: m.role, content: m.content })),
    });

    return new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
        } catch (e) {
          console.error("AI coach stream error, falling back:", e);
          controller.enqueue(encoder.encode(ruleBasedCoachReply(lastUser, ctx)));
        } finally {
          controller.close();
        }
      },
    });
  } catch (err) {
    console.error("AI coach failed, using rules engine:", err);
    const reply = ruleBasedCoachReply(lastUser, ctx);
    return new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(reply));
        controller.close();
      },
    });
  }
}
