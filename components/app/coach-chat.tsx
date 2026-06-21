"use client";

import { useRef, useState, useEffect } from "react";
import { Bot, Send, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "I missed my workout today",
  "I'm feeling low on energy",
  "How am I doing so far?",
  "Help me stay motivated",
];

export function CoachChat({
  initial,
  aiEnabled,
}: {
  initial: Msg[];
  aiEnabled: boolean;
}) {
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || streaming) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content }, { role: "assistant", content: "" }]);
    setStreaming(true);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });
      if (!res.body) throw new Error("No stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((m) =>
          m.map((msg, i) =>
            i === m.length - 1
              ? { role: "assistant" as const, content: msg.content + chunk }
              : msg,
          ),
        );
      }
    } catch {
      setMessages((m) =>
        m.map((msg, i) =>
          i === m.length - 1
            ? {
                role: "assistant" as const,
                content: "Sorry, I had trouble responding. Please try again.",
              }
            : msg,
        ),
      );
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border px-5 py-3.5">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
          <Bot className="h-5 w-5" />
        </span>
        <div>
          <p className="font-display font-semibold">AI Coach</p>
          <p className="text-xs text-muted">
            {aiEnabled ? "Powered by Claude" : "Smart coaching engine"} · knows your plan & progress
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.length === 0 && (
          <div className="grid h-full place-items-center text-center">
            <div>
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Bot className="h-7 w-7" />
              </span>
              <p className="mt-4 font-display text-lg font-semibold">How can I help today?</p>
              <p className="mt-1 text-sm text-muted">Ask about your workouts, food, sleep, or motivation.</p>
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
            <span
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                m.role === "user" ? "bg-muted-surface" : "bg-primary/10 text-primary",
              )}
            >
              {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </span>
            <div
              className={cn(
                "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted-surface text-foreground",
              )}
            >
              {m.content || (streaming && i === messages.length - 1 ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                ""
              ))}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2 px-5 pb-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted transition hover:border-primary/40 hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message your coach…"
          className="h-11 flex-1 rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <Button type="submit" size="md" disabled={streaming || !input.trim()} className="px-4">
          {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
}
