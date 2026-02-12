import cron from "node-cron";
import prisma from "../prisma/client";
import { sendReminderEmail } from "./reminderNotificationService";

export async function processReminders(): Promise<{ sent: number; failed: number }> {
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

  const dueReminders = await prisma.careReminder.findMany({
    where: {
      enabled: true,
      notificationSent: false,
      nextDue: { lte: oneHourFromNow },
    },
    include: {
      user: { select: { firstName: true, email: true } },
      plant: { select: { id: true, commonName: true } },
    },
  });

  let sent = 0;
  let failed = 0;

  for (const reminder of dueReminders) {
    const success = await sendReminderEmail({
      userName: reminder.user.firstName,
      userEmail: reminder.user.email,
      plantName: reminder.plant.commonName,
      plantId: reminder.plant.id,
      reminderType: reminder.type,
      notes: reminder.notes,
    });

    if (success) {
      await prisma.careReminder.update({
        where: { id: reminder.id },
        data: { notificationSent: true },
      });
      sent++;
    } else {
      failed++;
    }
  }

  console.log(
    `[ReminderScheduler] Processed ${dueReminders.length} reminders: ${sent} sent, ${failed} failed`
  );

  return { sent, failed };
}

export function startReminderScheduler(): void {
  cron.schedule("0 * * * *", async () => {
    console.log(`[ReminderScheduler] Running at ${new Date().toISOString()}`);
    try {
      await processReminders();
    } catch (err) {
      console.error("[ReminderScheduler] Error:", err);
    }
  });

  console.log("[ReminderScheduler] Cron job scheduled (runs every hour at :00)");
}
