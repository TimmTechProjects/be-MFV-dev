import { Request, Response } from "express";
import * as forumService from "../services/forumService";

// Extend Request to include user
interface AuthRequest extends Request {
  user?: string; // userId from JWT
}

// GET /api/forums/posts (legacy endpoint)
export const getPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 7;

    if (limit < 1 || limit > 50) {
      res.status(400).json({ 
        error: "Invalid limit parameter. Must be between 1 and 50." 
      });
      return;
    }

    const posts = await forumService.getForumPosts(limit);

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    console.error("Error fetching forum posts:", error);
    res.status(500).json({ 
      error: "Failed to fetch forum posts",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// POST /api/forums/categories (admin only)
export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, slug, description, icon, order } = req.body;

    if (!name) {
      res.status(400).json({ error: "Category name is required" });
      return;
    }

    const category = await forumService.createCategory({
      name,
      slug,
      description,
      icon,
      order,
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({
      error: "Failed to create category",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// GET /api/forums/categories
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await forumService.getCategories();

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      error: "Failed to fetch categories",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// POST /api/forums/threads
export const createThread = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { title, content, categoryId, tags, images } = req.body;

    if (!title || !content || !categoryId) {
      res.status(400).json({ 
        error: "Title, content, and categoryId are required" 
      });
      return;
    }

    const thread = await forumService.createThread(userId, {
      title,
      content,
      categoryId,
      tags,
      images,
    });

    res.status(201).json({
      success: true,
      data: thread,
    });
  } catch (error) {
    console.error("Error creating thread:", error);
    res.status(500).json({
      error: "Failed to create thread",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// GET /api/forums/threads
export const getThreads = async (req: Request, res: Response): Promise<void> => {
  try {
    const categoryId = req.query.categoryId as string;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const sortBy = req.query.sortBy as "recent" | "popular" | "replies" | undefined;

    const threads = await forumService.getThreads({
      categoryId,
      limit,
      offset,
      sortBy,
    });

    res.status(200).json({
      success: true,
      count: threads.length,
      data: threads,
    });
  } catch (error) {
    console.error("Error fetching threads:", error);
    res.status(500).json({
      error: "Failed to fetch threads",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// GET /api/forums/threads/:id
export const getThreadById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const thread = await forumService.getThreadById(id);

    if (!thread) {
      res.status(404).json({ error: "Thread not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: thread,
    });
  } catch (error) {
    console.error("Error fetching thread:", error);
    res.status(500).json({
      error: "Failed to fetch thread",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// PUT /api/forums/threads/:id
export const updateThread = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const { title, content, tags, images } = req.body;

    const thread = await forumService.updateThread(id, userId, {
      title,
      content,
      tags,
      images,
    });

    res.status(200).json({
      success: true,
      data: thread,
    });
  } catch (error) {
    console.error("Error updating thread:", error);
    if (error instanceof Error) {
      if (error.message.includes("Not authorized")) {
        res.status(403).json({ error: error.message });
        return;
      }
      if (error.message.includes("locked")) {
        res.status(400).json({ error: error.message });
        return;
      }
    }
    res.status(500).json({
      error: "Failed to update thread",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// DELETE /api/forums/threads/:id
export const deleteThread = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { id } = req.params;

    await forumService.deleteThread(id, userId);

    res.status(200).json({
      success: true,
      message: "Thread deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting thread:", error);
    if (error instanceof Error && error.message.includes("Not authorized")) {
      res.status(403).json({ error: error.message });
      return;
    }
    res.status(500).json({
      error: "Failed to delete thread",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// POST /api/forums/threads/:id/replies
export const createReply = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { id: threadId } = req.params;
    const { content, parentId, images } = req.body;

    if (!content) {
      res.status(400).json({ error: "Content is required" });
      return;
    }

    const reply = await forumService.createReply(userId, {
      threadId,
      content,
      parentId,
      images,
    });

    res.status(201).json({
      success: true,
      data: reply,
    });
  } catch (error) {
    console.error("Error creating reply:", error);
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        res.status(404).json({ error: error.message });
        return;
      }
      if (error.message.includes("locked")) {
        res.status(400).json({ error: error.message });
        return;
      }
    }
    res.status(500).json({
      error: "Failed to create reply",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// PUT /api/forums/threads/:id/replies/:replyId
export const updateReply = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { replyId } = req.params;
    const { content, images } = req.body;

    const reply = await forumService.updateReply(replyId, userId, {
      content,
      images,
    });

    res.status(200).json({
      success: true,
      data: reply,
    });
  } catch (error) {
    console.error("Error updating reply:", error);
    if (error instanceof Error) {
      if (error.message.includes("Not authorized")) {
        res.status(403).json({ error: error.message });
        return;
      }
      if (error.message.includes("locked")) {
        res.status(400).json({ error: error.message });
        return;
      }
    }
    res.status(500).json({
      error: "Failed to update reply",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// DELETE /api/forums/threads/:id/replies/:replyId
export const deleteReply = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { replyId } = req.params;

    await forumService.deleteReply(replyId, userId);

    res.status(200).json({
      success: true,
      message: "Reply deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting reply:", error);
    if (error instanceof Error && error.message.includes("Not authorized")) {
      res.status(403).json({ error: error.message });
      return;
    }
    res.status(500).json({
      error: "Failed to delete reply",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// POST /api/forums/threads/:id/pin (admin only)
export const pinThread = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { pin } = req.body;

    let thread;
    if (pin === false) {
      thread = await forumService.unpinThread(id);
    } else {
      thread = await forumService.pinThread(id);
    }

    res.status(200).json({
      success: true,
      data: thread,
    });
  } catch (error) {
    console.error("Error pinning thread:", error);
    res.status(500).json({
      error: "Failed to pin thread",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// POST /api/forums/threads/:id/lock (admin only)
export const lockThread = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { lock } = req.body;

    let thread;
    if (lock === false) {
      thread = await forumService.unlockThread(id);
    } else {
      thread = await forumService.lockThread(id);
    }

    res.status(200).json({
      success: true,
      data: thread,
    });
  } catch (error) {
    console.error("Error locking thread:", error);
    res.status(500).json({
      error: "Failed to lock thread",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// POST /api/forums/threads/:id/subscribe
export const subscribeToThread = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { id: threadId } = req.params;
    const { subscribe } = req.body;

    if (subscribe === false) {
      await forumService.unsubscribeFromThread(threadId, userId);
    } else {
      await forumService.subscribeToThread(threadId, userId);
    }

    res.status(200).json({
      success: true,
      message: subscribe === false ? "Unsubscribed successfully" : "Subscribed successfully",
    });
  } catch (error) {
    console.error("Error subscribing to thread:", error);
    res.status(500).json({
      error: "Failed to subscribe to thread",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// GET /api/forums/search
export const searchThreadsAndReplies = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!query) {
      res.status(400).json({ error: "Search query is required" });
      return;
    }

    const results = await forumService.searchThreadsAndReplies(query, limit);

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error searching forums:", error);
    res.status(500).json({
      error: "Failed to search forums",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
