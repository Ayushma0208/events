import express from 'express';
import { computeFunnel, getEventMetrics, getRetention, getUserJourney } from '../controllers/analytics.controller';
import { ingestEvents } from '../controllers/event.controller';
import { apiKeyAuth } from '../middlewares/apiKeyAuth';

const router = express.Router();

router.post('/events', apiKeyAuth, ingestEvents);
router.post('/funnels', apiKeyAuth, computeFunnel);
router.get('/users/:id/journey', apiKeyAuth, getUserJourney);
router.get('/retention', apiKeyAuth, getRetention);
router.get('/metrics', apiKeyAuth, getEventMetrics);
export default router;
