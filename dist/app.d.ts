import { Application } from 'express';
import { IAppConfig, ICredentials } from './common/types';
export declare class App {
    private expressApp;
    private config;
    constructor(config: IAppConfig, credentials: ICredentials);
    getExpressApp(): Application;
    private setupMiddleware;
    private setupRoutes;
}
//# sourceMappingURL=app.d.ts.map