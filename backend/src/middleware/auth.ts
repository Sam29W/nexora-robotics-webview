import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabase';

// Extend Express Request interface to include authenticated user
export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: string;
  user_metadata?: Record<string, any>;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Authentication Middleware:
 * 1. Checks for Authorization header with Bearer token.
 * 2. Validates the token against Supabase Auth.
 * 3. Derives the authenticated user ID strictly from the verified token claims.
 * 4. Never trusts user IDs passed in query parameters or request bodies.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Missing or malformed Authorization header with Bearer token',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Token is missing',
    });
    return;
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({
        success: false,
        error: error ? error.message : 'Unauthorized: Invalid or expired access token',
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      user_metadata: user.user_metadata,
    };

    next();
  } catch (err: any) {
    console.error('Auth middleware unexpected error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error during authentication verification',
    });
  }
}
