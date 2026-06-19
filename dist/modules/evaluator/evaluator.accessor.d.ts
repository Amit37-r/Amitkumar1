import { IStreakRecord } from './evaluator.types';
export declare class EvaluatorAccessor {
    private db;
    constructor();
    getStreak(): IStreakRecord;
    updateStreak(streak: IStreakRecord): void;
    getTodayLineCount(date: string): number;
    markDayEvaluated(date: string, target: number, passed: boolean, lineCount: number): void;
    getDayStatus(date: string): 'pending' | 'success' | 'failed';
}
//# sourceMappingURL=evaluator.accessor.d.ts.map