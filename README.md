# Alerting & Notification Platform (MVP)

Lightweight, extensible alerting/notification backend designed with clean OOP, strategy pattern for channels, in-memory storage with seeds, and a simple reminder engine.

- Admin: create/update/list alerts with org/team/user audience
- End user: fetch alerts, read/unread, snooze-for-today
- Reminder simulation: re-trigger every 2 hours by endpoint
- Analytics summary

## Tech

- Node.js + TypeScript (ESM)
- Express, Zod, Dayjs, UUID
- In-memory store (no DB) for demo
- Strategy pattern for channels (MVP: in-app)

## Getting Started

1) Install

```bash
npm install
```

2) Run (dev, ESM-friendly)

```bash
npm run dev
```

Server starts at `http://localhost:3000`.

3) Health

```bash
curl http://localhost:3000/health
```

## Seed Data

Database is in-memory and seeded on boot.

- Teams: Engineering, Marketing, Operations
- Users: Alice(Engineering), Bob(Engineering), Cara(Marketing), Dave(no team)

Discover exact IDs:

```bash
curl http://localhost:3000/admin/seeds | jq
```

Example structure:

```json
{
  "teams": [{"id":"...","name":"Engineering"}],
  "users": [{"id":"...","name":"Alice","teamId":"..."}]
}
```

## API Overview

Base URL: `http://localhost:3000`

### Admin

- List alerts

```bash
curl "http://localhost:3000/admin/alerts"
```

Query params: `severity=info|warning|critical`, `status=active|expired`, `audienceType=organization|teams|users`

- Create alert

```bash
curl -X POST http://localhost:3000/admin/alerts \
  -H 'Content-Type: application/json' \
  -d '{
    "title":"Security Training",
    "message":"Complete by Friday",
    "severity":"warning",
    "audience": {"type":"organization"},
    "reminderFrequencyMinutes":120,
    "startAt": null,
    "expiresAt": null,
    "remindersEnabled": true
  }'
```

- Update alert

```bash
curl -X PUT http://localhost:3000/admin/alerts/ALERT_ID \
  -H 'Content-Type: application/json' \
  -d '{"remindersEnabled": false}'
```

- Seed helper

```bash
curl http://localhost:3000/admin/seeds | jq
```

### User

- Fetch visible alerts for a user

```bash
curl "http://localhost:3000/user/alerts?userId=USER_ID" | jq
```

Includes per-user state: `readState`, `snoozedToday`, `lastDeliveredAt`.

- Mark read/unread

```bash
curl -X POST "http://localhost:3000/user/alerts/ALERT_ID/read-state?userId=USER_ID" \
  -H 'Content-Type: application/json' \
  -d '{"readState":"read"}'
```

- Snooze alert for today

```bash
curl -X POST "http://localhost:3000/user/alerts/ALERT_ID/snooze?userId=USER_ID"
```

Snoozing suppresses reminders for the rest of the day. Next day, reminders resume if still active.

### Reminders (Simulation)

- Trigger reminder run (now)

```bash
curl -X POST http://localhost:3000/reminder/run | jq
```

- Trigger reminder run at specific time

```bash
curl -X POST http://localhost:3000/reminder/run \
  -H 'Content-Type: application/json' \
  -d '{"now":"2025-01-10T12:00:00Z"}' | jq
```

Returns list of deliveries performed.

### Analytics

- Summary

```bash
curl http://localhost:3000/analytics/summary | jq
```

Returns totals and per-alert breakdowns: deliveries, read counts, snoozed counts, severity breakdown.

## Architecture

- `src/domain` — core types and helpers (`Alert`, `User`, `Team`, audience, state)
- `src/data` — in-memory store and seeding
- `src/channels` — Strategy pattern for delivery (MVP: `InAppChannel`)
- `src/services` — business services: alerts, delivery, preferences, analytics
- `src/scheduler` — `ReminderService` simulates 2h reminder cadence
- `src/routes` — Express routes grouped by responsibility
- `src/index.ts` — app bootstrap

For a deeper overview, see docs/architecture.md.

### Design Patterns

- Strategy: `ChannelStrategy` lets you plug new channels (email, SMS) without changing core logic.
- State: User alert preference represents read/unread and snooze-for-today.
- Separation of Concerns: CRUD vs delivery vs preferences vs analytics.

### Extensibility

- Add channel: implement `ChannelStrategy` and register in `DeliveryService`.
- Custom frequencies: set `reminderFrequencyMinutes` per alert; extend scheduler for cron-like timing.
- Persistence: replace `src/data/store.ts` with a repository adapter (e.g., Prisma) without changing services.

## Development

- Lint

```bash
npx eslint "src/**/*.{ts,tsx}"
```

- Build

```bash
npm run build
```

- Start built app

```bash
npm start
```

## Notes

This is an MVP. Real systems would add authentication, RBAC, durable storage, background job runner, and robust idempotency for deliveries.
