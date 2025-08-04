"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const redis_1 = require("../config/redis");
const event_model_1 = require("../models/event.model");
dotenv_1.default.config();
mongoose_1.default.connect(process.env.MONGODB_URI || '');
const worker = new bullmq_1.Worker('event-ingestion', async (job) => {
    const { events } = job.data;
    await event_model_1.Event.insertMany(events, { ordered: false });
    console.log(`✅ Inserted ${events.length} events`);
}, { connection: redis_1.redis });
worker.on('failed', (job, err) => {
    console.error(`❌ Job failed`, err);
});
