import { db } from '../data/store.js';

export class AnalyticsService {
  getSummary() {
    const totalAlerts = db.alerts.length;
    const totalDeliveries = db.deliveries.length;

    const deliveryByAlert = new Map<string, number>();
    const readByAlert = new Map<string, number>();
    const snoozedByAlert = new Map<string, number>();

    for (const d of db.deliveries) {
      deliveryByAlert.set(d.alertId, (deliveryByAlert.get(d.alertId) ?? 0) + 1);
    }
    for (const p of db.userAlertPrefs) {
      if (p.readState === 'read') {
        readByAlert.set(p.alertId, (readByAlert.get(p.alertId) ?? 0) + 1);
      }
      if (p.lastSnoozedAt) {
        snoozedByAlert.set(p.alertId, (snoozedByAlert.get(p.alertId) ?? 0) + 1);
      }
    }

    const severityBreakdown = db.alerts.reduce(
      (acc, a) => {
        acc[a.severity] = (acc[a.severity] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      totalAlerts,
      totalDeliveries,
      deliveryByAlert: Object.fromEntries(deliveryByAlert),
      readByAlert: Object.fromEntries(readByAlert),
      snoozedByAlert: Object.fromEntries(snoozedByAlert),
      severityBreakdown,
    };
  }
}

