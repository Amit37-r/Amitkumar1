import { AiGeneratorService } from './ai-generator.service';
export class AiGeneratorController {
    service;
    constructor() {
        this.service = new AiGeneratorService();
    }
    generatePost = async (req, res) => {
        const body = req.body;
        if (!body.type || !['penalty', 'success'].includes(body.type)) {
            res.status(400).json({ error: 'type must be "penalty" or "success"' });
            return;
        }
        const result = await this.service.generatePost(body);
        res.json(result);
    };
}
//# sourceMappingURL=ai-generator.controller.js.map