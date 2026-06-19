import { ICredentials } from '../../common/types';
import { IQueuedPost, IQueueFlushResult } from './offline-queue.types';
import { IPostRequest } from '../post-automator/post-automator.types';
export declare class OfflineQueueService {
    private accessor;
    private postAutomator;
    private logger;
    constructor(credentials: ICredentials);
    enqueue(request: IPostRequest): IQueuedPost;
    flush(): Promise<IQueueFlushResult>;
    getPendingPosts(): IQueuedPost[];
    getQueueSize(): number;
}
//# sourceMappingURL=offline-queue.service.d.ts.map