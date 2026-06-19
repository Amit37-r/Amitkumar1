/**
 * Accessor for the Google Gemini API.
 */
export declare class AiGeneratorAccessor {
    private apiKey;
    private model;
    constructor(apiKey?: string, model?: string);
    generate(prompt: string): Promise<string>;
}
//# sourceMappingURL=ai-generator.accessor.d.ts.map