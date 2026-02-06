import { Request, Response } from "express";
import {
  createPlant,
  deletePlant,
  getAllPaginatedPlants,
  getAllPlants,
  getPlantBySlug as fetchPlantBySlug,
  querySearch,
} from "../services/plantService";
import { AuthenticatedRequest } from "../types/express";

export const getPlants = async (req: Request, res: Response) => {
  const plants = await getAllPlants();

  if (!plants) {
    res.status(400).json({ message: "Could not find plants" });
  }

  res.status(200).json(plants);
};

export const getPaginatedPlants = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const { plants, total } = await getAllPaginatedPlants(page, limit);

  res.status(200).json({ plants, total });
};

export const searchPlants = async (req: Request, res: Response) => {
  const query = req.query.q as string;

  if (!query) {
    res.status(400).json({ message: "Query required" });
    return;
  }

  try {
    const results = await querySearch(query);

    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching data", error);
  }
};

export const getPlantBySlug = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const { slug, username } = req.params;

  const plant = await fetchPlantBySlug(slug, username);

  if (!plant) {
    res.status(404).json({ message: "Plant not found" });
  }

  res.status(200).json(plant);
};

export const createPlantPost = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    console.log("REQ BODY:", req.body);

    const {
      commonName,
      botanicalName,
      description,
      origin,
      family,
      tags,
      images,
      type,
      isPublic = true,
      collectionId,
    } = req.body;

    const userId = req.user;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!collectionId) {
      res.status(400).json({ message: "Collection ID is required." });
      return;
    }

    const newPlant = await createPlant({
      commonName,
      botanicalName,
      description,
      origin,
      family,
      type,
      isPublic,
      user: { connect: { id: userId } },
      tags,
      images,
      collectionId,
    });

    res.status(201).json(newPlant);
  } catch (error) {
    console.error("Error creating plant post:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const deletePlantPost = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { plantId } = req.params;
    const userId = req.user;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!plantId) {
      res.status(400).json({ message: "Plant ID is required." });
      return;
    }

    const result = await deletePlant(plantId, userId);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Error deleting plant:", error);
    if (error.message.includes("not found") || error.message.includes("permission")) {
      res.status(403).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};
