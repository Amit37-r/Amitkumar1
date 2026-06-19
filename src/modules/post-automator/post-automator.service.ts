import { chromium, Browser, Page } from 'playwright';
import { ICredentials } from '../../common/types';
import { LoggerService } from '../../common/logger/logger.service';
import { PostAutomatorAccessor } from './post-automator.accessor';
import { IPostRequest, IPostResult, IPostHistoryEntry } from './post-automator.types';

export class PostAutomatorService {
  private accessor: PostAutomatorAccessor;
  private logger: LoggerService;
  private credentials: ICredentials;

  private static readonly MAX_RETRIES = 2;

  constructor(credentials: ICredentials) {
    this.accessor = new PostAutomatorAccessor();
    this.logger = LoggerService.getInstance();
    this.credentials = credentials;
  }

  async publish(request: IPostRequest): Promise<IPostResult> {
    const creds = this.credentials[request.platform];
    if (!creds) {
      return { success: false, platform: request.platform, postedAt: new Date(), error: 'No credentials for platform' };
    }

    let browser: Browser | null = null;

    try {
      browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();

      const loggedIn = await this.login(page, request.platform, creds);
      if (!loggedIn) {
        return { success: false, platform: request.platform, postedAt: new Date(), error: 'Login failed' };
      }

      for (let attempt = 1; attempt <= PostAutomatorService.MAX_RETRIES + 1; attempt++) {
        try {
          await this.composeAndPost(page, request.platform, request.text);
          this.accessor.logPost(request, this.getTodayDate());
          this.logger.info('PostAutomatorService', `Post published to ${request.platform}`);
          return { success: true, platform: request.platform, postedAt: new Date() };
        } catch (err) {
          if (attempt > PostAutomatorService.MAX_RETRIES) {
            return { success: false, platform: request.platform, postedAt: new Date(), error: (err as Error).message };
          }
          await this.sleep(2000);
        }
      }

      return { success: false, platform: request.platform, postedAt: new Date(), error: 'Unknown error' };
    } catch (err) {
      return { success: false, platform: request.platform, postedAt: new Date(), error: (err as Error).message };
    } finally {
      await browser?.close().catch(() => {});
    }
  }

  getHistory(limit?: number): IPostHistoryEntry[] {
    return this.accessor.getHistory(limit);
  }

  private async login(page: Page, platform: 'linkedin' | 'x', creds: Record<string, string>): Promise<boolean> {
    try {
      if (platform === 'linkedin') {
        await page.goto('https://www.linkedin.com/login', { waitUntil: 'networkidle' });
        await page.fill('#username', creds.email ?? '');
        await page.fill('#password', creds.password);
        await page.click('[data-litms-control-urn="login-submit"]');
        await page.waitForURL('**/feed/**', { timeout: 15_000 });
        return true;
      }

      if (platform === 'x') {
        await page.goto('https://x.com/i/flow/login', { waitUntil: 'networkidle' });
        await page.fill('input[autocomplete="username"]', creds.username ?? '');
        await page.click('button:has-text("Next")');
        await page.waitForTimeout(1500);
        await page.fill('input[type="password"]', creds.password);
        await page.click('button:has-text("Log in")');
        await page.waitForURL('**/home', { timeout: 15_000 });
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  private async composeAndPost(page: Page, platform: 'linkedin' | 'x', text: string): Promise<void> {
    if (platform === 'linkedin') {
      await page.click('button.share-box-feed-entry__trigger');
      await page.waitForTimeout(1000);
      await page.fill('[role="textbox"]', text);
      await page.waitForTimeout(500);
      await page.click('button.share-actions__primary-action');
      await page.waitForTimeout(3000);
      return;
    }

    if (platform === 'x') {
      await page.click('[data-testid="tweetTextarea_0"]');
      await page.waitForTimeout(500);
      await page.fill('[data-testid="tweetTextarea_0"]', text);
      await page.waitForTimeout(500);
      await page.click('[data-testid="tweetButtonInline"]');
      await page.waitForTimeout(3000);
      return;
    }

    throw new Error(`Unsupported platform: ${platform}`);
  }

  private getTodayDate(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
