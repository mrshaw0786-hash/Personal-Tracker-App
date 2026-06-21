"use client";

import { motion } from "framer-motion";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Dumbbell, Flame, Moon, CheckCircle2 } from "lucide-react";

export function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
      className="relative mx-auto w-full max-w-md"
    >
      <div className="rounded-3xl border border-border bg-card p-5 shadow-2xl shadow-primary/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted">Day 18 · Transformation</p>
            <p className="font-display text-lg font-bold">Today&apos;s Plan</p>
          </div>
          <ProgressRing value={72} size={64} stroke={7} sublabel="done" />
        </div>

        <div className="mt-4 space-y-2.5">
          {[
            { icon: Dumbbell, label: "Upper Body Strength", done: true },
            { icon: Flame, label: "1,840 / 2,100 kcal", done: false },
            { icon: Moon, label: "Sleep target 7.5h", done: true },
          ].map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.12 }}
              className="flex items-center gap-3 rounded-xl bg-muted-surface px-3 py-2.5"
            >
              <r.icon className="h-4.5 w-4.5 text-primary" />
              <span className="flex-1 text-sm font-medium">{r.label}</span>
              {r.done && <CheckCircle2 className="h-4.5 w-4.5 text-success" />}
            </motion.div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3">
          <p className="text-xs font-semibold text-primary">AI Coach</p>
          <p className="mt-1 text-sm text-foreground">
            Great work hitting your lift today. You&apos;re 260 kcal under — add a post-workout shake to protect your muscle.
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute -right-4 -top-4 rounded-2xl border border-border bg-card px-4 py-3 shadow-lg"
      >
        <p className="text-xs text-muted">Streak</p>
        <p className="font-display text-xl font-bold text-primary">🔥 14 days</p>
      </motion.div>
    </motion.div>
  );
}
