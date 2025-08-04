"use strict";
/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event ingestion and analytics routes
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
 *     summary: Ingest batched events (up to 1000)
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
 *         description: Invalid input
 */
