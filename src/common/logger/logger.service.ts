import { appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { TLogLevel } from '../types';

export class LoggerService {
  private static instance: LoggerService;
  private logFilePath: string;
  private redactValues: string[] = [];

  private constructor(logFilePath: string) {
    this.logFilePath = logFilePath;
    const dir = dirname(logFilePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  static initialize(logFilePath: string): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService(logFilePath);
    }
    return LoggerService.instance;
  }

  static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      // Fallback to console-only mode
      LoggerService.instance = new LoggerService('/dev/null');
    }
    return LoggerService.instance;
  }

  setRedactValues(values: string[]): void {
    this.redactValues = values.filter((v) => v.length > 0);
  }

  info(module: string, message: string, metadata?: Record<string, unknown>): void {
    this.write('info', module, message, metadata);
  }

  warn(module: string, message: string, metadata?: Record<string, unknown>): void {
    this.write('warn', module, message, metadata);
  }

  error(module: string, message: string, metadata?: Record<string, unknown>): void {
    this.write('error', module, message, metadata);
  }

  debug(module: string, message: string, metadata?: Record<string, unknown>): void {
    this.write('debug', module, message, metadata);
  }

  private write(level: TLogLevel, module: string, message: string, metadata?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const redactedMessage = this.redact(message);
    const meta = metadata ? ` ${JSON.stringify(this.redactObject(metadata))}` : '';
    const line = `[${timestamp}] [${level.toUpperCase()}] [${module}] ${redactedMessage}${meta}`;

    console.log(line);

    try {
      appendFileSync(this.logFilePath, line + '\n', 'utf-8');
    } catch {
      // Fail silently for file write errors
    }
  }

  private redact(text: string): string {
    let result = text;
    for (const value of this.redactValues) {
      result = result.replaceAll(value, '[REDACTED]');
    }
    return result;
  }

  private redactObject(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = typeof value === 'string' ? this.redact(value) : value;
    }
    return result;
  }
}
