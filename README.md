# Ascend — AI-Powered 45-Day Transformation Platform

Ascend is a premium, AI-powered personal transformation web app. It acts as a
personal **coach, trainer, nutritionist, sleep advisor, productivity mentor, and
accountability partner** in one product, guiding users through a structured
**45-day system** across three phases: *Foundation Reset → Transformation →
Optimization*.

This is a complete digital transformation platform — not a simple tracker.

---

## ✨ Features

- **Premium marketing landing page** — hero, problem statement, how-it-works,
  features, 3-phase roadmap, testimonials, pricing, FAQ, and CTA, with scroll
  animations and a dark/light theme.
- **Secure auth** — email/password accounts (Auth.js v5, hashed with bcrypt,
  JWT sessions). All app routes are gated server-side.
- **Guided onboarding** — a multi-step wizard collecting body stats, goals,
  schedule, food preference, gym access, injuries, and more.
- **AI plan generation** — generates a personalized 45-day plan (daily routine,
  workouts, meals, tasks, mindset cues, reflections) using **Claude
  (`claude-opus-4-8`)**, with a **deterministic rule-based engine fallback** so
  the app works fully with no API key.
- **AI Coach** — a streaming chat coach that knows your profile and progress,
  diagnoses missed workouts, and adjusts your plan.
- **Main dashboard** — today's plan, habit checklist, animated progress rings,
  weight chart, macro meters, and streaks.
- **45-Day Program** — phase tabs, an interactive day grid, and full day detail.
- **Fitness** — workout logger with set/rep/weight tracking, automatic PR
  detection, recent sessions, and a filterable exercise library.
- **Nutrition** — calorie & macro targets (Mifflin-St Jeor BMR → TDEE →
  goal-adjusted), meal logging from a library or custom, and the day's plan.
- **Sleep** — sleep logging with a computed sleep score, trend chart, and an
  improvement plan.
- **Productivity** — daily planner, deep-work Pomodoro timer (logs focus hours),
  and goal management with progress sliders.
- **Habits** — a weekly habit grid (tap any day), streaks, completion %, and a
  weekly report.

---

## 🧱 Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 (CSS-variable design tokens, class-based dark mode) |
| Animation | Framer Motion |
| Charts | Recharts |
| Icons | lucide-react |
| Auth | Auth.js v5 (Credentials, JWT) + bcrypt |
| Database | Prisma ORM + SQLite (swappable to Postgres) |
| AI | Anthropic SDK (`claude-opus-4-8`) with a rule-based fallback |
| Validation | Zod |

---

## 🚀 Getting Started

### 1. Install

    npm install

### 2. Environment

A `.env` is included for local development. Copy `.env.example` to customize:

    DATABASE_URL="file:./dev.db"
    AUTH_SECRET="generate-with: openssl rand -base64 32"
    NEXTAUTH_URL="http://localhost:3000"
    # ANTHROPIC_API_KEY="sk-ant-..."   # optional — enables Claude-powered AI
    # AI_MODEL="claude-opus-4-8"       # optional override

> **No `ANTHROPIC_API_KEY`?** No problem. The app uses a deterministic
> rule-based engine for plan generation and coaching. Add a key any time to
> upgrade to Claude — if the key is missing, invalid, or unreachable, the app
> automatically and gracefully falls back.

### 3. Database

    npx prisma migrate dev   # create the SQLite DB + apply migrations
    npm run seed             # seed the exercise & meal libraries

### 4. Run

    npm run dev              # http://localhost:3000

Register an account → complete onboarding → your 45-day plan is generated →
explore the dashboard and modules.

---

## 🗄️ Database Schema (Prisma)

Key models: `User`, `Profile`, `TransformationPlan` + `PlanDay` (45 rows),
`Exercise`, `WorkoutLog` + `SetLog`, `Meal` + `MealLog`, `SleepLog`,
`Habit` + `HabitLog`, `Task`, `FocusSession`, `Goal`, `WeightLog`, and
`CoachMessage`. Arrays/nested data are stored as JSON strings (SQLite has no
native array/enum support); switch the datasource `provider` to `postgresql`
for production.

---

## 🤖 AI Architecture

    lib/ai/
      client.ts          Lazy Anthropic client (null when no key; bounded timeout + retry)
      plan-generator.ts  Claude structured-output 45-day plan → falls back to rules
      coach.ts           Streaming Claude coach → falls back to rule-based replies
      rules-engine.ts    Deterministic plan templates + context-aware coaching
    lib/nutrition/calc.ts  Macro math (single source of truth for both paths)

The AI integration follows current Anthropic best practices: model
`claude-opus-4-8`, `output_config.format` (JSON schema) for structured plan
generation, `messages.stream` for the coach, and no deprecated
`temperature`/`budget_tokens` parameters. All Claude calls run server-side.

---

## 🧪 Testing & Verification

    npm run build   # type-checks all routes
    npm run lint    # eslint (clean)

End-to-end (manual): register → onboarding → plan generation → dashboard → log a
workout/meal/sleep/habit → open the AI coach. The fallback path was verified
end-to-end (plan generation produces 45 days, logging updates the dashboard, and
the coach returns context-aware replies). With a valid `ANTHROPIC_API_KEY` and
network egress to `api.anthropic.com`, the same flows run through Claude.

---

## 📦 Deployment

1. Set a strong `AUTH_SECRET` (`openssl rand -base64 32`) and `NEXTAUTH_URL`.
2. For production, point `DATABASE_URL` at Postgres and change the Prisma
   datasource `provider` to `postgresql`, then `prisma migrate deploy`.
3. (Optional) Set `ANTHROPIC_API_KEY` to enable Claude-powered AI.
4. Deploy to any Node host (e.g. Vercel): `npm run build` then `npm start`.

---

## 🛣️ Deferred / Next Steps

Built at "full breadth, MVP depth". Intentionally deferred: payment processing,
email verification, Lottie assets, real exercise videos/GIFs (placeholders used),
and push notifications.
