import { Response } from "express";
import {
  togglePlantLike,
  getPlantLikeStatus,
  getPlantLikeCount,
} from "../services/likeService";
import { AuthenticatedRequest } from "../types/express";

export const toggleLike = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user;
  const { plantId } = req.params;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (!plantId) {
    res.status(400).json({ message: "Plant ID is required" });
    return;
  }

  try {
    const result = await togglePlantLike(userId as string, plantId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: "Failed to toggle like" });
  }
};

export const getLikeStatus = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user;
  const { plantId } = req.params;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (!plantId) {
    res.status(400).json({ message: "Plant ID is required" });
    return;
  }

  try {
    const result = await getPlantLikeStatus(userId as string, plantId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error getting like status:", error);
    res.status(500).json({ message: "Failed to get like status" });
  }
};

export const getLikeCount = async (req: AuthenticatedRequest, res: Response) => {
  const { plantId } = req.params;

  if (!plantId) {
    res.status(400).json({ message: "Plant ID is required" });
    return;
  }

  try {
    const result = await getPlantLikeCount(plantId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error getting like count:", error);
    res.status(500).json({ message: "Failed to get like count" });
  }
};
