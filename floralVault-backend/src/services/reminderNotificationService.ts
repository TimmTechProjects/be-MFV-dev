import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL =
  process.env.REMINDER_FROM_EMAIL || "My Floral Vault <reminders@myfloral-vault.com>";
const APP_URL = process.env.APP_URL || "https://myfloralvault.com";

interface ReminderEmailParams {
  userName: string;
  userEmail: string;
  plantName: string;
  plantId: string;
  reminderType: string;
  notes: string | null;
}

export async function sendReminderEmail(params: ReminderEmailParams): Promise<boolean> {
  const { userName, userEmail, plantName, plantId, reminderType, notes } = params;

  const emailContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #f8faf8; border-radius: 12px;">
      <h2 style="color: #2d6a4f; margin-top: 0;">🌱 Plant Care Reminder</h2>
      <p style="color: #333; font-size: 16px;">Hi ${userName},</p>
      <p style="color: #333; font-size: 16px;">
        It's time to <strong style="color: #2d6a4f;">${reminderType}</strong> your <strong>${plantName}</strong>!
      </p>
      ${notes ? `<p style="color: #555; font-style: italic; background: #eef5ee; padding: 12px; border-radius: 8px;">📝 ${notes}</p>` : ""}
      <a href="${APP_URL}/vault/${plantId}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #2d6a4f; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">View Plant</a>
      <p style="color: #888; font-size: 12px; margin-top: 24px;">— My Floral Vault</p>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: `🌱 Reminder: ${reminderType} your ${plantName}`,
      html: emailContent,
    });

    if (error) {
      console.error("Failed to send reminder email:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error sending reminder email:", err);
    return false;
  }
}
