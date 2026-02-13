"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTicketConfirmation = sendTicketConfirmation;
exports.sendAdminNotification = sendAdminNotification;
exports.sendReplyNotification = sendReplyNotification;
exports.sendStatusUpdateEmail = sendStatusUpdateEmail;
const resend_1 = require("resend");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let resend = null;
function getResendClient() {
    if (!resend) {
        if (!process.env.RESEND_API_KEY) {
            throw new Error("RESEND_API_KEY is not configured");
        }
        resend = new resend_1.Resend(process.env.RESEND_API_KEY);
    }
    return resend;
}
const FROM_EMAIL = process.env.SUPPORT_FROM_EMAIL || "My Floral Vault Support <support@myfloralvault.com>";
const APP_URL = process.env.APP_URL || "https://myfloralvault.com";
async function sendTicketConfirmation(params) {
    const { ticketNumber, recipientEmail, recipientName, subject, emailThreadId } = params;
    const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #f8faf8; border-radius: 12px;">
      <h2 style="color: #2d6a4f; margin-top: 0;">Support Ticket Received</h2>
      <p style="color: #333; font-size: 16px;">Hi ${recipientName},</p>
      <p style="color: #333; font-size: 16px;">
        We've received your support request and created ticket <strong style="color: #2d6a4f;">${ticketNumber}</strong>.
      </p>
      <div style="background: #eef5ee; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0; color: #555;"><strong>Subject:</strong> ${subject}</p>
        <p style="margin: 8px 0 0; color: #555;"><strong>Ticket Number:</strong> ${ticketNumber}</p>
      </div>
      <p style="color: #333; font-size: 16px;">
        Our team will review your request and get back to you as soon as possible.
        You can reply to this email to add more information to your ticket.
      </p>
      <a href="${APP_URL}/support/tickets" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #2d6a4f; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">View Your Tickets</a>
      <p style="color: #888; font-size: 12px; margin-top: 24px;">— My Floral Vault Support Team</p>
    </div>
  `;
    try {
        const { error } = await getResendClient().emails.send({
            from: FROM_EMAIL,
            to: recipientEmail,
            subject: `[${ticketNumber}] ${subject} - Ticket Received`,
            html,
            headers: {
                "Message-ID": emailThreadId,
                "X-Ticket-Number": ticketNumber,
            },
        });
        if (error) {
            console.error("[Support Email] Failed to send confirmation:", error);
            return false;
        }
        return true;
    }
    catch (err) {
        console.error("[Support Email] Error sending confirmation:", err);
        return false;
    }
}
async function sendAdminNotification(params) {
    const adminEmail = process.env.SUPPORT_ADMIN_EMAIL || "support@myfloralvault.com";
    const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #f8faf8; border-radius: 12px;">
      <h2 style="color: #2d6a4f; margin-top: 0;">New Support Ticket: ${params.ticketNumber}</h2>
      <div style="background: #eef5ee; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0; color: #555;"><strong>From:</strong> ${params.senderName} (${params.senderEmail})</p>
        <p style="margin: 8px 0 0; color: #555;"><strong>Subject:</strong> ${params.subject}</p>
        <p style="margin: 8px 0 0; color: #555;"><strong>Category:</strong> ${params.category}</p>
        <p style="margin: 8px 0 0; color: #555;"><strong>Priority:</strong> ${params.priority}</p>
      </div>
      <div style="background: #fff; padding: 16px; border-radius: 8px; border: 1px solid #ddd; margin: 16px 0;">
        <p style="color: #333; white-space: pre-wrap;">${params.message}</p>
      </div>
      <a href="${APP_URL}/admin/support/${params.ticketNumber}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #2d6a4f; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">View in Admin</a>
    </div>
  `;
    try {
        const { error } = await getResendClient().emails.send({
            from: FROM_EMAIL,
            to: adminEmail,
            subject: `[${params.ticketNumber}] New: ${params.subject} (${params.priority})`,
            html,
        });
        if (error) {
            console.error("[Support Email] Failed to send admin notification:", error);
            return false;
        }
        return true;
    }
    catch (err) {
        console.error("[Support Email] Error sending admin notification:", err);
        return false;
    }
}
async function sendReplyNotification(params) {
    const { ticketNumber, recipientEmail, recipientName, subject, replyMessage, replierName, emailThreadId } = params;
    const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #f8faf8; border-radius: 12px;">
      <h2 style="color: #2d6a4f; margin-top: 0;">New Reply on ${ticketNumber}</h2>
      <p style="color: #333; font-size: 16px;">Hi ${recipientName},</p>
      <p style="color: #333; font-size: 16px;">
        <strong>${replierName}</strong> has replied to your support ticket:
      </p>
      <div style="background: #fff; padding: 16px; border-radius: 8px; border: 1px solid #ddd; margin: 16px 0;">
        <p style="color: #333; white-space: pre-wrap;">${replyMessage}</p>
      </div>
      <p style="color: #555; font-size: 14px;">You can reply to this email to respond directly.</p>
      <a href="${APP_URL}/support/tickets" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #2d6a4f; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">View Ticket</a>
      <p style="color: #888; font-size: 12px; margin-top: 24px;">— My Floral Vault Support Team</p>
    </div>
  `;
    try {
        const { error } = await getResendClient().emails.send({
            from: FROM_EMAIL,
            to: recipientEmail,
            subject: `Re: [${ticketNumber}] ${subject}`,
            html,
            headers: {
                "In-Reply-To": emailThreadId,
                References: emailThreadId,
                "X-Ticket-Number": ticketNumber,
            },
        });
        if (error) {
            console.error("[Support Email] Failed to send reply notification:", error);
            return false;
        }
        return true;
    }
    catch (err) {
        console.error("[Support Email] Error sending reply notification:", err);
        return false;
    }
}
async function sendStatusUpdateEmail(params) {
    const { ticketNumber, recipientEmail, recipientName, subject, newStatus, emailThreadId } = params;
    const statusLabels = {
        OPEN: "Open",
        IN_PROGRESS: "In Progress",
        RESOLVED: "Resolved",
        CLOSED: "Closed",
    };
    const statusColors = {
        OPEN: "#e67e22",
        IN_PROGRESS: "#3498db",
        RESOLVED: "#27ae60",
        CLOSED: "#95a5a6",
    };
    const statusLabel = statusLabels[newStatus] || newStatus;
    const statusColor = statusColors[newStatus] || "#333";
    const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #f8faf8; border-radius: 12px;">
      <h2 style="color: #2d6a4f; margin-top: 0;">Ticket Status Updated</h2>
      <p style="color: #333; font-size: 16px;">Hi ${recipientName},</p>
      <p style="color: #333; font-size: 16px;">
        Your ticket <strong>${ticketNumber}</strong> has been updated:
      </p>
      <div style="background: #eef5ee; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0; color: #555;"><strong>Subject:</strong> ${subject}</p>
        <p style="margin: 8px 0 0; color: #555;">
          <strong>New Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${statusLabel}</span>
        </p>
      </div>
      <a href="${APP_URL}/support/tickets" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #2d6a4f; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">View Ticket</a>
      <p style="color: #888; font-size: 12px; margin-top: 24px;">— My Floral Vault Support Team</p>
    </div>
  `;
    try {
        const { error } = await getResendClient().emails.send({
            from: FROM_EMAIL,
            to: recipientEmail,
            subject: `[${ticketNumber}] Status Update: ${statusLabel}`,
            html,
            headers: {
                "In-Reply-To": emailThreadId,
                References: emailThreadId,
                "X-Ticket-Number": ticketNumber,
            },
        });
        if (error) {
            console.error("[Support Email] Failed to send status update:", error);
            return false;
        }
        return true;
    }
    catch (err) {
        console.error("[Support Email] Error sending status update:", err);
        return false;
    }
}
