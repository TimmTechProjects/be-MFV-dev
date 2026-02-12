import { Request, Response } from "express";
import {
  getAllListings,
  getListingsByUsername,
} from "../services/marketplaceService";

/**
 * Get all marketplace listings
 * Query params: sort (newest/oldest/price), status (active/draft/sold), limit
 */
export const getMarketplaceListings = async (req: Request, res: Response) => {
  try {
    const sort = (req.query.sort as "newest" | "oldest" | "price") || "newest";
    const status = req.query.status as "active" | "draft" | "sold" | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    const listings = getAllListings({ sort, status, limit });

    res.status(200).json({
      success: true,
      count: listings.length,
      listings,
    });
  } catch (error) {
    console.error("Error fetching marketplace listings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch marketplace listings",
    });
  }
};

/**
 * Get marketplace listings for a specific user
 * Route: GET /api/marketplace/users/:username/listings
 * Query params: sort (newest/oldest/price), status (active/draft/sold), limit
 */
export const getUserMarketplaceListings = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    if (!username) {
      res.status(400).json({
        success: false,
        message: "Username is required",
      });
      return;
    }

    const sort = (req.query.sort as "newest" | "oldest" | "price") || "newest";
    const status = req.query.status as "active" | "draft" | "sold" | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    const listings = getListingsByUsername(username, { sort, status, limit });

    res.status(200).json({
      success: true,
      username,
      count: listings.length,
      listings,
    });
  } catch (error) {
    console.error("Error fetching user marketplace listings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user marketplace listings",
    });
  }
};
