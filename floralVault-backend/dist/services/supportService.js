"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTicketNumber = generateTicketNumber;
exports.generateEmailThreadId = generateEmailThreadId;
exports.createPublicTicket = createPublicTicket;
exports.createUserTicket = createUserTicket;
exports.getUserTickets = getUserTickets;
exports.getTicketById = getTicketById;
exports.getTicketByNumber = getTicketByNumber;
exports.addUserReply = addUserReply;
exports.getAdminTickets = getAdminTickets;
exports.addAdminReply = addAdminReply;
exports.assignTicket = assignTicket;
exports.updateTicketStatus = updateTicketStatus;
exports.updateTicketPriority = updateTicketPriority;
exports.getAdminStats = getAdminStats;
exports.processEmailReply = processEmailReply;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const TICKET_NUMBER_START = 1001;
async function generateTicketNumber() {
    const lastTicket = await prisma.supportTicket.findFirst({
        orderBy: { createdAt: "desc" },
        select: { ticketNumber: true },
    });
    let nextNumber = TICKET_NUMBER_START;
    if (lastTicket?.ticketNumber) {
        const match = lastTicket.ticketNumber.match(/TICKET-(\d+)/);
        if (match) {
            nextNumber = parseInt(match[1], 10) + 1;
        }
    }
    return `TICKET-${nextNumber}`;
}
function generateEmailThreadId(ticketNumber) {
    const domain = "myfloralvault.com";
    return `<${ticketNumber.toLowerCase()}@${domain}>`;
}
const userSelect = {
    id: true,
    username: true,
    firstName: true,
    lastName: true,
    avatarUrl: true,
};
const replyInclude = {
    user: { select: userSelect },
    attachments: true,
};
const ticketInclude = {
    user: { select: userSelect },
    assignedTo: { select: userSelect },
    replies: {
        include: replyInclude,
        orderBy: { createdAt: "asc" },
    },
    attachments: true,
};
const ticketListInclude = {
    user: { select: userSelect },
    assignedTo: { select: userSelect },
    _count: { select: { replies: true, attachments: true } },
};
async function createPublicTicket(input) {
    const ticketNumber = await generateTicketNumber();
    const emailThreadId = generateEmailThreadId(ticketNumber);
    const ticket = await prisma.supportTicket.create({
        data: {
            ticketNumber,
            email: input.email,
            name: input.name,
            subject: input.subject,
            category: input.category,
            priority: input.priority || "MEDIUM",
            emailThreadId,
            replies: {
                create: {
                    message: input.message,
                    isStaff: false,
                    senderName: input.name,
                    senderEmail: input.email,
                    source: "WEB",
                },
            },
        },
        include: ticketInclude,
    });
    return ticket;
}
async function createUserTicket(input) {
    const user = await prisma.user.findUnique({
        where: { id: input.userId },
        select: { id: true, email: true, firstName: true, lastName: true },
    });
    if (!user)
        throw new Error("User not found");
    const ticketNumber = await generateTicketNumber();
    const emailThreadId = generateEmailThreadId(ticketNumber);
    const userName = `${user.firstName} ${user.lastName}`;
    const ticket = await prisma.supportTicket.create({
        data: {
            ticketNumber,
            userId: input.userId,
            email: user.email,
            name: userName,
            subject: input.subject,
            category: input.category,
            priority: input.priority || "MEDIUM",
            emailThreadId,
            replies: {
                create: {
                    userId: input.userId,
                    message: input.message,
                    isStaff: false,
                    senderName: userName,
                    senderEmail: user.email,
                    source: "WEB",
                },
            },
        },
        include: ticketInclude,
    });
    return ticket;
}
async function getUserTickets(userId, page, limit, filter) {
    const skip = (page - 1) * limit;
    const where = { userId };
    if (filter.status)
        where.status = filter.status;
    const [tickets, total] = await Promise.all([
        prisma.supportTicket.findMany({
            where,
            include: ticketListInclude,
            orderBy: { updatedAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.supportTicket.count({ where }),
    ]);
    return {
        tickets,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
}
async function getTicketById(ticketId) {
    return prisma.supportTicket.findUnique({
        where: { id: ticketId },
        include: ticketInclude,
    });
}
async function getTicketByNumber(ticketNumber) {
    return prisma.supportTicket.findUnique({
        where: { ticketNumber },
        include: ticketInclude,
    });
}
async function addUserReply(ticketId, userId, message) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, firstName: true, lastName: true },
    });
    const reply = await prisma.supportReply.create({
        data: {
            ticketId,
            userId,
            message,
            isStaff: false,
            senderName: user ? `${user.firstName} ${user.lastName}` : undefined,
            senderEmail: user?.email,
            source: "WEB",
        },
        include: replyInclude,
    });
    await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { updatedAt: new Date() },
    });
    return reply;
}
async function getAdminTickets(page, limit, filter) {
    const skip = (page - 1) * limit;
    const where = {};
    if (filter.status)
        where.status = filter.status;
    if (filter.priority)
        where.priority = filter.priority;
    if (filter.category)
        where.category = filter.category;
    if (filter.assignedToId)
        where.assignedToId = filter.assignedToId;
    if (filter.search) {
        where.OR = [
            { subject: { contains: filter.search, mode: "insensitive" } },
            { ticketNumber: { contains: filter.search, mode: "insensitive" } },
            { email: { contains: filter.search, mode: "insensitive" } },
            { name: { contains: filter.search, mode: "insensitive" } },
        ];
    }
    const [tickets, total] = await Promise.all([
        prisma.supportTicket.findMany({
            where,
            include: ticketListInclude,
            orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
            skip,
            take: limit,
        }),
        prisma.supportTicket.count({ where }),
    ]);
    return {
        tickets,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
}
async function addAdminReply(ticketId, userId, message) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, firstName: true, lastName: true },
    });
    const reply = await prisma.supportReply.create({
        data: {
            ticketId,
            userId,
            message,
            isStaff: true,
            senderName: user ? `${user.firstName} ${user.lastName}` : "Support Team",
            senderEmail: user?.email,
            source: "ADMIN",
        },
        include: replyInclude,
    });
    await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: "IN_PROGRESS", updatedAt: new Date() },
    });
    const ticket = await prisma.supportTicket.findUnique({
        where: { id: ticketId },
        select: { userId: true, subject: true },
    });
    if (ticket?.userId) {
        await prisma.notification.create({
            data: {
                userId: ticket.userId,
                type: "SYSTEM",
                title: "Support ticket update",
                message: `Your ticket "${ticket.subject}" has a new reply`,
                link: `/support/tickets/${ticketId}`,
            },
        });
    }
    return reply;
}
async function assignTicket(ticketId, assignedToId) {
    return prisma.supportTicket.update({
        where: { id: ticketId },
        data: { assignedToId },
        include: ticketListInclude,
    });
}
async function updateTicketStatus(ticketId, status) {
    const data = { status };
    if (status === "CLOSED" || status === "RESOLVED") {
        data.closedAt = new Date();
    }
    return prisma.supportTicket.update({
        where: { id: ticketId },
        data,
        include: ticketListInclude,
    });
}
async function updateTicketPriority(ticketId, priority) {
    return prisma.supportTicket.update({
        where: { id: ticketId },
        data: { priority },
        include: ticketListInclude,
    });
}
async function getAdminStats() {
    const [total, open, inProgress, resolved, closed, byCategory, byPriority] = await Promise.all([
        prisma.supportTicket.count(),
        prisma.supportTicket.count({ where: { status: "OPEN" } }),
        prisma.supportTicket.count({ where: { status: "IN_PROGRESS" } }),
        prisma.supportTicket.count({ where: { status: "RESOLVED" } }),
        prisma.supportTicket.count({ where: { status: "CLOSED" } }),
        prisma.supportTicket.groupBy({
            by: ["category"],
            _count: { id: true },
        }),
        prisma.supportTicket.groupBy({
            by: ["priority"],
            _count: { id: true },
        }),
    ]);
    return {
        total,
        open,
        inProgress,
        resolved,
        closed,
        byCategory: byCategory.reduce((acc, item) => ({ ...acc, [item.category]: item._count.id }), {}),
        byPriority: byPriority.reduce((acc, item) => ({ ...acc, [item.priority]: item._count.id }), {}),
    };
}
async function processEmailReply(fromEmail, fromName, subject, body, inReplyTo) {
    let ticket = null;
    if (inReplyTo) {
        ticket = await prisma.supportTicket.findUnique({
            where: { emailThreadId: inReplyTo },
        });
    }
    if (!ticket) {
        const ticketNumberMatch = subject.match(/TICKET-\d+/i);
        if (ticketNumberMatch) {
            ticket = await prisma.supportTicket.findUnique({
                where: { ticketNumber: ticketNumberMatch[0].toUpperCase() },
            });
        }
    }
    if (ticket) {
        const user = await prisma.user.findFirst({
            where: { email: fromEmail },
            select: { id: true },
        });
        const reply = await prisma.supportReply.create({
            data: {
                ticketId: ticket.id,
                userId: user?.id,
                message: body,
                isStaff: false,
                senderName: fromName,
                senderEmail: fromEmail,
                source: "EMAIL",
            },
            include: replyInclude,
        });
        if (ticket.status === "CLOSED" || ticket.status === "RESOLVED") {
            await prisma.supportTicket.update({
                where: { id: ticket.id },
                data: { status: "OPEN", closedAt: null, updatedAt: new Date() },
            });
        }
        else {
            await prisma.supportTicket.update({
                where: { id: ticket.id },
                data: { updatedAt: new Date() },
            });
        }
        return { action: "reply_added", ticket, reply };
    }
    const user = await prisma.user.findFirst({
        where: { email: fromEmail },
        select: { id: true },
    });
    const newTicket = await createPublicTicket({
        name: fromName,
        email: fromEmail,
        subject: subject || "Email Support Request",
        category: "OTHER",
        message: body,
    });
    return { action: "ticket_created", ticket: newTicket, reply: null };
}
