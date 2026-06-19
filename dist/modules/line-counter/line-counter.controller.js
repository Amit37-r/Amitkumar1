import { LineCounterService } from './line-counter.service';
export class LineCounterController {
    service;
    constructor() {
        this.service = new LineCounterService();
    }
    getLineCount = (_req, res) => {
        const lineCount = this.service.getTodayLineCount();
        const lastScanAt = this.service.getLastScanTime();
        res.json({ lineCount, lastScanAt });
    };
    triggerScan = (req, res) => {
        const codeFolders = req.body.codeFolders;
        if (!codeFolders || !Array.isArray(codeFolders)) {
            res.status(400).json({ error: 'codeFolders is required' });
            return;
        }
        const result = this.service.scan(codeFolders);
        res.json(result);
    };
}
//# sourceMappingURL=line-counter.controller.js.map