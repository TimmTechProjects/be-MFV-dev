import { Request, Response } from "express";
import { getMarketplaceListings } from "../services/marketplaceService";

export const getListings = async (req: Request, res: Response): Promise<void> => {
  try {
    const sort = (req.query.sort as string) || "newest";
    const limit = parseInt(req.query.limit as string) || 6;

    // Validate limit
    if (limit < 1 || limit > 50) {
      res.status(400).json({ 
        error: "Invalid limit parameter. Must be between 1 and 50." 
      });
      return;
    }

    const listings = await getMarketplaceListings(sort, limit);

    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings
    });
  } catch (error) {
    console.error("Error fetching marketplace listings:", error);
    res.status(500).json({ 
      error: "Failed to fetch marketplace listings",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
