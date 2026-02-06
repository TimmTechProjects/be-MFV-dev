import { Request, Response } from "express";
import {
  createNewCollection,
  getUserCollections,
  addPlantToCollectionService,
  getUsersCollectionsById,
  setCollectionThumbnailService,
} from "../services/collectionService";
import { getUserCollectionWithPlants } from "../services/plantService";
import { AuthenticatedRequest } from "../types/express";

export const createCollection = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { username } = req.params;
    const { name, description } = req.body;
    const userId = req.user;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!username || !name) {
      res
        .status(400)
        .json({ message: "Username and collection name are required" });
      return;
    }

    // Verify the authenticated user matches the requested username
    const newCollection = await createNewCollection(username, {
      name,
      description,
    }, userId);

    res.status(201).json(newCollection);
  } catch (error: any) {
    console.error("Error creating collection:", error);
    if (error.message === "Unauthorized: User mismatch") {
      res.status(403).json({ message: "You can only create collections for your own account" });
      return;
    }
    res.status(500).json({ message: "Server error while creating collection" });
  }
};

export const getCollections = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    if (!username) {
      res.status(400).json({ message: "Username is required" });
    }

    const collections = await getUserCollections(username);

    res.status(200).json(collections);
    return;
  } catch (error) {
    console.error("Error creating plant post:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getCollectionWithPlants = async (req: Request, res: Response) => {
  try {
    const { username, collectionSlug } = req.params;

    if (!username || !collectionSlug) {
      res.status(400).json({ message: "Missing username or collectionSlug" });
      return;
    }

    const collectionPlants = await getUserCollectionWithPlants(
      username,
      collectionSlug
    );

    if (!collectionPlants) {
      res.status(404).json({ message: "Collection not found" });
      return;
    }

    res.status(200).json(collectionPlants);
  } catch (error) {
    console.error("Error fetching collection:", error);
    res.status(500).json({ message: "Server error while fetching collection" });
  }
};

export const getCollectionsForUser = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const collections = await getUsersCollectionsById(userId);
    res.status(200).json(collections);
    return;
  } catch (error) {
    console.error("Error fetching user collections:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching collections" });
    return;
  }
};

export const addPlantToCollection = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user;
  const { collectionId } = req.params;
  const { plantId } = req.body;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (!collectionId || !plantId) {
    res
      .status(400)
      .json({ message: "Both collectionId and plantId are required." });
    return;
  }

  try {
    const result = await addPlantToCollectionService({
      userId,
      collectionId,
      plantId,
    });

    res.status(200).json(result);
    return;
  } catch (error) {
    console.error("Failed to add plant to collection:", error);
    res.status(500).json({ message: "Server error" });
    return;
  }
};

export const setCollectionThumbnail = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user;
  const { collectionId } = req.params;
  const { imageId } = req.body;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (!collectionId || !imageId) {
    res
      .status(400)
      .json({ message: "Both collectionId and imageId are required." });
    return;
  }

  try {
    const result = await setCollectionThumbnailService({
      userId,
      collectionId,
      imageId,
    });

    res.status(200).json(result);
    return;
  } catch (error: any) {
    console.error("Failed to set collection thumbnail:", error);
    if (error.message === "Collection not found or access denied") {
      res.status(403).json({ message: error.message });
      return;
    }
    if (error.message === "Image not found") {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Server error" });
    return;
  }
};
