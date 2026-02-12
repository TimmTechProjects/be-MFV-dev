import { Router, Request, Response } from "express";
import { processDueReminders } from "../services/reminderNotificationService";

const router = Router();

router.post("/send-reminders", async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const result = await processDueReminders();
    res.json({
      message: "Reminder processing complete",
      ...result,
    });
  } catch (error) {
    console.error("[CronRoute] Error processing reminders:", error);
    res.status(500).json({ message: "Failed to process reminders" });
  }
});

export default router;
