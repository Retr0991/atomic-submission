# Architecture Overview

This document describes the MVP Alerting & Notification Platform’s structure, core flows, and extension points.

## Goals

- Admin-configurable alerts with audience targeting (org/teams/users)
- End-user visibility, read/unread, and snooze-for-today
- Reminder cadence (default 2h) until snoozed or expired
- Clean OOP, strategy for channels, separation of concerns

## Tech Stack

- Node.js + TypeScript (ESM)
- Express, Zod, Dayjs, UUID
- In-memory store with seeds (no persistent DB for MVP)

## High-level Architecture

- API layer (Express routes): admin, user, reminders, analytics
- Domain layer: core models and audience definitions
- Services: alert CRUD, delivery orchestration, preferences, analytics, reminders
- Channels: strategy pattern for delivery (MVP: in-app)
- Data layer: in-memory store and seeds

```text
[Routes] → [Services] → [Channels] ↘
           ↘ [Domain Models]      [Data Store]
```

## Source Map

- src/index.ts — app bootstrap and route wiring
- src/domain/models.ts — types/interfaces: Alert, User, Team, Audience, enums
- src/data/store.ts — in-memory collections (alerts, users, teams, deliveries, prefs)
- src/data/seeds.ts — initial users/teams and helper endpoint payloads
- src/channels/Channel.ts — ChannelStrategy interface
- src/channels/InAppChannel.ts — in-app implementation and delivery logging
- src/services/AlertService.ts — alert CRUD, visibility filtering, status (active/expired)
- src/services/DeliveryService.ts — send via channels, record deliveries
- src/services/PreferenceService.ts — read/unread, snooze-for-today, lastDeliveredAt
- src/services/AnalyticsService.ts — totals, reads, snoozes, severity breakdown
- src/scheduler/ReminderService.ts — reminder run: eligible alerts × users
- src/routes/admin.ts — admin endpoints
- src/routes/user.ts — user endpoints
- src/routes/reminder.ts — trigger reminder run (simulation)
- src/routes/analytics.ts — analytics summary

## Core Data Shapes (conceptual)

- Alert
  - id, title, message, severity: info|warning|critical
  - audience: organization | teams(teamIds[]) | users(userIds[])
  - remindersEnabled: boolean
  - reminderFrequencyMinutes: number (default 120)
  - startAt?: ISO string | null
  - expiresAt?: ISO string | null
- User: id, name, teamId?
- Team: id, name
- UserAlertPreference
  - userId, alertId
  - readState: read|unread
  - snoozedOn?: ISO date (YYYY-MM-DD)
  - lastDeliveredAt?: ISO timestamp
- NotificationDelivery: id, userId, alertId, channel, deliveredAt, metadata?

## Visibility Resolution

- organization: all users
- teams: users whose teamId ∈ teamIds
- users: only listed userIds

## Reminder Logic (simulation)

- Triggered by POST /reminder/run (optionally with `now` timestamp)
- Eligible when:
  - Alert is active (now in [startAt, expiresAt] if provided)
  - remindersEnabled = true
  - User not snoozed today (snoozedOn != today)
  - lastDeliveredAt is null OR now - lastDeliveredAt ≥ reminderFrequencyMinutes
- On delivery: record NotificationDelivery and update lastDeliveredAt
- Snooze: set snoozedOn = today; resumes next day if still active

## API Surface

- Admin
  - GET /admin/alerts?severity=&status=&audienceType=
  - POST /admin/alerts
  - PUT /admin/alerts/:alertId
  - GET /admin/seeds
- User
  - GET /user/alerts?userId=...
  - POST /user/alerts/:alertId/read-state?userId=...  body: { readState: read|unread }
  - POST /user/alerts/:alertId/snooze?userId=...
- Reminders
  - POST /reminder/run  body optional: { now: ISOString }
- Analytics
  - GET /analytics/summary

## Design Patterns

- Strategy: per-channel delivery (MVP: in-app). Add email/SMS by implementing ChannelStrategy and registering it.
- State: per-user alert preference encodes read/unread and snooze state.
- SRP/SoC: CRUD vs delivery vs reminders vs analytics are separated into services.

## Extensibility

- Channels: add new strategy implementations (email, SMS)
- Frequencies: `reminderFrequencyMinutes` supported today; cron-like schedules can extend ReminderService
- Persistence: swap `src/data/store.ts` for a repository layer without changing services
- Auth/RBAC: add middleware in routes; keep services pure
- Escalations: add a policy module consumed by ReminderService/DeliveryService

## Non-functional Notes

- In-memory store: ephemeral; suitable for demo and tests
- Idempotency: deliveries keyed by (user, alert, timestamp window) if needed for real systems
- Time: Dayjs used; ensure consistent timezone handling (e.g., UTC for snooze day key)

## Local Development

- Install: npm install
- Run (dev): npm run dev → <http://localhost:3000>
- Health: GET /health
- Seeds: GET /admin/seeds to discover user/team IDs

## Future Scope

- Email/SMS channels, push notifications
- Cron/scheduled times, custom frequencies UI
- Escalation rules (auto-upgrade severity)
- RBAC and authentication
- Durable storage and background workers
