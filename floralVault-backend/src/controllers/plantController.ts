import { Request, Response } from "express";
import { createPlant } from "../services/plantService";

export const createPlantPost = async (req: Request, res: Response) => {
  try {
    const {
      commonName,
      botanicalName,
      description,
      tags,
      images,
      type,
      isPublic = true,
    } = req.body;

    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const newPlant = await createPlant({
      commonName,
      botanicalName,
      description,
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
