import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';
import { db } from '../data/store.js';
import type { UserAlertPreference, UserAlertReadState } from '../domain/models.js';

export class PreferenceService {
  private getOrCreate(alertId: string, userId: string): UserAlertPreference {
    let pref = db.userAlertPrefs.find((p) => p.alertId === alertId && p.userId === userId);
    if (!pref) {
      pref = {
        id: uuid(),
        alertId,
        userId,
        readState: 'unread',
        lastSnoozedAt: null,
        updatedAt: new Date(),
      };
      db.userAlertPrefs.push(pref);
    }
    return pref;
  }

  setReadState(alertId: string, userId: string, state: UserAlertReadState): UserAlertPreference {
    const pref = this.getOrCreate(alertId, userId);
    pref.readState = state;
    pref.updatedAt = new Date();
    return pref;
  }

  snoozeForToday(alertId: string, userId: string): UserAlertPreference {
    const pref = this.getOrCreate(alertId, userId);
    pref.lastSnoozedAt = new Date();
    pref.updatedAt = new Date();
    return pref;
  }

  isSnoozedForToday(alertId: string, userId: string, now = new Date()): boolean {
    const pref = db.userAlertPrefs.find((p) => p.alertId === alertId && p.userId === userId);
    if (!pref || !pref.lastSnoozedAt) return false;
    return dayjs(pref.lastSnoozedAt).isSame(now, 'day');
  }
}

