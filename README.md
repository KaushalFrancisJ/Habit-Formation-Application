# HabitFlow — Habit Formation Application

A production-oriented full stack habit tracking application built with clean architecture, recurrence-based streak tracking, and secure session management.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Setup Guide](#setup-guide)
4. [Docker Setup](#docker-setup)
5. [Environment Variables](#environment-variables)
6. [Database Schema](#database-schema)
7. [Architecture](#architecture)
8. [Business Logic](#business-logic)
9. [API Endpoints](#api-endpoints)
10. [Security](#security)
11. [Design Decisions](#design-decisions)

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ |
| Framework | Express.js |
| Language | TypeScript (ESM) |
| ORM | Sequelize |
| Database | MySQL |
| Auth | JWT (jsonwebtoken) |
| Password Hashing | bcrypt |
| Validation | Zod |
| Cache (session) | In-memory Map with TTL |
| Cache (streaks) | Redis (optional, graceful fallback) |
| Rate Limiting | express-rate-limit |
| API Docs | Swagger UI (swagger-jsdoc + swagger-ui-express) |
| Date/Timezone | Luxon |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| HTTP Client | Axios |
| State Management | React Context |
| Charts | Recharts |

---

## Project Structure

```
habit-formation-app/
├── src/                        # Backend source
│   ├── config/
│   │   ├── env.ts              # Environment variable loader
│   │   ├── appSettings.ts      # DB-driven runtime config loader
│   │   └── swagger.ts          # Swagger spec config
│   ├── db/
│   │   ├── models/             # Sequelize models
│   │   ├── associations.ts     # All model relationships
│   │   └── sequelize.ts        # DB connection
│   ├── cache/
│   │   ├── memCache.ts         # In-memory TTL cache (sessions)
│   │   └── redis.ts            # Redis client (optional)
│   ├── middleware/
│   │   ├── auth.ts             # JWT + session validation
│   │   ├── rateLimiter.ts      # IP / IP+user rate limiters
│   │   ├── requestLogger.ts    # HTTP request logger
│   │   └── errorHandler.ts     # Global error handler
│   ├── routes/                 # Express routers with Swagger JSDoc
│   ├── controllers/            # Request/response handlers
│   ├── services/               # Business logic
│   ├── repositories/           # All DB queries
│   ├── validators/             # Zod schemas
│   ├── types/                  # TypeScript type augmentations
│   ├── app.ts                  # Express app setup
│   └── server.ts               # Entry point
├── db/
│   ├── migrations/             # sequelize-cli migrations (.cjs)
│   ├── seeders/                # sequelize-cli seeders (.cjs)
│   └── config.cjs              # DB config (reads from .env)
├── client/                     # Frontend source
│   └── src/
│       ├── api/                # Axios instance + API calls
│       ├── context/            # AuthContext
│       ├── components/         # Reusable UI components
│       ├── pages/              # Route-level page components
│       └── types/              # Shared TypeScript interfaces
├── .env                        # Local environment variables
├── .env.example                # Environment variable reference
├── .sequelizerc                # sequelize-cli path config
├── package.json
└── tsconfig.json
```

---

## Setup Guide

### Prerequisites

- Node.js 20+
- MySQL 8+
- Redis (optional — app runs without it)

### 1. Clone and install

```bash
git clone <repository-url>
cd "habit formation application"
npm install
cd client && npm install && cd ..
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your database credentials. See [Environment Variables](#environment-variables) for all options.

### 3. Create the database

```bash
npx sequelize-cli db:create
```

### 4. Run migrations

```bash
npm run db:migrate
```

### 5. Seed initial settings

```bash
npm run db:seed
```

### 6. Start the backend

```bash
npm run dev
```

Backend runs on `http://localhost:3000`

### 7. Start the frontend

```bash
cd client
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies `/api` requests to the backend automatically.

### 8. API Documentation

Swagger UI is available at:

```
http://localhost:3000/api/docs
```

---

## Docker Setup

The entire stack — backend, frontend, MySQL, and Redis — can be run with a single command using Docker Compose.

### Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)

### Services

| Service | Image | Port |
|---|---|---|
| `backend` | Built from `Dockerfile` | `3000` |
| `frontend` | Built from `client/Dockerfile`, served via nginx | `80` |
| `mysql` | `mysql:8` | `3306` |
| `redis` | `redis:7-alpine` | `6379` |

### 1. Configure environment

```bash
cp .env.example .env
```

Edit `.env` — at minimum set `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, and the rate limit variables.

### 2. Build and start all services

```bash
docker compose up --build
```

On first boot the backend container automatically runs migrations and seeds before starting the server.

### 3. Access the app

| URL | Description |
|---|---|
| `http://localhost` | Frontend (React app) |
| `http://localhost:3000/api/docs` | Swagger UI |
| `http://localhost:3000/health` | Backend health check |

### 4. Stop all services

```bash
docker compose down
```

To also remove the MySQL volume (wipes all data):

```bash
docker compose down -v
```

### Notes

- The backend waits for MySQL to be healthy before starting (via `healthcheck` + `depends_on`)
- Redis is optional — if the Redis container is removed, the backend falls back to DB-based streak calculation automatically
- MySQL data is persisted in a named Docker volume (`mysql_data`) across restarts
- In the Docker setup, the frontend nginx container proxies all `/api` requests to the backend container — no CORS configuration needed

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `3000` | Server port |
| `NODE_ENV` | No | `development` | Environment |
| `DB_HOST` | Yes | — | MySQL host |
| `DB_PORT` | No | `3306` | MySQL port |
| `DB_NAME` | Yes | — | Database name |
| `DB_USER` | Yes | — | Database user |
| `DB_PASSWORD` | No | `""` | Database password |
| `REDIS_HOST` | No | `127.0.0.1` | Redis host |
| `REDIS_PORT` | No | `6379` | Redis port |
| `REDIS_CONNECT_TIMEOUT_MS` | No | `3000` | Redis connection timeout before giving up |
| `RATE_LIMIT_WINDOW_MS` | Yes | — | Rate limit window in ms |
| `RATE_LIMIT_MAX_PUBLIC` | Yes | — | Max requests per window on public routes |
| `RATE_LIMIT_MAX_PROTECTED` | Yes | — | Max requests per window on protected routes |
| `JWT_SECRET` | Yes | — | Secret key for signing JWTs |
| `JWT_EXPIRES_IN` | No | `7d` | JWT hard expiry |

---

## Database Schema

### Entity Relationship Overview

```
users_t
  ├── user_passwords_t   (1:many — full password history)
  ├── user_sessions_t    (1:many — concurrent sessions)
  └── user_habits_t      (1:many — habits being tracked)
          └── habit_completion_t  (1:many — completion event log)

habits_t  ←── user_habits_t  (habit template referenced by user habit)

client_settings_t  (standalone — runtime configuration)
```

---

### `client_settings_t`

Runtime-configurable application settings. Loaded at startup, no redeploy needed to change behaviour.

| Column | Type | Description |
|---|---|---|
| `setting_key` | VARCHAR(100) PK | Setting identifier |
| `setting_value` | VARCHAR(255) | Value |
| `description` | VARCHAR(500) | Human-readable description |
| `updated_at` | DATETIME | Last modified |

**Default seed values:**

| Key | Default | Description |
|---|---|---|
| `session_idle_timeout_ms` | `1800000` | Session idle expiry (30 min) |
| `max_concurrent_sessions` | `3` | Max active sessions per user |
| `grace_period_daily_hours` | `4` | Grace window for daily habits |
| `grace_period_weekly_hours` | `48` | Grace window for weekly habits |

---

### `users_t`

| Column | Type | Notes |
|---|---|---|
| `id` | INT UNSIGNED PK | Auto increment |
| `name` | VARCHAR(255) | No constraints |
| `email` | VARCHAR(255) | Unique |
| `timezone` | VARCHAR(100) | IANA timezone string, profile default |
| `created_at` | DATETIME | |
| `updated_at` | DATETIME | |

---

### `user_passwords_t`

Stores full password history. Never deleted. Current password = latest by `created_at`.

| Column | Type | Notes |
|---|---|---|
| `id` | INT UNSIGNED PK | |
| `user_id` | INT UNSIGNED FK | → users_t.id |
| `password_hash` | VARCHAR(255) | bcrypt hash |
| `created_at` | DATETIME | |

> On password change, all historical hashes are checked to prevent reuse.

---

### `user_sessions_t`

| Column | Type | Notes |
|---|---|---|
| `session_token` | VARCHAR(512) PK | JWT token |
| `user_id` | INT UNSIGNED FK | → users_t.id |
| `timezone` | VARCHAR(100) | Captured from client at login — used for all completion date derivation |
| `last_accessed_at` | DATETIME | Updated on every authenticated request |
| `is_active` | BOOLEAN | False on logout or session expiry |
| `created_at` | DATETIME | |

**Indexes:** `user_id`, `(user_id, is_active)`

---

### `habits_t`

Master habit template. User-generated. Soft-deleted, never hard-deleted.

| Column | Type | Notes |
|---|---|---|
| `id` | INT UNSIGNED PK | |
| `title` | VARCHAR(255) | No uniqueness constraint |
| `description` | TEXT | Optional |
| `estimated_duration_minutes` | INT UNSIGNED | Optional |
| `difficulty_level` | ENUM | `EASY`, `MEDIUM`, `HARD` |
| `source` | ENUM | `USER`, `SYSTEM` (extensible to `COACH`, `AI`) |
| `created_by_user_id` | INT UNSIGNED FK | Nullable for SYSTEM habits |
| `created_at` | DATETIME | |
| `updated_at` | DATETIME | |
| `deleted_at` | DATETIME | Soft delete — NULL means active |

---

### `user_habits_t`

Represents a user actively pursuing a habit. Primary configuration table.

| Column | Type | Notes |
|---|---|---|
| `id` | INT UNSIGNED PK | |
| `user_id` | INT UNSIGNED FK | → users_t.id |
| `habit_id` | INT UNSIGNED FK | → habits_t.id |
| `frequency_type` | ENUM | `DAILY`, `WEEKLY` |
| `target_frequency` | INT UNSIGNED | e.g. 1 for daily, 3 for 3x/week |
| `grace_period_hours` | INT UNSIGNED | Overrides global setting if set |
| `status` | ENUM | `ACTIVE`, `PAUSED`, `COMPLETED`, `ARCHIVED` |
| `current_streak_count` | INT UNSIGNED | Cached — updated on each completion |
| `longest_streak_count` | INT UNSIGNED | Cached — updated on each completion |
| `started_at` | DATETIME | |
| `completed_at` | DATETIME | Set when status → COMPLETED |
| `paused_at` | DATETIME | Set when status → PAUSED |
| `archived_at` | DATETIME | Set when status → ARCHIVED |
| `created_at` | DATETIME | |
| `updated_at` | DATETIME | |

**Indexes:** `(user_id, status)`, `(user_id, habit_id)`

---

### `habit_completion_t`

Source-of-truth event log. All streaks and missed day calculations derive from this table.

| Column | Type | Notes |
|---|---|---|
| `id` | INT UNSIGNED PK | |
| `user_habit_id` | INT UNSIGNED FK | → user_habits_t.id |
| `started_at` | DATETIME | Optional — when user started the habit session |
| `completed_at` | DATETIME | UTC timestamp sent by client |
| `completion_date` | DATE | Derived server-side: `toLocalDate(completed_at, session.timezone)` |
| `duration_minutes` | INT UNSIGNED | Calculated from started_at → completed_at if both present |
| `notes` | TEXT | Optional |
| `completion_source` | ENUM | `MANUAL`, `SYSTEM` |
| `created_at` | DATETIME | |

**Indexes:** `(user_habit_id, completion_date)`, `(user_habit_id, completed_at)`

> `completion_date` is always the logical local date in the user's timezone — not the UTC date. A completion at 11:50 PM IST (UTC+5:30) that is submitted at 12:05 AM UTC will still record `completion_date` as the IST date.

---

## Architecture

### Backend Layers

```
Request
  └── Middleware (logger → rate limiter → auth)
        └── Route
              └── Controller        ← thin, handles req/res only
                    └── Service     ← business logic
                          └── Repository  ← all DB queries via Sequelize
```

### Session Management

1. On login, client sends `timezone` (IANA string e.g. `Asia/Kolkata`)
2. A JWT is issued (7-day hard expiry) and a session row is created in `user_sessions_t` with the timezone
3. On every authenticated request, the auth middleware:
   - Checks the in-memory `memCache` first (keyed by token, TTL = `session_idle_timeout_ms`)
   - On cache hit: updates `lastAccessedAt` in cache, allows through
   - On cache miss: queries `user_sessions_t`, validates idle time against `session_idle_timeout_ms`
   - If valid: repopulates cache, updates `last_accessed_at` in DB
   - If expired: returns `401`
4. On logout: cache entry deleted immediately, session marked `is_active = false`
5. Concurrent session limit enforced at login — oldest session auto-expired when limit is reached

### Streak Cache (Redis)

- Streak data cached in Redis under key `streak:{user_habit_id}`
- Invalidated on every new completion or habit edit
- If Redis is unavailable (connection timeout at startup), streak is calculated dynamically from `habit_completion_t` on every request

---

## Business Logic

### Habit Lifecycle

```
CREATE → ACTIVE → PAUSED ⇄ ACTIVE → COMPLETED
                         → ARCHIVED (soft delete)
```

- **ACTIVE**: tracked, streak calculated, completions accepted
- **PAUSED**: streak calculation suspended, completions blocked
- **COMPLETED**: user has internalized the habit, read-only
- **ARCHIVED**: soft-deleted, hidden from default list, history preserved

### Streak Calculation

Streaks represent consecutive successful recurrence periods — not raw daily completions.

**Daily habit:**
- Walk back day by day from today
- Each day must have at least 1 completion
- First missing day (outside grace period) breaks the streak
- If today is not yet completed but still within grace window, today is skipped (not penalised)

**Weekly habit:**
- Walk back week by week from the current week
- Each week must have completions ≥ `target_frequency`
- First week below target (outside grace period) breaks the streak
- Current week is skipped if still within the end-of-week grace window

### Grace Period

Configurable per habit (overrides global) or globally via `client_settings_t`:

| Setting | Default | Purpose |
|---|---|---|
| `grace_period_daily_hours` | 4 hours | Buffer after midnight for daily habits |
| `grace_period_weekly_hours` | 48 hours | Buffer after Sunday for weekly habits |

Grace periods prevent streak loss due to late submissions or timezone edge cases.

### Missed Days / Periods

Never stored. Always calculated dynamically:

- **Daily**: count of days since `started_at` with no completion and outside grace period
- **Weekly**: count of week windows where completions < `target_frequency` and grace period has passed

### Completion Duplicate Prevention

- **Daily**: max 1 completion per `completion_date`
- **Weekly**: max `target_frequency` completions per week window

### Password Policy

Enforced via Zod on registration and password change:
- Minimum 8 characters
- At least 2 numbers
- At least 1 special character

On password change, the new password is compared against all historical hashes in `user_passwords_t`. Reuse is rejected.

### Timezone Handling

- User's profile stores a default `timezone`
- At login, client sends current `timezone` (detected via `Intl.DateTimeFormat`)
- Session stores this timezone — used for all `completion_date` derivation during that session
- This correctly handles users travelling across timezones

---

## API Endpoints

Full interactive documentation available at `http://localhost:3000/api/docs` (Swagger UI).

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login, returns JWT |
| POST | `/api/auth/logout` | Yes | Invalidate current session |
| GET | `/api/auth/me` | Yes | Get current user profile |

### Habits

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/habits` | Yes | Create habit |
| GET | `/api/habits` | Yes | List habits (filter by `?status=ACTIVE`) |
| GET | `/api/habits/:id` | Yes | Get habit with streak + missed stats |
| PUT | `/api/habits/:id` | Yes | Update habit or change status |
| DELETE | `/api/habits/:id` | Yes | Soft delete habit |
| POST | `/api/habits/:id/complete` | Yes | Log a completion |
| GET | `/api/habits/:id/completions` | Yes | Get completion history |

### Dashboard

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/dashboard/summary` | Yes | Aggregated stats for all active habits |

### Request / Response Examples

**POST `/api/auth/register`**
```json
{
  "name": "John",
  "email": "john@example.com",
  "password": "Secure@123",
  "timezone": "Asia/Kolkata"
}
```

**POST `/api/auth/login`**
```json
{
  "email": "john@example.com",
  "password": "Secure@123",
  "timezone": "Asia/Kolkata"
}
```
Response:
```json
{
  "token": "<jwt>",
  "user": { "id": 1, "name": "John", "email": "john@example.com", "timezone": "Asia/Kolkata" }
}
```

**POST `/api/habits`**
```json
{
  "title": "Practice Guitar",
  "description": "30 minutes of focused practice",
  "difficulty_level": "MEDIUM",
  "frequency_type": "WEEKLY",
  "target_frequency": 3,
  "estimated_duration_minutes": 30,
  "grace_period_hours": 12
}
```

**POST `/api/habits/:id/complete`**
```json
{
  "completed_at": "2024-01-15T18:30:00.000Z",
  "started_at": "2024-01-15T18:00:00.000Z",
  "notes": "Practiced scales and chord transitions"
}
```

**GET `/api/dashboard/summary`** Response:
```json
{
  "totalActiveHabits": 3,
  "completedToday": 2,
  "completionPercentage": 75,
  "habits": [
    {
      "userHabitId": 1,
      "habitId": 1,
      "frequencyType": "DAILY",
      "currentStreak": 7,
      "longestStreak": 14,
      "missedCount": 0,
      "completedToday": true,
      "weeklyProgress": { "completed": 5, "target": 7 }
    }
  ]
}
```

---

## Security

| Concern | Implementation |
|---|---|
| Password hashing | bcrypt with 12 salt rounds |
| Password history | All hashes retained in `user_passwords_t`, reuse rejected |
| Authentication | JWT (Bearer token), 7-day hard expiry |
| Session idle timeout | Configurable via `client_settings_t`, enforced via in-memory cache + DB |
| Concurrent sessions | Configurable limit, oldest session auto-expired on overflow |
| Rate limiting | IP-only on public routes, IP+userId composite on protected routes |
| Input validation | Zod schemas on all request bodies |
| Protected routes | Auth middleware on all non-auth endpoints |
| Environment secrets | All credentials in `.env`, never hardcoded |
| Soft deletes | Habit data never hard-deleted, preserves audit trail |

---

## Design Decisions

### Why separate `habits_t` and `user_habits_t`?

`habits_t` is a template/definition. `user_habits_t` is the user's personal pursuit of that habit with their own recurrence config, streak data, and lifecycle state. This separation allows the same habit template to be reused across users in the future (e.g. system-defined habits, coach-assigned habits) without duplicating definitions.

### Why is `completion_date` derived server-side?

The client sends a UTC timestamp. The server converts it to a local date using the timezone stored on the session. This prevents incorrect date assignment for users in timezones far from UTC — a completion at 11:50 PM IST is still that day's completion even though the UTC timestamp is the next day.

### Why in-memory cache for sessions instead of always hitting the DB?

Every authenticated request would otherwise require a DB round-trip to validate the session. The in-memory cache with a TTL equal to `session_idle_timeout_ms` means the DB is only hit on cache miss (first request after idle, or after server restart). The cache is invalidated immediately on logout, so there is no window where a logged-out session appears valid.

### Why is Redis optional?

This is a prototype. Redis adds operational complexity. The app degrades gracefully — streak calculation falls back to a DB query if Redis is unavailable. The Redis connection attempt times out after 3 seconds and the server continues without it.

### Why store all password history?

Password reuse checks require comparing against previous hashes. Since bcrypt hashes are one-way, the only way to check reuse is to retain all historical hashes and run `bcrypt.compare` against each. Storage cost is negligible.

### Why `client_settings_t` instead of hardcoded config?

Session timeout, grace periods, and concurrent session limits are operational parameters that may need tuning without a redeploy. Storing them in the DB and loading at startup makes the system configurable by an admin without touching code.
