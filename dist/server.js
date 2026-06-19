import { resolve } from 'node:path';
import { ConfigService } from './config/config.service';
import { DatabaseService } from './common/database/database.service';
import { MongoService } from './common/database/mongo.service';
import { LoggerService } from './common/logger/logger.service';
import { NetworkMonitorService } from './modules/network-monitor/network-monitor.service';
import { OfflineQueueService } from './modules/offline-queue/offline-queue.service';
import { SchedulerService } from './modules/scheduler/scheduler.service';
import { App } from './app';
const NETWORK_CHECK_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
async function bootstrap() {
    // 1. Load config
    const configService = new ConfigService();
    const config = configService.getConfig();
    const credentials = configService.getCredentials();
    // 2. Initialize logger
    const logger = LoggerService.initialize(resolve(process.cwd(), 'logs', 'app.log'));
    const redactValues = [];
    if (credentials.linkedin?.password)
        redactValues.push(credentials.linkedin.password);
    if (credentials.linkedin?.email)
        redactValues.push(credentials.linkedin.email);
    if (credentials.x?.password)
        redactValues.push(credentials.x.password);
    if (credentials.x?.username)
        redactValues.push(credentials.x.username);
    logger.setRedactValues(redactValues);
    logger.info('Server', 'Daily Code Accountability starting...');
    // 3. Initialize database
    DatabaseService.initialize();
    logger.info('Server', 'Database initialized');
    // 3b. Connect to MongoDB
    const mongo = MongoService.getInstance();
    await mongo.connect(config.mongoUri);
    logger.info('Server', 'MongoDB connected');
    // 4. Start network monitor
    const networkMonitor = new NetworkMonitorService();
    const offlineQueue = new OfflineQueueService(credentials);
    networkMonitor.start(NETWORK_CHECK_INTERVAL_MS, async () => {
        logger.info('Server', 'Network restored — flushing queue');
        await offlineQueue.flush();
    });
    // 5. Start scheduler
    const scheduler = new SchedulerService(config, credentials, networkMonitor);
    scheduler.start();
    // 6. Start Express
    const app = new App(config, credentials);
    const server = app.getExpressApp().listen(config.backendPort, () => {
        logger.info('Server', `Running on http://localhost:${config.backendPort}`);
    });
    // 7. Graceful shutdown
    const shutdown = (signal) => {
        logger.info('Server', `${signal} received — shutting down`);
        scheduler.stop();
        networkMonitor.stop();
        DatabaseService.getInstance().close();
        MongoService.getInstance().disconnect();
        server.close(() => process.exit(0));
        setTimeout(() => process.exit(1), 5000);
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('uncaughtException', (err) => {
        logger.error('Server', `Uncaught: ${err.message}\n${err.stack}`);
        DatabaseService.getInstance().close();
        process.exit(1);
    });
}
bootstrap().catch((err) => {
    console.error('Fatal:', err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map