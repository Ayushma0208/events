"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const eventSchema = new mongoose_1.default.Schema({
    userId: { type: String, required: true },
    eventName: { type: String, required: true },
    properties: { type: Object, default: {} },
    timestamp: { type: Date, default: Date.now },
    orgId: { type: String, required: true },
    projectId: { type: String, required: true },
});
exports.Event = mongoose_1.default.model('Event', eventSchema);
