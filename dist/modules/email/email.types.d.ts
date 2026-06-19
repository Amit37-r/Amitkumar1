import { TPostType } from '../../common/types';
export interface ISendEmailRequest {
    type: TPostType;
    text: string;
    lineCount: number;
    target: number;
    streak?: number;
    recipientEmail: string;
}
export interface ISendEmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
}
//# sourceMappingURL=email.types.d.ts.map