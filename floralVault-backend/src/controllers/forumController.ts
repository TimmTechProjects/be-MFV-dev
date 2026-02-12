import { Request, Response } from "express";
import { getForumPosts } from "../services/forumService";

export const getPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 7;

    // Validate limit
    if (limit < 1 || limit > 50) {
      res.status(400).json({ 
        error: "Invalid limit parameter. Must be between 1 and 50." 
      });
      return;
    }

    const posts = await getForumPosts(limit);

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
