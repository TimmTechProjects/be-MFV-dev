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
  getUserPlants,
  toggleGarden,
  getRelatedPlants,
} from "../controllers/plantController";

const router = Router();

// Discovery endpoints (must be before dynamic routes)
router.get("/discover/search", discoverPlants);
router.get("/discover/filters", getDiscoverFilters);

// Related plants endpoint (must be before dynamic routes)
router.get("/related/:plantId", getRelatedPlants);

// Standard endpoints
router.get("/", getPaginatedPlants);
router.get("/user/:username", getUserPlants);
router.get("/search", searchPlants);
router.post("/new", verifyToken, createPlantPost);
router.patch("/:plantId/garden", verifyToken, toggleGarden);
router.delete("/:plantId", verifyToken, deletePlantPost);

// Dynamic routes (must be last)
router.get("/:username/:slug", getPlantBySlug);

export default router;
