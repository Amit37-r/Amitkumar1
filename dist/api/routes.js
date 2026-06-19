import { EvaluatorController } from '../modules/evaluator/evaluator.controller';
import { LineCounterController } from '../modules/line-counter/line-counter.controller';
import { PostAutomatorController } from '../modules/post-automator/post-automator.controller';
import { OfflineQueueController } from '../modules/offline-queue/offline-queue.controller';
import { AiGeneratorController } from '../modules/ai-generator/ai-generator.controller';
import { AuthController } from '../modules/auth/auth.controller';
import { AuthService } from '../modules/auth/auth.service';
import { authMiddleware } from '../modules/auth/auth.middleware';
import { GithubOAuthService } from '../modules/auth/github-oauth.service';
export function registerRoutes(app, config, credentials, updateConfig) {
    // Auth setup
    const authService = new AuthService(config.jwtSecret);
    const authCtrl = new AuthController(authService);
    const protect = authMiddleware(authService);
    // Controllers
    const evaluatorCtrl = new EvaluatorController();
    const lineCounterCtrl = new LineCounterController();
    const postAutomatorCtrl = new PostAutomatorController(credentials);
    const offlineQueueCtrl = new OfflineQueueController(credentials);
    const aiGeneratorCtrl = new AiGeneratorController();
    // ===== Public Routes (no auth required) =====
    // Health
    app.get('/api/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
    // Auth
    app.post('/api/auth/signup', authCtrl.signup);
    app.post('/api/auth/login', authCtrl.login);
    app.get('/api/auth/me', protect, authCtrl.me);
    // ===== Protected Routes (auth required) =====
    // Status
    app.get('/api/status', protect, evaluatorCtrl.getStatus(config));
    // Line Counter
    app.get('/api/line-count', protect, lineCounterCtrl.getLineCount);
    app.post('/api/scan', protect, lineCounterCtrl.triggerScan);
    // Config
    app.get('/api/config', protect, (_req, res) => res.json(config));
    app.put('/api/config', protect, (req, res) => {
        const updates = req.body;
        updateConfig(updates);
        res.json({ success: true, config });
    });
    // Post History
    app.get('/api/history', protect, postAutomatorCtrl.getHistory);
    // Offline Queue
    app.get('/api/queue', protect, offlineQueueCtrl.getQueueStatus);
    app.post('/api/queue/flush', protect, offlineQueueCtrl.flushQueue);
    // AI Generator
    app.post('/api/generate', protect, aiGeneratorCtrl.generatePost);
    // Test Email (for testing purposes)
    app.post('/api/test-email', protect, async (req, res) => {
        const { EmailService } = await import('../modules/email/email.service');
        const emailService = new EmailService();
        const { type, text, lineCount, target, streak, recipientEmail } = req.body;
        const result = await emailService.sendEmail({
            type: type || 'penalty',
            text: text || 'Test: I was too lazy to code today.',
            lineCount: lineCount || 0,
            target: target || 50,
            streak: streak || 0,
            recipientEmail: recipientEmail || process.env.RECIPIENT_EMAIL || '',
        });
        res.json(result);
    });
    // ===== GitHub OAuth =====
    const githubOAuth = new GithubOAuthService();
    // Step 1: Redirect user to GitHub login (accepts token via query param for browser redirect)
    app.get('/api/auth/github', (req, res) => {
        const token = req.query.token || req.headers.authorization?.split(' ')[1];
        if (!token) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }
        const decoded = authService.verifyToken(token);
        if (!decoded) {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }
        const url = githubOAuth.getAuthUrl(decoded.userId);
        res.redirect(url);
    });
    // Step 2: GitHub redirects back with code
    app.get('/api/auth/github/callback', async (req, res) => {
        const { code, state: userId } = req.query;
        if (!code || !userId) {
            res.redirect(`${config.frontendPort === 3000 ? 'http://localhost:3000' : ''}/settings?github=error&reason=missing_params`);
            return;
        }
        const result = await githubOAuth.handleCallback(code, userId);
        if (result.success) {
            res.redirect(`http://localhost:${config.frontendPort}/settings?github=connected&username=${result.username}`);
        }
        else {
            res.redirect(`http://localhost:${config.frontendPort}/settings?github=error&reason=${encodeURIComponent(result.error || 'unknown')}`);
        }
    });
    // Get GitHub connection status
    app.get('/api/auth/github/status', protect, async (req, res) => {
        const authReq = req;
        const { UserModel } = await import('../modules/auth/user.model');
        const user = await UserModel.findById(authReq.userId).select('githubUsername githubRepos');
        res.json({
            connected: !!user?.githubUsername,
            username: user?.githubUsername || null,
            repos: user?.githubRepos || [],
        });
    });
    // Disconnect GitHub
    app.post('/api/auth/github/disconnect', protect, async (req, res) => {
        const authReq = req;
        await githubOAuth.disconnect(authReq.userId);
        res.json({ success: true });
    });
}
//# sourceMappingURL=routes.js.map