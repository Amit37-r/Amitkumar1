import { ICredentials } from '../../common/types';
import { IPostRequest, IPostResult, IPostHistoryEntry } from './post-automator.types';
export declare class PostAutomatorService {
    private accessor;
    private logger;
    private credentials;
    private static readonly MAX_RETRIES;
    constructor(credentials: ICredentials);
    publish(request: IPostRequest): Promise<IPostResult>;
    getHistory(limit?: number): IPostHistoryEntry[];
    private login;
    private composeAndPost;
    private getTodayDate;
    private sleep;
}
//# sourceMappingURL=post-automator.service.d.ts.map