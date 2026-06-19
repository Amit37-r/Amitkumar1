import { IGeneratePostRequest, IGeneratePostResponse } from './ai-generator.types';
export declare class AiGeneratorService {
    private accessor;
    private logger;
    private static readonly RETRY_ATTEMPTS;
    private static readonly RETRY_DELAY_MS;
    private static readonly FALLBACK_PENALTY;
    private static readonly FALLBACK_SUCCESS;
    constructor();
    generatePost(request: IGeneratePostRequest): Promise<IGeneratePostResponse>;
    /**
     * Sanitizes generated text by removing private paths.
     */
    sanitize(text: string, privatePaths: string[], publicFields?: string[]): string;
    /**
     * Builds prompt based on post type.
     * Public for testing.
     */
    buildPrompt(request: IGeneratePostRequest): string;
    /**
     * Validates post text is non-empty with alphabetic content.
     * Public for testing.
     */
    validatePostText(text: unknown): boolean;
    private getFallbackText;
    private sleep;
}
//# sourceMappingURL=ai-generator.service.d.ts.map