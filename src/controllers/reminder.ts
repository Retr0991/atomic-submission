import { type Request, type Response } from 'express';
import { InMemoryReminderScheduler } from '../scheduler/ReminderService.js';
import type { ReminderScheduler } from '../scheduler/ReminderScheduler.js';
import { reminderRunSchema } from '../validation/reminder-validation.js';
import { z } from 'zod';

export class ReminderController {
  private readonly reminderScheduler: ReminderScheduler;

  constructor() {
    this.reminderScheduler = new InMemoryReminderScheduler();
  }

  runReminders = (req: Request, res: Response) => {
    const parsed = reminderRunSchema.safeParse(req.body ?? {});
    if (!parsed.success) return res.status(400).json(z.treeifyError(parsed.error));
    const deliveries = this.reminderScheduler.run(parsed.data.now ?? new Date());
    res.json({ deliveries });
  };
}
