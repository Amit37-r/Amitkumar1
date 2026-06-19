import { IConnectivityStatus } from './network-monitor.types';
export declare class NetworkMonitorService {
    private logger;
    private intervalHandle;
    private lastStatus;
    private wasOffline;
    private static readonly CHECK_URL;
    private static readonly TIMEOUT_MS;
    constructor();
    checkConnectivity(): Promise<IConnectivityStatus>;
    start(intervalMs: number, onReconnect: () => void | Promise<void>): void;
    stop(): void;
    isOnline(): boolean;
    getStatus(): IConnectivityStatus;
}
//# sourceMappingURL=network-monitor.service.d.ts.map