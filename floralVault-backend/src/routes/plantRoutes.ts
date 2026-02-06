import { Router } from "express";
import verifyToken from "../middleware/verifyToken";
import {
  getPaginatedPlants,
  searchPlants,
  getPlantBySlug,
  createPlantPost,
  deletePlantPost,
} from "../controllers/plantController";

const router = Router();

router.get("/", getPaginatedPlants);

router.get("/search", searchPlants);

router.get("/:username/:slug", getPlantBySlug);

router.post("/new", verifyToken, createPlantPost);

router.delete("/:plantId", verifyToken, deletePlantPost);

export default router;
