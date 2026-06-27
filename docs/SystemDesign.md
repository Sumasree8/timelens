# TimeLens — System Design Document

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                     CLIENT (React/Vite)                  │
│   ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌─────────┐  │
│   │Measure  │  │Dashboard │  │Insights │  │  Auth   │  │
│   │ Engine  │  │  Page    │  │  Page   │  │  Pages  │  │
│   └────┬────┘  └────┬─────┘  └────┬────┘  └────┬────┘  │
│        └─────────────┴─────────────┴─────────────┘       │
│                      Zustand Store                        │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTP/REST (Axios)
┌────────────────────────▼─────────────────────────────────┐
│                  SERVER (Node.js/Express)                 │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐   │
│  │  Routes  │→ │ Controllers  │→ │     Services      │   │
│  └──────────┘  └──────────────┘  └────────┬──────────┘   │
│                                           │               │
│  ┌──────────────────────────────────────▼──────────────┐ │
│  │                 MongoDB (Mongoose)                   │ │
│  │  Users | Sessions | Insights                        │ │
│  └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

## 2. Data Flow

### Session Lifecycle (real measurement)
```
User picks activity (+ optional state) → POST /api/sessions/start
→ Stopwatch runs with the clock HIDDEN (no time shown to the user)
→ User stops → blindly estimates how long it felt
→ POST /api/sessions/end (actualSeconds, estimatedSeconds)
→ SessionService computes perceptionRatio / accuracy / direction
→ Persists to MongoDB → Analytics recomputed → Dashboard updates
```

### Insight Generation
```
GET /api/insights/:userId
→ InsightService computes analytics from completed sessions
→ Selects a provider by plan: rule-based (free) or LLM (Pro, gated)
→ Provider derives summary / patterns / recommendations from REAL metrics
→ Persists Insight document (with `source` provenance)
→ Returns to frontend
```

## 3. Perception Measurement

This is the honest core of the product. We do **not** fabricate a "perceived clock"
from a coefficient. We apply the **verbal time-estimation paradigm** from cognitive
psychology: the user works with the clock hidden, then estimates the duration blind.
Every metric derives from comparing that estimate to the real elapsed time.

```
perceptionRatio = estimatedSeconds / actualSeconds   // 1.0 = accurate
accuracy        = 100 * (1 - |estimated - actual| / actual)   // clamped 0–100
direction       = ratio ≤ 0.8 → compressed (time flew)
                  ratio ≥ 1.2 → expanded  (time dragged)
                  else         → calibrated
```

Hiding the clock during the session is the load-bearing design decision: perception
cannot be measured if the subject can watch a timer.

## 4. Analytics Engine

### Metrics Computed (all derived from measured sessions)

| Metric | Formula |
|--------|---------|
| Chronoception Accuracy | mean(session.accuracy) |
| Avg Perception Ratio | mean(session.perceptionRatio) |
| Compression / Expansion Rate | % of sessions with direction compressed / expanded |
| Per-activity / per-state ratio | mean(perceptionRatio) grouped by activity / state |
| Consistency Score | 1 - (stdDev(dailySessions) / mean(dailySessions)) |
| Peak Hour | hour with the most *compressed* sessions |
| Time Mastery Score | 0.5·accuracy + 0.3·compressionRate + 0.2·(consistency·100) |

## 5. Design Decisions

### Why Zustand over Redux?
- TimeLens state is modular (auth, sessions, UI)
- Zustand has zero boilerplate
- Slices can be composed cleanly
- Lighter bundle for client-side performance

### Why a wall-clock stopwatch (Date.now) over requestAnimationFrame?
- The clock is hidden, so we never animate elapsed time — we only need the true delta
- `Date.now()` deltas stay accurate even when the tab is backgrounded (rAF throttles to ~0fps)
- A backgrounded session must still measure real elapsed time correctly
- Elapsed time lives in a ref and is revealed only after the user commits their estimate

### Why MongoDB over SQL?
- Session documents are schema-flexible
- Analytics aggregation pipelines are expressive
- Horizontal scaling via sharding fits usage patterns
- No relational joins needed for primary use cases

## 6. Scalability Considerations

### Horizontal Scaling
- Stateless Express server → multiple instances behind load balancer
- JWT auth requires no server-side session storage
- MongoDB Atlas supports automatic sharding

### Caching Strategy (Future)
- Redis cache for analytics results (TTL: 10 min)
- Cache invalidation on new session creation
- User insight cache with 1-hour TTL

### Performance
- API pagination for session history
- Indexed MongoDB queries (userId + createdAt)
- Frontend code splitting via React.lazy

## 7. Security Design
- Passwords hashed with bcrypt (12 rounds)
- JWT stored in httpOnly cookie (production)
- Rate limiting on auth endpoints
- Input validation with express-validator
- CORS configured for known origins only
