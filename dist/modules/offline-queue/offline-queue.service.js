import { LoggerService } from '../../common/logger/logger.service';
import { PostAutomatorService } from '../post-automator/post-automator.service';
import { OfflineQueueAccessor } from './offline-queue.accessor';
export class OfflineQueueService {
    accessor;
    postAutomator;
    logger;
    constructor(credentials) {
        this.accessor = new OfflineQueueAccessor();
        this.postAutomator = new PostAutomatorService(credentials);
        this.logger = LoggerService.getInstance();
    }
    enqueue(request) {
        const post = this.accessor.enqueue(request.text, request.platform, request.type);
        this.logger.info('OfflineQueueService', `Post queued: id=${post.id}, platform=${post.platform}`);
        return post;
    }
    async flush() {
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
            }
            else {
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
    getPendingPosts() {
        return this.accessor.getPendingPosts();
    }
    getQueueSize() {
        return this.accessor.getQueueSize();
    }
}
//# sourceMappingURL=offline-queue.service.js.map