import { TPlatform, TPostType } from '../../common/types';
export interface IQueuedPost {
    id: number;
    text: string;
    platform: TPlatform;
    type: TPostType;
    createdAt: Date;
    attempts: number;
    lastAttemptAt: Date | null;
    status: TQueueStatus;
}
export type TQueueStatus = 'pending' | 'published' | 'failed';
export interface IQueueFlushResult {
    published: number;
    failed: number;
}
//# sourceMappingURL=offline-queue.types.d.ts.map