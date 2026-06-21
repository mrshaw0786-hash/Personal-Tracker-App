"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Check, Play, Pause, RotateCcw, Timer, Target } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/misc";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  category: string;
  done: boolean;
}
interface Goal {
  id: string;
  title: string;
  type: string;
  progress: number;
  done: boolean;
}

export function TaskManager({ initial }: { initial: Task[] }) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initial);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("work");

  async function add() {
    if (!title.trim()) return;
    const optimistic = { id: `tmp-${Date.now()}`, title: title.trim(), category, done: false };
    setTasks((t) => [...t, optimistic]);
    setTitle("");
    await fetch("/api/log/task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: optimistic.title, category }),
    });
    router.refresh();
  }
  async function toggle(t: Task) {
    setTasks((ts) => ts.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)));
    await fetch("/api/log/task", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: t.id, done: !t.done }),
    });
    router.refresh();
  }
  async function remove(id: string) {
    setTasks((ts) => ts.filter((x) => x.id !== id));
    await fetch("/api/log/task", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }

  return (
    <Card>
      <CardHeader title="Daily planner" subtitle="Plan the work, work the plan" />
      <div className="flex gap-2">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a task…" onKeyDown={(e) => e.key === "Enter" && add()} />
        <Select className="w-32" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="work">Work</option>
          <option value="learning">Learning</option>
          <option value="career">Career</option>
          <option value="general">General</option>
        </Select>
        <Button onClick={add} className="px-3"><Plus className="h-4 w-4" /></Button>
      </div>
      <ul className="mt-3 space-y-1.5">
        {tasks.length === 0 && <p className="text-sm text-muted">No tasks yet. Add your first.</p>}
        {tasks.map((t) => (
          <li key={t.id} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
            <button onClick={() => toggle(t)} className={cn("grid h-5 w-5 place-items-center rounded-md border", t.done ? "border-primary bg-primary text-primary-foreground" : "border-border")}>
              {t.done && <Check className="h-3.5 w-3.5" />}
            </button>
            <span className={cn("flex-1 text-sm", t.done && "text-muted line-through")}>{t.title}</span>
            <span className="rounded-md bg-muted-surface px-2 py-0.5 text-xs capitalize text-muted">{t.category}</span>
            <button onClick={() => remove(t.id)} className="text-muted hover:text-danger"><Trash2 className="h-4 w-4" /></button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function DeepWorkTimer() {
  const router = useRouter();
  const [minutes, setMinutes] = useState(50);
  const [left, setLeft] = useState(50 * 60);
  const [running, setRunning] = useState(false);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  const logSession = useCallback(
    async (mins: number) => {
      await fetch("/api/log/focus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: "Deep Work", minutes: mins }),
      });
      router.refresh();
    },
    [router],
  );

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => {
        setLeft((l) => {
          if (l <= 1) {
            clearInterval(ref.current!);
            setRunning(false);
            void logSession(minutes);
            return 0;
          }
          return l - 1;
        });
      }, 1000);
    }
    return () => {
      if (ref.current) clearInterval(ref.current);
    };
  }, [running, minutes, logSession]);

  function setPreset(m: number) {
    setMinutes(m);
    setLeft(m * 60);
    setRunning(false);
  }
  function reset() {
    setRunning(false);
    setLeft(minutes * 60);
  }

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const pct = 100 - (left / (minutes * 60)) * 100;

  return (
    <Card className="flex flex-col items-center">
      <CardHeader title="Deep-work timer" subtitle="Protect a block of focused work" className="w-full" />
      <div className="relative my-2 grid h-40 w-40 place-items-center">
        <svg className="absolute -rotate-90" width="160" height="160">
          <circle cx="80" cy="80" r="72" fill="none" stroke="var(--muted-surface)" strokeWidth="10" />
          <circle cx="80" cy="80" r="72" fill="none" stroke="var(--primary)" strokeWidth="10" strokeLinecap="round" strokeDasharray={2 * Math.PI * 72} strokeDashoffset={(1 - pct / 100) * 2 * Math.PI * 72} />
        </svg>
        <span className="font-display text-3xl font-bold tabular-nums">{mm}:{ss}</span>
      </div>
      <div className="mb-3 flex gap-2">
        {[25, 50, 90].map((m) => (
          <button key={m} onClick={() => setPreset(m)} className={cn("rounded-lg border px-3 py-1.5 text-sm font-medium", minutes === m ? "border-primary bg-primary/10 text-primary" : "border-border text-muted")}>{m}m</button>
        ))}
      </div>
      <div className="flex gap-2">
        <Button onClick={() => setRunning((r) => !r)} size="sm">
          {running ? <><Pause className="h-4 w-4" /> Pause</> : <><Play className="h-4 w-4" /> Start</>}
        </Button>
        <Button onClick={reset} size="sm" variant="outline"><RotateCcw className="h-4 w-4" /> Reset</Button>
      </div>
    </Card>
  );
}

export function GoalManager({ initial }: { initial: Goal[] }) {
  const router = useRouter();
  const [goals, setGoals] = useState(initial);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("career");

  async function add() {
    if (!title.trim()) return;
    setTitle("");
    await fetch("/api/log/goal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), type }),
    });
    router.refresh();
  }
  async function setProgress(g: Goal, progress: number) {
    setGoals((gs) => gs.map((x) => (x.id === g.id ? { ...x, progress } : x)));
    await fetch("/api/log/goal", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: g.id, progress, done: progress >= 100 }),
    });
    router.refresh();
  }
  async function remove(id: string) {
    setGoals((gs) => gs.filter((x) => x.id !== id));
    await fetch("/api/log/goal", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }

  return (
    <Card>
      <CardHeader title="Goals" subtitle="Career, learning & life targets" />
      <div className="flex gap-2">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New goal…" onKeyDown={(e) => e.key === "Enter" && add()} />
        <Select className="w-32" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="career">Career</option>
          <option value="learning">Learning</option>
          <option value="fitness">Fitness</option>
          <option value="life">Life</option>
        </Select>
        <Button onClick={add} className="px-3"><Plus className="h-4 w-4" /></Button>
      </div>
      <ul className="mt-3 space-y-3">
        {goals.length === 0 && <p className="text-sm text-muted">No goals yet.</p>}
        {goals.map((g) => (
          <li key={g.id} className="rounded-xl border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-sm font-medium"><Target className="h-4 w-4 text-primary" /> {g.title}</span>
              <button onClick={() => remove(g.id)} className="text-muted hover:text-danger"><Trash2 className="h-4 w-4" /></button>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <input type="range" min={0} max={100} step={5} value={g.progress} onChange={(e) => setProgress(g, Number(e.target.value))} className="flex-1 accent-[var(--primary)]" />
              <span className="w-10 text-right text-sm font-semibold">{g.progress}%</span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function FocusSummary({ today, week }: { today: number; week: number }) {
  return (
    <Card>
      <CardHeader title="Focus hours" />
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="rounded-xl bg-muted-surface p-4">
          <Timer className="mx-auto h-5 w-5 text-primary" />
          <p className="mt-2 font-display text-2xl font-bold">{(today / 60).toFixed(1)}h</p>
          <p className="text-xs text-muted">Today</p>
        </div>
        <div className="rounded-xl bg-muted-surface p-4">
          <Timer className="mx-auto h-5 w-5 text-accent" />
          <p className="mt-2 font-display text-2xl font-bold">{(week / 60).toFixed(1)}h</p>
          <p className="text-xs text-muted">This week</p>
        </div>
      </div>
    </Card>
  );
}
