import { DatabaseService } from '../../common/database/database.service';
import { IPostRequest, IPostHistoryEntry } from './post-automator.types';

export class PostAutomatorAccessor {
  private db: DatabaseService;

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  logPost(request: IPostRequest, date: string): void {
    const conn = this.db.getConnection();
    conn.prepare(
      `INSERT INTO post_history (date, platform, post_type, text, posted_at) VALUES (?, ?, ?, ?, datetime('now'))`
    ).run(date, request.platform, request.type, request.text);
  }

  getHistory(limit = 50): IPostHistoryEntry[] {
    const conn = this.db.getConnection();
    const rows = conn.prepare(
      'SELECT id, date, platform, post_type, text, posted_at FROM post_history ORDER BY posted_at DESC LIMIT ?'
    ).all(limit) as Array<{
      id: number; date: string; platform: string; post_type: string; text: string; posted_at: string;
    }>;

    return rows.map((r) => ({
      id: r.id,
      date: r.date,
      platform: r.platform,
      postType: r.post_type,
      text: r.text,
      postedAt: r.posted_at,
    }));
  }
}
