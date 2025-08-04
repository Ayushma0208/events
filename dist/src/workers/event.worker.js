"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const socket_io_client_1 = require("socket.io-client");
const redis_1 = require("../config/redis");
const event_model_1 = require("../models/event.model");
dotenv_1.default.config();
// Connect MongoDB
mongoose_1.default.connect(process.env.MONGODB_URI || '');
// Connect to WebSocket server
const io = (0, socket_io_client_1.io)(process.env.SOCKET_SERVER || 'http://localhost:5000');
// BullMQ Worker
const worker = new bullmq_1.Worker('event-ingestion', async (job) => {
    const { events } = job.data;
    await event_model_1.Event.insertMany(events, { ordered: false });
    console.log(`✅ Inserted ${events.length} events`);
    // Emit live event count
    io.emit('event_count', {
        count: events.length,
        timestamp: new Date(),
    });
}, { connection: redis_1.redis });
// On Failure
worker.on('failed', (job, err) => {
    console.error(`❌ Job failed`, err);
});
