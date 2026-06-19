import { IAppConfig, ICredentials } from '../../common/types';
import { NetworkMonitorService } from '../network-monitor/network-monitor.service';
export declare class SchedulerService {
    private logger;
    private lineCounter;
    private evaluator;
    private aiGenerator;
    private postAutomator;
    private offlineQueue;
    private networkMonitor;
    private emailService;
    private config;
    private scanTask;
    private evaluationTask;
    constructor(config: IAppConfig, credentials: ICredentials, networkMonitor: NetworkMonitorService);
    start(): void;
    stop(): void;
    private runScan;
    private runEvaluation;
}
//# sourceMappingURL=scheduler.service.d.ts.map