import { Router } from "express";
import verifyToken from "../middleware/verifyToken";
import {
  getPaginatedPlants,
  searchPlants,
  getPlantBySlug,
  createPlantPost,
  deletePlantPost,
  discoverPlants,
  getDiscoverFilters,
} from "../controllers/plantController";

const router = Router();

// Discovery endpoints (must be before dynamic routes)
router.get("/discover/search", discoverPlants);
router.get("/discover/filters", getDiscoverFilters);

// Standard endpoints
router.get("/", getPaginatedPlants);
router.get("/search", searchPlants);
router.post("/new", verifyToken, createPlantPost);
router.delete("/:plantId", verifyToken, deletePlantPost);

// Dynamic routes (must be last)
router.get("/:username/:slug", getPlantBySlug);

export default router;
