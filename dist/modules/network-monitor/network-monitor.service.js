import { LoggerService } from '../../common/logger/logger.service';
export class NetworkMonitorService {
    logger;
    intervalHandle = null;
    lastStatus = { isOnline: false, checkedAt: new Date() };
    wasOffline = false;
    static CHECK_URL = 'https://dns.google';
    static TIMEOUT_MS = 5000;
    constructor() {
        this.logger = LoggerService.getInstance();
    }
    async checkConnectivity() {
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
        }
        catch {
            this.lastStatus = { isOnline: false, checkedAt: new Date() };
        }
        return this.lastStatus;
    }
    start(intervalMs, onReconnect) {
        if (this.intervalHandle)
            clearInterval(this.intervalHandle);
        // Initial check
        this.checkConnectivity().then((status) => {
            if (status.isOnline)
                onReconnect();
        });
        this.intervalHandle = setInterval(async () => {
            const previouslyOnline = this.lastStatus.isOnline;
            const status = await this.checkConnectivity();
            if (status.isOnline && (this.wasOffline || !previouslyOnline)) {
                this.wasOffline = false;
                this.logger.info('NetworkMonitorService', 'Network restored');
                await onReconnect();
            }
            else if (!status.isOnline) {
                this.wasOffline = true;
            }
        }, intervalMs);
    }
    stop() {
        if (this.intervalHandle) {
            clearInterval(this.intervalHandle);
            this.intervalHandle = null;
        }
    }
    isOnline() {
        return this.lastStatus.isOnline;
    }
    getStatus() {
        return { ...this.lastStatus };
    }
}
//# sourceMappingURL=network-monitor.service.js.map