import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { IAuthenticatedRequest } from './auth.types';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    signup: (req: Request, res: Response) => Promise<void>;
    login: (req: Request, res: Response) => Promise<void>;
    me: (req: IAuthenticatedRequest, res: Response) => Promise<void>;
}
//# sourceMappingURL=auth.controller.d.ts.map