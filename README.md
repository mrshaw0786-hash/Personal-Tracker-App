# Ascend — AI-Powered 45-Day Transformation Platform

Ascend is a premium, AI-powered personal transformation web app. It acts as a
personal **coach, trainer, nutritionist, sleep advisor, productivity mentor, and
accountability partner** in one product, guiding users through a structured
**45-day system** across three phases: *Foundation Reset → Transformation →
Optimization*.

This is a complete digital transformation platform — not a simple tracker.

---

## ▶️ Get a live, shareable link (recommended)

This is a full-stack app (server + auth + Postgres database), so it can't run on
static GitHub Pages. The easiest way to get a **permanent public URL** you can
open like any website is to deploy to **Vercel** with a free **Neon Postgres**
database. ~5 minutes, all in the browser:

1. **Create the database (free).** Go to **[neon.tech](https://neon.tech)** →
   sign in with GitHub → **Create project**. Copy the **connection string**
   (use the *direct* connection, not the pooled one — it looks like
   `postgresql://user:pass@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require`).

2. **Import the repo to Vercel.** Go to **[vercel.com/new](https://vercel.com/new)**
   → sign in with GitHub → **Import** `Personal-Tracker-App`.

3. **Add two environment variables** (Vercel import screen → *Environment Variables*):
   - `DATABASE_URL` = the Neon connection string from step 1
   - `AUTH_SECRET` = any long random string (e.g. run `openssl rand -base64 32`,
     or just paste 40+ random characters)

4. **Click Deploy.** The build automatically creates the database tables and
   seeds the exercise/meal libraries (`vercel-build` runs
   `prisma db push` + seed). When it finishes you get a live URL like
   `https://personal-tracker-app.vercel.app`.

5. **Open the URL → Create account → complete onboarding → use the app.**

> No `ANTHROPIC_API_KEY` needed — AI uses the built-in rule-based engine. Add
> `ANTHROPIC_API_KEY` in Vercel → Settings → Environment Variables (and redeploy)
> to switch on the Claude-powered coach.

---

## 💻 Or preview in GitHub Codespaces (dev, no accounts)

Prefer a throwaway dev preview with zero external accounts? Launch a Codespace —
it runs the app **and** a Postgres container for you:

**[➡️ Open in GitHub Codespaces](https://codespaces.new/mrshaw0786-hash/Personal-Tracker-App?quickstart=1)**

1. Click the link (or on the repo: **Code → Codespaces → Create codespace**).
2. Wait ~2–3 min while it installs deps, starts Postgres, creates the schema,
   seeds data, and boots the app.
3. When port **3000** forwards, click **Open in Browser** (or the **Ports** tab →
   globe icon on port 3000). If it doesn't auto-start, run `npm run dev` in the
   terminal.

The Codespace link only works while the Codespace is running — use the Vercel
option above for an always-on link.

---

## ✨ Features

- **Premium landing page** — hero, problem, how-it-works, features, 3-phase
  roadmap, testimonials, pricing, FAQ, CTA, scroll animations, dark/light theme.
- **Secure auth** — Auth.js v5 email/password (bcrypt, JWT); server-gated routes.
- **Guided onboarding** — multi-step wizard capturing body stats, goals,
  schedule, food preference, gym access, injuries, and more.
- **AI plan generation** — a personalized 45-day plan (routine, workouts, meals,
  tasks, mindset cues, reflections) via **Claude (`claude-opus-4-8`)** with a
  **deterministic rule-based fallback** so it works with no API key.
- **AI Coach** — streaming chat coach that knows your profile & progress.
- **Dashboard** — today's plan, habit checklist, progress rings, weight chart,
  macro meters, streaks.
- **45-Day Program**, **Fitness** (logging + PRs + library), **Nutrition**
  (macros + meal logging), **Sleep** (score + trend), **Productivity** (planner +
  deep-work timer + goals), **Habits** (weekly grid + streaks + report).

---

## 🧱 Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 (design tokens, class-based dark mode) |
| Animation | Framer Motion · Charts: Recharts · Icons: lucide-react |
| Auth | Auth.js v5 (Credentials, JWT) + bcrypt |
| Database | Prisma ORM + PostgreSQL |
| AI | Anthropic SDK (`claude-opus-4-8`) with a rule-based fallback |
| Validation | Zod |

---

## 🛠️ Local Development

Requires Node 22+ and a Postgres database (a free Neon DB works, or run Postgres
locally / via Docker).

    npm install
    cp .env.example .env         # then set DATABASE_URL + AUTH_SECRET
    npx prisma db push           # create tables
    npm run seed                 # seed exercise & meal libraries
    npm run dev                  # http://localhost:3000

`.env` example:

    DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
    AUTH_SECRET="generate with: openssl rand -base64 32"
    # ANTHROPIC_API_KEY="sk-ant-..."   # optional — enables Claude

---

## 🗄️ Database Schema (Prisma / PostgreSQL)

Models: `User`, `Profile`, `TransformationPlan` + `PlanDay` (45 rows),
`Exercise`, `WorkoutLog` + `SetLog`, `Meal` + `MealLog`, `SleepLog`,
`Habit` + `HabitLog`, `Task`, `FocusSession`, `Goal`, `WeightLog`,
`CoachMessage`. Arrays/nested data are stored as JSON strings (no
dialect-specific features), so the schema is fully portable.

---

## 🤖 AI Architecture

    lib/ai/
      client.ts          Lazy Anthropic client (null when no key; bounded timeout + retry)
      plan-generator.ts  Claude structured-output 45-day plan → falls back to rules
      coach.ts           Streaming Claude coach → falls back to rule-based replies
      rules-engine.ts    Deterministic plan templates + context-aware coaching
    lib/nutrition/calc.ts  Macro math (single source of truth for both paths)

Follows current Anthropic guidance: model `claude-opus-4-8`,
`output_config.format` (JSON schema) for structured generation,
`messages.stream` for the coach, no deprecated `temperature`/`budget_tokens`.
All Claude calls run server-side.

---

## 🧪 Verification

`npm run build` and `npm run lint` pass. The full flow (register → onboarding →
45-day plan generation → dashboard → logging workouts/meals/sleep/habits →
AI coach) was verified end-to-end; schema push, seeding, and the production
build were validated against PostgreSQL.

---

## 🛣️ Deferred / Next Steps

Built at "full breadth, MVP depth". Intentionally deferred: payment processing,
email verification, Lottie assets, real exercise videos/GIFs (placeholders), and
push notifications.
