import { DatabaseService } from '../../common/database/database.service';
export class EvaluatorAccessor {
    db;
    constructor() {
        this.db = DatabaseService.getInstance();
    }
    getStreak() {
        const conn = this.db.getConnection();
        const row = conn.prepare('SELECT current_streak, longest_streak, last_success_date FROM streak WHERE id = 1').get();
        return {
            currentStreak: row.current_streak,
            longestStreak: row.longest_streak,
            lastSuccessDate: row.last_success_date,
        };
    }
    updateStreak(streak) {
        const conn = this.db.getConnection();
        conn.prepare(`UPDATE streak SET current_streak = ?, longest_streak = ?, last_success_date = ?, updated_at = datetime('now') WHERE id = 1`).run(streak.currentStreak, streak.longestStreak, streak.lastSuccessDate);
    }
    getTodayLineCount(date) {
        const conn = this.db.getConnection();
        const row = conn.prepare('SELECT line_count FROM daily_records WHERE date = ?').get(date);
        return row?.line_count ?? 0;
    }
    markDayEvaluated(date, target, passed, lineCount) {
        const conn = this.db.getConnection();
        const existing = conn.prepare('SELECT id FROM daily_records WHERE date = ?').get(date);
        if (existing) {
            conn.prepare(`UPDATE daily_records SET target = ?, passed = ?, evaluated_at = datetime('now') WHERE date = ?`).run(target, passed ? 1 : 0, date);
        }
        else {
            conn.prepare(`INSERT INTO daily_records (date, line_count, target, passed, evaluated_at) VALUES (?, ?, ?, ?, datetime('now'))`).run(date, lineCount, target, passed ? 1 : 0);
        }
    }
    getDayStatus(date) {
        const conn = this.db.getConnection();
        const row = conn.prepare('SELECT passed, evaluated_at FROM daily_records WHERE date = ?').get(date);
        if (!row || !row.evaluated_at)
            return 'pending';
        return row.passed === 1 ? 'success' : 'failed';
    }
}
//# sourceMappingURL=evaluator.accessor.js.map