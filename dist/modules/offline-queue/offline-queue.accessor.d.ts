import { IQueuedPost } from './offline-queue.types';
import { TPlatform, TPostType } from '../../common/types';
export declare class OfflineQueueAccessor {
    private db;
    constructor();
    enqueue(text: string, platform: TPlatform, type: TPostType): IQueuedPost;
    getPendingPosts(): IQueuedPost[];
    markPublished(id: number): void;
    incrementAttempt(id: number): void;
    getQueueSize(): number;
}
//# sourceMappingURL=offline-queue.accessor.d.ts.map