import { IGithubRepo } from '../../common/types';
import { IScanResult } from './line-counter.types';
export declare class LineCounterService {
    private accessor;
    private logger;
    private static readonly CODE_EXTENSIONS;
    constructor();
    /**
     * Scans both local folders and GitHub repos, combines the results.
     */
    scanAll(codeFolders: string[], githubRepos: IGithubRepo[], githubToken?: string): Promise<IScanResult>;
    /**
     * Legacy sync scan for local folders only.
     */
    scan(codeFolders: string[]): IScanResult;
    getTodayLineCount(): number;
    getLastScanTime(): string | null;
    private scanGithubRepos;
    private fetchTodayCommits;
    private fetchCommitDetails;
    private scanLocalFolders;
    private scanGitFolder;
    private parseNumstat;
    private scanNonGitFolder;
    private findRecentFiles;
    private getTodayDate;
}
//# sourceMappingURL=line-counter.service.d.ts.map