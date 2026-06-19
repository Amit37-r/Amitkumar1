import { execSync } from 'node:child_process';
import { existsSync, statSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { LoggerService } from '../../common/logger/logger.service';
import { LineCounterAccessor } from './line-counter.accessor';
export class LineCounterService {
    accessor;
    logger;
    static CODE_EXTENSIONS = new Set([
        '.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.go', '.rs',
        '.c', '.cpp', '.h', '.hpp', '.cs', '.rb', '.php', '.swift',
        '.kt', '.scala', '.vue', '.svelte', '.html', '.css', '.scss',
    ]);
    constructor() {
        this.accessor = new LineCounterAccessor();
        this.logger = LoggerService.getInstance();
    }
    /**
     * Scans both local folders and GitHub repos, combines the results.
     */
    async scanAll(codeFolders, githubRepos, githubToken) {
        const localResult = this.scanLocalFolders(codeFolders);
        const githubResult = await this.scanGithubRepos(githubRepos, githubToken);
        const combined = {
            totalLinesAdded: localResult.totalLinesAdded + githubResult.totalLinesAdded,
            totalLinesDeleted: localResult.totalLinesDeleted + githubResult.totalLinesDeleted,
            netLines: (localResult.totalLinesAdded + githubResult.totalLinesAdded) - (localResult.totalLinesDeleted + githubResult.totalLinesDeleted),
            filesChanged: [...new Set([...localResult.filesChanged, ...githubResult.filesChanged])],
            errors: [...localResult.errors, ...githubResult.errors],
            scannedAt: new Date(),
        };
        // Persist
        try {
            this.accessor.saveScanResult(this.getTodayDate(), combined);
        }
        catch (err) {
            this.logger.error('LineCounterService', `Failed to persist scan: ${err.message}`);
        }
        this.logger.info('LineCounterService', `Scan complete: ${combined.netLines} net lines`, {
            files: combined.filesChanged.length,
            errors: combined.errors.length,
            sources: { local: codeFolders.length, github: githubRepos.length },
        });
        return combined;
    }
    /**
     * Legacy sync scan for local folders only.
     */
    scan(codeFolders) {
        return this.scanLocalFolders(codeFolders);
    }
    getTodayLineCount() {
        return this.accessor.getTodayLineCount(this.getTodayDate());
    }
    getLastScanTime() {
        return this.accessor.getLastScanTime(this.getTodayDate());
    }
    // ─── GitHub Scanning ────────────────────────────────────────────────
    async scanGithubRepos(repos, token) {
        let totalLinesAdded = 0;
        let totalLinesDeleted = 0;
        const filesChanged = [];
        const errors = [];
        for (const repo of repos) {
            try {
                const commits = await this.fetchTodayCommits(repo, token);
                for (const commit of commits) {
                    const details = await this.fetchCommitDetails(repo, commit.sha, token);
                    if (details.stats) {
                        totalLinesAdded += details.stats.additions;
                        totalLinesDeleted += details.stats.deletions;
                    }
                    if (details.files) {
                        for (const file of details.files) {
                            filesChanged.push(`${repo.owner}/${repo.repo}:${file.filename}`);
                        }
                    }
                }
                this.logger.info('LineCounterService', `GitHub: ${repo.owner}/${repo.repo} — ${commits.length} commits today`);
            }
            catch (err) {
                errors.push({ folder: `github:${repo.owner}/${repo.repo}`, message: err.message });
            }
        }
        return {
            totalLinesAdded,
            totalLinesDeleted,
            netLines: totalLinesAdded - totalLinesDeleted,
            filesChanged: [...new Set(filesChanged)],
            errors,
            scannedAt: new Date(),
        };
    }
    async fetchTodayCommits(repo, token) {
        const today = this.getTodayDate();
        const since = `${today}T00:00:00Z`;
        const branch = repo.branch ?? 'main';
        const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/commits?sha=${branch}&since=${since}&per_page=100`;
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'daily-code-accountability',
        };
        if (token)
            headers['Authorization'] = `Bearer ${token}`;
        const response = await fetch(url, { headers, signal: AbortSignal.timeout(15_000) });
        if (!response.ok) {
            throw new Error(`GitHub API returned ${response.status}: ${response.statusText}`);
        }
        return (await response.json());
    }
    async fetchCommitDetails(repo, sha, token) {
        const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/commits/${sha}`;
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'daily-code-accountability',
        };
        if (token)
            headers['Authorization'] = `Bearer ${token}`;
        const response = await fetch(url, { headers, signal: AbortSignal.timeout(15_000) });
        if (!response.ok) {
            throw new Error(`GitHub API returned ${response.status} for commit ${sha}`);
        }
        return (await response.json());
    }
    // ─── Local Folder Scanning ──────────────────────────────────────────
    scanLocalFolders(codeFolders) {
        let totalLinesAdded = 0;
        let totalLinesDeleted = 0;
        const filesChanged = [];
        const errors = [];
        for (const folder of codeFolders) {
            try {
                if (!existsSync(folder)) {
                    errors.push({ folder, message: 'Folder not found' });
                    continue;
                }
                if (!statSync(folder).isDirectory()) {
                    errors.push({ folder, message: 'Path is not a directory' });
                    continue;
                }
                const isGit = existsSync(join(folder, '.git'));
                if (isGit) {
                    const entries = this.scanGitFolder(folder);
                    for (const entry of entries) {
                        totalLinesAdded += entry.insertions;
                        totalLinesDeleted += entry.deletions;
                        filesChanged.push(entry.fileName);
                    }
                }
                else {
                    const files = this.scanNonGitFolder(folder);
                    filesChanged.push(...files);
                    totalLinesAdded += files.length;
                }
            }
            catch (err) {
                errors.push({ folder, message: err.message });
            }
        }
        const result = {
            totalLinesAdded,
            totalLinesDeleted,
            netLines: totalLinesAdded - totalLinesDeleted,
            filesChanged: [...new Set(filesChanged)],
            errors,
            scannedAt: new Date(),
        };
        try {
            this.accessor.saveScanResult(this.getTodayDate(), result);
        }
        catch (err) {
            this.logger.error('LineCounterService', `Failed to persist scan: ${err.message}`);
        }
        return result;
    }
    scanGitFolder(folder) {
        const today = this.getTodayDate();
        let output = '';
        try {
            output = execSync(`git log --since="${today}" --numstat --pretty=format:""`, {
                cwd: folder, encoding: 'utf-8', timeout: 30_000,
            });
        }
        catch {
            try {
                output = execSync('git diff --numstat', { cwd: folder, encoding: 'utf-8', timeout: 30_000 });
            }
            catch {
                return [];
            }
        }
        try {
            const uncommitted = execSync('git diff HEAD --numstat', { cwd: folder, encoding: 'utf-8', timeout: 30_000 });
            output += '\n' + uncommitted;
        }
        catch {
            // ignore
        }
        return this.parseNumstat(output);
    }
    parseNumstat(output) {
        const entries = [];
        const seen = new Set();
        for (const line of output.split('\n')) {
            const parts = line.trim().split('\t');
            if (parts.length < 3)
                continue;
            const [ins, del, fileName] = parts;
            if (ins === '-' || del === '-')
                continue;
            const insertions = parseInt(ins, 10);
            const deletions = parseInt(del, 10);
            if (isNaN(insertions) || isNaN(deletions))
                continue;
            if (!seen.has(fileName)) {
                seen.add(fileName);
                entries.push({ insertions, deletions, fileName });
            }
        }
        return entries;
    }
    scanNonGitFolder(folder) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        return this.findRecentFiles(folder, todayStart.getTime());
    }
    findRecentFiles(dir, since, depth = 0) {
        if (depth > 5)
            return [];
        const files = [];
        try {
            for (const entry of readdirSync(dir, { withFileTypes: true })) {
                if (entry.name.startsWith('.') || entry.name === 'node_modules')
                    continue;
                const fullPath = join(dir, entry.name);
                if (entry.isDirectory()) {
                    files.push(...this.findRecentFiles(fullPath, since, depth + 1));
                }
                else if (entry.isFile()) {
                    const ext = entry.name.substring(entry.name.lastIndexOf('.'));
                    if (!LineCounterService.CODE_EXTENSIONS.has(ext))
                        continue;
                    try {
                        if (statSync(fullPath).mtimeMs >= since)
                            files.push(fullPath);
                    }
                    catch { /* skip */ }
                }
            }
        }
        catch { /* skip unreadable dirs */ }
        return files;
    }
    getTodayDate() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
}
//# sourceMappingURL=line-counter.service.js.map