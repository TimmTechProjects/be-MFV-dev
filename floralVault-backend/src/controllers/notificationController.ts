import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: string;
}

export async function getNotifications(req: AuthRequest, res: Response) {
  try {
    const userId = req.user;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);

    return res.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ message: "Failed to fetch notifications" });
  }
}

export async function markAsRead(req: AuthRequest, res: Response) {
  try {
    const userId = req.user;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    if (notification.userId !== userId) return res.status(403).json({ message: "Forbidden" });

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return res.status(500).json({ message: "Failed to mark as read" });
  }
}

export async function markAllAsRead(req: AuthRequest, res: Response) {
  try {
    const userId = req.user;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all as read:", error);
    return res.status(500).json({ message: "Failed to mark all as read" });
  }
}

export async function deleteNotification(req: AuthRequest, res: Response) {
  try {
    const userId = req.user;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    if (notification.userId !== userId) return res.status(403).json({ message: "Forbidden" });

    await prisma.notification.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting notification:", error);
    return res.status(500).json({ message: "Failed to delete notification" });
  }
}
