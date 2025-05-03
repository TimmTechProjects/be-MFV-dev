import { Router } from "express";
import verifyToken from "../middleware/verifyToken";
import { createPlantPost } from "../controllers/plantController";

const router = Router();

router.post("/", verifyToken, createPlantPost);

export default router;
