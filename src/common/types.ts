// =============================================================================
// Shared types used across multiple modules
// =============================================================================

export type TPlatform = 'linkedin' | 'x';
export type TPostType = 'penalty' | 'success';
export type TDayStatus = 'pending' | 'success' | 'failed';
export type TLogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface IGithubRepo {
  owner: string;       // e.g. "amitkumar1"
  repo: string;        // e.g. "my-project"
  branch?: string;     // defaults to "main"
}

export interface IAppConfig {
  mongoUri: string;
  jwtSecret: string;
  dailyTarget: number;
  deadline: string;
  scanIntervalMinutes: number;
  codeFolders: string[];
  githubRepos: IGithubRepo[];  // GitHub repos to track
  githubToken?: string;        // Personal access token for private repos
  platform: TPlatform;
  ollamaUrl: string;
  ollamaModel: string;
  backendPort: number;
  frontendPort: number;
  publicFields: string[];
}

export interface ICredentials {
  linkedin?: { email: string; password: string };
  x?: { username: string; password: string };
  email?: IEmailConfig;
}

export interface IEmailConfig {
  smtpHost: string;         // e.g. "smtp.gmail.com"
  smtpPort: number;         // e.g. 587
  senderEmail: string;      // your email
  senderPassword: string;   // app password (not your real password)
  recipientEmail: string;   // who gets the shame/success email
}
