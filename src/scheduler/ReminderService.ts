import type { ReminderScheduler } from './ReminderScheduler.js';
import dayjs from 'dayjs';
import { db } from '../data/store.js';
import { isAlertActiveNow } from '../domain/models.js';
import { AlertService } from '../services/AlertService.js';
import { DeliveryService } from '../services/DeliveryService.js';
import { PreferenceService } from '../services/PreferenceService.js';

export class InMemoryReminderScheduler implements ReminderScheduler {
  private alertService = new AlertService();
  private deliveryService = new DeliveryService();
  private prefService = new PreferenceService();

  scheduleAlert(_alert: any): void {
    // No-op for MVP; would add alert to schedule in real implementation
  }

  cancelAlert(_alertId: string): void {
    // No-op for MVP; would remove alert from schedule in real implementation
  }

  rescheduleAlert(_alert: any): void {
    // No-op for MVP; would update alert schedule in real implementation
  }

  run(now = new Date()) {
    const deliveries: { alertId: string; userId: string }[] = [];
    for (const alert of db.alerts) {
      if (!alert.remindersEnabled) continue;
      if (!isAlertActiveNow(alert, now)) continue;

      const users = this.alertService.resolveAudienceUsers(alert.audience);
      for (const user of users) {
        const lastDelivery = this.getLastDeliveryAt(alert.id, user.id);
        const shouldDeliver = this.shouldDeliverAlertToUser(alert.id, user.id, now, lastDelivery);
        if (!shouldDeliver) continue;
        if (this.prefService.isSnoozedForToday(alert.id, user.id, now)) continue;

        // Removed misplaced import
        deliveries.push({ alertId: alert.id, userId: user.id });
      }
    }
    return deliveries;
  }

  private getLastDeliveryAt(alertId: string, userId: string): Date | null {
    const d = [...db.deliveries]
      .filter((x) => x.alertId === alertId && x.userId === userId)
      .sort((a, b) => b.deliveredAt.getTime() - a.deliveredAt.getTime())[0];
    return d ? d.deliveredAt : null;
  }

  private shouldDeliverAlertToUser(
    alertId: string,
    userId: string,
    now: Date,
    lastDeliveryAt: Date | null,
  ): boolean {
    const alert = db.alerts.find((a) => a.id === alertId);
    if (!alert) return false;
    if (!lastDeliveryAt) return true; // never delivered
    const diffMinutes = dayjs(now).diff(dayjs(lastDeliveryAt), 'minute');
    return diffMinutes >= alert.reminderFrequencyMinutes;
  }
}
