export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function startOfDay(d = new Date()): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function dayOfProgram(start: Date | string): number {
  const s = startOfDay(new Date(start));
  const now = startOfDay(new Date());
  const diff = Math.floor((now.getTime() - s.getTime()) / 86400000) + 1;
  return Math.min(45, Math.max(1, diff));
}
