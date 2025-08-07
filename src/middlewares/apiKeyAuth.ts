import { NextFunction, Request, Response } from 'express';
import { APIKey } from '../models/apiKey.model';

export const apiKeyAuth = async (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    return res.status(401).json({ error: 'API key missing' });
  }

  const keyRecord = await APIKey.findOne({ key: apiKey });
  if (!keyRecord) {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  (req as any).orgId = keyRecord.orgId;
  (req as any).projectId = keyRecord.projectId;

  next();
};
