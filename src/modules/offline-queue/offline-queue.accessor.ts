import { DatabaseService } from '../../common/database/database.service';
import { IQueuedPost } from './offline-queue.types';
import { TPlatform, TPostType } from '../../common/types';

export class OfflineQueueAccessor {
  private db: DatabaseService;

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  enqueue(text: string, platform: TPlatform, type: TPostType): IQueuedPost {
    const conn = this.db.getConnection();

    const result = conn.prepare(
      `INSERT INTO post_queue (text, platform, post_type, status, attempts) VALUES (?, ?, ?, 'pending', 0)`
    ).run(text, platform, type);

    const row = conn.prepare(
      'SELECT id, text, platform, post_type, created_at, attempts, last_attempt_at, status FROM post_queue WHERE id = ?'
    ).get(result.lastInsertRowid) as {
      id: number; text: string; platform: TPlatform; post_type: TPostType;
      created_at: string; attempts: number; last_attempt_at: string | null; status: string;
    };

    return {
      id: row.id,
      text: row.text,
      platform: row.platform,
      type: row.post_type,
      createdAt: new Date(row.created_at),
      attempts: row.attempts,
      lastAttemptAt: null,
      status: 'pending',
    };
  }

  getPendingPosts(): IQueuedPost[] {
    const conn = this.db.getConnection();

    const rows = conn.prepare(
      `SELECT id, text, platform, post_type, created_at, attempts, last_attempt_at, status
       FROM post_queue WHERE status = 'pending' ORDER BY created_at ASC`
    ).all() as Array<{
      id: number; text: string; platform: TPlatform; post_type: TPostType;
      created_at: string; attempts: number; last_attempt_at: string | null; status: string;
    }>;

    return rows.map((r) => ({
      id: r.id,
      text: r.text,
      platform: r.platform,
      type: r.post_type,
      createdAt: new Date(r.created_at),
      attempts: r.attempts,
      lastAttemptAt: r.last_attempt_at ? new Date(r.last_attempt_at) : null,
      status: 'pending' as const,
    }));
  }

  markPublished(id: number): void {
    const conn = this.db.getConnection();
    conn.prepare(`DELETE FROM post_queue WHERE id = ?`).run(id);
  }

  incrementAttempt(id: number): void {
    const conn = this.db.getConnection();
    conn.prepare(
      `UPDATE post_queue SET attempts = attempts + 1, last_attempt_at = datetime('now') WHERE id = ?`
    ).run(id);
  }

  getQueueSize(): number {
    const conn = this.db.getConnection();
    const row = conn.prepare(`SELECT COUNT(*) as count FROM post_queue WHERE status = 'pending'`).get() as { count: number };
    return row.count;
  }
}
