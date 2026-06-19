import nodemailer from 'nodemailer';
export class EmailService {
    transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    async sendEmail(params) {
        try {
            let html;
            let subject;
            if (params.type === 'penalty') {
                html = this.buildPenaltyHtml(params.text, params.lineCount, params.target);
                subject = '❌ You are a loser - Daily Target Failed';
            }
            else {
                html = this.buildSuccessHtml(params.text, params.lineCount, params.target, params.streak ?? 0);
                subject = '✅ You are a champ - Daily Target Hit!';
            }
            const result = await this.transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: params.recipientEmail,
                subject,
                html,
            });
            return { success: true, messageId: result.messageId };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to send email';
            return { success: false, error: message };
        }
    }
    buildPenaltyHtml(text, lineCount, target) {
        return `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">❌ Daily Target FAILED</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9;">You wrote ${lineCount} lines. Target was ${target}.</p>
        </div>
        <div style="background: #fef2f2; padding: 20px; border: 1px solid #fecaca; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; color: #991b1b; font-style: italic;">"${text}"</p>
          <hr style="border: none; border-top: 1px solid #fecaca; margin: 16px 0;">
          <p style="color: #666; font-size: 12px;">This post has been (or will be) published to your social media. Get coding tomorrow. 💀</p>
        </div>
      </div>
    `;
    }
    buildSuccessHtml(text, lineCount, target, streak) {
        return `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #16a34a; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">✅ Daily Target HIT</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9;">You wrote ${lineCount} lines. Target was ${target}. Streak: ${streak} days 🔥</p>
        </div>
        <div style="background: #f0fdf4; padding: 20px; border: 1px solid #bbf7d0; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; color: #166534;">"${text}"</p>
          <hr style="border: none; border-top: 1px solid #bbf7d0; margin: 16px 0;">
          <p style="color: #666; font-size: 12px;">This has been posted to your social media. Keep the streak alive! 🚀</p>
        </div>
      </div>
    `;
    }
}
//# sourceMappingURL=email.service.js.map