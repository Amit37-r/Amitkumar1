import { ISendEmailRequest, ISendEmailResult } from './email.types';
export declare class EmailService {
    private transporter;
    sendEmail(params: ISendEmailRequest): Promise<ISendEmailResult>;
    private buildPenaltyHtml;
    private buildSuccessHtml;
}
//# sourceMappingURL=email.service.d.ts.map