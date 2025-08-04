"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIKey = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const apiKeySchema = new mongoose_1.default.Schema({
    key: { type: String, required: true, unique: true },
    orgId: { type: String, required: true },
    projectId: { type: String, required: true },
});
exports.APIKey = mongoose_1.default.model('APIKey', apiKeySchema);
