"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const analytics_controller_1 = require("../controllers/analytics.controller");
const event_controller_1 = require("../controllers/event.controller");
const apiKeyAuth_1 = require("../middlewares/apiKeyAuth");
const router = express_1.default.Router();
router.post('/events', apiKeyAuth_1.apiKeyAuth, event_controller_1.ingestEvents);
router.post('/funnels', apiKeyAuth_1.apiKeyAuth, analytics_controller_1.computeFunnel);
router.get('/users/:id/journey', apiKeyAuth_1.apiKeyAuth, analytics_controller_1.getUserJourney);
router.get('/retention', apiKeyAuth_1.apiKeyAuth, analytics_controller_1.getRetention);
router.get('/metrics', apiKeyAuth_1.apiKeyAuth, analytics_controller_1.getEventMetrics);
exports.default = router;
