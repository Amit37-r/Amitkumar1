import { appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
export class LoggerService {
    static instance;
    logFilePath;
    redactValues = [];
    constructor(logFilePath) {
        this.logFilePath = logFilePath;
        const dir = dirname(logFilePath);
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }
    }
    static initialize(logFilePath) {
        if (!LoggerService.instance) {
            LoggerService.instance = new LoggerService(logFilePath);
        }
        return LoggerService.instance;
    }
    static getInstance() {
        if (!LoggerService.instance) {
            // Fallback to console-only mode
            LoggerService.instance = new LoggerService('/dev/null');
        }
        return LoggerService.instance;
    }
    setRedactValues(values) {
        this.redactValues = values.filter((v) => v.length > 0);
    }
    info(module, message, metadata) {
        this.write('info', module, message, metadata);
    }
    warn(module, message, metadata) {
        this.write('warn', module, message, metadata);
    }
    error(module, message, metadata) {
        this.write('error', module, message, metadata);
    }
    debug(module, message, metadata) {
        this.write('debug', module, message, metadata);
    }
    write(level, module, message, metadata) {
        const timestamp = new Date().toISOString();
        const redactedMessage = this.redact(message);
        const meta = metadata ? ` ${JSON.stringify(this.redactObject(metadata))}` : '';
        const line = `[${timestamp}] [${level.toUpperCase()}] [${module}] ${redactedMessage}${meta}`;
        console.log(line);
        try {
            appendFileSync(this.logFilePath, line + '\n', 'utf-8');
        }
        catch {
            // Fail silently for file write errors
        }
    }
    redact(text) {
        let result = text;
        for (const value of this.redactValues) {
            result = result.replaceAll(value, '[REDACTED]');
        }
        return result;
    }
    redactObject(obj) {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            result[key] = typeof value === 'string' ? this.redact(value) : value;
        }
        return result;
    }
}
//# sourceMappingURL=logger.service.js.map