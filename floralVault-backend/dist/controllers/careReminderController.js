"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReminders = getReminders;
exports.getDueReminders = getDueReminders;
exports.createReminder = createReminder;
exports.updateReminder = updateReminder;
exports.completeReminder = completeReminder;
exports.deleteReminder = deleteReminder;
const client_1 = __importDefault(require("../prisma/client"));
const PLANT_SELECT = {
    id: true,
    commonName: true,
    botanicalName: true,
    images: { where: { isMain: true }, select: { url: true }, take: 1 },
};
function addIsOverdue(reminder) {
    return {
        ...reminder,
        isOverdue: reminder.enabled && reminder.nextDue < new Date(),
    };
}
async function getReminders(req, res) {
    const { userId } = req.params;
    const { upcoming, overdue } = req.query;
    const now = new Date();
    const where = { userId };
    if (upcoming === 'true') {
        where.enabled = true;
        where.nextDue = { gt: now };
    }
    else if (overdue === 'true') {
        where.enabled = true;
        where.nextDue = { lte: now };
    }
    const reminders = await client_1.default.careReminder.findMany({
        where,
        include: { plant: { select: PLANT_SELECT } },
        orderBy: { nextDue: 'asc' },
    });
    return res.json(reminders.map(addIsOverdue));
}
async function getDueReminders(req, res) {
    const { userId } = req.params;
    const reminders = await client_1.default.careReminder.findMany({
        where: {
            userId,
            enabled: true,
            nextDue: { lte: new Date() },
        },
        include: { plant: { select: PLANT_SELECT } },
        orderBy: { nextDue: 'asc' },
    });
    return res.json(reminders.map(addIsOverdue));
}
async function createReminder(req, res) {
    const { userId, plantId, type, frequency, frequencyUnit, nextDue, notes } = req.body;
    if (!userId || !plantId || !type || !frequency || !nextDue) {
        return res.status(400).json({ message: 'userId, plantId, type, frequency, and nextDue are required' });
    }
    const plant = await client_1.default.plant.findUnique({ where: { id: plantId } });
    if (!plant) {
        return res.status(404).json({ message: 'Plant not found' });
    }
    if (plant.userId !== userId) {
        return res.status(403).json({ message: 'You can only create reminders for your own plants' });
    }
    const reminder = await client_1.default.careReminder.create({
        data: {
            userId,
            plantId,
            type,
            frequency,
            frequencyUnit: frequencyUnit || 'days',
            nextDue: new Date(nextDue),
            notes,
        },
        include: { plant: { select: PLANT_SELECT } },
    });
    return res.status(201).json(addIsOverdue(reminder));
}
async function updateReminder(req, res) {
    const { id } = req.params;
    const { type, frequency, frequencyUnit, nextDue, enabled, notes } = req.body;
    const existing = await client_1.default.careReminder.findUnique({ where: { id } });
    if (!existing) {
        return res.status(404).json({ message: 'Reminder not found' });
    }
    const reminder = await client_1.default.careReminder.update({
        where: { id },
        data: {
            ...(type !== undefined && { type }),
            ...(frequency !== undefined && { frequency }),
            ...(frequencyUnit !== undefined && { frequencyUnit }),
            ...(nextDue !== undefined && { nextDue: new Date(nextDue) }),
            ...(enabled !== undefined && { enabled }),
            ...(notes !== undefined && { notes }),
        },
        include: { plant: { select: PLANT_SELECT } },
    });
    return res.json(addIsOverdue(reminder));
}
async function completeReminder(req, res) {
    const { id } = req.params;
    const existing = await client_1.default.careReminder.findUnique({ where: { id } });
    if (!existing) {
        return res.status(404).json({ message: 'Reminder not found' });
    }
    const now = new Date();
    const msPerUnit = {
        hours: 3600000,
        days: 86400000,
        weeks: 604800000,
        months: 2592000000,
    };
    const interval = existing.frequency * (msPerUnit[existing.frequencyUnit] || 86400000);
    const nextDue = new Date(now.getTime() + interval);
    const reminder = await client_1.default.careReminder.update({
        where: { id },
        data: { lastCompleted: now, nextDue, notificationSent: false },
        include: { plant: { select: PLANT_SELECT } },
    });
    return res.json(addIsOverdue(reminder));
}
async function deleteReminder(req, res) {
    const { id } = req.params;
    const existing = await client_1.default.careReminder.findUnique({ where: { id } });
    if (!existing) {
        return res.status(404).json({ message: 'Reminder not found' });
    }
    await client_1.default.careReminder.delete({ where: { id } });
    return res.status(204).send();
}
