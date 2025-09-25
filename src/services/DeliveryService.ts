import { InAppChannel } from '../channels/InAppChannel.js';
import type { ChannelStrategy } from '../channels/Channel.js';
import type { Alert, NotificationDelivery } from '../domain/models.js';

export class DeliveryService {
  private channels: Map<string, ChannelStrategy> = new Map();

  constructor() {
    // Register default channel(s)
    const inApp = new InAppChannel();
    this.channels.set(inApp.channel, inApp);
  }

  deliverToUser(alert: Alert, userId: string): NotificationDelivery[] {
    return alert.deliveryChannels.map((c) => {
      const channel = this.channels.get(c);
      if (!channel) throw new Error(`Channel not registered: ${c}`);
      return channel.deliver({ alert, userId });
    });
  }
}

