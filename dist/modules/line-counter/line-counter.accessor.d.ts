import { IScanResult } from './line-counter.types';
export declare class LineCounterAccessor {
    private db;
    constructor();
    saveScanResult(date: string, result: IScanResult): void;
    getTodayLineCount(date: string): number;
    getLastScanTime(date: string): string | null;
}
//# sourceMappingURL=line-counter.accessor.d.ts.map