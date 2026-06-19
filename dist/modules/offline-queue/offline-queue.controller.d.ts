import { Request, Response } from 'express';
import { ICredentials } from '../../common/types';
export declare class OfflineQueueController {
    private service;
    constructor(credentials: ICredentials);
    getQueueStatus: (_req: Request, res: Response) => void;
    flushQueue: (_req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=offline-queue.controller.d.ts.map