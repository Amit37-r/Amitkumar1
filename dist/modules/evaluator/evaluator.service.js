import { LoggerService } from '../../common/logger/logger.service';
import { EvaluatorAccessor } from './evaluator.accessor';
export class EvaluatorService {
    accessor;
    logger;
    constructor() {
        this.accessor = new EvaluatorAccessor();
        this.logger = LoggerService.getInstance();
    }
    evaluateDay(target) {
        const date = this.getTodayDate();
        const lineCount = this.accessor.getTodayLineCount(date);
        const passed = lineCount >= target;
        const currentStreak = this.accessor.getStreak();
        const newStreakValue = this.computeStreak(currentStreak.currentStreak, passed);
        const longestStreak = Math.max(currentStreak.longestStreak, newStreakValue);
        const lastSuccessDate = passed ? date : currentStreak.lastSuccessDate;
        this.accessor.updateStreak({
            currentStreak: newStreakValue,
            longestStreak,
            lastSuccessDate,
        });
        this.accessor.markDayEvaluated(date, target, passed, lineCount);
        this.logger.info('EvaluatorService', `Day evaluated: ${passed ? 'PASSED' : 'FAILED'}`, {
            lineCount,
            target,
            streak: newStreakValue,
        });
        return {
            date,
            lineCount,
            target,
            passed,
            streak: newStreakValue,
        };
    }
    getCurrentStreak() {
        return this.accessor.getStreak().currentStreak;
    }
    getDayStatus() {
        return this.accessor.getDayStatus(this.getTodayDate());
    }
    /**
     * Pure streak computation logic.
     * Exported as public for property-based testing.
     */
    computeStreak(previousStreak, passed) {
        return passed ? previousStreak + 1 : 0;
    }
    getTodayDate() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
}
//# sourceMappingURL=evaluator.service.js.map