import { IAppConfig, ICredentials } from '../common/types';
export declare class ConfigService {
    private config;
    private credentials;
    constructor(configPath?: string, credentialsPath?: string);
    getConfig(): IAppConfig;
    getCredentials(): ICredentials;
    updateConfig(updates: Partial<IAppConfig>): IAppConfig;
    private loadConfig;
    private loadCredentials;
    private validateConfig;
    private validateCredentials;
}
//# sourceMappingURL=config.service.d.ts.map