import express from 'express';
import cors from 'cors';
import { registerRoutes } from './api/routes';
export class App {
    expressApp;
    config;
    constructor(config, credentials) {
        this.expressApp = express();
        this.config = config;
        this.setupMiddleware();
        this.setupRoutes(credentials);
    }
    getExpressApp() {
        return this.expressApp;
    }
    setupMiddleware() {
        this.expressApp.use(cors());
        this.expressApp.use(express.json());
    }
    setupRoutes(credentials) {
        const updateConfig = (updates) => {
            Object.assign(this.config, updates);
        };
        registerRoutes(this.expressApp, this.config, credentials, updateConfig);
    }
}
//# sourceMappingURL=app.js.map