import { Resend } from "resend";
import prisma from "../prisma/client";

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = process.env.APP_URL || "https://myfloralvault.com";
const FROM_EMAIL =
  process.env.REMINDER_FROM_EMAIL ||
  "My Floral Vault <reminders@myfloral-vault.com>";

interface ReminderWithRelations {
  id: string;
  type: string;
  notes: string | null;
  nextDue: Date;
  user: { id: string; firstName: string; email: string };
  plant: { id: string; commonName: string; botanicalName: string };
}

export async function sendReminderEmail(reminder: ReminderWithRelations) {
  const { user, plant } = reminder;

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2d5a27;">Plant Care Reminder</h2>
      <p>Hi ${user.firstName},</p>
      <p>It's time to <strong>${reminder.type}</strong> your <strong>${plant.commonName}</strong> (<em>${plant.botanicalName}</em>)!</p>
      ${reminder.notes ? `<p style="color: #666;"><em>Notes: ${reminder.notes}</em></p>` : ""}
      <p>
        <a href="${APP_URL}/vault/${plant.id}" style="display: inline-block; padding: 10px 20px; background-color: #2d5a27; color: white; text-decoration: none; border-radius: 5px;">
          View Plant
        </a>
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #999; font-size: 12px;">
        You're receiving this because you set up a care reminder on My Floral Vault.
      </p>
    </div>
  `;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: user.email,
    subject: `Plant Care Reminder: ${reminder.type} your ${plant.commonName}`,
    html: emailContent,
  });
}

export async function processDueReminders() {
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

  const dueReminders = await prisma.careReminder.findMany({
    where: {
      enabled: true,
      notificationSent: false,
      nextDue: { lte: oneHourFromNow },
    },
    include: {
      user: { select: { id: true, firstName: true, email: true } },
      plant: {
        select: { id: true, commonName: true, botanicalName: true },
      },
    },
  });

  let sent = 0;
  let failed = 0;

  for (const reminder of dueReminders) {
    try {
      await sendReminderEmail(reminder);
      await prisma.careReminder.update({
        where: { id: reminder.id },
        data: { notificationSent: true },
      });
      sent++;
    } catch (error) {
      console.error(
        `Failed to send reminder ${reminder.id} for plant ${reminder.plant.commonName}:`,
        error
      );
      failed++;
    }
  }

  return { total: dueReminders.length, sent, failed };
}
