export interface IEvaluationResult {
  date: string;
  lineCount: number;
  target: number;
  passed: boolean;
  streak: number;
}

export interface IStreakRecord {
  currentStreak: number;
  longestStreak: number;
  lastSuccessDate: string | null;
}

export interface IDailyRecord {
  id: number;
  date: string;
  lineCount: number;
  target: number;
  passed: boolean;
  evaluatedAt: string | null;
}

export type TDayStatus = 'pending' | 'success' | 'failed';
