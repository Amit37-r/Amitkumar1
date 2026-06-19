export declare class GithubOAuthService {
    private clientId;
    private clientSecret;
    private callbackUrl;
    constructor();
    /**
     * Generate the GitHub OAuth authorization URL.
     * The user gets redirected here to login and authorize.
     */
    getAuthUrl(userId: string): string;
    /**
     * Exchange the authorization code for an access token,
     * fetch the GitHub username, and store both on the user.
     */
    handleCallback(code: string, userId: string): Promise<{
        success: boolean;
        username?: string;
        error?: string;
    }>;
    /**
     * Get the stored GitHub token for a user.
     */
    getUserGithubToken(userId: string): Promise<string | null>;
    /**
     * Disconnect GitHub from user account.
     */
    disconnect(userId: string): Promise<void>;
}
//# sourceMappingURL=github-oauth.service.d.ts.map