"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventMetrics = exports.getRetention = exports.getUserJourney = exports.computeFunnel = void 0;
const event_model_1 = require("../models/event.model");
const computeFunnel = async (req, res, next) => {
    try {
        const { steps, startDate, endDate } = req.body;
        if (!Array.isArray(steps) || steps.length === 0) {
            return res.status(400).json({ error: 'Funnel steps are required' });
        }
        const orgId = req.orgId;
        const projectId = req.projectId;
        const events = await event_model_1.Event.aggregate([
            {
                $match: {
                    orgId,
                    projectId,
                    eventName: { $in: steps },
                    timestamp: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate),
                    },
                },
            },
            {
                $sort: { userId: 1, timestamp: 1 },
            },
            {
                $group: {
                    _id: '$userId',
                    events: { $push: '$eventName' },
                },
            },
        ]);
        const funnelCounts = steps.map(step => ({ step, users: 0 }));
        for (const user of events) {
            let progress = 0;
            for (const ev of user.events) {
                if (ev === steps[progress]) {
                    funnelCounts[progress].users++;
                    progress++;
                }
                if (progress === steps.length)
                    break;
            }
        }
        res.json({ funnel: funnelCounts });
    }
    catch (err) {
        next(err);
    }
};
exports.computeFunnel = computeFunnel;
const getUserJourney = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const orgId = req.orgId;
        const projectId = req.projectId;
        const events = await event_model_1.Event.find({ userId, orgId, projectId })
            .sort({ timestamp: 1 })
            .select('eventName timestamp -_id');
        res.json({
            userId,
            events,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getUserJourney = getUserJourney;
const getRetention = async (req, res, next) => {
    try {
        const cohortEvent = req.query.cohort?.toString() || 'signup';
        const days = parseInt(req.query.days) || 7;
        const orgId = req.orgId;
        const projectId = req.projectId;
        const startDate = new Date();
        startDate.setUTCHours(0, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setUTCDate(endDate.getUTCDate() + days);
        const cohortUsers = await event_model_1.Event.aggregate([
            {
                $match: {
                    orgId,
                    projectId,
                    eventName: cohortEvent,
                    timestamp: {
                        $gte: startDate,
                        $lt: new Date(startDate.getTime() + 86400000),
                    },
                },
            },
            {
                $group: {
                    _id: '$userId',
                },
            },
        ]).then(users => users.map(u => u._id));
        if (cohortUsers.length === 0) {
            return res.json({ cohortEvent, retention: [] });
        }
        const events = await event_model_1.Event.aggregate([
            {
                $match: {
                    orgId,
                    projectId,
                    userId: { $in: cohortUsers },
                    timestamp: { $gte: startDate, $lt: endDate },
                },
            },
            {
                $project: {
                    userId: 1,
                    dayOffset: {
                        $floor: {
                            $divide: [
                                { $subtract: ['$timestamp', startDate] },
                                1000 * 60 * 60 * 24,
                            ],
                        },
                    },
                },
            },
            {
                $group: {
                    _id: { day: '$dayOffset', user: '$userId' },
                },
            },
            {
                $group: {
                    _id: '$_id.day',
                    users: { $sum: 1 },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ]);
        const retention = [];
        for (let i = 0; i <= days; i++) {
            const entry = events.find(e => e._id === i);
            retention.push({ day: i, users: entry?.users || 0 });
        }
        res.json({ cohortEvent, retention });
    }
    catch (err) {
        next(err);
    }
};
exports.getRetention = getRetention;
const getEventMetrics = async (req, res, next) => {
    try {
        const eventName = req.query.event?.toString();
        const interval = req.query.interval?.toString() || 'daily';
        const orgId = req.orgId;
        const projectId = req.projectId;
        const from = new Date(req.query.from?.toString() || new Date());
        const to = new Date(req.query.to?.toString() || new Date());
        const format = interval === 'weekly' ? '%Y-%U' :
            interval === 'monthly' ? '%Y-%m' :
                '%Y-%m-%d';
        const events = await event_model_1.Event.aggregate([
            {
                $match: {
                    orgId,
                    projectId,
                    eventName,
                    timestamp: { $gte: from, $lte: to },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format, date: '$timestamp' },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ]);
        const buckets = events.map(e => ({
            date: e._id,
            count: e.count,
        }));
        res.json({ event: eventName, interval, buckets });
    }
    catch (err) {
        next(err);
    }
};
exports.getEventMetrics = getEventMetrics;
