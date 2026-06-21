export interface Phase {
  id: number;
  name: string;
  range: [number, number];
  focus: string;
  description: string;
  pillars: string[];
}

export const PHASES: Phase[] = [
  {
    id: 1,
    name: "Foundation Reset",
    range: [1, 15],
    focus: "Sleep correction, basic movement, habit building",
    description:
      "We rebuild the base. Fix the sleep cycle, get the body moving daily, and install the keystone habits that everything else depends on. No heroics — just consistency.",
    pillars: ["Fix sleep timing", "Daily movement", "Hydration & protein", "Morning routine"],
  },
  {
    id: 2,
    name: "Transformation",
    range: [16, 30],
    focus: "Strength training, fat loss, better nutrition, productivity",
    description:
      "Now we build. Structured strength training, a real nutrition target, and a productivity system that protects deep work. This is where the body and the routine start to visibly change.",
    pillars: ["Strength progression", "Macro adherence", "Deep-work blocks", "Cardio for fat loss"],
  },
  {
    id: 3,
    name: "Optimization",
    range: [31, 45],
    focus: "Discipline, performance, lifestyle mastery",
    description:
      "We lock it in. Push performance, sharpen discipline under pressure, and turn the routine into an identity that outlasts the 45 days. You finish owning the system.",
    pillars: ["Performance peaks", "Discipline under load", "Career momentum", "Sustainable identity"],
  },
];

export function phaseForDay(day: number): Phase {
  return PHASES.find((p) => day >= p.range[0] && day <= p.range[1]) ?? PHASES[0];
}

export const CORE_HABITS = [
  { name: "Wake up on time", icon: "sunrise" },
  { name: "Workout", icon: "dumbbell" },
  { name: "Hit protein target", icon: "beef" },
  { name: "Drink 3L water", icon: "droplets" },
  { name: "Read 10 pages", icon: "book-open" },
  { name: "Meditate / breathe", icon: "brain" },
  { name: "Learning / skill", icon: "graduation-cap" },
  { name: "Career prep", icon: "briefcase" },
  { name: "Sleep on time", icon: "moon" },
];
