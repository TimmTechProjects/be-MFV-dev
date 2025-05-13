import { Router } from "express";
import verifyToken from "../middleware/verifyToken";
import {
  getPaginatedPlants,
  searchPlants,
  getPlantBySlug,
  createPlantPost,
} from "../controllers/plantController";

const router = Router();

router.get("/", getPaginatedPlants);

router.get("/search", searchPlants);

router.get("/:username/:slug", getPlantBySlug);

router.post("/new", verifyToken, createPlantPost);

export default router;
