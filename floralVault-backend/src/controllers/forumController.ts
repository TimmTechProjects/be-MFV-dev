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

export async function getCategories(_req: Request, res: Response) {
  try {
    const categories = await prisma.forumCategory.findMany({
      include: {
        _count: { select: { threads: true } },
      },
      orderBy: { name: "asc" },
    });

    return res.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({ message: "Failed to fetch categories" });
  }
}

export async function createCategory(req: AuthRequest, res: Response) {
  try {
    const { name, description, icon } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const category = await prisma.forumCategory.create({
      data: { name, slug, description, icon },
    });

    return res.status(201).json({ success: true, data: category });
  } catch (error) {
    console.error("Error creating category:", error);
    return res.status(500).json({ message: "Failed to create category" });
  }
}

export async function getThreads(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const categoryId = req.query.categoryId as string;
    const sort = (req.query.sort as string) || "new";
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (categoryId) where.categoryId = categoryId;

    let orderBy: Record<string, string>[];
    switch (sort) {
      case "hot":
        orderBy = [{ views: "desc" }, { createdAt: "desc" }];
        break;
      case "top":
        orderBy = [{ createdAt: "desc" }];
        break;
      default:
        orderBy = [{ isPinned: "desc" }, { createdAt: "desc" }];
    }

    const [threads, total] = await Promise.all([
      prisma.forumThread.findMany({
        where,
        include: {
          user: { select: userSelect },
          category: true,
          votes: true,
          _count: { select: { replies: true, votes: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.forumThread.count({ where }),
    ]);

    return res.json({
      success: true,
      data: threads,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching threads:", error);
    return res.status(500).json({ message: "Failed to fetch threads" });
  }
}

export async function createThread(req: AuthRequest, res: Response) {
  try {
    const userId = req.user;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { categoryId, title, content } = req.body;
    if (!categoryId || !title || !content) {
      return res.status(400).json({ message: "categoryId, title, and content are required" });
    }

    const thread = await prisma.forumThread.create({
      data: { categoryId, userId, title, content },
      include: {
        user: { select: userSelect },
        category: true,
        _count: { select: { replies: true, votes: true } },
      },
    });

    return res.status(201).json({ success: true, data: thread });
  } catch (error) {
    console.error("Error creating thread:", error);
    return res.status(500).json({ message: "Failed to create thread" });
  }
}

export async function getThread(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const thread = await prisma.forumThread.update({
      where: { id },
      data: { views: { increment: 1 } },
      include: {
        user: { select: userSelect },
        category: true,
        votes: true,
        replies: {
          where: { parentId: null },
          include: {
            user: { select: userSelect },
            votes: true,
            replies: {
              include: {
                user: { select: userSelect },
                votes: true,
                replies: { include: { user: { select: userSelect }, votes: true } },
              },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        _count: { select: { replies: true, votes: true } },
      },
    });

    return res.json({ success: true, data: thread });
  } catch (error) {
    console.error("Error fetching thread:", error);
    return res.status(500).json({ message: "Failed to fetch thread" });
  }
}

export async function updateThread(req: AuthRequest, res: Response) {
  try {
    const userId = req.user;
    const { id } = req.params;
    const { title, content } = req.body;

    const thread = await prisma.forumThread.findUnique({ where: { id } });
    if (!thread) return res.status(404).json({ message: "Thread not found" });
    if (thread.userId !== userId) return res.status(403).json({ message: "Forbidden" });

    const updated = await prisma.forumThread.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
      },
      include: { user: { select: userSelect }, category: true },
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating thread:", error);
    return res.status(500).json({ message: "Failed to update thread" });
  }
}

export async function deleteThread(req: AuthRequest, res: Response) {
  try {
    const userId = req.user;
    const { id } = req.params;

    const thread = await prisma.forumThread.findUnique({ where: { id } });
    if (!thread) return res.status(404).json({ message: "Thread not found" });
    if (thread.userId !== userId) return res.status(403).json({ message: "Forbidden" });

    await prisma.forumThread.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting thread:", error);
    return res.status(500).json({ message: "Failed to delete thread" });
  }
}

export async function addReply(req: AuthRequest, res: Response) {
  try {
    const userId = req.user;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { id } = req.params;
    const { content, parentId } = req.body;

    if (!content) return res.status(400).json({ message: "Content is required" });

    const thread = await prisma.forumThread.findUnique({ where: { id } });
    if (!thread) return res.status(404).json({ message: "Thread not found" });
    if (thread.isLocked) return res.status(403).json({ message: "Thread is locked" });

    const reply = await prisma.forumReply.create({
      data: { threadId: id, userId, content, parentId: parentId || null },
      include: { user: { select: userSelect }, votes: true },
    });

    if (thread.userId !== userId) {
      await prisma.notification.create({
        data: {
          userId: thread.userId,
          type: "FORUM_REPLY",
          title: "New reply to your thread",
          message: content.substring(0, 100),
          link: `/forum/thread/${id}`,
        },
      });
    }

    return res.status(201).json({ success: true, data: reply });
  } catch (error) {
    console.error("Error adding reply:", error);
    return res.status(500).json({ message: "Failed to add reply" });
  }
}

export async function voteThread(req: AuthRequest, res: Response) {
  try {
    const userId = req.user;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { id } = req.params;
    const { value } = req.body;

    if (value !== 1 && value !== -1) {
      return res.status(400).json({ message: "Value must be 1 or -1" });
    }

    const existing = await prisma.forumThreadVote.findUnique({
      where: { threadId_userId: { threadId: id, userId } },
    });

    if (existing) {
      if (existing.value === value) {
        await prisma.forumThreadVote.delete({ where: { id: existing.id } });
        return res.json({ success: true, vote: null });
      }
      const updated = await prisma.forumThreadVote.update({
        where: { id: existing.id },
        data: { value },
      });
      return res.json({ success: true, vote: updated });
    }

    const vote = await prisma.forumThreadVote.create({
      data: { threadId: id, userId, value },
    });

    return res.json({ success: true, vote });
  } catch (error) {
    console.error("Error voting on thread:", error);
    return res.status(500).json({ message: "Failed to vote" });
  }
}

export async function voteReply(req: AuthRequest, res: Response) {
  try {
    const userId = req.user;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { id } = req.params;
    const { value } = req.body;

    if (value !== 1 && value !== -1) {
      return res.status(400).json({ message: "Value must be 1 or -1" });
    }

    const existing = await prisma.forumReplyVote.findUnique({
      where: { replyId_userId: { replyId: id, userId } },
    });

    if (existing) {
      if (existing.value === value) {
        await prisma.forumReplyVote.delete({ where: { id: existing.id } });
        return res.json({ success: true, vote: null });
      }
      const updated = await prisma.forumReplyVote.update({
        where: { id: existing.id },
        data: { value },
      });
      return res.json({ success: true, vote: updated });
    }

    const vote = await prisma.forumReplyVote.create({
      data: { replyId: id, userId, value },
    });

    return res.json({ success: true, vote });
  } catch (error) {
    console.error("Error voting on reply:", error);
    return res.status(500).json({ message: "Failed to vote" });
  }
}

export async function pinThread(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { isPinned } = req.body;

    const thread = await prisma.forumThread.update({
      where: { id },
      data: { isPinned: isPinned !== undefined ? isPinned : true },
      include: { user: { select: userSelect }, category: true },
    });

    return res.json({ success: true, data: thread });
  } catch (error) {
    console.error("Error pinning thread:", error);
    return res.status(500).json({ message: "Failed to pin thread" });
  }
}
