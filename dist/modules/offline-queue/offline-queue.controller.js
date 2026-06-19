import { OfflineQueueService } from './offline-queue.service';
export class OfflineQueueController {
    service;
    constructor(credentials) {
        this.service = new OfflineQueueService(credentials);
    }
    getQueueStatus = (_req, res) => {
        const size = this.service.getQueueSize();
        const pending = this.service.getPendingPosts();
        res.json({ size, posts: pending });
    };
    flushQueue = async (_req, res) => {
        const result = await this.service.flush();
        res.json(result);
    };
}
//# sourceMappingURL=offline-queue.controller.js.map