export interface IScanResult {
  totalLinesAdded: number;
  totalLinesDeleted: number;
  netLines: number;
  filesChanged: string[];
  errors: IScanError[];
  scannedAt: Date;
}

export interface IScanError {
  folder: string;
  message: string;
}

export interface IGitNumstatEntry {
  insertions: number;
  deletions: number;
  fileName: string;
}

export interface IGithubCommitStats {
  additions: number;
  deletions: number;
  total: number;
}

export interface IGithubCommit {
  sha: string;
  commit: { message: string; author: { date: string } };
  stats?: IGithubCommitStats;
  files?: Array<{ filename: string; additions: number; deletions: number }>;
}
