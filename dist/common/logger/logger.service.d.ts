export declare class LoggerService {
    private static instance;
    private logFilePath;
    private redactValues;
    private constructor();
    static initialize(logFilePath: string): LoggerService;
    static getInstance(): LoggerService;
    setRedactValues(values: string[]): void;
    info(module: string, message: string, metadata?: Record<string, unknown>): void;
    warn(module: string, message: string, metadata?: Record<string, unknown>): void;
    error(module: string, message: string, metadata?: Record<string, unknown>): void;
    debug(module: string, message: string, metadata?: Record<string, unknown>): void;
    private write;
    private redact;
    private redactObject;
}
//# sourceMappingURL=logger.service.d.ts.map