import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole, SessionUser } from '../db/types';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: SessionUser;
    }
  }
}

const SESSION_SECRET = process.env.SESSION_SECRET || 'worktak_super_secret_session_key_2026_dev_mode';

export function signSessionToken(user: SessionUser): string {
  return jwt.sign(user, SESSION_SECRET, { expiresIn: '7d' });
}

export function verifySessionToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, SESSION_SECRET) as SessionUser;
  } catch (err) {
    return null;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.worktak_session;
  if (!token) {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Authentication required. No session cookie found.' },
    });
  }

  const user = verifySessionToken(token);
  if (!user) {
    res.clearCookie('worktak_session');
    return res.status(401).json({
      error: { code: 'INVALID_SESSION', message: 'Session expired or invalid.' },
    });
  }

  req.user = user;
  next();
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Role ${req.user.role} is not permitted for this resource.`,
          requiredRoles: allowedRoles,
        },
      });
    }

    next();
  };
}
