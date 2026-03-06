import nodemailer from 'nodemailer';
import type { EmailPayload, InvitationContext } from '../types/index.js';
import { config } from '../config/index.js';
import logger from '../utils/logger.js';

export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor(customConfig?: { user: string; pass: string }) {
        this.transporter = nodemailer.createTransport({
            host: config.smtp.host,
            port: config.smtp.port,
            secure: config.smtp.secure,
            family: 4,
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
            auth: customConfig ? {
                user: customConfig.user,
                pass: customConfig.pass,
            } : {
                user: config.smtp.user,
                pass: config.smtp.pass,
            },
            // Extremely generous timeouts for slow cloud handshakes
            connectionTimeout: 30000,
            greetingTimeout: 20000,
            socketTimeout: 60000,
            tls: {
                rejectUnauthorized: false,
                minVersion: 'TLSv1.2',
                servername: config.smtp.host
            }
        } as any);

        logger.info(`EmailService initialized: ${config.smtp.host}:${config.smtp.port} (secure: ${config.smtp.secure}, IPv4)`);
    }

    async verifyConnection(): Promise<boolean> {
        try {
            // Force verify the Gmail SMTP connection
            logger.info(`Verifying Gmail SMTP connection to ${config.smtp.host}...`);
            await this.transporter.verify();
            return true;
        } catch (error: any) {
            logger.error(`Gmail SMTP Connection Check Failed: ${error.message}`);
            return false;
        }
    }

    async sendEmail(payload: EmailPayload): Promise<boolean> {
        // Strictly use Gmail SMTP as requested
        try {
            logger.info(`Sending email via Gmail SMTP to ${payload.to}...`);
            await this.transporter.sendMail({
                from: config.smtp.user, // Use the actual Gmail user address as sender
                to: payload.to,
                subject: payload.subject,
                html: payload.html,
                text: payload.text,
            });
            return true;
        } catch (error: any) {
            logger.error(`Gmail SMTP delivery failed for ${payload.to}: ${error.message}`);
            return false;
        }
    }

    generateInvitationEmail(ctx: InvitationContext): EmailPayload {
        const html = `
        <div style="font-family:sans-serif; max-width:600px; margin:0 auto; padding:20px; border:1px solid #eee; border-radius:10px;">
            <h2 style="color:#667eea;">🚀 Hackathon Invitation</h2>
            <p>Hi <b>${ctx.candidateName}</b>,</p>
            <p>You are invited to participate in <b>${ctx.hackathonTitle}</b>.</p>
            <p>Click the button below to submit your project repository:</p>
            <a href="${ctx.submissionUrl}" style="background:#667eea; color:white; padding:12px 25px; border-radius:5px; text-decoration:none; display:inline-block; font-weight:bold;">Submit Project →</a>
            <p style="color:#888; font-size:12px; margin-top:30px;">Link: ${ctx.submissionUrl}</p>
        </div>`;

        return {
            to: '',
            subject: `🚀 Hackathon Invitation: ${ctx.hackathonTitle}`,
            html,
            text: `Invite to ${ctx.hackathonTitle}. Submit at: ${ctx.submissionUrl}`,
        };
    }

    async sendInvitations(
        emails: Array<{ email: string; name: string }>,
        ctx: InvitationContext,
        onProgress?: (sent: number, total: number, email: string) => void
    ): Promise<{ sent: number; failed: number; total: number; error?: string }> {
        let sent = 0;
        let failed = 0;
        const total = emails.length;

        for (const { email, name } of emails) {
            const personalCtx = { ...ctx, candidateName: name };
            const payload = this.generateInvitationEmail(personalCtx);
            payload.to = email;

            const success = await this.sendEmail(payload);
            if (success) sent++;
            else failed++;

            if (onProgress) onProgress(sent + failed, total, email);
        }

        const result: { sent: number; failed: number; total: number; error?: string } = { sent, failed, total };
        if (failed > 0) result.error = 'SMTP Failed';
        return result;
    }

    // ─── Interview Confirmation Email ──────────────────────────────
    generateInterviewEmail(ctx: {
        candidateName: string;
        jobTitle: string;
        roundName: string;
        scheduledAt: string;
        notes?: string;
        companyName?: string;
    }): EmailPayload {
        const company = ctx.companyName || 'Our Company';
        const dateStr = ctx.scheduledAt
            ? new Date(ctx.scheduledAt).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })
            : ctx.scheduledAt;

        const html = `
        <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
            <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:36px 32px;text-align:center;">
                <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;letter-spacing:-0.5px;">📅 Interview Scheduled</h1>
                <p style="color:#c7d2fe;margin:8px 0 0;font-size:14px;">${company} — Recruitment Team</p>
            </div>
            <div style="padding:32px;background:#fff;">
                <p style="font-size:16px;color:#111827;">Hi <strong>${ctx.candidateName}</strong>,</p>
                <p style="color:#6b7280;font-size:14px;line-height:1.6;">
                    Congratulations! We are pleased to invite you for an interview at <strong>${company}</strong> for the position of <strong>${ctx.jobTitle}</strong>.
                </p>
                <div style="background:#f5f3ff;border:1px solid #ede9fe;border-radius:12px;padding:20px 24px;margin:24px 0;">
                    <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#4f46e5;text-transform:uppercase;letter-spacing:0.1em;">Interview Details</p>
                    <table style="width:100%;font-size:14px;color:#374151;border-collapse:collapse;">
                        <tr><td style="padding:6px 0;color:#6b7280;width:110px;">Round</td><td style="padding:6px 0;font-weight:600;">${ctx.roundName}</td></tr>
                        <tr><td style="padding:6px 0;color:#6b7280;">Date & Time</td><td style="padding:6px 0;font-weight:600;">${dateStr}</td></tr>
                        <tr><td style="padding:6px 0;color:#6b7280;">Position</td><td style="padding:6px 0;font-weight:600;">${ctx.jobTitle}</td></tr>
                        ${ctx.notes ? `<tr><td style="padding:6px 0;color:#6b7280;vertical-align:top;">Details</td><td style="padding:6px 0;">${ctx.notes}</td></tr>` : ''}
                    </table>
                </div>
                <p style="color:#6b7280;font-size:14px;line-height:1.6;">Please make sure to be available at the scheduled time. Feel free to reach out if you have any questions.</p>
                <p style="color:#111827;font-size:14px;margin-top:24px;">Best regards,<br><strong>${company} Recruitment Team</strong></p>
            </div>
            <div style="background:#f3f4f6;padding:16px 32px;text-align:center;font-size:12px;color:#9ca3af;">This is an automated notification from ${company}'s Recruitment System.</div>
        </div>`;

        return {
            to: '',
            subject: `📅 Interview Scheduled: ${ctx.roundName} for ${ctx.jobTitle} — ${company}`,
            html,
            text: `Hi ${ctx.candidateName}, your interview for ${ctx.jobTitle} (${ctx.roundName}) is scheduled on ${dateStr}. ${ctx.notes || ''}`,
        };
    }

    async sendInterviewConfirmation(
        to: string,
        ctx: Parameters<EmailService['generateInterviewEmail']>[0]
    ): Promise<boolean> {
        const payload = this.generateInterviewEmail(ctx);
        payload.to = to;
        return this.sendEmail(payload);
    }

    // ─── Offer Letter Email ──────────────────────────────────────
    generateOfferLetter(ctx: {
        candidateName: string;
        jobTitle: string;
        salary: string;
        joiningDate?: string;
        manager?: string;
        companyName?: string;
    }): EmailPayload {
        const company = ctx.companyName || 'Our Company';
        const joiningStr = ctx.joiningDate
            ? new Date(ctx.joiningDate).toLocaleDateString('en-IN', { dateStyle: 'long' })
            : 'To be decided';

        const html = `
        <div style="font-family:'Segoe UI',sans-serif;max-width:640px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#059669,#047857);padding:40px 36px;text-align:center;">
                <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;letter-spacing:-0.5px;">🎉 Offer of Employment</h1>
                <p style="color:#a7f3d0;margin:8px 0 0;font-size:14px;">${company}</p>
            </div>
            <div style="padding:36px;background:#fff;">
                <p style="font-size:16px;color:#111827;font-weight:500;">Dear <strong>${ctx.candidateName}</strong>,</p>
                <p style="color:#374151;font-size:14px;line-height:1.8;">
                    We are thrilled to extend this <strong>formal offer of employment</strong> to you for the position of <strong>${ctx.jobTitle}</strong> at <strong>${company}</strong>. After a thorough review of your qualifications and interview performance, we are confident that you will be a valuable addition to our team.
                </p>
                <div style="background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:12px;padding:24px 28px;margin:28px 0;">
                    <p style="margin:0 0 16px;font-size:12px;font-weight:800;color:#059669;text-transform:uppercase;letter-spacing:0.12em;">Offer Summary</p>
                    <table style="width:100%;border-collapse:collapse;font-size:14px;color:#1f2937;">
                        <tr style="border-bottom:1px solid #d1fae5;"><td style="padding:10px 0;color:#6b7280;font-weight:500;width:140px;">Position</td><td style="padding:10px 0;font-weight:700;">${ctx.jobTitle}</td></tr>
                        <tr style="border-bottom:1px solid #d1fae5;"><td style="padding:10px 0;color:#6b7280;font-weight:500;">Compensation</td><td style="padding:10px 0;font-weight:700;color:#059669;">${ctx.salary}</td></tr>
                        <tr style="border-bottom:1px solid #d1fae5;"><td style="padding:10px 0;color:#6b7280;font-weight:500;">Joining Date</td><td style="padding:10px 0;font-weight:700;">${joiningStr}</td></tr>
                        ${ctx.manager ? `<tr><td style="padding:10px 0;color:#6b7280;font-weight:500;">Reporting To</td><td style="padding:10px 0;font-weight:700;">${ctx.manager}</td></tr>` : ''}
                    </table>
                </div>
                <p style="color:#374151;font-size:14px;line-height:1.8;">
                    Please confirm your acceptance by replying to this email. If you have any questions or require further information, do not hesitate to contact us.
                </p>
                <p style="color:#374151;font-size:14px;margin-top:28px;">Sincerely,<br>
                    <strong>${ctx.manager || company + ' HR'}</strong><br>
                    <span style="color:#6b7280;">${company} — Human Resources</span>
                </p>
            </div>
            <div style="background:#f9fafb;padding:16px 32px;text-align:center;font-size:12px;color:#9ca3af;">
                This is an official employment offer from ${company}. Please treat this communication as confidential.
            </div>
        </div>`;

        return {
            to: '',
            subject: `🎉 Offer Letter — ${ctx.jobTitle} at ${company}`,
            html,
            text: `Dear ${ctx.candidateName}, We are pleased to offer you the position of ${ctx.jobTitle} at ${company} with a compensation of ${ctx.salary}, joining on ${joiningStr}.`,
        };
    }

    async sendOfferLetter(
        to: string,
        ctx: Parameters<EmailService['generateOfferLetter']>[0]
    ): Promise<boolean> {
        const payload = this.generateOfferLetter(ctx);
        payload.to = to;
        return this.sendEmail(payload);
    }
}
