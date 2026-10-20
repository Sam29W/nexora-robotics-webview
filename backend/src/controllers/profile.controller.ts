import { Request, Response } from 'express';
import { ProfileService } from '../services/profile.service';
import { updateProfileSchema } from '../validators/profile.validator';

export class ProfileController {
  /**
   * GET /api/v1/profile/me
   * Retrieves the authenticated user's profile.
   */
  static async getMe(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const userEmail = req.user!.email;

      const profile = await ProfileService.getProfile(userId, userEmail);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Internal server error retrieving profile',
      });
    }
  }

  /**
   * PATCH /api/v1/profile/me
   * Validates input with Zod and updates the authenticated user's profile.
   */
  static async updateMe(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      // Zod validation
      const parseResult = updateProfileSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: parseResult.error.flatten().fieldErrors,
        });
        return;
      }

      const updatedProfile = await ProfileService.updateProfile(userId, parseResult.data);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedProfile,
      });
    } catch (err: any) {
      console.error('Error updating profile:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Internal server error updating profile',
      });
    }
  }

  /**
   * GET /api/v1/profile/me/audit-logs
   * Retrieves trigger-generated audit logs for the authenticated user.
   */
  static async getMyAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const logs = await ProfileService.getAuditLogs(userId);

      res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Internal server error retrieving audit logs',
      });
    }
  }
}
