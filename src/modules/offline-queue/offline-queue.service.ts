import { ICredentials } from '../../common/types';
import { LoggerService } from '../../common/logger/logger.service';
import { PostAutomatorService } from '../post-automator/post-automator.service';
import { OfflineQueueAccessor } from './offline-queue.accessor';
import { IQueuedPost, IQueueFlushResult } from './offline-queue.types';
import { IPostRequest } from '../post-automator/post-automator.types';

export class OfflineQueueService {
  private accessor: OfflineQueueAccessor;
  private postAutomator: PostAutomatorService;
  private logger: LoggerService;

  constructor(credentials: ICredentials) {
    this.accessor = new OfflineQueueAccessor();
    this.postAutomator = new PostAutomatorService(credentials);
    this.logger = LoggerService.getInstance();
  }

  enqueue(request: IPostRequest): IQueuedPost {
    const post = this.accessor.enqueue(request.text, request.platform, request.type);
    this.logger.info('OfflineQueueService', `Post queued: id=${post.id}, platform=${post.platform}`);
    return post;
  }

  async flush(): Promise<IQueueFlushResult> {
    const pending = this.accessor.getPendingPosts();
    let published = 0;
    let failed = 0;

    for (const post of pending) {
      const result = await this.postAutomator.publish({
        text: post.text,
        platform: post.platform,
        type: post.type,
      });

      if (result.success) {
        this.accessor.markPublished(post.id);
        published++;
      } else {
        this.accessor.incrementAttempt(post.id);
        failed++;
        break; // Stop at first failure to preserve chronological order
      }
    }

    if (published > 0) {
      this.logger.info('OfflineQueueService', `Queue flush: ${published} published, ${failed} failed`);
    }

    return { published, failed };
  }

  getPendingPosts(): IQueuedPost[] {
    return this.accessor.getPendingPosts();
  }

  getQueueSize(): number {
    return this.accessor.getQueueSize();
  }
}
