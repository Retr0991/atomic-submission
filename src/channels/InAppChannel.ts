import { v4 as uuid } from 'uuid';
import { db } from '../data/store.js';
import type { NotificationDelivery } from '../domain/models.js';
import type { ChannelStrategy, DeliveryContext } from './Channel.js';

/**
 * InAppChannel
 *
 * Implements the ChannelStrategy interface for in-app notifications.
 * This class is responsible for delivering alerts to users via the in-app channel.
 * Extensible: Add new delivery channels (e.g., Email, SMS, Push) by implementing ChannelStrategy.
 */
export class InAppChannel implements ChannelStrategy {
  /**
   * The channel identifier for in-app delivery.
   */
  readonly channel = 'in_app' as const;

  /**
   * Deliver a notification to a user via the in-app channel.
   *
   * Note: This is a basic implementation for MVP. The logic here can be replaced or extended
   * to support more complex delivery requirements (e.g., batching, async, custom payloads).
   *
   * @param ctx - DeliveryContext containing alert and user information
   * @returns NotificationDelivery object representing the delivery event
   */
  deliver(ctx: DeliveryContext): NotificationDelivery {
    // Not a finalized implementation. This method can be customized for future delivery logic.
    const delivery: NotificationDelivery = {
      id: uuid(),
      alertId: ctx.alert.id,
      userId: ctx.userId,
      channel: this.channel,
      deliveredAt: new Date(),
    };
    db.deliveries.push(delivery);
    return delivery;
  }
}
