import Anthropic from "@anthropic-ai/sdk";

// Lazily construct the Anthropic client only when a key is configured.
// When unset, callers fall back to the deterministic rules engine.
let cached: Anthropic | null | undefined;

export function getAnthropic(): Anthropic | null {
  if (cached !== undefined) return cached;
  const key = process.env.ANTHROPIC_API_KEY;
  // Bounded timeout + a single retry so an unreachable/invalid key falls back
  // to the rules engine quickly instead of hanging the request.
  cached = key ? new Anthropic({ apiKey: key, maxRetries: 1, timeout: 90_000 }) : null;
  return cached;
}

export const AI_MODEL = process.env.AI_MODEL || "claude-opus-4-8";
export const aiEnabled = () => !!process.env.ANTHROPIC_API_KEY;
