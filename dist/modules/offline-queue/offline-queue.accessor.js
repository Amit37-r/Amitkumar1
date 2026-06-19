import { DatabaseService } from '../../common/database/database.service';
export class OfflineQueueAccessor {
    db;
    constructor() {
        this.db = DatabaseService.getInstance();
    }
    enqueue(text, platform, type) {
        const conn = this.db.getConnection();
        const result = conn.prepare(`INSERT INTO post_queue (text, platform, post_type, status, attempts) VALUES (?, ?, ?, 'pending', 0)`).run(text, platform, type);
        const row = conn.prepare('SELECT id, text, platform, post_type, created_at, attempts, last_attempt_at, status FROM post_queue WHERE id = ?').get(result.lastInsertRowid);
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
    getPendingPosts() {
        const conn = this.db.getConnection();
        const rows = conn.prepare(`SELECT id, text, platform, post_type, created_at, attempts, last_attempt_at, status
       FROM post_queue WHERE status = 'pending' ORDER BY created_at ASC`).all();
        return rows.map((r) => ({
            id: r.id,
            text: r.text,
            platform: r.platform,
            type: r.post_type,
            createdAt: new Date(r.created_at),
            attempts: r.attempts,
            lastAttemptAt: r.last_attempt_at ? new Date(r.last_attempt_at) : null,
            status: 'pending',
        }));
    }
    markPublished(id) {
        const conn = this.db.getConnection();
        conn.prepare(`DELETE FROM post_queue WHERE id = ?`).run(id);
    }
    incrementAttempt(id) {
        const conn = this.db.getConnection();
        conn.prepare(`UPDATE post_queue SET attempts = attempts + 1, last_attempt_at = datetime('now') WHERE id = ?`).run(id);
    }
    getQueueSize() {
        const conn = this.db.getConnection();
        const row = conn.prepare(`SELECT COUNT(*) as count FROM post_queue WHERE status = 'pending'`).get();
        return row.count;
    }
}
//# sourceMappingURL=offline-queue.accessor.js.map