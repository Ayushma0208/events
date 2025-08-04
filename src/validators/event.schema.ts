import { z } from 'zod';

export const eventSchema = z.object({
  userId: z.string(),
  eventName: z.string(),
  properties: z.record(z.any(), z.any()).optional(),
  timestamp: z.string().datetime().optional(),
  orgId: z.string(),
  projectId: z.string(),
});

export const eventsBatchSchema = z.array(eventSchema).max(1000);
