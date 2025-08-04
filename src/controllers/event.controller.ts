import { NextFunction, Request, Response } from 'express';
import { eventQueue } from '../queues/event.queue';
import { eventsBatchSchema } from '../validators/event.schema';

export const ingestEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = eventsBatchSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid event format', details: parsed.error.format() });
    }

    const events = parsed.data.map(event => ({
      ...event,
      timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
    }));

    await eventQueue.add('bulk-ingest', { events });

    res.status(202).json({ message: 'Events queued for ingestion' });
  } catch (err) {
    next(err);
  }
};