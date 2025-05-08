import { Request, Response } from "express";
import { getUserCollections } from "../services/collectionService";

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
