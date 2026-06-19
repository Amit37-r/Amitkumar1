import { Request } from 'express';
export interface IUser {
    _id: string;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface ISignupRequest {
    name: string;
    email: string;
    password: string;
}
export interface ILoginRequest {
    email: string;
    password: string;
}
export interface IAuthResponse {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
}
export interface IAuthenticatedRequest extends Request {
    userId?: string;
}
//# sourceMappingURL=auth.types.d.ts.map