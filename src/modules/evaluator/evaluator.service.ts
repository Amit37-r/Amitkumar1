import { LoggerService } from '../../common/logger/logger.service';
import { EvaluatorAccessor } from './evaluator.accessor';
import { IEvaluationResult, TDayStatus } from './evaluator.types';

export class EvaluatorService {
  private accessor: EvaluatorAccessor;
  private logger: LoggerService;

  constructor() {
    this.accessor = new EvaluatorAccessor();
    this.logger = LoggerService.getInstance();
  }

  evaluateDay(target: number): IEvaluationResult {
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

  getCurrentStreak(): number {
    return this.accessor.getStreak().currentStreak;
  }

  getDayStatus(): TDayStatus {
    return this.accessor.getDayStatus(this.getTodayDate());
  }

  /**
   * Pure streak computation logic.
   * Exported as public for property-based testing.
   */
  computeStreak(previousStreak: number, passed: boolean): number {
    return passed ? previousStreak + 1 : 0;
  }

  private getTodayDate(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
