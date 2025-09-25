export type Severity = 'info' | 'warning' | 'critical';

export type DeliveryChannel = 'in_app' | 'email' | 'sms';

export interface Team {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  teamId: string | null;
}

export type AudienceScope =
  | { type: 'organization' }
  | { type: 'teams'; teamIds: string[] }
  | { type: 'users'; userIds: string[] };

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: Severity;
  deliveryChannels: DeliveryChannel[]; // MVP: ['in_app']
  reminderFrequencyMinutes: number; // MVP: 120
  startAt: Date | null; // null => start immediately
  expiresAt: Date | null; // null => never expires
  remindersEnabled: boolean; // default true
  audience: AudienceScope;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationDelivery {
  id: string;
  alertId: string;
  userId: string;
  channel: DeliveryChannel;
  deliveredAt: Date;
}

export type UserAlertReadState = 'unread' | 'read';

export interface UserAlertPreference {
  id: string;
  alertId: string;
  userId: string;
  readState: UserAlertReadState;
  lastSnoozedAt: Date | null; // if date is today, snoozed for the day
  updatedAt: Date;
}

export function isAlertActiveNow(alert: Alert, now: Date): boolean {
  if (alert.isArchived) return false;
  if (alert.startAt && alert.startAt > now) return false;
  if (alert.expiresAt && alert.expiresAt <= now) return false;
  return true;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

