import { IEvaluationResult, TDayStatus } from './evaluator.types';
export declare class EvaluatorService {
    private accessor;
    private logger;
    constructor();
    evaluateDay(target: number): IEvaluationResult;
    getCurrentStreak(): number;
    getDayStatus(): TDayStatus;
    /**
     * Pure streak computation logic.
     * Exported as public for property-based testing.
     */
    computeStreak(previousStreak: number, passed: boolean): number;
    private getTodayDate;
}
//# sourceMappingURL=evaluator.service.d.ts.map