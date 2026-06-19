import { PostAutomatorService } from './post-automator.service';
export class PostAutomatorController {
    service;
    constructor(credentials) {
        this.service = new PostAutomatorService(credentials);
    }
    getHistory = (_req, res) => {
        const history = this.service.getHistory();
        res.json(history);
    };
}
//# sourceMappingURL=post-automator.controller.js.map