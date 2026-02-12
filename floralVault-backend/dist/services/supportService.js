"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportService = void 0;
const client_1 = __importDefault(require("../prisma/client"));
exports.supportService = {
    // Support Tickets
    async createTicket(data) {
        return await client_1.default.supportTicket.create({
            data: {
                subject: data.subject,
                description: data.description,
                priority: data.priority,
                category: data.category,
                userId: data.userId,
                attachments: data.attachments || [],
            },
        });
    },
    async getTickets(userId, status) {
        const where = {};
        if (userId)
            where.userId = userId;
        if (status)
            where.status = status;
        return await client_1.default.supportTicket.findMany({
            where,
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    },
    async getTicketById(id) {
        return await client_1.default.supportTicket.findUnique({
            where: { id },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
    },
    async updateTicketStatus(id, status, assignedTo) {
        const updateData = { status };
        if (status === 'resolved' || status === 'closed') {
            updateData.resolvedAt = new Date();
        }
        if (assignedTo !== undefined) {
            updateData.assignedTo = assignedTo;
        }
        return await client_1.default.supportTicket.update({
            where: { id },
            data: updateData,
        });
    },
    async addTicketMessage(data) {
        return await client_1.default.ticketMessage.create({
            data: {
                ticketId: data.ticketId,
                userId: data.userId,
                message: data.message,
                isStaff: data.isStaff || false,
            },
        });
    },
    // User Suggestions
    async createSuggestion(data) {
        return await client_1.default.userSuggestion.create({
            data: {
                title: data.title,
                description: data.description,
                category: data.category,
                userId: data.userId,
            },
        });
    },
    async getSuggestions(status) {
        const where = {};
        if (status)
            where.status = status;
        return await client_1.default.userSuggestion.findMany({
            where,
            orderBy: [{ votes: 'desc' }, { createdAt: 'desc' }],
        });
    },
    async voteSuggestion(id, increment = true) {
        return await client_1.default.userSuggestion.update({
            where: { id },
            data: {
                votes: {
                    increment: increment ? 1 : -1,
                },
            },
        });
    },
    async updateSuggestionStatus(id, status, adminNotes) {
        return await client_1.default.userSuggestion.update({
            where: { id },
            data: {
                status,
                adminNotes: adminNotes || undefined,
            },
        });
    },
    // Bug Reports
    async createBugReport(data) {
        return await client_1.default.bugReport.create({
            data: {
                title: data.title,
                description: data.description,
                stepsToReproduce: data.stepsToReproduce,
                severity: data.severity,
                userId: data.userId,
                screenshots: data.screenshots || [],
                browserInfo: data.browserInfo,
            },
        });
    },
    async getBugReports(status, severity) {
        const where = {};
        if (status)
            where.status = status;
        if (severity)
            where.severity = severity;
        return await client_1.default.bugReport.findMany({
            where,
            orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
        });
    },
    async updateBugReportStatus(id, status) {
        return await client_1.default.bugReport.update({
            where: { id },
            data: { status },
        });
    },
    // Admin Stats
    async getAdminStats() {
        const [openTickets, resolvedTickets, pendingSuggestions, approvedSuggestions, newBugs, resolvedBugs,] = await Promise.all([
            client_1.default.supportTicket.count({ where: { status: 'open' } }),
            client_1.default.supportTicket.count({ where: { status: 'resolved' } }),
            client_1.default.userSuggestion.count({ where: { status: 'pending' } }),
            client_1.default.userSuggestion.count({ where: { status: 'approved' } }),
            client_1.default.bugReport.count({ where: { status: 'new' } }),
            client_1.default.bugReport.count({ where: { status: 'resolved' } }),
        ]);
        return {
            tickets: {
                open: openTickets,
                resolved: resolvedTickets,
                total: openTickets + resolvedTickets,
            },
            suggestions: {
                pending: pendingSuggestions,
                approved: approvedSuggestions,
            },
            bugs: {
                new: newBugs,
                resolved: resolvedBugs,
            },
        };
    },
};
