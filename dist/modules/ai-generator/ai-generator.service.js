import { LoggerService } from '../../common/logger/logger.service';
import { AiGeneratorAccessor } from './ai-generator.accessor';
export class AiGeneratorService {
    accessor;
    logger;
    static RETRY_ATTEMPTS = 3;
    static RETRY_DELAY_MS = 10_000;
    static FALLBACK_PENALTY = [
        "I'm publicly admitting that I couldn't write 50 lines of code today. I spent the entire day procrastinating and convincing myself I'd start 'in 5 minutes.' I am the living embodiment of wasted potential.",
        "Today I chose comfort over growth. While real developers shipped features, I couldn't even open my IDE. I deserve this public shame.",
        "Confession: I had 24 hours to write 50 lines of code and I failed. A toddler randomly pressing keys could have done better.",
    ];
    static FALLBACK_SUCCESS = [
        "Another day of consistent coding done. Hit my daily target and kept the streak alive. Small daily efforts compound into real skills.",
        "Shipped code today. Stayed disciplined, hit my target, and maintained my streak. Consistency beats inspiration every time.",
    ];
    constructor() {
        this.accessor = new AiGeneratorAccessor(process.env.GEMINI_API_KEY, 'gemini-2.0-flash');
        this.logger = LoggerService.getInstance();
    }
    async generatePost(request) {
        const prompt = this.buildPrompt(request);
        for (let attempt = 1; attempt <= AiGeneratorService.RETRY_ATTEMPTS; attempt++) {
            try {
                const text = await this.accessor.generate(prompt);
                if (this.validatePostText(text)) {
                    return {
                        text: text.trim(),
                        model: 'gemini-2.0-flash',
                        generatedAt: new Date(),
                        usedFallback: false,
                    };
                }
            }
            catch (err) {
                this.logger.warn('AiGeneratorService', `Attempt ${attempt} failed: ${err.message}`);
                if (attempt < AiGeneratorService.RETRY_ATTEMPTS) {
                    await this.sleep(AiGeneratorService.RETRY_DELAY_MS);
                }
            }
        }
        // Fallback
        const fallbackText = this.getFallbackText(request.type);
        this.logger.warn('AiGeneratorService', 'All retries failed, using fallback text');
        return {
            text: fallbackText,
            model: 'fallback',
            generatedAt: new Date(),
            usedFallback: true,
        };
    }
    /**
     * Sanitizes generated text by removing private paths.
     */
    sanitize(text, privatePaths, publicFields = []) {
        let sanitized = text;
        const sorted = [...privatePaths].sort((a, b) => b.length - a.length);
        for (const path of sorted) {
            if (publicFields.includes(path))
                continue;
            sanitized = sanitized.replaceAll(path, '');
        }
        // Remove absolute paths
        sanitized = sanitized.replace(/\/(?:home|Users|var|tmp|opt)\/[^\s,;)}\]"']+/g, '');
        sanitized = sanitized.replace(/[A-Z]:\\[^\s,;)}\]"']+/g, '');
        sanitized = sanitized.replace(/\s{2,}/g, ' ').trim();
        return sanitized;
    }
    /**
     * Builds prompt based on post type.
     * Public for testing.
     */
    buildPrompt(request) {
        if (request.type === 'penalty') {
            return 'Write a highly embarrassing, cringey first-person confession post for social media. The person failed to write their daily minimum of code today. They are lazy and procrastinated. Make it dramatic and self-deprecating. Keep it under 280 characters. Write only the post text.';
        }
        const ctx = request.context ?? {};
        const lines = ctx.linesWritten ? `${ctx.linesWritten} lines of code` : 'code';
        const files = ctx.filesChanged?.length ? `Files: ${ctx.filesChanged.join(', ')}.` : '';
        const streak = ctx.streak ? `Streak: ${ctx.streak} days.` : '';
        return `Write a clean, professional social media post about today's coding work. The developer wrote ${lines}. ${files} ${streak} Keep it under 280 characters. Write only the post text.`;
    }
    /**
     * Validates post text is non-empty with alphabetic content.
     * Public for testing.
     */
    validatePostText(text) {
        if (text === null || text === undefined || typeof text !== 'string')
            return false;
        const trimmed = text.trim();
        if (trimmed.length === 0)
            return false;
        return /[a-zA-Z]/.test(trimmed);
    }
    getFallbackText(type) {
        const posts = type === 'penalty' ? AiGeneratorService.FALLBACK_PENALTY : AiGeneratorService.FALLBACK_SUCCESS;
        return posts[Math.floor(Math.random() * posts.length)];
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
//# sourceMappingURL=ai-generator.service.js.map