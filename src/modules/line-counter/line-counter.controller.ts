import { Request, Response } from 'express';
import { LineCounterService } from './line-counter.service';

export class LineCounterController {
  private service: LineCounterService;

  constructor() {
    this.service = new LineCounterService();
  }

  getLineCount = (_req: Request, res: Response): void => {
    const lineCount = this.service.getTodayLineCount();
    const lastScanAt = this.service.getLastScanTime();
    res.json({ lineCount, lastScanAt });
  };

  triggerScan = (req: Request, res: Response): void => {
    const codeFolders = req.body.codeFolders as string[] | undefined;
    if (!codeFolders || !Array.isArray(codeFolders)) {
      res.status(400).json({ error: 'codeFolders is required' });
      return;
    }
    const result = this.service.scan(codeFolders);
    res.json(result);
  };
}
