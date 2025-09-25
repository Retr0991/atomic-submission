import type { Alert } from '../domain/models.js';

export interface ReminderScheduler {
  scheduleAlert(alert: Alert): void;
  cancelAlert(alertId: string): void;
  rescheduleAlert(alert: Alert): void;
  run(now: Date): any;
}
