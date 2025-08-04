import { Worker } from 'bullmq';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { io as ClientIO } from 'socket.io-client';
import { redis } from '../config/redis';
import { Event } from '../models/event.model';

dotenv.config();

// Connect MongoDB
mongoose.connect(process.env.MONGODB_URI || '');

// Connect to WebSocket server
const io = ClientIO(process.env.SOCKET_SERVER || 'http://localhost:5000');

// BullMQ Worker
const worker = new Worker(
  'event-ingestion',
  async job => {
    const { events } = job.data;

    await Event.insertMany(events, { ordered: false });

    console.log(`✅ Inserted ${events.length} events`);

    // Emit live event count
    io.emit('event_count', {
      count: events.length,
      timestamp: new Date(),
    });
  },
  { connection: redis }
);

// On Failure
worker.on('failed', (job, err) => {
  console.error(`❌ Job failed`, err);
});
