import { IAppConfig as AppConfig } from '../common/types';
export type { AppConfig };
declare function validateConfig(config: Record<string, unknown>): AppConfig;
export declare function loadConfig(configPath?: string): AppConfig;
export { validateConfig };
//# sourceMappingURL=configLoader.d.ts.map