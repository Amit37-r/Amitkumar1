import { LoggerService } from '../../common/logger/logger.service';
import { IConnectivityStatus } from './network-monitor.types';

export class NetworkMonitorService {
  private logger: LoggerService;
  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  private lastStatus: IConnectivityStatus = { isOnline: false, checkedAt: new Date() };
  private wasOffline = false;

  private static readonly CHECK_URL = 'https://dns.google';
  private static readonly TIMEOUT_MS = 5000;

  constructor() {
    this.logger = LoggerService.getInstance();
  }

  async checkConnectivity(): Promise<IConnectivityStatus> {
    const start = Date.now();

    try {
      const response = await fetch(NetworkMonitorService.CHECK_URL, {
        method: 'HEAD',
        signal: AbortSignal.timeout(NetworkMonitorService.TIMEOUT_MS),
      });

      this.lastStatus = {
        isOnline: response.ok,
        checkedAt: new Date(),
        latencyMs: Date.now() - start,
      };
    } catch {
      this.lastStatus = { isOnline: false, checkedAt: new Date() };
    }

    return this.lastStatus;
  }

  start(intervalMs: number, onReconnect: () => void | Promise<void>): void {
    if (this.intervalHandle) clearInterval(this.intervalHandle);

    // Initial check
    this.checkConnectivity().then((status) => {
      if (status.isOnline) onReconnect();
    });

    this.intervalHandle = setInterval(async () => {
      const previouslyOnline = this.lastStatus.isOnline;
      const status = await this.checkConnectivity();

      if (status.isOnline && (this.wasOffline || !previouslyOnline)) {
        this.wasOffline = false;
        this.logger.info('NetworkMonitorService', 'Network restored');
        await onReconnect();
      } else if (!status.isOnline) {
        this.wasOffline = true;
      }
    }, intervalMs);
  }

  stop(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  isOnline(): boolean {
    return this.lastStatus.isOnline;
  }

  getStatus(): IConnectivityStatus {
    return { ...this.lastStatus };
  }
}
