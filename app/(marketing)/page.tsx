import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Dumbbell,
  Utensils,
  Moon,
  Target,
  Flame,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Calendar,
  Star,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/misc";
import { Reveal } from "@/components/marketing/reveal";
import { HeroVisual } from "@/components/marketing/hero-visual";
import { Faq } from "@/components/marketing/faq";
import { PHASES } from "@/lib/program";

const problems = [
  "No daily routine or structure",
  "Broken sleep cycle",
  "Low motivation & discipline",
  "Weight gain & stubborn belly fat",
  "Poor fitness and energy",
  "Low productivity & career stagnation",
];

const features = [
  { icon: Brain, title: "AI Coach", desc: "A coach that knows your profile, reviews your progress daily, and adjusts your plan when life happens." },
  { icon: Dumbbell, title: "Fitness System", desc: "Workout calendar, exercise library, set logging, PRs, and progress graphs — gym or home." },
  { icon: Utensils, title: "Nutrition Planner", desc: "Calorie & macro targets, personalized meal plans, food logging, and swap suggestions." },
  { icon: Moon, title: "Sleep Optimization", desc: "Track sleep, get a nightly sleep score, and follow a plan to fix your cycle." },
  { icon: Target, title: "Productivity & Career", desc: "Daily planner, deep-work timer, learning tracker, and goal management." },
  { icon: Flame, title: "Habit Streaks", desc: "Nine keystone habits, streaks, completion rates, and weekly reports." },
];

const steps = [
  { n: "01", title: "Tell us about you", desc: "A guided onboarding captures your body, goals, schedule, food preference, and limitations." },
  { n: "02", title: "AI builds your 45-day plan", desc: "We compute your targets and generate daily routines, workouts, meals, tasks, and mindset cues." },
  { n: "03", title: "Execute with your coach", desc: "Track everything, and let the AI coach keep you accountable and adapt the plan in real time." },
  { n: "04", title: "Transform & sustain", desc: "Move through three phases, build the identity, and finish owning the system for life." },
];

const testimonials = [
  { name: "Aarav M.", role: "Lost 6.4kg in 45 days", quote: "I'd tried everything. The difference here was the coach actually adjusting when I slipped, instead of a static PDF. I never fell off." },
  { name: "Priya S.", role: "Fixed her sleep & focus", quote: "The Foundation phase repaired my sleep in two weeks. By Phase 3 I was getting more done by noon than I used to in a day." },
  { name: "Daniel K.", role: "Built his first routine", quote: "It finally made discipline feel doable. Small reps, every day, with something checking in on me. Genuinely life-changing." },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36">
        <div className="absolute inset-0 hero-grid opacity-60" />
        <div className="absolute left-1/2 top-0 -z-0 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm font-medium text-muted">
                <Sparkles className="h-4 w-4 text-primary" /> AI-powered 45-day transformation
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
                Rebuild your body, <span className="text-gradient">mind, and discipline</span> in 45 days.
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-xl text-lg text-muted">
                Ascend is your personal coach, trainer, nutritionist, and productivity mentor in one app — a complete transformation system, not just another tracker.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/register">
                    Start your transformation <ArrowRight className="h-4.5 w-4.5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="#how">See how it works</a>
                </Button>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> No gym required</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> Personalized by AI</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> Start free</span>
              </div>
            </Reveal>
          </div>
          <HeroVisual />
        </div>
      </section>

      {/* Problem */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <SectionHeading
              center
              eyebrow="The problem"
              title="You don't need more willpower. You need a system."
              subtitle="Most people fail not from laziness, but from chaos — no routine, no feedback, no one keeping them accountable. Ascend fixes the system."
            />
          </Reveal>
          <div className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-2">
            {problems.map((p, i) => (
              <Reveal key={p} delay={i * 0.05}>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-danger/10 text-danger">✕</span>
                  <span className="text-sm font-medium">{p}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-border bg-surface py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <SectionHeading center eyebrow="How it works" title="From overwhelmed to in control, in four steps" />
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.08}>
                <div className="h-full rounded-2xl border border-border bg-card p-6">
                  <span className="font-display text-3xl font-bold text-primary/30">{s.n}</span>
                  <h3 className="mt-3 font-display text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <SectionHeading center eyebrow="Everything in one app" title="A complete transformation platform" subtitle="Six integrated systems working together — coached by AI, tracked automatically, and tuned to you." />
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.06}>
                <div className="group h-full rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                    <f.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section id="roadmap" className="border-y border-border bg-surface py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <SectionHeading center eyebrow="The roadmap" title="Three phases. One transformation." subtitle="A deliberate progression — reset the foundation, drive the change, then optimize and sustain it." />
          </Reveal>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {PHASES.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.1}>
                <div className="relative h-full overflow-hidden rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4.5 w-4.5 text-primary" />
                    <span className="text-sm font-semibold text-primary">
                      Days {p.range[0]}–{p.range[1]}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-xl font-bold">Phase {p.id}: {p.name}</h3>
                  <p className="mt-2 text-sm text-muted">{p.description}</p>
                  <ul className="mt-4 space-y-2">
                    {p.pillars.map((pill) => (
                      <li key={pill} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-success" /> {pill}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <SectionHeading center eyebrow="Real change" title="People who took the 45 days" />
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.08}>
                <figure className="h-full rounded-2xl border border-border bg-card p-6">
                  <div className="flex gap-0.5 text-warning">
                    {Array.from({ length: 5 }).map((_, k) => (
                      <Star key={k} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <blockquote className="mt-4 text-sm leading-relaxed">“{t.quote}”</blockquote>
                  <figcaption className="mt-4 flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 font-semibold text-primary">
                      {t.name[0]}
                    </span>
                    <div>
                      <div className="text-sm font-semibold">{t.name}</div>
                      <div className="flex items-center gap-1 text-xs text-muted">
                        <TrendingUp className="h-3 w-3 text-success" /> {t.role}
                      </div>
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-y border-border bg-surface py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <SectionHeading center eyebrow="Pricing" title="Invest in the version of you worth becoming" subtitle="Start free. Upgrade when the system proves itself." />
          </Reveal>
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-2xl border border-border bg-card p-7">
                <h3 className="font-display text-lg font-semibold">Starter</h3>
                <p className="mt-1 text-sm text-muted">Everything you need to begin.</p>
                <p className="mt-5 font-display text-4xl font-bold">$0<span className="text-base font-normal text-muted">/forever</span></p>
                <ul className="mt-6 space-y-3 text-sm">
                  {["Full 45-day plan", "Fitness, nutrition & sleep tracking", "Habit streaks & dashboard", "Rule-based coaching"].map((f) => (
                    <li key={f} className="flex items-center gap-2"><CheckCircle2 className="h-4.5 w-4.5 text-success" /> {f}</li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="mt-7 w-full">
                  <Link href="/register">Start free</Link>
                </Button>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="relative h-full overflow-hidden rounded-2xl border-2 border-primary bg-card p-7 shadow-xl shadow-primary/10">
                <span className="absolute right-5 top-5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">Most popular</span>
                <h3 className="font-display text-lg font-semibold">Pro Coach</h3>
                <p className="mt-1 text-sm text-muted">The full AI-coached experience.</p>
                <p className="mt-5 font-display text-4xl font-bold">$19<span className="text-base font-normal text-muted">/month</span></p>
                <ul className="mt-6 space-y-3 text-sm">
                  {["Everything in Starter", "Claude-powered AI coach", "Adaptive plan adjustments", "Deep-work & career tools", "Priority new features"].map((f) => (
                    <li key={f} className="flex items-center gap-2"><CheckCircle2 className="h-4.5 w-4.5 text-success" /> {f}</li>
                  ))}
                </ul>
                <Button asChild className="mt-7 w-full">
                  <Link href="/register">Start 45 days <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <SectionHeading center eyebrow="FAQ" title="Questions, answered" />
          </Reveal>
          <div className="mt-10">
            <Faq />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-16 text-center">
              <div className="absolute inset-0 hero-grid opacity-50" />
              <div className="absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-primary/25 blur-[100px]" />
              <div className="relative">
                <MessageSquare className="mx-auto h-10 w-10 text-primary" />
                <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-bold sm:text-4xl">
                  Your next 45 days can change everything.
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-muted">
                  Stop starting over. Build the routine, body, and discipline you actually want — with a coach in your corner.
                </p>
                <Button asChild size="lg" className="mt-8">
                  <Link href="/register">Begin your transformation <ArrowRight className="h-4.5 w-4.5" /></Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
