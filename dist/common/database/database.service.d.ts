import Database from 'better-sqlite3';
export declare class DatabaseService {
    private static instance;
    private db;
    private constructor();
    static initialize(dbPath?: string): DatabaseService;
    static getInstance(): DatabaseService;
    getConnection(): Database.Database;
    close(): void;
    private runMigrations;
}
//# sourceMappingURL=database.service.d.ts.map