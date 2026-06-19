import { IPostRequest, IPostHistoryEntry } from './post-automator.types';
export declare class PostAutomatorAccessor {
    private db;
    constructor();
    logPost(request: IPostRequest, date: string): void;
    getHistory(limit?: number): IPostHistoryEntry[];
}
//# sourceMappingURL=post-automator.accessor.d.ts.map