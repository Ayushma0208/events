"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
exports.eventQueue = new bullmq_1.Queue('event-ingestion', {
    connection: redis_1.redis,
});
