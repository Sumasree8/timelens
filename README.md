<div align="center">

# 🧠 TimeLens

### Cognitive Time Intelligence Platform

**_"We don't track time. We measure how time is experienced."_**

A full-stack product that applies the **verbal time-estimation paradigm** from cognitive
psychology to give knowledge workers a real, data-backed picture of their focus —
something no mainstream productivity tool does.

<br/>

![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Jest](https://img.shields.io/badge/Tested_with_Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)

</div>

---

## ⚡ The 30-Second Pitch

Traditional productivity tools ask *"How much time did you spend?"*

TimeLens asks — and **measures** — *"How long did it **feel**, and how far off were you?"*

You do focused work with the **clock hidden**, then **blindly estimate** how long it felt.
TimeLens compares your estimate to the real elapsed time. That gap is a genuine,
measured signal about your attention:

- ⏩ **Time flew** (you underestimated) → you were engaged, likely in **flow**.
- 🐌 **Time dragged** (you overestimated) → there's friction worth fixing.
- 🎯 Over time, you learn **which activities and states warp your perception** the most —
  and whether your internal clock is getting **sharper**.

> **The moat:** every number traces back to a real comparison the user made — never a
> hardcoded coefficient, never a simulation. This is **measured chronoception**, shipped
> as a consumer product.

---

## 🧑‍💻 What This Project Demonstrates

> *For reviewers skimming: this is a production-shaped full-stack app, not a tutorial clone.*

| Area | What's in here |
|---|---|
| **Full-stack ownership** | React 18 SPA + Express REST API + MongoDB, end to end |
| **Clean architecture** | Strict layering: `routes → controllers → services → models` |
| **Design patterns** | **Strategy pattern** for insights — a `ruleBasedProvider` (free, deterministic) and a pluggable `llmProvider` (Pro) behind one interface |
| **Security** | JWT auth, `bcryptjs` hashing, protected routes, `express-rate-limit`, `express-validator` input validation |
| **Testing** | Jest + Supertest integration suite over the live API surface |
| **Product thinking** | Freemium tiering, gamification, a real differentiator grounded in cognitive science |
| **Data viz** | Recharts dashboards driven entirely by aggregated real measurements |

---

## 🔬 How the Measurement Engine Works

```
   1. PICK            2. FOCUS              3. ESTIMATE          4. REVEAL
 ┌──────────┐      ┌──────────────┐      ┌─────────────┐      ┌──────────────────┐
 │ activity │  →   │ clock hidden │  →   │ blind guess │  →   │ perceptionRatio  │
 │ + state  │      │ (deep work)  │      │ "felt like" │      │ accuracy 0–100   │
 └──────────┘      └──────────────┘      └─────────────┘      │ direction        │
                                                              └──────────────────┘
```

When the user stops, the engine computes:

```js
perceptionRatio = estimate / actual   // 1.0 = perfect · <1 = time flew · >1 = dragged
accuracy        = 0–100               // how close, in either direction
direction       = "compressed" | "calibrated" | "expanded"
```

Every chart and insight in the app is **aggregated from these real measurements** — the
clock is hidden the entire session because *you can't measure perception while the user
is watching a timer.*

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎯 **Measurement Engine** | Hidden-clock focus sessions + blind estimate → a real, measured perception ratio & chronoception accuracy |
| 📊 **Honest Analytics** | Accuracy, compression/expansion rate, per-activity & per-state breakdowns, calibration trend over time |
| 🧠 **Insight Engine** | Deterministic, data-grounded insights (free) behind a pluggable provider interface for the Pro-tier LLM |
| 🏋️ **Perception Trainer** | Timed rounds that sharpen your internal clock and track improvement |
| 🧭 **Coach** | Personalized, measurement-driven coaching surface |
| 📈 **Dashboard** | Recharts-powered visualization of your measured patterns |
| 🏆 **Gamification** | Transparent Time Mastery Score, streaks, challenges |
| 💳 **Freemium** | Zero-cost free tier (rule-based insights) with a gated Pro tier for AI coaching |
| 🔐 **Auth System** | JWT login/register, hashed passwords, protected & rate-limited routes |

---

## 🏗️ Tech Stack

**Frontend** — React 18 (Vite) · Tailwind CSS · Framer Motion · Zustand · Recharts · React Router v6

**Backend** — Node.js · Express · JWT · bcryptjs · express-validator · express-rate-limit · Morgan

**Database** — MongoDB + Mongoose

**Testing** — Jest · Supertest

---

## 📁 Project Structure

```
TimeLens/
├── client/                      # React 18 + Vite SPA
│   └── src/
│       ├── components/          # FocusOrb, MetricCard, selectors, layout…
│       ├── pages/               # Home, Dashboard, Insights, Coach, Trainer, auth
│       ├── store/               # Zustand state stores
│       ├── hooks/               # Custom React hooks
│       └── utils/               # Helpers
├── server/                      # Express REST API
│   ├── routes/                  # auth · sessions · analytics · insights · coach · trainer · challenges
│   ├── controllers/             # Thin request handlers
│   ├── services/                # Business logic
│   │   └── insightProviders/    # Strategy pattern: ruleBasedProvider · llmProvider
│   ├── models/                  # User · Session · Insight · Challenge · TrainerRound
│   ├── middleware/              # Auth, validation & error handling
│   └── __tests__/               # Jest + Supertest API suite
└── docs/                        # SystemDesign · ProductVision · API
```

---

## ⚙️ Getting Started

**Prerequisites:** Node.js ≥ 18 · MongoDB (local or Atlas) · npm

```bash
# 1. Clone & install
git clone https://github.com/Sumasree8/timelens.git
cd timelens
cd server && npm install
cd ../client && npm install
```

**2. Environment variables**

`server/.env`
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/timelens
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development

# Optional — only for the Pro-tier LLM insight provider.
# The free tier runs fully without it; leave unset for a zero-cost deployment.
# ANTHROPIC_API_KEY=sk-ant-...
```

`client/.env`
```env
VITE_API_URL=http://localhost:5000/api
```

**3. Run**

```bash
# Terminal 1 — backend
cd server && npm run dev      # → http://localhost:5000/api

# Terminal 2 — frontend
cd client && npm run dev      # → http://localhost:5173
```

---

## 🧪 Testing

```bash
cd server && npm test          # Jest + Supertest integration suite
```

---

## 📸 Screenshots

> _Add screenshots here for instant impact:_
> - **Dashboard** — activity distribution + daily session charts
> - **Focus session** — the hidden-clock Focus Orb
> - **Insights** — measurement-driven behavioral analysis

---

## 🔮 Roadmap

- [ ] **Pro tier** — ship the LLM insight provider (scaffolded in `insightProviders/llmProvider.js`) + billing
- [ ] Reproduction & production estimation tasks (the other two classic chronoception paradigms)
- [ ] Wearable integration (heart rate → perception correlation)
- [ ] Calendar sync for automatic activity tagging
- [ ] Team dashboards for engineering managers
- [ ] Mobile app (React Native)

---

## 📐 Architecture & Product Docs

Deep dives live in [`/docs`](docs/):
[System Design](docs/SystemDesign.md) · [Product Vision](docs/ProductVision.md) · [API Reference](docs/API.md)

---

<div align="center">

**Built to measure something nobody else does.** ⏳

</div>
