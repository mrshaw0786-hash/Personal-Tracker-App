"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Moon } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/misc";
import { cn } from "@/lib/utils";

function hoursBetween(sleep: string, wake: string): number {
  const [sh, sm] = sleep.split(":").map(Number);
  const [wh, wm] = wake.split(":").map(Number);
  let mins = wh * 60 + wm - (sh * 60 + sm);
  if (mins <= 0) mins += 24 * 60;
  return Math.round((mins / 60) * 10) / 10;
}

export function SleepLogger({
  defaultSleep,
  defaultWake,
}: {
  defaultSleep: string;
  defaultWake: string;
}) {
  const router = useRouter();
  const [sleepTime, setSleepTime] = useState(defaultSleep);
  const [wakeTime, setWakeTime] = useState(defaultWake);
  const [quality, setQuality] = useState(3);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const hours = hoursBetween(sleepTime, wakeTime);

  async function save() {
    setSaving(true);
    await fetch("/api/log/sleep", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sleepTime, wakeTime, hours, quality, notes }),
    });
    setSaving(false);
    setNotes("");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader title="Log last night's sleep" />
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Slept at</Label>
            <Input type="time" value={sleepTime} onChange={(e) => setSleepTime(e.target.value)} />
          </div>
          <div>
            <Label>Woke at</Label>
            <Input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} />
          </div>
        </div>
        <div className="rounded-lg bg-muted-surface px-3 py-2 text-sm">
          Duration: <b>{hours}h</b>
        </div>
        <div>
          <Label>Quality</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((q) => (
              <button
                key={q}
                onClick={() => setQuality(q)}
                className={cn(
                  "h-10 flex-1 rounded-lg border text-sm font-semibold transition",
                  quality === q ? "border-primary bg-primary/10 text-primary" : "border-border text-muted hover:bg-muted-surface",
                )}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label>Notes (optional)</Label>
          <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Woke up once, felt rested…" />
        </div>
        <Button className="w-full" onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Moon className="h-4 w-4" />} Log sleep
        </Button>
      </div>
    </Card>
  );
}
