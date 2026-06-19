export class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    signup = async (req, res) => {
        try {
            const { name, email, password } = req.body;
            if (!name || !email || !password) {
                res.status(400).json({ error: 'Name, email, and password are required' });
                return;
            }
            if (password.length < 6) {
                res.status(400).json({ error: 'Password must be at least 6 characters' });
                return;
            }
            const result = await this.authService.signup({ name, email, password });
            res.status(201).json(result);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Signup failed';
            res.status(400).json({ error: message });
        }
    };
    login = async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({ error: 'Email and password are required' });
                return;
            }
            const result = await this.authService.login({ email, password });
            res.json(result);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Login failed';
            res.status(401).json({ error: message });
        }
    };
    me = async (req, res) => {
        try {
            if (!req.userId) {
                res.status(401).json({ error: 'Not authenticated' });
                return;
            }
            const user = await this.authService.getUserById(req.userId);
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            res.json(user);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to get user info' });
        }
    };
}
//# sourceMappingURL=auth.controller.js.map