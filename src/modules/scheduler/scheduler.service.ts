import cron from 'node-cron';
import { IAppConfig, ICredentials } from '../../common/types';
import { LoggerService } from '../../common/logger/logger.service';
import { LineCounterService } from '../line-counter/line-counter.service';
import { EvaluatorService } from '../evaluator/evaluator.service';
import { AiGeneratorService } from '../ai-generator/ai-generator.service';
import { PostAutomatorService } from '../post-automator/post-automator.service';
import { OfflineQueueService } from '../offline-queue/offline-queue.service';
import { NetworkMonitorService } from '../network-monitor/network-monitor.service';
import { EmailService } from '../email/email.service';

export class SchedulerService {
  private logger: LoggerService;
  private lineCounter: LineCounterService;
  private evaluator: EvaluatorService;
  private aiGenerator: AiGeneratorService;
  private postAutomator: PostAutomatorService;
  private offlineQueue: OfflineQueueService;
  private networkMonitor: NetworkMonitorService;
  private emailService: EmailService | null;
  private config: IAppConfig;

  private scanTask: cron.ScheduledTask | null = null;
  private evaluationTask: cron.ScheduledTask | null = null;

  constructor(config: IAppConfig, credentials: ICredentials, networkMonitor: NetworkMonitorService) {
    this.config = config;
    this.logger = LoggerService.getInstance();
    this.lineCounter = new LineCounterService();
    this.evaluator = new EvaluatorService();
    this.aiGenerator = new AiGeneratorService();
    this.postAutomator = new PostAutomatorService(credentials);
    this.offlineQueue = new OfflineQueueService(credentials);
    this.networkMonitor = networkMonitor;

    // Email service is optional — only enabled if email env vars are configured
    this.emailService = process.env.EMAIL_USER ? new EmailService() : null;
  }

  start(): void {
    // Schedule scans
    const scanCron = `*/${this.config.scanIntervalMinutes} * * * *`;
    this.scanTask = cron.schedule(scanCron, () => this.runScan());

    // Schedule evaluation at deadline
    const [hour, minute] = this.config.deadline.split(':').map(Number);
    const evalCron = `${minute} ${hour} * * *`;
    this.evaluationTask = cron.schedule(evalCron, () => this.runEvaluation());

    this.logger.info('SchedulerService', `Started: scans every ${this.config.scanIntervalMinutes}min, evaluation at ${this.config.deadline}`);
  }

  stop(): void {
    this.scanTask?.stop();
    this.evaluationTask?.stop();
    this.scanTask = null;
    this.evaluationTask = null;
    this.logger.info('SchedulerService', 'Stopped');
  }

  private async runScan(): Promise<void> {
    try {
      await this.lineCounter.scanAll(this.config.codeFolders, this.config.githubRepos, this.config.githubToken);
    } catch (err) {
      this.logger.error('SchedulerService', `Scan failed: ${(err as Error).message}`);
    }
  }

  private async runEvaluation(): Promise<void> {
    try {
      const result = this.evaluator.evaluateDay(this.config.dailyTarget);

      // Generate post
      const request = result.passed
        ? { type: 'success' as const, context: { linesWritten: result.lineCount, streak: result.streak } }
        : { type: 'penalty' as const };

      const generated = await this.aiGenerator.generatePost(request);
      const sanitizedText = this.aiGenerator.sanitize(generated.text, this.config.codeFolders, this.config.publicFields);

      // Send email notification
      if (this.emailService) {
        await this.emailService.sendEmail({
          type: result.passed ? 'success' : 'penalty',
          text: sanitizedText,
          lineCount: result.lineCount,
          target: result.target,
          streak: result.streak,
          recipientEmail: process.env.RECIPIENT_EMAIL || '',
        });
      }

      // Publish or queue social media post
      const postRequest = { text: sanitizedText, platform: this.config.platform, type: request.type };

      if (this.networkMonitor.isOnline()) {
        const postResult = await this.postAutomator.publish(postRequest);
        if (!postResult.success) {
          this.offlineQueue.enqueue(postRequest);
        }
      } else {
        this.offlineQueue.enqueue(postRequest);
      }
    } catch (err) {
      this.logger.error('SchedulerService', `Evaluation pipeline failed: ${(err as Error).message}`);
    }
  }
}
