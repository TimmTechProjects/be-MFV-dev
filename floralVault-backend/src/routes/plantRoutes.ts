import { Router } from "express";
import verifyToken from "../middleware/verifyToken";
import {
  getPlants,
  getPlantBySlug,
  createPlantPost,
} from "../controllers/plantController";

const router = Router();

router.get("/", getPlants);

router.get("/:slug", getPlantBySlug);

router.post("/new", verifyToken, createPlantPost);

export default router;
