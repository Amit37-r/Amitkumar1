import express, { Application } from 'express';
import cors from 'cors';
import { IAppConfig, ICredentials } from './common/types';
import { registerRoutes } from './api/routes';

export class App {
  private expressApp: Application;
  private config: IAppConfig;

  constructor(config: IAppConfig, credentials: ICredentials) {
    this.expressApp = express();
    this.config = config;

    this.setupMiddleware();
    this.setupRoutes(credentials);
  }

  getExpressApp(): Application {
    return this.expressApp;
  }

  private setupMiddleware(): void {
    this.expressApp.use(cors());
    this.expressApp.use(express.json());
  }

  private setupRoutes(credentials: ICredentials): void {
    const updateConfig = (updates: Partial<IAppConfig>): void => {
      Object.assign(this.config, updates);
    };

    registerRoutes(this.expressApp, this.config, credentials, updateConfig);
  }
}
