import Database from 'better-sqlite3';
import { resolve } from 'node:path';

export class DatabaseService {
  private static instance: DatabaseService;
  private db: Database.Database;

  private constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.runMigrations();
  }

  static initialize(dbPath?: string): DatabaseService {
    if (!DatabaseService.instance) {
      const path = dbPath ?? resolve(process.cwd(), 'data.db');
      DatabaseService.instance = new DatabaseService(path);
    }
    return DatabaseService.instance;
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      throw new Error('DatabaseService not initialized. Call DatabaseService.initialize() first.');
    }
    return DatabaseService.instance;
  }

  getConnection(): Database.Database {
    return this.db;
  }

  close(): void {
    this.db.close();
  }

  private runMigrations(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS daily_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL UNIQUE,
        line_count INTEGER NOT NULL DEFAULT 0,
        target INTEGER NOT NULL DEFAULT 0,
        passed INTEGER NOT NULL DEFAULT 0,
        evaluated_at TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS streak (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        current_streak INTEGER NOT NULL DEFAULT 0,
        longest_streak INTEGER NOT NULL DEFAULT 0,
        last_success_date TEXT,
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS post_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'x')),
        post_type TEXT NOT NULL CHECK (post_type IN ('penalty', 'success')),
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        attempts INTEGER NOT NULL DEFAULT 0,
        last_attempt_at TEXT,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'failed'))
      );

      CREATE TABLE IF NOT EXISTS post_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        platform TEXT NOT NULL,
        post_type TEXT NOT NULL CHECK (post_type IN ('penalty', 'success')),
        text TEXT NOT NULL,
        posted_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS scan_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        line_count INTEGER NOT NULL,
        files_changed TEXT,
        errors TEXT,
        scanned_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    // Singleton streak row
    const existing = this.db.prepare('SELECT id FROM streak WHERE id = 1').get();
    if (!existing) {
      this.db.prepare(
        `INSERT INTO streak (id, current_streak, longest_streak, updated_at) VALUES (1, 0, 0, datetime('now'))`
      ).run();
    }
  }
}
