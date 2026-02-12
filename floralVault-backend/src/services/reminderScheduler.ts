import cron from "node-cron";
import { processDueReminders } from "./reminderNotificationService";

export function startReminderScheduler() {
  cron.schedule("0 * * * *", async () => {
    console.log(
      `[ReminderScheduler] Running at ${new Date().toISOString()}`
    );
    try {
      const result = await processDueReminders();
      console.log(
        `[ReminderScheduler] Processed: ${result.total} due, ${result.sent} sent, ${result.failed} failed`
      );
    } catch (error) {
      console.error("[ReminderScheduler] Error processing reminders:", error);
    }
  });

  console.log("[ReminderScheduler] Started - runs every hour at :00");
}
