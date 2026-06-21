import { GeneratedPlan, ProfileLike } from "@/lib/types";
import { calcMacros } from "@/lib/nutrition/calc";
import { getAnthropic, AI_MODEL } from "@/lib/ai/client";
import { generateRulesPlan, MealLite } from "@/lib/ai/rules-engine";
import { PHASES } from "@/lib/program";

// JSON schema describing the structured plan we want Claude to return.
const planSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: { type: "string" },
    days: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          dayNumber: { type: "integer" },
          phase: { type: "integer" },
          title: { type: "string" },
          morning: { type: "string" },
          workout: { type: "string" },
          meals: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                type: { type: "string" },
                name: { type: "string" },
              },
              required: ["type", "name"],
            },
          },
          tasks: { type: "array", items: { type: "string" } },
          mindset: { type: "string" },
          reflect: { type: "string" },
        },
        required: ["dayNumber", "phase", "title", "morning", "workout", "meals", "tasks", "mindset", "reflect"],
      },
    },
  },
  required: ["summary", "days"],
} as const;

/**
 * Generate a 45-day plan. Uses Claude when ANTHROPIC_API_KEY is set, otherwise
 * (or on any error) falls back to the deterministic rules engine. The rules
 * engine always provides the macro math so numbers stay consistent.
 */
export async function generatePlan(
  profile: ProfileLike,
  mealLibrary: MealLite[],
): Promise<GeneratedPlan> {
  const macros = calcMacros(profile);
  const client = getAnthropic();
  if (!client) return generateRulesPlan(profile, mealLibrary, macros);

  try {
    const mealNames = mealLibrary.map((m) => `${m.name} (${m.type}, ${m.pref})`).join("; ");
    const phaseText = PHASES.map(
      (p) => `Phase ${p.id} "${p.name}" days ${p.range[0]}-${p.range[1]}: ${p.focus}`,
    ).join("\n");

    const system = `You are an elite transformation coach (trainer, nutritionist, productivity mentor). You design a structured, realistic, motivating 45-day plan. Respect the user's equipment, food preference, injuries, and schedule. Use ONLY meals from the provided library by exact name. Keep each text field concise (1-2 sentences). The three phases are:\n${phaseText}`;

    const user = `Create a complete 45-day transformation plan as JSON.

USER PROFILE:
- Name: ${profile.name ?? "User"}
- Age ${profile.age}, ${profile.gender}, ${profile.heightCm}cm, ${profile.weightKg}kg → target ${profile.targetWeightKg}kg
- Fitness level: ${profile.fitnessLevel}; gym available: ${profile.gymAvailable}
- Activity: ${profile.activityLevel}; lifestyle: ${profile.lifestyleType}; work: ${profile.workSchedule}
- Sleep ${profile.sleepTime}-${profile.wakeTime}; food: ${profile.foodPreference}
- Goals: ${(profile.fitnessGoals || []).join(", ") || "general transformation"}
- Career goals: ${profile.careerGoals || "n/a"}
- Injuries/limitations: ${profile.injuries || "none"}; medical: ${profile.medicalNotes || "none"}

TARGETS (use these): ~${macros.calorieTarget} kcal/day, ${macros.proteinTarget}g protein, goal=${macros.goal}.

MEAL LIBRARY (pick by exact name, match the food preference): ${mealNames}

Return all 45 days. Each day: dayNumber (1-45), phase (1/2/3 by range above), a short title, morning routine, workout focus, 4-6 meals (use library names; include pre/post-workout meals on training days), 3-4 concrete tasks (include productivity + career), a one-line mindset cue, and a reflection prompt.`;

    const params = {
      model: AI_MODEL,
      max_tokens: 32000,
      system,
      messages: [{ role: "user", content: user }],
      output_config: { format: { type: "json_schema", schema: planSchema } },
    };
    // output_config is newer than the installed SDK types; cast around it.
    const resp = (await client.messages.create(
      params as unknown as Parameters<typeof client.messages.create>[0],
    )) as unknown as { content: Array<{ type: string; text?: string }> };

    const block = resp.content.find((b) => b.type === "text" && b.text);
    if (!block?.text) throw new Error("Empty AI response");
    const parsed = JSON.parse(block.text) as Omit<GeneratedPlan, "source">;
    if (!parsed.days || parsed.days.length < 30) throw new Error("Incomplete AI plan");

    return { source: "ai", summary: parsed.summary, days: parsed.days };
  } catch (err) {
    console.error("AI plan generation failed, using rules engine:", err);
    return generateRulesPlan(profile, mealLibrary, macros);
  }
}
