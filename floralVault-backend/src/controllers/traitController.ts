import { Request, Response } from "express";
import { getAllTraits, getTraitsGroupedByCategory } from "../services/traitService";

export const getTraits = async (_req: Request, res: Response) => {
  try {
    const traits = await getAllTraits();
    res.status(200).json(traits);
  } catch (error) {
    console.error("Error fetching traits:", error);
    res.status(500).json({ message: "Failed to fetch traits" });
  }
};

export const getTraitsGrouped = async (_req: Request, res: Response) => {
  try {
    const grouped = await getTraitsGroupedByCategory();
    res.status(200).json(grouped);
  } catch (error) {
    console.error("Error fetching grouped traits:", error);
    res.status(500).json({ message: "Failed to fetch grouped traits" });
  }
};
