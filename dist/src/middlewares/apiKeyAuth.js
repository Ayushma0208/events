"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiKeyAuth = void 0;
const apiKey_model_1 = require("../models/apiKey.model");
const apiKeyAuth = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
        return res.status(401).json({ error: 'API key missing' });
    }
    const keyRecord = await apiKey_model_1.APIKey.findOne({ key: apiKey });
    if (!keyRecord) {
        return res.status(403).json({ error: 'Invalid API key' });
    }
    // attach to request context
    req.orgId = keyRecord.orgId;
    req.projectId = keyRecord.projectId;
    next();
};
exports.apiKeyAuth = apiKeyAuth;
