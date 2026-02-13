import { Request, Response } from "express";
import {
  createPublicTicket,
  createUserTicket,
  getUserTickets,
  getTicketById,
  addUserReply,
  getAdminTickets,
  addAdminReply,
  assignTicket,
  updateTicketStatus,
  updateTicketPriority,
  getAdminStats,
  processEmailReply,
} from "../services/supportService";
import {
  sendTicketConfirmation,
  sendAdminNotification,
  sendReplyNotification,
  sendStatusUpdateEmail,
} from "../services/supportEmailService";
import { TicketStatus, TicketPriority, TicketCategory } from "@prisma/client";

interface AuthRequest extends Request {
  user?: string;
}

// ========== PUBLIC ENDPOINTS ==========

export async function submitPublicTicket(req: Request, res: Response) {
  try {
    const { name, email, subject, category, priority, message } = req.body;

    if (!name || !email || !subject || !category || !message) {
      return res
        .status(400)
        .json({ message: "Name, email, subject, category, and message are required" });
    }

    if (!Object.values(TicketCategory).includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const ticket = await createPublicTicket({
      name,
      email,
      subject,
      category,
      priority: priority || undefined,
      message,
    });

    sendTicketConfirmation({
      ticketNumber: ticket.ticketNumber,
      recipientEmail: email,
      recipientName: name,
      subject,
      emailThreadId: ticket.emailThreadId || "",
    }).catch((err) => console.error("[Support] Confirmation email failed:", err));

    sendAdminNotification({
      ticketNumber: ticket.ticketNumber,
      subject,
      category,
      priority: ticket.priority,
      senderName: name,
      senderEmail: email,
      message,
    }).catch((err) => console.error("[Support] Admin notification failed:", err));

    return res.status(201).json({
      success: true,
      data: {
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        status: ticket.status,
        createdAt: ticket.createdAt,
      },
    });
  } catch (error) {
    console.error("Error submitting public ticket:", error);
    return res.status(500).json({ message: "Failed to submit ticket" });
  }
}

// ========== USER ENDPOINTS ==========

export async function createTicket(req: AuthRequest, res: Response) {
  try {
    const userId = req.user;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { subject, category, priority, message } = req.body;
    if (!subject || !category || !message) {
      return res.status(400).json({ message: "Subject, category, and message are required" });
    }

    if (!Object.values(TicketCategory).includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const ticket = await createUserTicket({
      userId,
      subject,
      category,
      priority: priority || undefined,
      message,
    });

    sendTicketConfirmation({
      ticketNumber: ticket.ticketNumber,
      recipientEmail: ticket.email,
      recipientName: ticket.name,
      subject,
      emailThreadId: ticket.emailThreadId || "",
    }).catch((err) => console.error("[Support] Confirmation email failed:", err));

    sendAdminNotification({
      ticketNumber: ticket.ticketNumber,
      subject,
      category,
      priority: ticket.priority,
      senderName: ticket.name,
      senderEmail: ticket.email,
      message,
    }).catch((err) => console.error("[Support] Admin notification failed:", err));

    return res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return res.status(500).json({ message: "Failed to create ticket" });
  }
}

export async function listUserTickets(req: AuthRequest, res: Response) {
  try {
    const userId = req.user;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as TicketStatus | undefined;

    const result = await getUserTickets(userId, page, limit, { status });

    return res.json({ success: true, data: result.tickets, pagination: result.pagination });
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    return res.status(500).json({ message: "Failed to fetch tickets" });
  }
}

export async function getTicket(req: AuthRequest, res: Response) {
  try {
    const userId = req.user;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { id } = req.params;

    const ticket = await getTicketById(id);
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

    const ticket = await getTicketById(id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    if (ticket.userId !== userId) return res.status(403).json({ message: "Forbidden" });

    const reply = await addUserReply(id, userId, message);

    return res.status(201).json({ success: true, data: reply });
  } catch (error) {
    console.error("Error adding message:", error);
    return res.status(500).json({ message: "Failed to add message" });
  }
}

// ========== ADMIN ENDPOINTS ==========

export async function listAdminTickets(req: AuthRequest, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as TicketStatus | undefined;
    const priority = req.query.priority as TicketPriority | undefined;
    const category = req.query.category as TicketCategory | undefined;
    const assignedToId = req.query.assignedToId as string | undefined;
    const search = req.query.search as string | undefined;

    const result = await getAdminTickets(page, limit, {
      status,
      priority,
      category,
      assignedToId,
      search,
    });

    return res.json({ success: true, data: result.tickets, pagination: result.pagination });
  } catch (error) {
    console.error("Error fetching admin tickets:", error);
    return res.status(500).json({ message: "Failed to fetch tickets" });
  }
}

export async function getAdminTicket(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const ticket = await getTicketById(id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    return res.json({ success: true, data: ticket });
  } catch (error) {
    console.error("Error fetching admin ticket:", error);
    return res.status(500).json({ message: "Failed to fetch ticket" });
  }
}

export async function adminReplyToTicket(req: AuthRequest, res: Response) {
  try {
    const userId = req.user;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { id } = req.params;
    const { message } = req.body;

    if (!message) return res.status(400).json({ message: "Message is required" });

    const ticket = await getTicketById(id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const reply = await addAdminReply(id, userId, message);

    if (ticket.emailThreadId) {
      sendReplyNotification({
        ticketNumber: ticket.ticketNumber,
        recipientEmail: ticket.email,
        recipientName: ticket.name,
        subject: ticket.subject,
        replyMessage: message,
        replierName: "Support Team",
        emailThreadId: ticket.emailThreadId,
      }).catch((err) => console.error("[Support] Reply notification failed:", err));
    }

    return res.status(201).json({ success: true, data: reply });
  } catch (error) {
    console.error("Error adding admin reply:", error);
    return res.status(500).json({ message: "Failed to add reply" });
  }
}

export async function assignTicketHandler(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { assignedToId } = req.body;

    const ticket = await getTicketById(id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const updated = await assignTicket(id, assignedToId || null);

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error assigning ticket:", error);
    return res.status(500).json({ message: "Failed to assign ticket" });
  }
}

export async function updateStatus(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) return res.status(400).json({ message: "Status is required" });
    if (!Object.values(TicketStatus).includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const ticket = await getTicketById(id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const updated = await updateTicketStatus(id, status);

    if (ticket.emailThreadId) {
      sendStatusUpdateEmail({
        ticketNumber: ticket.ticketNumber,
        recipientEmail: ticket.email,
        recipientName: ticket.name,
        subject: ticket.subject,
        newStatus: status,
        emailThreadId: ticket.emailThreadId,
      }).catch((err) => console.error("[Support] Status email failed:", err));
    }

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating ticket status:", error);
    return res.status(500).json({ message: "Failed to update status" });
  }
}

export async function updatePriority(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    if (!priority) return res.status(400).json({ message: "Priority is required" });
    if (!Object.values(TicketPriority).includes(priority)) {
      return res.status(400).json({ message: "Invalid priority" });
    }

    const ticket = await getTicketById(id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const updated = await updateTicketPriority(id, priority);

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating ticket priority:", error);
    return res.status(500).json({ message: "Failed to update priority" });
  }
}

export async function adminStats(_req: AuthRequest, res: Response) {
  try {
    const stats = await getAdminStats();
    return res.json({ success: true, data: stats });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return res.status(500).json({ message: "Failed to fetch stats" });
  }
}

// ========== EMAIL WEBHOOK ENDPOINT ==========

export async function emailWebhook(req: Request, res: Response) {
  try {
    const webhookSecret = process.env.SUPPORT_WEBHOOK_SECRET;
    if (webhookSecret) {
      const authHeader = req.headers["x-webhook-secret"] || req.headers.authorization;
      if (authHeader !== webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
        return res.status(401).json({ message: "Unauthorized" });
      }
    }

    const { from_email, from_name, subject, text_body, html_body, in_reply_to, headers } = req.body;

    if (!from_email) {
      return res.status(400).json({ message: "from_email is required" });
    }

    const body = text_body || html_body || "";
    const senderName = from_name || from_email.split("@")[0];

    let replyToHeader = in_reply_to;
    if (!replyToHeader && headers) {
      replyToHeader = headers["In-Reply-To"] || headers["in-reply-to"];
    }

    const result = await processEmailReply(
      from_email,
      senderName,
      subject || "Email Support Request",
      body,
      replyToHeader
    );

    if (result.action === "ticket_created" && result.ticket.emailThreadId) {
      sendTicketConfirmation({
        ticketNumber: result.ticket.ticketNumber,
        recipientEmail: from_email,
        recipientName: senderName,
        subject: subject || "Email Support Request",
        emailThreadId: result.ticket.emailThreadId,
      }).catch((err) => console.error("[Support] Email confirmation failed:", err));

      sendAdminNotification({
        ticketNumber: result.ticket.ticketNumber,
        subject: subject || "Email Support Request",
        category: "OTHER",
        priority: "MEDIUM",
        senderName,
        senderEmail: from_email,
        message: body,
      }).catch((err) => console.error("[Support] Admin notification failed:", err));
    }

    return res.json({
      success: true,
      action: result.action,
      ticketNumber: result.ticket.ticketNumber,
    });
  } catch (error) {
    console.error("Error processing email webhook:", error);
    return res.status(500).json({ message: "Failed to process email" });
  }
}
