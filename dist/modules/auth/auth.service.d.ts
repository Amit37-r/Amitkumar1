import { ISignupRequest, ILoginRequest, IAuthResponse } from './auth.types';
export declare class AuthService {
    private jwtSecret;
    constructor(jwtSecret: string);
    signup(data: ISignupRequest): Promise<IAuthResponse>;
    login(data: ILoginRequest): Promise<IAuthResponse>;
    getUserById(userId: string): Promise<{
        id: string;
        name: string;
        email: string;
    } | null>;
    verifyToken(token: string): {
        userId: string;
    } | null;
    private generateToken;
}
//# sourceMappingURL=auth.service.d.ts.map