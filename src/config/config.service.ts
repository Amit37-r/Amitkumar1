import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadEnv } from 'dotenv';
import { IAppConfig, ICredentials } from '../common/types';

// Load .env file
loadEnv({ path: resolve(process.cwd(), '.env') });

export class ConfigService {
  private config: IAppConfig;
  private credentials: ICredentials;

  constructor(configPath?: string, credentialsPath?: string) {
    this.config = this.loadConfig(configPath);
    this.credentials = this.loadCredentials(credentialsPath);
  }

  getConfig(): IAppConfig {
    return { ...this.config };
  }

  getCredentials(): ICredentials {
    return this.credentials;
  }

  updateConfig(updates: Partial<IAppConfig>): IAppConfig {
    this.config = { ...this.config, ...updates };
    return this.getConfig();
  }

  private loadConfig(configPath?: string): IAppConfig {
    const filePath = configPath ?? resolve(process.cwd(), 'config.json');

    if (!existsSync(filePath)) {
      console.error(`ERROR: config.json not found at ${filePath}`);
      process.exit(1);
    }

    const raw = JSON.parse(readFileSync(filePath, 'utf-8'));
    return this.validateConfig(raw);
  }

  private loadCredentials(credentialsPath?: string): ICredentials {
    const filePath = credentialsPath ?? resolve(process.cwd(), 'credentials.json');

    if (!existsSync(filePath)) {
      console.error(`ERROR: credentials.json not found at ${filePath}`);
      process.exit(1);
    }

    const raw = JSON.parse(readFileSync(filePath, 'utf-8'));
    return this.validateCredentials(raw);
  }

  private validateConfig(raw: Record<string, unknown>): IAppConfig {
    if ((!raw.codeFolders || !Array.isArray(raw.codeFolders) || raw.codeFolders.length === 0)
      && (!raw.githubRepos || !Array.isArray(raw.githubRepos) || (raw.githubRepos as unknown[]).length === 0)) {
      throw new Error('At least one of codeFolders or githubRepos must be a non-empty array');
    }

    return {
      mongoUri: process.env.MONGO_URI || (raw.mongoUri as string) || 'mongodb://localhost:27017/code-accountability',
      jwtSecret: process.env.JWT_SECRET || (raw.jwtSecret as string) || 'default-secret-change-me',
      dailyTarget: (raw.dailyTarget as number) ?? 50,
      deadline: (raw.deadline as string) ?? '23:59',
      scanIntervalMinutes: (raw.scanIntervalMinutes as number) ?? 5,
      codeFolders: (raw.codeFolders as string[]) ?? [],
      githubRepos: (raw.githubRepos as IAppConfig['githubRepos']) ?? [],
      githubToken: (raw.githubToken as string) ?? undefined,
      platform: (raw.platform as 'linkedin' | 'x') ?? 'linkedin',
      ollamaUrl: (raw.ollamaUrl as string) ?? 'http://localhost:11434',
      ollamaModel: (raw.ollamaModel as string) ?? 'llama3',
      backendPort: parseInt(process.env.PORT || '') || (raw.backendPort as number) || 4000,
      frontendPort: (raw.frontendPort as number) ?? 3000,
      publicFields: (raw.publicFields as string[]) ?? [],
    };
  }

  private validateCredentials(raw: Record<string, unknown>): ICredentials {
    return raw as unknown as ICredentials;
  }
}
