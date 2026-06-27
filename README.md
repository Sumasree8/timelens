# 🧠 TimeLens — Cognitive Time Intelligence Platform

> *"We do not track time. We optimize how time is experienced."*

---

## 🚀 Overview

TimeLens **measures** how you actually perceive time. You do focused work with the
clock hidden, then blindly estimate how long it felt. We compare your estimate to the
real elapsed time — the gap between the two is a genuine, measured signal about your
focus and engagement.

This is **not** a timer app, and it is **not** a simulation. It applies the *verbal
time-estimation* paradigm from cognitive psychology to give knowledge workers,
developers, and students a real, data-backed picture of their attention.

---

## 💡 Unique Value Proposition

Traditional productivity tools ask *"How much time did you spend?"*

TimeLens asks — and **measures** — *"How long did it feel, and how far off were you?"*

- When time **flies** for you (you underestimate), you were engaged — likely in flow.
- When time **drags** (you overestimate), there's friction worth fixing.
- Which **activities** and **states** warp your sense of time the most.
- When your **internal clock is sharpest** — and whether it's improving over time.

Nobody else in the consumer productivity market measures chronoception directly. That
is the moat: every number in TimeLens traces back to a real comparison the user made,
never to a hardcoded coefficient.

---

## 🎯 Target Users

- Students struggling with focus and retention
- Developers & creators managing deep work
- Knowledge workers optimizing cognitive output
- Self-optimization enthusiasts

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎯 **Measurement Engine** | Hidden-clock focus sessions + blind time estimate → a real, measured perception ratio & chronoception accuracy |
| 📊 **Honest Analytics** | Accuracy, compression/expansion rate, per-activity & per-state breakdowns, calibration trend |
| 🧠 **Insight Engine** | Deterministic, data-grounded insights (free) with a pluggable LLM provider for the Pro tier |
| 📈 **Dashboard** | Recharts-powered visualization of your measured patterns |
| 🏆 **Gamification** | Transparent Time Mastery Score, streaks |
| 💳 **Freemium** | Free tier (rule-based insights, no cost) with a gated Pro tier for AI-generated coaching |
| 🔐 **Auth System** | JWT-based login/register with protected routes |

---

## 🔬 How Measurement Works

1. **Pick** what you're working on (and optionally how you feel).
2. **Focus** — the clock is hidden the entire time. You can't measure perception if the user is watching a timer.
3. **Estimate** — when you stop, you blindly guess how long it felt.
4. **Reveal** — we compute:
   - `perceptionRatio = estimate ÷ actual` (1.0 = accurate, < 1 = time flew, > 1 = dragged)
   - `accuracy` (0–100) — how close your estimate was, either direction
   - `direction` — *compressed* / *calibrated* / *expanded*

Everything in your analytics and insights is aggregated from these real measurements.

---

## 🏗️ Tech Stack

### Frontend
- React 18 (Vite)
- Tailwind CSS
- Framer Motion
- Zustand (state management)
- Recharts (data visualization)
- React Router v6

### Backend
- Node.js + Express
- Layered architecture (routes → controllers → services → models)
- JWT Authentication
- bcryptjs password hashing

### Database
- MongoDB + Mongoose

---

## 📁 Project Structure

```
TimeLens/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route-level pages
│   │   ├── store/           # Zustand state stores
│   │   ├── hooks/           # Custom React hooks
│   │   └── utils/           # Utility functions
├── server/                  # Express backend
│   ├── routes/              # API route definitions
│   ├── controllers/         # Request handlers
│   ├── services/            # Business logic
│   ├── models/              # Mongoose schemas
│   └── middleware/          # Auth & error middleware
├── docs/                    # Architecture & product docs
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Install

```bash
git clone https://github.com/yourname/timelens.git
cd timelens

# Install server deps
cd server && npm install

# Install client deps
cd ../client && npm install
```

### 2. Environment Variables

**server/.env**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/timelens
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development

# Optional — only needed for the Pro-tier LLM insight provider.
# The free tier runs entirely without this; do not set it for a zero-cost deployment.
# ANTHROPIC_API_KEY=sk-ant-...
```

**client/.env**
```
VITE_API_URL=http://localhost:5000/api
```

### 3. Run the Application

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

Frontend: http://localhost:5173
Backend API: http://localhost:5000/api

---

## 🧪 Testing

```bash
cd server
npm test
```

---

## 📸 Screenshots

> [Dashboard] — Mode distribution pie chart + daily session bar chart
> [Simulation] — Real-time animated clock with distortion visualization
> [Insights] — AI-generated behavioral analysis panel

---

## 🔮 Future Roadmap

- [ ] **Pro tier**: ship the LLM insight provider (scaffolded in `server/services/insightProviders/llmProvider.js`) + billing
- [ ] Reproduction & production estimation tasks (the other two classic chronoception paradigms)
- [ ] Wearable integration (heart rate → perception correlation)
- [ ] Calendar sync for automatic activity tagging
- [ ] Team dashboards for engineering managers
- [ ] Mobile app (React Native)

---

## 🏗️ System Design

See `/docs/SystemDesign.md` for full architecture documentation.

---

*Built with engineering depth and product thinking. Explainable in any FAANG system design interview.*
