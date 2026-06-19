import { TPostType } from '../../common/types';
export interface IGeneratePostRequest {
    type: TPostType;
    context?: IPostContext;
}
export interface IPostContext {
    linesWritten?: number;
    filesChanged?: string[];
    streak?: number;
}
export interface IGeneratePostResponse {
    text: string;
    model: string;
    generatedAt: Date;
    usedFallback: boolean;
}
//# sourceMappingURL=ai-generator.types.d.ts.map