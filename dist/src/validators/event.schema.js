"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventsBatchSchema = exports.eventSchema = void 0;
const zod_1 = require("zod");
exports.eventSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    eventName: zod_1.z.string(),
    properties: zod_1.z.record(zod_1.z.any(), zod_1.z.any()).optional(),
    timestamp: zod_1.z.string().datetime().optional(),
    orgId: zod_1.z.string(),
    projectId: zod_1.z.string(),
});
exports.eventsBatchSchema = zod_1.z.array(exports.eventSchema).max(1000);
