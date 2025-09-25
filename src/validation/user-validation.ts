import { z } from 'zod';

export const requireUserSchema = z.object({
  userId: z.string().min(1),
});

export const readStateSchema = z.object({
  readState: z.enum(['read', 'unread']),
});
