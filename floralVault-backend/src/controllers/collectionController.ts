import { Request, Response } from "express";
import {
  createNewCollection,
  getUserCollections,
} from "../services/collectionService";
import { getUserCollectionWithPlants } from "../services/plantService";

export const createCollection = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const { name, description } = req.body;

    if (!username || !name) {
      res
        .status(400)
        .json({ message: "Username and collection name are required" });
      return;
    }

    const newCollection = await createNewCollection(username, {
      name,
      description,
    });

    res.status(201).json(newCollection);
  } catch (error) {
    console.error("Error creating collection:", error);
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
