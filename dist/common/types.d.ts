export type TPlatform = 'linkedin' | 'x';
export type TPostType = 'penalty' | 'success';
export type TDayStatus = 'pending' | 'success' | 'failed';
export type TLogLevel = 'info' | 'warn' | 'error' | 'debug';
export interface IGithubRepo {
    owner: string;
    repo: string;
    branch?: string;
}
export interface IAppConfig {
    mongoUri: string;
    jwtSecret: string;
    dailyTarget: number;
    deadline: string;
    scanIntervalMinutes: number;
    codeFolders: string[];
    githubRepos: IGithubRepo[];
    githubToken?: string;
    platform: TPlatform;
    ollamaUrl: string;
    ollamaModel: string;
    backendPort: number;
    frontendPort: number;
    publicFields: string[];
}
export interface ICredentials {
    linkedin?: {
        email: string;
        password: string;
    };
    x?: {
        username: string;
        password: string;
    };
    email?: IEmailConfig;
}
export interface IEmailConfig {
    smtpHost: string;
    smtpPort: number;
    senderEmail: string;
    senderPassword: string;
    recipientEmail: string;
}
//# sourceMappingURL=types.d.ts.map