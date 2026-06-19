import { Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { IAuthenticatedRequest } from './auth.types';

export function authMiddleware(authService: AuthService) {
  return (req: IAuthenticatedRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = authService.verifyToken(token);

    if (!decoded) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    req.userId = decoded.userId;
    next();
  };
}
