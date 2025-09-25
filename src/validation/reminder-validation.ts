import { z } from 'zod';

export const reminderRunSchema = z.object({
  now: z.coerce.date().optional(),
});
