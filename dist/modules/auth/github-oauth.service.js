import { UserModel } from './user.model';
const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_URL = 'https://api.github.com/user';
export class GithubOAuthService {
    clientId;
    clientSecret;
    callbackUrl;
    constructor() {
        this.clientId = process.env.GITHUB_CLIENT_ID || '';
        this.clientSecret = process.env.GITHUB_CLIENT_SECRET || '';
        this.callbackUrl = process.env.GITHUB_CALLBACK_URL || 'http://localhost:4000/api/auth/github/callback';
    }
    /**
     * Generate the GitHub OAuth authorization URL.
     * The user gets redirected here to login and authorize.
     */
    getAuthUrl(userId) {
        const params = new URLSearchParams({
            client_id: this.clientId,
            redirect_uri: this.callbackUrl,
            scope: 'repo read:user',
            state: userId, // pass userId so we know who to link the token to
        });
        return `${GITHUB_AUTH_URL}?${params.toString()}`;
    }
    /**
     * Exchange the authorization code for an access token,
     * fetch the GitHub username, and store both on the user.
     */
    async handleCallback(code, userId) {
        try {
            // 1. Exchange code for access token
            const tokenResponse = await fetch(GITHUB_TOKEN_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    code,
                    redirect_uri: this.callbackUrl,
                }),
            });
            const tokenData = await tokenResponse.json();
            if (tokenData.error) {
                return { success: false, error: tokenData.error_description || tokenData.error };
            }
            const accessToken = tokenData.access_token;
            // 2. Fetch GitHub username
            const userResponse = await fetch(GITHUB_USER_URL, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
            });
            const userData = await userResponse.json();
            const githubUsername = userData.login;
            // 3. Store token and username on user
            await UserModel.findByIdAndUpdate(userId, {
                githubToken: accessToken,
                githubUsername,
            });
            return { success: true, username: githubUsername };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'GitHub OAuth failed';
            return { success: false, error: message };
        }
    }
    /**
     * Get the stored GitHub token for a user.
     */
    async getUserGithubToken(userId) {
        const user = await UserModel.findById(userId).select('githubToken');
        return user?.githubToken || null;
    }
    /**
     * Disconnect GitHub from user account.
     */
    async disconnect(userId) {
        await UserModel.findByIdAndUpdate(userId, {
            githubToken: null,
            githubUsername: null,
            githubRepos: [],
        });
    }
}
//# sourceMappingURL=github-oauth.service.js.map