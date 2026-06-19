import { Request, Response } from 'express';
import { OfflineQueueService } from './offline-queue.service';
import { ICredentials } from '../../common/types';

export class OfflineQueueController {
  private service: OfflineQueueService;

  constructor(credentials: ICredentials) {
    this.service = new OfflineQueueService(credentials);
  }

  getQueueStatus = (_req: Request, res: Response): void => {
    const size = this.service.getQueueSize();
    const pending = this.service.getPendingPosts();
    res.json({ size, posts: pending });
  };

  flushQueue = async (_req: Request, res: Response): Promise<void> => {
    const result = await this.service.flush();
    res.json(result);
  };
}
