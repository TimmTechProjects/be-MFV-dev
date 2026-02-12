import { Response } from "express";
import { AuthenticatedRequest } from "../types/express";
import {
  getUserWishlist,
  addWishlistItem,
  updateWishlistItem,
  removeWishlistItem,
  createPriceAlert,
  checkMarketplaceAvailability,
} from "../services/wishlistService";

export const getWishlist = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const wishlist = await getUserWishlist(userId);
    res.status(200).json(wishlist);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ message: "Failed to fetch wishlist" });
  }
};

export const addItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const {
      plantId,
      plantName,
      notes,
      priority,
      priceTarget,
      marketplaceUrl,
      notifyOnAvailable,
    } = req.body;

    if (!plantName) {
      res.status(400).json({ message: "Plant name is required" });
      return;
    }

    const item = await addWishlistItem(userId, {
      plantId,
      plantName,
      notes,
      priority,
      priceTarget,
      marketplaceUrl,
      notifyOnAvailable,
    });

    res.status(201).json(item);
  } catch (error) {
    console.error("Error adding wishlist item:", error);
    res.status(500).json({ message: "Failed to add wishlist item" });
  }
};

export const updateItem = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const updateData = req.body;

    const item = await updateWishlistItem(userId, id, updateData);

    if (!item) {
      res.status(404).json({ message: "Wishlist item not found" });
      return;
    }

    res.status(200).json(item);
  } catch (error) {
    console.error("Error updating wishlist item:", error);
    res.status(500).json({ message: "Failed to update wishlist item" });
  }
};

export const deleteItem = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const success = await removeWishlistItem(userId, id);

    if (!success) {
      res.status(404).json({ message: "Wishlist item not found" });
      return;
    }

    res.status(200).json({ message: "Item removed from wishlist" });
  } catch (error) {
    console.error("Error deleting wishlist item:", error);
    res.status(500).json({ message: "Failed to delete wishlist item" });
  }
};

export const addPriceAlert = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { plantName, targetPrice, listingId } = req.body;

    if (!plantName || !targetPrice) {
      res.status(400).json({
        message: "Plant name and target price are required",
      });
      return;
    }

    const alert = await createPriceAlert(userId, {
      plantName,
      targetPrice,
      listingId,
    });

    res.status(201).json(alert);
  } catch (error) {
    console.error("Error creating price alert:", error);
    res.status(500).json({ message: "Failed to create price alert" });
  }
};

export const checkAvailability = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const availability = await checkMarketplaceAvailability(userId);
    res.status(200).json(availability);
  } catch (error) {
    console.error("Error checking availability:", error);
    res.status(500).json({ message: "Failed to check availability" });
  }
};
