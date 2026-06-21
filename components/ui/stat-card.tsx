"use client";

import { motion, useInView, useMotionValue, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function AnimatedNumber({
  value,
  decimals = 0,
  className,
}: {
  value: number;
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, value, {
      duration: 1.1,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v.toFixed(decimals)),
    });
    return controls.stop;
  }, [inView, value, decimals, mv]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}

export function StatCard({
  icon,
  label,
  value,
  suffix,
  tone = "primary",
  decimals,
}: {
  icon?: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  tone?: "primary" | "accent" | "warning";
  decimals?: number;
}) {
  const tones = {
    primary: "text-primary bg-primary/10",
    accent: "text-accent bg-accent/10",
    warning: "text-warning bg-warning/10",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-border bg-card p-4"
    >
      <div className="flex items-center gap-3">
        {icon && (
          <span className={cn("grid h-10 w-10 place-items-center rounded-xl", tones[tone])}>
            {icon}
          </span>
        )}
        <div>
          <div className="font-display text-2xl font-bold leading-none">
            <AnimatedNumber value={value} decimals={decimals} />
            {suffix && <span className="ml-0.5 text-base text-muted">{suffix}</span>}
          </div>
          <div className="mt-1 text-xs text-muted">{label}</div>
        </div>
      </div>
    </motion.div>
  );
}
