import { Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { IAuthenticatedRequest } from './auth.types';
export declare function authMiddleware(authService: AuthService): (req: IAuthenticatedRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map