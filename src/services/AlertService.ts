import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';
import { db } from '../data/store.js';
import type { Alert, AudienceScope, Severity, User } from '../domain/models.js';
import type { CreateAlertInput, UpdateAlertInput } from '../types/alert-service.types.js';

export class AlertService {
  create(input: CreateAlertInput): Alert {
    const now = new Date();
    const alert: Alert = {
      id: uuid(),
      title: input.title,
      message: input.message,
      severity: input.severity,
      deliveryChannels: ['in_app'],
      reminderFrequencyMinutes: input.reminderFrequencyMinutes ?? 120,
      startAt: input.startAt ?? now,
      expiresAt: input.expiresAt ?? null,
      remindersEnabled: input.remindersEnabled ?? true,
      audience: input.audience,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };
    db.alerts.push(alert);
    return alert;
  }

  update(id: string, input: UpdateAlertInput): Alert | null {
    const alert = db.alerts.find((a) => a.id === id);
    if (!alert) return null;
    Object.assign(alert, input);
    alert.updatedAt = new Date();
    return alert;
  }

  archive(id: string): boolean {
    const alert = db.alerts.find((a) => a.id === id);
    if (!alert) return false;
    alert.isArchived = true;
    alert.updatedAt = new Date();
    return true;
  }

  list(params?: {
    severity?: Severity;
    status?: 'active' | 'expired';
    audienceType?: AudienceScope['type'];
  }): Alert[] {
    const now = new Date();
    return db.alerts.filter((a) => {
      if (params?.severity && a.severity !== params.severity) return false;
      if (params?.audienceType && a.audience.type !== params.audienceType) return false;
      if (params?.status === 'active') {
        return (
          !a.isArchived && (!a.startAt || a.startAt <= now) && (!a.expiresAt || a.expiresAt > now)
        );
      }
      if (params?.status === 'expired') {
        return !!a.expiresAt && dayjs(a.expiresAt).isBefore(now);
      }
      return true;
    });
  }

  resolveAudienceUsers(audience: AudienceScope): User[] {
    if (audience.type === 'organization') return db.users;
    if (audience.type === 'teams') {
      const set = new Set(audience.teamIds);
      return db.users.filter((u) => (u.teamId ? set.has(u.teamId) : false));
    }
    if (audience.type === 'users') {
      const set = new Set(audience.userIds);
      return db.users.filter((u) => set.has(u.id));
    }
    return [];
  }
}
