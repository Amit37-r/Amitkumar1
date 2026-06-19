import { DatabaseService } from '../../common/database/database.service';
export class PostAutomatorAccessor {
    db;
    constructor() {
        this.db = DatabaseService.getInstance();
    }
    logPost(request, date) {
        const conn = this.db.getConnection();
        conn.prepare(`INSERT INTO post_history (date, platform, post_type, text, posted_at) VALUES (?, ?, ?, ?, datetime('now'))`).run(date, request.platform, request.type, request.text);
    }
    getHistory(limit = 50) {
        const conn = this.db.getConnection();
        const rows = conn.prepare('SELECT id, date, platform, post_type, text, posted_at FROM post_history ORDER BY posted_at DESC LIMIT ?').all(limit);
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
//# sourceMappingURL=post-automator.accessor.js.map