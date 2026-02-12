import { Request, Response } from "express";
import { getHomepageStats } from "../services/statsService";

export const getHomepage = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await getHomepageStats();

    res.status(200).json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error fetching homepage stats:", error);
    res.status(500).json({ 
      error: "Failed to fetch homepage statistics",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
