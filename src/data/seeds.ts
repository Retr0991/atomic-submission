import { v4 as uuid } from 'uuid';
import { db } from './store.js';
import type { Alert, DeliveryChannel, Severity, Team, User } from '../domain/models.js';

function createTeam(name: string): Team {
  return { id: uuid(), name };
}

function createUser(name: string, teamId: string | null): User {
  return { id: uuid(), name, teamId };
}

function createAlert(
  title: string,
  message: string,
  severity: Severity,
  audience: Alert['audience'],
  channels: DeliveryChannel[] = ['in_app'],
): Alert {
  const now = new Date();
  return {
    id: uuid(),
    title,
    message,
    severity,
    deliveryChannels: channels,
    reminderFrequencyMinutes: 120,
    startAt: now,
    expiresAt: null,
    remindersEnabled: true,
    audience,
    isArchived: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function seed(): void {
  if (db.teams.length > 0) return; // seed once

  const eng = createTeam('Engineering');
  const mkt = createTeam('Marketing');
  const ops = createTeam('Operations');
  db.teams.push(eng, mkt, ops);

  const alice = createUser('Alice', eng.id);
  const bob = createUser('Bob', eng.id);
  const cara = createUser('Cara', mkt.id);
  const dave = createUser('Dave', null);
  db.users.push(alice, bob, cara, dave);

  const orgWide = createAlert(
    'Security Training',
    'Complete your annual security training by Friday.',
    'warning',
    { type: 'organization' },
  );
  const engOnly = createAlert(
    'Deploy Freeze',
    'Deploy freeze from 5pm Friday to 9am Monday.',
    'info',
    { type: 'teams', teamIds: [eng.id] },
  );
  const userOnly = createAlert(
    'Profile Incomplete',
    'Please update your emergency contact info.',
    'critical',
    { type: 'users', userIds: [alice.id] },
  );

  db.alerts.push(orgWide, engOnly, userOnly);
}

