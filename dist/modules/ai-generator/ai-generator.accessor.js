/**
 * Accessor for the Google Gemini API.
 */
export class AiGeneratorAccessor {
    apiKey;
    model;
    constructor(apiKey, model) {
        this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
        this.model = 'gemini-2.5-flash';
    }
    async generate(prompt) {
        if (!this.apiKey) {
            throw new Error('GEMINI_API_KEY is not set');
        }
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                        parts: [{ text: prompt }],
                    }],
            }),
            signal: AbortSignal.timeout(30_000),
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Gemini API returned status ${response.status}: ${error}`);
        }
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        return text;
    }
}
//# sourceMappingURL=ai-generator.accessor.js.map