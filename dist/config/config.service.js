import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadEnv } from 'dotenv';
// Load .env file
loadEnv({ path: resolve(process.cwd(), '.env') });
export class ConfigService {
    config;
    credentials;
    constructor(configPath, credentialsPath) {
        this.config = this.loadConfig(configPath);
        this.credentials = this.loadCredentials(credentialsPath);
    }
    getConfig() {
        return { ...this.config };
    }
    getCredentials() {
        return this.credentials;
    }
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
        return this.getConfig();
    }
    loadConfig(configPath) {
        const filePath = configPath ?? resolve(process.cwd(), 'config.json');
        if (!existsSync(filePath)) {
            console.error(`ERROR: config.json not found at ${filePath}`);
            process.exit(1);
        }
        const raw = JSON.parse(readFileSync(filePath, 'utf-8'));
        return this.validateConfig(raw);
    }
    loadCredentials(credentialsPath) {
        const filePath = credentialsPath ?? resolve(process.cwd(), 'credentials.json');
        if (!existsSync(filePath)) {
            console.error(`ERROR: credentials.json not found at ${filePath}`);
            process.exit(1);
        }
        const raw = JSON.parse(readFileSync(filePath, 'utf-8'));
        return this.validateCredentials(raw);
    }
    validateConfig(raw) {
        if ((!raw.codeFolders || !Array.isArray(raw.codeFolders) || raw.codeFolders.length === 0)
            && (!raw.githubRepos || !Array.isArray(raw.githubRepos) || raw.githubRepos.length === 0)) {
            throw new Error('At least one of codeFolders or githubRepos must be a non-empty array');
        }
        return {
            mongoUri: process.env.MONGO_URI || raw.mongoUri || 'mongodb://localhost:27017/code-accountability',
            jwtSecret: process.env.JWT_SECRET || raw.jwtSecret || 'default-secret-change-me',
            dailyTarget: raw.dailyTarget ?? 50,
            deadline: raw.deadline ?? '23:59',
            scanIntervalMinutes: raw.scanIntervalMinutes ?? 5,
            codeFolders: raw.codeFolders ?? [],
            githubRepos: raw.githubRepos ?? [],
            githubToken: raw.githubToken ?? undefined,
            platform: raw.platform ?? 'linkedin',
            ollamaUrl: raw.ollamaUrl ?? 'http://localhost:11434',
            ollamaModel: raw.ollamaModel ?? 'llama3',
            backendPort: parseInt(process.env.PORT || '') || raw.backendPort || 4000,
            frontendPort: raw.frontendPort ?? 3000,
            publicFields: raw.publicFields ?? [],
        };
    }
    validateCredentials(raw) {
        return raw;
    }
}
//# sourceMappingURL=config.service.js.map