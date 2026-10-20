import { Router, Request, Response } from 'express';
import { env } from '../config/env';

export const healthRouter = Router();

/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: System Health Check
 *     description: Returns the health status, uptime, and database connection state of the backend API.
 *     responses:
 *       200:
 *         description: System is healthy and operational.
 */
healthRouter.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'nexora-backend',
    environment: env.NODE_ENV,
    uptimeSeconds: Math.floor(process.uptime()),
    databaseConfigured: env.isConfigured,
  });
});
