import type { Alert, DeliveryChannel, NotificationDelivery } from '../domain/models.js';

export interface DeliveryContext {
  alert: Alert;
  userId: string;
}

export interface ChannelStrategy {
  readonly channel: DeliveryChannel;
  deliver(ctx: DeliveryContext): NotificationDelivery;
}

