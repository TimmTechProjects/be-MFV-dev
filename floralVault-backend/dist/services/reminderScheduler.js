"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processReminders = processReminders;
exports.startReminderScheduler = startReminderScheduler;
const node_cron_1 = __importDefault(require("node-cron"));
const client_1 = __importDefault(require("../prisma/client"));
const reminderNotificationService_1 = require("./reminderNotificationService");
async function processReminders() {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const dueReminders = await client_1.default.careReminder.findMany({
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
        const success = await (0, reminderNotificationService_1.sendReminderEmail)({
            userName: reminder.user.firstName,
            userEmail: reminder.user.email,
            plantName: reminder.plant.commonName,
            plantId: reminder.plant.id,
            reminderType: reminder.type,
            notes: reminder.notes,
        });
        if (success) {
            await client_1.default.careReminder.update({
                where: { id: reminder.id },
                data: { notificationSent: true },
            });
            sent++;
        }
        else {
            failed++;
        }
    }
    console.log(`[ReminderScheduler] Processed ${dueReminders.length} reminders: ${sent} sent, ${failed} failed`);
    return { sent, failed };
}
function startReminderScheduler() {
    node_cron_1.default.schedule("0 * * * *", async () => {
        console.log(`[ReminderScheduler] Running at ${new Date().toISOString()}`);
        try {
            await processReminders();
        }
        catch (err) {
            console.error("[ReminderScheduler] Error:", err);
        }
    });
    console.log("[ReminderScheduler] Cron job scheduled (runs every hour at :00)");
}
