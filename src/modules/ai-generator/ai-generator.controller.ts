import { Request, Response } from 'express';
import { AiGeneratorService } from './ai-generator.service';
import { IGeneratePostRequest } from './ai-generator.types';

export class AiGeneratorController {
  private service: AiGeneratorService;

  constructor() {
    this.service = new AiGeneratorService();
  }

  generatePost = async (req: Request, res: Response): Promise<void> => {
    const body = req.body as IGeneratePostRequest;

    if (!body.type || !['penalty', 'success'].includes(body.type)) {
      res.status(400).json({ error: 'type must be "penalty" or "success"' });
      return;
    }

    const result = await this.service.generatePost(body);
    res.json(result);
  };
}
