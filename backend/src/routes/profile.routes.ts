import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { requireAuth } from '../middleware/auth';

export const profileRouter = Router();

// Protect all profile routes using authentication middleware
profileRouter.use(requireAuth);

/**
 * @openapi
 * /api/v1/profile/me:
 *   get:
 *     summary: Retrieve current authenticated user profile
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile successfully retrieved
 *       401:
 *         description: Unauthorized
 */
profileRouter.get('/me', ProfileController.getMe);

/**
 * @openapi
 * /api/v1/profile/me:
 *   patch:
 *     summary: Update current authenticated user profile
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               display_name:
 *                 type: string
 *               bio:
 *                 type: string
 *               avatar_url:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, non-binary, other, unspecified]
 *               hobbies:
 *                 type: array
 *                 items:
 *                   type: string
 *               strengths:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Profile updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
profileRouter.patch('/me', ProfileController.updateMe);

/**
 * @openapi
 * /api/v1/profile/me/audit-logs:
 *   get:
 *     summary: Retrieve PostgreSQL trigger-generated audit logs for current user
 *     security:
 *       - BearerAuth: []
 */
profileRouter.get('/me/audit-logs', ProfileController.getMyAuditLogs);
