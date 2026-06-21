import { GeneratedDay, GeneratedPlan, PlanMeal, ProfileLike } from "@/lib/types";
import { calcMacros, MacroTargets } from "@/lib/nutrition/calc";
import { phaseForDay } from "@/lib/program";

export interface MealLite {
  name: string;
  type: string;
  pref: string;
}

interface WorkoutTemplate {
  title: string;
  focus: string;
  isTraining: boolean;
}

function workoutTemplatesForPhase(phase: number, gym: boolean): WorkoutTemplate[] {
  const eq = gym ? "" : " (home / bodyweight)";
  if (phase === 1) {
    return [
      { title: "Full-Body Foundations", focus: `Full-body strength${eq}: Goblet Squat, Push-Up, Bent-Over Row, Plank`, isTraining: true },
      { title: "Steady Cardio", focus: "30 min brisk walk or incline treadmill — build the aerobic base", isTraining: true },
      { title: "Mobility & Core", focus: "Cat-Cow, World's Greatest Stretch, Hip Flexor Stretch, Plank holds", isTraining: true },
      { title: "Active Recovery", focus: "Light walk + 10 min foam rolling. Prioritise sleep tonight.", isTraining: false },
    ];
  }
  if (phase === 2) {
    return [
      { title: "Upper Body Strength", focus: `Push & pull${eq}: Dumbbell Bench Press, Bent-Over Row, Overhead Press, Curls`, isTraining: true },
      { title: "Lower Body Strength", focus: `Legs${eq}: Barbell Back Squat, Romanian Deadlift, Lunge, Hip Thrust`, isTraining: true },
      { title: "Fat-Loss Cardio", focus: "Jump Rope or HIIT intervals — 20-25 min, push the heart rate", isTraining: true },
      { title: "Full-Body + Core", focus: `Compound circuit${eq}: Deadlift/RDL, Push-Up, Lat Pulldown, Plank`, isTraining: true },
      { title: "Recovery", focus: "Mobility flow + foam rolling. Walk 8k steps.", isTraining: false },
    ];
  }
  return [
    { title: "Strength Peak — Push", focus: `Heavy push${eq}: Bench Press, Overhead Press, Dips, weighted core`, isTraining: true },
    { title: "Strength Peak — Pull", focus: `Heavy pull${eq}: Deadlift, Bent-Over Row, Lat Pulldown, Curls`, isTraining: true },
    { title: "Conditioning", focus: "HIIT intervals — 8 rounds of 30s hard / 60s easy. Performance focus.", isTraining: true },
    { title: "Lower Power", focus: `Power legs${eq}: Back Squat, Hip Thrust, Lunge, jump work`, isTraining: true },
    { title: "Recovery & Reflect", focus: "Mobility, breathwork, foam rolling. Review the week's wins.", isTraining: false },
  ];
}

function pickMeals(day: number, isTraining: boolean, library: MealLite[], pref: string): PlanMeal[] {
  const matches = (t: string) =>
    library.filter(
      (m) => m.type === t && (m.pref === pref || m.pref === "any" || (pref === "vegetarian" && m.pref === "vegan")),
    );
  const rotate = (arr: MealLite[]) => (arr.length ? arr[day % arr.length] : null);

  const out: PlanMeal[] = [];
  const order = isTraining
    ? ["breakfast", "pre-workout", "post-workout", "lunch", "snack", "dinner"]
    : ["breakfast", "lunch", "snack", "dinner"];
  for (const t of order) {
    const m = rotate(matches(t));
    if (m) out.push({ type: t, name: m.name });
  }
  return out;
}

const MINDSETS = [
  "Discipline is choosing what you want most over what you want now.",
  "You don't have to be extreme, just consistent.",
  "Small reps, every day. That's the whole secret.",
  "Motivation gets you started; systems keep you going.",
  "The version of you that you want to be is built in the boring days.",
  "Show up for the workout you don't feel like doing — that's the one that counts.",
  "Sleep is a performance enhancer. Protect it.",
  "Progress, not perfection. A 70% day still beats a 0% day.",
  "Your future self is watching. Give them something to be proud of.",
  "Comfort is the enemy of change. Lean into the hard thing.",
];

const REFLECTS = [
  "What was your biggest win today, and what made it possible?",
  "Where did your energy dip, and what could you adjust tomorrow?",
  "Did your actions today match the person you're becoming?",
  "What's one thing you'll do differently tomorrow?",
  "Rate your discipline 1-10 today. Why that number?",
  "What drained you, and what energised you?",
  "What are you grateful for right now?",
];

function morningRoutine(profile: ProfileLike, phase: number): string {
  const wake = profile.wakeTime || "07:00";
  if (phase === 1)
    return `Wake at ${wake}. 500ml water, 5 min sunlight/stretch, box breathing. No phone for the first 20 minutes.`;
  if (phase === 2)
    return `Wake at ${wake}. Water + electrolytes, 5 min mobility, review the day's top 3 tasks before anything else.`;
  return `Wake at ${wake}. Cold shower or brisk start, journal 3 lines, lock in deep-work block #1. Own the morning.`;
}

function tasksForDay(profile: ProfileLike, phase: number, day: number): string[] {
  const career = profile.careerGoals?.trim();
  const base: string[] = [];
  if (phase === 1) {
    base.push("Read 10 pages", "10-min walk after a meal", "Lights out on time tonight");
  } else if (phase === 2) {
    base.push("One 50-min deep-work block (no phone)", "Read 10 pages", "Log every meal honestly");
  } else {
    base.push("Two deep-work blocks", "Review weekly goals", "Teach/share one thing you learned");
  }
  if (career) {
    base.push(day % 2 === 0 ? `Career: ${career} — 30 min focused effort` : "Career prep: 1 application / skill rep");
  } else {
    base.push("30 min learning a high-value skill");
  }
  return base;
}

export function generateRulesPlan(
  profile: ProfileLike,
  mealLibrary: MealLite[],
  macros?: MacroTargets,
): GeneratedPlan {
  const m = macros ?? calcMacros(profile);
  const days: GeneratedDay[] = [];

  for (let dayNumber = 1; dayNumber <= 45; dayNumber++) {
    const phase = phaseForDay(dayNumber).id;
    const templates = workoutTemplatesForPhase(phase, profile.gymAvailable);
    const idxInPhase = dayNumber - 1;
    const tpl = templates[idxInPhase % templates.length];

    days.push({
      dayNumber,
      phase,
      title: `Day ${dayNumber}: ${tpl.title}`,
      morning: morningRoutine(profile, phase),
      workout: tpl.focus,
      meals: pickMeals(dayNumber, tpl.isTraining, mealLibrary, profile.foodPreference),
      tasks: tasksForDay(profile, phase, dayNumber),
      mindset: MINDSETS[dayNumber % MINDSETS.length],
      reflect: REFLECTS[dayNumber % REFLECTS.length],
    });
  }

  const goalLabel =
    m.goal === "fat-loss" ? "lose fat and get lean" : m.goal === "muscle-gain" ? "build muscle and strength" : "recomposition and discipline";

  return {
    source: "rules",
    summary: `A 45-day plan to ${goalLabel}, targeting ~${m.calorieTarget} kcal and ${m.proteinTarget}g protein per day across three phases: Foundation Reset, Transformation, and Optimization.`,
    days,
  };
}

// ---------------------------------------------------------------------------
// Deterministic coach fallback
// ---------------------------------------------------------------------------

export interface CoachContext {
  name?: string | null;
  dayNumber: number;
  phaseName: string;
  habitsDoneToday: number;
  habitsTotal: number;
  workoutDoneToday: boolean;
  proteinTarget: number;
  proteinToday: number;
  streak: number;
  weightTrend: "down" | "up" | "flat" | "unknown";
  goal: string;
}

export function ruleBasedCoachReply(message: string, ctx: CoachContext): string {
  const text = message.toLowerCase();
  const name = ctx.name ? ctx.name.split(" ")[0] : "there";

  const adherence =
    ctx.habitsTotal > 0 ? Math.round((ctx.habitsDoneToday / ctx.habitsTotal) * 100) : 0;

  if (/(miss|skip|didn'?t|couldn'?t).*(workout|gym|train|exercise)/.test(text)) {
    return `No guilt, ${name} — one missed session doesn't undo your progress. Let's diagnose it: was it time, energy, or motivation? If time was tight, do a 15-minute version today (squats, push-ups, plank). If energy was low, check last night's sleep and your protein (${ctx.proteinToday}/${ctx.proteinTarget}g today). The plan is flexible — shift today's session to tomorrow and just keep the streak of *showing up* alive. What got in the way?`;
  }

  if (/(tired|exhaust|no energy|drained|fatigue)/.test(text)) {
    return `Fatigue is data, not weakness. On Day ${ctx.dayNumber} of the ${ctx.phaseName} phase, three things usually cause it: under-sleeping, under-eating protein (${ctx.proteinToday}/${ctx.proteinTarget}g today), or under-recovering. Tonight, aim for a hard 7.5-8h and hit your protein. Today, swap any heavy session for a brisk walk + mobility — movement without draining you. Want me to adjust today's workout to a recovery day?`;
  }

  if (/(diet|eat|food|meal|nutrition|calorie|protein|hungry)/.test(text)) {
    const proteinGap = Math.max(0, ctx.proteinTarget - ctx.proteinToday);
    return `Nutrition is where ${ctx.goal} is won or lost. You're at ${ctx.proteinToday}/${ctx.proteinTarget}g protein today${proteinGap > 0 ? ` — about ${proteinGap}g to go. A shake or a chicken/paneer serving closes that fast.` : " — nicely done."} Keep protein high, lean on whole foods, and don't fear carbs around your workouts. Log everything honestly for 3 days and we'll spot the leaks. What did you eat today?`;
  }

  if (/(motivat|give up|quit|hard|struggl|can'?t do)/.test(text)) {
    return `${name}, you're ${ctx.dayNumber} days in with a ${ctx.streak}-day streak — that's not nothing, that's momentum. Motivation always dips; the system is what carries you. Shrink today down: just do the next *one* thing (one habit, one set, one glass of water). You've already proven you can show up. Discipline is just showing up on the days it's hard. What's the one thing you can do in the next 10 minutes?`;
  }

  if (/(sleep|insomnia|can'?t sleep|wake up|tired in morning)/.test(text)) {
    return `Sleep is your #1 lever right now. Tonight: no screens 30 min before bed, room cool and dark, and try box breathing (4-4-4-4) to down-regulate. Keep a consistent wake time even on weekends — that's what fixes the cycle fastest. If your mind races, brain-dump tomorrow's tasks onto paper so they're out of your head. How many hours are you averaging?`;
  }

  if (/(weight|scale|fat|belly|lose|gain)/.test(text)) {
    const trend =
      ctx.weightTrend === "down"
        ? "Your weight is trending down — exactly what we want. Stay the course."
        : ctx.weightTrend === "up"
        ? "The scale is up slightly — don't panic. Water, food timing, and stress all move it day-to-day. Watch the weekly average, not the daily number."
        : "Weigh in daily and watch the weekly average — the daily number is noisy.";
    return `${trend} Remember the scale is one data point: also track waist, energy, strength, and how clothes fit. ${ctx.goal === "fat-loss" ? "Stay in your calorie target, keep protein high, and keep lifting so you lose fat, not muscle." : "Keep eating enough and progressively overload your lifts."} Consistency over weeks is what wins.`;
  }

  if (/(progress|how am i|doing|review|update)/.test(text)) {
    return `Here's your snapshot, ${name}: Day ${ctx.dayNumber} (${ctx.phaseName}), ${adherence}% of today's habits done, ${ctx.streak}-day streak, protein at ${ctx.proteinToday}/${ctx.proteinTarget}g, workout ${ctx.workoutDoneToday ? "✓ done" : "pending"}. ${adherence >= 70 ? "Strong day — keep stacking them." : "Let's lift today's number: pick off two more habits before bed."} What do you want to focus on next?`;
  }

  // default
  return `I'm with you, ${name}. You're on Day ${ctx.dayNumber} of the ${ctx.phaseName} phase with a ${ctx.streak}-day streak and ${adherence}% of today's habits done. Tell me what's on your mind — a missed workout, food, sleep, motivation, or your plan — and I'll help you adjust and take the next right step.`;
}
