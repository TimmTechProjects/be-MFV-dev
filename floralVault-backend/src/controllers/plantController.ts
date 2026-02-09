import { Request, Response } from "express";
import {
  createPlant,
  deletePlant,
  getAllPaginatedPlants,
  getAllPlants,
  getPlantBySlug as fetchPlantBySlug,
  querySearch,
  searchAndFilterPlants,
  getFilterOptions,
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

    // FIX: Prevent double-encoding of HTML entities in descriptions
    // When descriptions contain HTML (from rich text editors), ensure they're stored
    // as-is without extra encoding that causes issues during retrieval
    let processedDescription = description || "";
    if (typeof processedDescription === "string" && processedDescription.length > 0) {
      // If description is already HTML-entity-encoded, decode it once before storage
      // This prevents double-encoding when sending via JSON
      if (processedDescription.includes("&lt;") || processedDescription.includes("&gt;") || processedDescription.includes("&quot;")) {
        try {
          processedDescription = decodeHTMLEntities(processedDescription);
        } catch (e) {
          // If decoding fails, use original - this maintains backwards compatibility
          console.warn("Could not decode HTML entities in description:", e);
        }
      }
    }

    const newPlant = await createPlant({
      commonName,
      botanicalName,
      description: processedDescription,
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

// Helper function to decode HTML entities at the backend level
// This is a workaround for the JSON body parsing issue that was blocking image uploads
// Reference: PR #6 - HTML entities in plant descriptions were being double-encoded
function decodeHTMLEntities(text: string): string {
  const entities: { [key: string]: string } = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
    "&#x27;": "'",
    "&#x2F;": "/",
    "&slash;": "/",
  };

  let decoded = text;
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.replace(new RegExp(entity, "g"), char);
  }

  return decoded;
}

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

/**
 * GET /api/plants/discover/search
 * Advanced search with filtering for plant discovery
 */
export const discoverPlants = async (req: Request, res: Response) => {
  try {
    const {
      q,
      type,
      light,
      water,
      difficulty,
      page = 1,
      limit = 20,
    } = req.query;

    const filters = {
      type: type as string | undefined,
      light: light as string | undefined,
      water: water as string | undefined,
      difficulty: difficulty as string | undefined,
    };

    const result = await searchAndFilterPlants(
      q as string | undefined,
      filters,
      parseInt(page as string) || 1,
      parseInt(limit as string) || 20
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Error discovering plants:", error);
    res.status(500).json({ message: "Failed to search plants" });
  }
};

/**
 * GET /api/plants/discover/filters
 * Get available filter options
 */
export const getDiscoverFilters = async (req: Request, res: Response) => {
  try {
    const filters = await getFilterOptions();
    res.status(200).json(filters);
  } catch (error) {
    console.error("Error getting filter options:", error);
    res.status(500).json({ message: "Failed to get filter options" });
  }
};
