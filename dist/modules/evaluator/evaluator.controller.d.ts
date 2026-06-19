import { Request, Response } from 'express';
import { IAppConfig } from '../../common/types';
export declare class EvaluatorController {
    private service;
    private lineCounterService;
    constructor();
    getStatus: (config: IAppConfig) => (_req: Request, res: Response) => void;
    private computeDeadlineTimestamp;
}
//# sourceMappingURL=evaluator.controller.d.ts.map