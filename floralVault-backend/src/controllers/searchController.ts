import { Request, Response } from "express";
import { querySearch } from "../services/searchService";

export const searchDB = async (req: Request, res: Response) => {
  const { q } = req.query;

  if (!q || typeof q !== "string") {
    res.status(400).json({ message: "Query required" });
    return;
  }

  try {
    const [plants, users] = await querySearch(q);

    res.status(200).json({ plants, users });
    return;
  } catch (error) {
    console.error("Error fetching data", error);
  }
};
