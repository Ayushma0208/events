"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingestEvents = void 0;
const event_queue_1 = require("../queues/event.queue");
const event_schema_1 = require("../validators/event.schema");
const ingestEvents = async (req, res, next) => {
    try {
        const parsed = event_schema_1.eventsBatchSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Invalid event format', details: parsed.error.format() });
        }
        const events = parsed.data.map(event => ({
            ...event,
            timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
        }));
        await event_queue_1.eventQueue.add('bulk-ingest', { events });
        res.status(202).json({ message: 'Events queued for ingestion' });
    }
    catch (err) {
        next(err);
    }
};
exports.ingestEvents = ingestEvents;
