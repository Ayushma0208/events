/**
 * @swagger
 * tags:
 *   - name: Events
 *     description: Event ingestion and analytics APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       required:
 *         - userId
 *         - eventName
 *         - orgId
 *         - projectId
 *       properties:
 *         userId:
 *           type: string
 *         eventName:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *         orgId:
 *           type: string
 *         projectId:
 *           type: string
 */

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Ingest batched events (max 1000)
 *     tags: [Events]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/Event'
 *     responses:
 *       202:
 *         description: Events queued for ingestion
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /funnels:
 *   post:
 *     summary: Analyze user drop-off across funnel steps
 *     tags: [Events]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - steps
 *               - startDate
 *               - endDate
 *             properties:
 *               steps:
 *                 type: array
 *                 items:
 *                   type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Funnel analysis result
 */

/**
 * @swagger
 * /users/{id}/journey:
 *   get:
 *     summary: Get chronological journey of a user
 *     tags: [Events]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: Timeline of user events
 */

/**
 * @swagger
 * /retention:
 *   get:
 *     summary: Get user retention from a cohort event
 *     tags: [Events]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: cohort
 *         schema:
 *           type: string
 *         required: false
 *         description: "Cohort event name (default: signup)"
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *         required: false
 *         description: "Number of days to check retention (default: 7)"
 *     responses:
 *       200:
 *         description: Retention data by day
 */

/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: Get event count buckets by time interval
 *     tags: [Events]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: event
 *         schema:
 *           type: string
 *         required: true
 *         description: Event name to analyze
 *       - in: query
 *         name: interval
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *         required: false
 *         description: "Time interval (default: daily)"
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: "Start date (inclusive)"
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: "End date (inclusive)"
 *     responses:
 *       200:
 *         description: Aggregated event metrics
 */

/**
 * @swagger
 * /retention:
 *   get:
 *     summary: Get retention analytics for a cohort event
 *     tags: [Events]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: cohort
 *         schema:
 *           type: string
 *         description: "Name of the cohort event (e.g., signup). Default is \"signup\"."
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *         description: "Number of days to track retention (default: 7)"
 *     responses:
 *       200:
 *         description: Retention result per day
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cohortEvent:
 *                   type: string
 *                 retention:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       day:
 *                         type: integer
 *                       users:
 *                         type: integer
 */

/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: Get aggregated counts of an event by time interval
 *     tags: [Events]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: event
 *         required: true
 *         schema:
 *           type: string
 *         description: "Event name to aggregate (e.g., signup)"
 *       - in: query
 *         name: interval
 *         required: false
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *         description: "Time interval to group data (default: daily)"
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: "Start date (inclusive)"
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: "End date (inclusive)"
 *     responses:
 *       200:
 *         description: Time-bucketed counts of the specified event
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 event:
 *                   type: string
 *                 interval:
 *                   type: string
 *                 buckets:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                       count:
 *                         type: integer
 */
