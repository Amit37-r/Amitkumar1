import { Request, Response } from 'express';
import { PostAutomatorService } from './post-automator.service';
import { ICredentials } from '../../common/types';

export class PostAutomatorController {
  private service: PostAutomatorService;

  constructor(credentials: ICredentials) {
    this.service = new PostAutomatorService(credentials);
  }

  getHistory = (_req: Request, res: Response): void => {
    const history = this.service.getHistory();
    res.json(history);
  };
}
