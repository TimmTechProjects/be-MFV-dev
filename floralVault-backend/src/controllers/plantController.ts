import { Request, Response } from "express";
import {
  createPlant,
  getAllPlants,
  getPlantBySlug as fetchPlantBySlug,
} from "../services/plantService";
import { AuthenticatedRequest } from "../types/express";

export const getPlants = async (req: Request, res: Response) => {
  const plants = await getAllPlants();

  if (!plants) {
    res.status(400).json({ message: "Could not find plants" });
  }

  res.status(200).json(plants);
};

export const getPlantBySlug = async (req: Request, res: Response) => {
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
    } = req.body;

    const userId = req.user;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
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
    });

    res.status(201).json(newPlant);
  } catch (error) {
    console.error("Error creating plant post:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
