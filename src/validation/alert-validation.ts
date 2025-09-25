import { z } from 'zod';

export const audienceSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('organization') }),
  z.object({ type: z.literal('teams'), teamIds: z.array(z.string()).nonempty() }),
  z.object({ type: z.literal('users'), userIds: z.array(z.string()).nonempty() }),
]);

export const createAlertSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  severity: z.enum(['info', 'warning', 'critical']),
  audience: audienceSchema,
  reminderFrequencyMinutes: z.number().int().positive().optional(),
  startAt: z.preprocess(
    (val) => (val === '' || val == null ? undefined : val),
    z.coerce.date().optional(),
  ),
  expiresAt: z.preprocess(
    (val) => (val === '' || val == null ? undefined : val),
    z.coerce.date().optional(),
  ),
  remindersEnabled: z.boolean().optional(),
});

export const updateAlertSchema = createAlertSchema.partial().extend({
  isArchived: z.boolean().optional(),
});
