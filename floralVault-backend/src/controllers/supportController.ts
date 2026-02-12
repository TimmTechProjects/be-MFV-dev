import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: string;
}

const userSelect = {
  id: true,
  username: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
};

export async function createTicket(req: AuthRequest, res: Response) {
  try {
    const userId = req.user;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { subject, category, priority, message } = req.body;
    if (!subject || !category) {
      return res.status(400).json({ message: "Subject and category are required" });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        subject,
        category,
        priority: priority || "MEDIUM",
        messages: message
          ? { create: { userId, message, isStaff: false } }
          : undefined,
      },
      include: {
        user: { select: userSelect },
        messages: { include: { user: { select: userSelect } } },
      },
    });

    return res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return res.status(500).json({ message: "Failed to create ticket" });
  }
}

export async function getUserTickets(req: AuthRequest, res: Response) {
  try {
    const userId = req.user;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId };
    if (status) where.status = status;

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        include: {
          _count: { select: { messages: true } },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.supportTicket.count({ where }),
    ]);

    return res.json({
      success: true,
      data: tickets,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return res.status(500).json({ message: "Failed to fetch tickets" });
  }
}

export async function getTicket(req: AuthRequest, res: Response) {
  try {
    const userId = req.user;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { id } = req.params;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: { select: userSelect },
        messages: {
          include: { user: { select: userSelect } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    if (ticket.userId !== userId) return res.status(403).json({ message: "Forbidden" });

    return res.json({ success: true, data: ticket });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return res.status(500).json({ message: "Failed to fetch ticket" });
  }
}

export async function addMessage(req: AuthRequest, res: Response) {
  try {
    const userId = req.user;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { id } = req.params;
    const { message } = req.body;

    if (!message) return res.status(400).json({ message: "Message is required" });

    const ticket = await prisma.supportTicket.findUnique({ where: { id } });
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const ticketMessage = await prisma.ticketMessage.create({
      data: { ticketId: id, userId, message, isStaff: false },
      include: { user: { select: userSelect } },
    });

    await prisma.supportTicket.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return res.status(201).json({ success: true, data: ticketMessage });
  } catch (error) {
    console.error("Error adding message:", error);
    return res.status(500).json({ message: "Failed to add message" });
  }
}

export async function updateTicketStatus(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) return res.status(400).json({ message: "Status is required" });

    const data: Record<string, unknown> = { status };
    if (status === "CLOSED" || status === "RESOLVED") {
      data.closedAt = new Date();
    }

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data,
      include: { user: { select: userSelect } },
    });

    return res.json({ success: true, data: ticket });
  } catch (error) {
    console.error("Error updating ticket status:", error);
    return res.status(500).json({ message: "Failed to update status" });
  }
}

export async function getAdminTickets(req: AuthRequest, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const priority = req.query.priority as string;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        include: {
          user: { select: userSelect },
          _count: { select: { messages: true } },
        },
        orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.supportTicket.count({ where }),
    ]);

    return res.json({
      success: true,
      data: tickets,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching admin tickets:", error);
    return res.status(500).json({ message: "Failed to fetch tickets" });
  }
}

export async function getAdminStats(_req: AuthRequest, res: Response) {
  try {
    const [total, open, inProgress, resolved, closed] = await Promise.all([
      prisma.supportTicket.count(),
      prisma.supportTicket.count({ where: { status: "OPEN" } }),
      prisma.supportTicket.count({ where: { status: "IN_PROGRESS" } }),
      prisma.supportTicket.count({ where: { status: "RESOLVED" } }),
      prisma.supportTicket.count({ where: { status: "CLOSED" } }),
    ]);

    return res.json({
      success: true,
      data: { total, open, inProgress, resolved, closed },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return res.status(500).json({ message: "Failed to fetch stats" });
  }
}

export async function adminReply(req: AuthRequest, res: Response) {
  try {
    const userId = req.user;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { id } = req.params;
    const { message } = req.body;

    if (!message) return res.status(400).json({ message: "Message is required" });

    const ticket = await prisma.supportTicket.findUnique({ where: { id } });
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const ticketMessage = await prisma.ticketMessage.create({
      data: { ticketId: id, userId, message, isStaff: true },
      include: { user: { select: userSelect } },
    });

    await prisma.supportTicket.update({
      where: { id },
      data: { status: "IN_PROGRESS", updatedAt: new Date() },
    });

    await prisma.notification.create({
      data: {
        userId: ticket.userId,
        type: "SYSTEM",
        title: "Support ticket update",
        message: `Your ticket "${ticket.subject}" has a new reply`,
        link: `/support/tickets/${id}`,
      },
    });

    return res.status(201).json({ success: true, data: ticketMessage });
  } catch (error) {
    console.error("Error adding admin reply:", error);
    return res.status(500).json({ message: "Failed to add reply" });
  }
}
