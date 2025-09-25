import type { Alert, NotificationDelivery, Team, User, UserAlertPreference } from '../domain/models.js';

export interface InMemoryStore {
  teams: Team[];
  users: User[];
  alerts: Alert[];
  deliveries: NotificationDelivery[];
  userAlertPrefs: UserAlertPreference[];
}

export const db: InMemoryStore = {
  teams: [],
  users: [],
  alerts: [],
  deliveries: [],
  userAlertPrefs: [],
};

