import { Request, Response } from "express";
import { getAllSuggestionTags, getAllTags } from "../services/tagServices";

// GET all tags
export const getTags = async (req: Request, res: Response) => {
  try {
    const tags = await getAllTags();

    // if (!tags) {
    //   res.status(404).json("Sorry, tags do not exist");
    //   return;
    // }

    res.status(200).json(tags);
    return;
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ message: "Failed to fetch tags" });
    return;
  }
};

export const getSuggestedTags = async (req: Request, res: Response) => {
  const query = req.query.query as string;

  if (!query || query.length < 2) {
    res.status(400).json({ message: "Query too short" });
    return;
  }

  try {
    const matchingTags = await getAllSuggestionTags(query);

    if (matchingTags.length === 0) {
      res.status(404).json({ message: "No matching tags" });
      return;
    }
    res.status(200).json(matchingTags);
    return;
  } catch (error) {
    console.error("Error fetching tag suggestions:", error);
    res.status(500).json({ message: "Failed to fetch tags" });
    return;
  }
};
