import { Request, Response } from 'express';
import { EvaluatorService } from './evaluator.service';
import { LineCounterService } from '../line-counter/line-counter.service';
import { IAppConfig } from '../../common/types';

export class EvaluatorController {
  private service: EvaluatorService;
  private lineCounterService: LineCounterService;

  constructor() {
    this.service = new EvaluatorService();
    this.lineCounterService = new LineCounterService();
  }

  getStatus = (config: IAppConfig) => (_req: Request, res: Response): void => {
    const lineCount = this.lineCounterService.getTodayLineCount();
    const streak = this.service.getCurrentStreak();
    const dayStatus = this.service.getDayStatus();
    const lastScanAt = this.lineCounterService.getLastScanTime();
    const deadlineTimestamp = this.computeDeadlineTimestamp(config.deadline);

    res.json({
      lineCount,
      dailyTarget: config.dailyTarget,
      streak,
      deadline: config.deadline,
      deadlineTimestamp,
      lastScanAt,
      dayStatus,
    });
  };

  private computeDeadlineTimestamp(deadline: string): number {
    const [hour, minute] = deadline.split(':').map(Number);
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }
    return target.getTime();
  }
}
