"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReminders = getReminders;
exports.getDueReminders = getDueReminders;
exports.createReminder = createReminder;
exports.updateReminder = updateReminder;
exports.completeReminder = completeReminder;
exports.deleteReminder = deleteReminder;
exports.snoozeReminder = snoozeReminder;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function getReminders(req, res) {
    const { userId } = req.params;
    const reminders = await prisma.careReminder.findMany({
        where: { userId },
        include: { plant: { select: { commonName: true, botanicalName: true } } },
        orderBy: { nextDue: 'asc' },
    });
    return res.json(reminders);
}
async function getDueReminders(req, res) {
    const { userId } = req.params;
    const reminders = await prisma.careReminder.findMany({
        where: {
            userId,
            enabled: true,
            nextDue: { lte: new Date() },
        },
        include: { plant: { select: { commonName: true, botanicalName: true } } },
        orderBy: { nextDue: 'asc' },
    });
    return res.json(reminders);
}
async function createReminder(req, res) {
    const { userId, plantId, type, frequency, frequencyUnit, nextDue, notes } = req.body;
    if (!userId || !plantId || !type || !frequency || !nextDue) {
        return res.status(400).json({ message: 'userId, plantId, type, frequency, and nextDue are required' });
    }
    const reminder = await prisma.careReminder.create({
        data: {
            userId,
            plantId,
            type,
            frequency,
            frequencyUnit: frequencyUnit || 'days',
            nextDue: new Date(nextDue),
            notes,
        },
        include: { plant: { select: { commonName: true, botanicalName: true } } },
    });
    return res.status(201).json(reminder);
}
async function updateReminder(req, res) {
    const { id } = req.params;
    const { type, frequency, frequencyUnit, nextDue, enabled, notes } = req.body;
    const reminder = await prisma.careReminder.update({
        where: { id },
        data: {
            ...(type !== undefined && { type }),
            ...(frequency !== undefined && { frequency }),
            ...(frequencyUnit !== undefined && { frequencyUnit }),
            ...(nextDue !== undefined && { nextDue: new Date(nextDue) }),
            ...(enabled !== undefined && { enabled }),
            ...(notes !== undefined && { notes }),
        },
        include: { plant: { select: { commonName: true, botanicalName: true } } },
    });
    return res.json(reminder);
}
async function completeReminder(req, res) {
    const { id } = req.params;
    const existing = await prisma.careReminder.findUnique({ where: { id } });
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
    const reminder = await prisma.careReminder.update({
        where: { id },
        data: { lastCompleted: now, nextDue },
        include: { plant: { select: { commonName: true, botanicalName: true } } },
    });
    return res.json(reminder);
}
async function deleteReminder(req, res) {
    const { id } = req.params;
    await prisma.careReminder.delete({ where: { id } });
    return res.status(204).send();
}
async function snoozeReminder(req, res) {
    const { id } = req.params;
    const { snoozeHours = 24 } = req.body; // Default 24 hours
    const existing = await prisma.careReminder.findUnique({ where: { id } });
    if (!existing) {
        return res.status(404).json({ message: 'Reminder not found' });
    }
    const now = new Date();
    const snoozeMs = snoozeHours * 3600000; // Convert hours to milliseconds
    const nextDue = new Date(now.getTime() + snoozeMs);
    const reminder = await prisma.careReminder.update({
        where: { id },
        data: { nextDue },
        include: { plant: { select: { commonName: true, botanicalName: true } } },
    });
    return res.json(reminder);
}
