# TimeLens — API Documentation

Base URL: `http://localhost:5000/api`

---

## Authentication

### POST /auth/register
Register a new user.

**Request:**
```json
{
  "name": "Arjun Sharma",
  "email": "arjun@example.com",
  "password": "securepassword123"
}
```

**Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f1b2c3d4e5f6a7b8c9d0e1",
    "name": "Arjun Sharma",
    "email": "arjun@example.com"
  }
}
```

---

### POST /auth/login
Authenticate an existing user.

**Request:**
```json
{
  "email": "arjun@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f1b2c3d4e5f6a7b8c9d0e1",
    "name": "Arjun Sharma",
    "email": "arjun@example.com"
  }
}
```

---

## Sessions

> All session endpoints require `Authorization: Bearer <token>` header.

### POST /sessions/start
Start a focus session. The client hides the clock from here on. Records only
what the user is doing and (optionally) how they feel.

**Request:**
```json
{
  "activity": "coding",
  "stateTag": "focused"
}
```
`activity` ∈ `coding | writing | reading | studying | meeting | design | admin | creative | other`.
`stateTag` is optional ∈ `focused | energized | neutral | tired | anxious | distracted`.

**Response (201):**
```json
{
  "success": true,
  "sessionId": "64f1b2c3d4e5f6a7b8c9d0e2",
  "startedAt": "2024-11-15T09:23:00.000Z"
}
```

---

### POST /sessions/end
End a session with the real elapsed time and the user's blind estimate. The
server measures the perception ratio, accuracy, and direction from these two
numbers — none of them are fabricated.

**Request:**
```json
{
  "sessionId": "64f1b2c3d4e5f6a7b8c9d0e2",
  "actualSeconds": 1800,
  "estimatedSeconds": 1500
}
```

**Response (200):**
```json
{
  "success": true,
  "session": {
    "id": "64f1b2c3d4e5f6a7b8c9d0e2",
    "activity": "coding",
    "stateTag": "focused",
    "actualSeconds": 1800,
    "estimatedSeconds": 1500,
    "perceptionRatio": 0.83,
    "accuracy": 83.3,
    "direction": "compressed",
    "createdAt": "2024-11-15T09:23:00.000Z"
  }
}
```

---

### GET /sessions/user/:id
Fetch all completed sessions for a user.

**Query Params:** `?limit=20&page=1`

**Response (200):**
```json
{
  "success": true,
  "sessions": [
    {
      "id": "64f1b2c3d4e5f6a7b8c9d0e2",
      "activity": "coding",
      "actualSeconds": 1800,
      "estimatedSeconds": 1500,
      "perceptionRatio": 0.83,
      "accuracy": 83.3,
      "direction": "compressed",
      "createdAt": "2024-11-15T09:23:00.000Z"
    }
  ],
  "total": 47,
  "page": 1
}
```

---

## Analytics

### GET /analytics/:userId
Get computed analytics, derived entirely from measured sessions.

**Response (200):**
```json
{
  "success": true,
  "analytics": {
    "totalSessions": 47,
    "totalActualSeconds": 86400,
    "avgAccuracy": 68.5,
    "avgPerceptionRatio": 0.86,
    "compressionRate": 55.3,
    "expansionRate": 14.9,
    "calibratedRate": 29.8,
    "consistencyScore": 0.74,
    "peakHour": 21,
    "timeMasteryScore": 71.2,
    "byActivity": {
      "coding": { "count": 22, "avgRatio": 0.74, "avgAccuracy": 72.1, "totalSeconds": 48000 },
      "admin":  { "count": 8,  "avgRatio": 1.28, "avgAccuracy": 55.0, "totalSeconds": 9000 }
    },
    "byState": {
      "focused": { "count": 18, "avgRatio": 0.72, "avgAccuracy": 74.0, "totalSeconds": 40000 }
    },
    "dailySessions": [
      { "date": "2024-11-15", "count": 4, "totalSeconds": 7200, "avgAccuracy": 70.2 }
    ]
  }
}
```

> `perceptionRatio` / `avgPerceptionRatio` = estimated ÷ actual. 1.0 = perfectly
> accurate; < 1 = time flew (compressed); > 1 = time dragged (expanded).
> `accuracy` (0–100) is symmetric closeness regardless of direction.
> `timeMasteryScore = 0.5·avgAccuracy + 0.3·compressionRate + 0.2·(consistencyScore·100)`.

---

## Insights

### GET /insights/:userId
Get an insight report derived from the user's measured analytics. The `source`
field is honest about how it was produced: `rule-based` (free, deterministic,
on-device) or `llm` (Pro tier, only when the user is on the `pro` plan and an
API key is configured — see [[insightService]]).

**Response (200):**
```json
{
  "success": true,
  "insight": {
    "id": "64f1b2c3d4e5f6a7b8c9d0e3",
    "summary": "Across 47 measured sessions, your time-perception accuracy is 68.5/100... time tends to fly for you, a hallmark of deep engagement.",
    "patterns": [
      "Time most often flies in the evening, around 9 PM — likely your natural deep-work window.",
      "\"coding\" makes time fly the most (ratio 0.74) — your strongest flow trigger.",
      "When you feel \"tired\", time consistently expands — emotional state is shaping your perception."
    ],
    "recommendations": [
      "Schedule your hardest work between 9 PM–11 PM, when time tends to compress for you.",
      "\"admin\" feels long — try shorter timeboxed blocks (e.g. 25 min) to keep it from dragging."
    ],
    "source": "rule-based",
    "analyticsSnapshot": {
      "avgAccuracy": 68.5,
      "avgPerceptionRatio": 0.86,
      "compressionRate": 55.3,
      "consistencyScore": 0.74,
      "peakHour": 21,
      "timeMasteryScore": 71.2
    },
    "createdAt": "2024-11-15T10:00:00.000Z"
  }
}
```

---

## Error Responses

All errors follow this shape:

```json
{
  "success": false,
  "error": "Descriptive error message",
  "code": "ERROR_CODE"
}
```

Common codes: `UNAUTHORIZED`, `NOT_FOUND`, `VALIDATION_ERROR`, `SERVER_ERROR`
