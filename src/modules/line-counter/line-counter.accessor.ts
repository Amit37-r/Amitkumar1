import { DatabaseService } from '../../common/database/database.service';
import { IScanResult } from './line-counter.types';

export class LineCounterAccessor {
  private db: DatabaseService;

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  saveScanResult(date: string, result: IScanResult): void {
    const conn = this.db.getConnection();

    conn.prepare(
      `INSERT OR REPLACE INTO scan_log (date, line_count, files_changed, errors, scanned_at)
       VALUES (?, ?, ?, ?, datetime('now'))`
    ).run(date, result.netLines, JSON.stringify(result.filesChanged), JSON.stringify(result.errors));

    const existing = conn.prepare('SELECT id FROM daily_records WHERE date = ?').get(date);
    if (existing) {
      conn.prepare('UPDATE daily_records SET line_count = ? WHERE date = ?').run(result.netLines, date);
    } else {
      conn.prepare('INSERT INTO daily_records (date, line_count, target, passed) VALUES (?, ?, 0, 0)').run(date, result.netLines);
    }
  }

  getTodayLineCount(date: string): number {
    const conn = this.db.getConnection();
    const row = conn.prepare('SELECT line_count FROM daily_records WHERE date = ?').get(date) as { line_count: number } | undefined;
    return row?.line_count ?? 0;
  }

  getLastScanTime(date: string): string | null {
    const conn = this.db.getConnection();
    const row = conn.prepare(
      'SELECT scanned_at FROM scan_log WHERE date = ? ORDER BY scanned_at DESC LIMIT 1'
    ).get(date) as { scanned_at: string } | undefined;
    return row?.scanned_at ?? null;
  }
}
