import { Router } from "express";
import { getHomepage } from "../controllers/statsController";

const router = Router();

// GET /api/stats/homepage
router.get("/homepage", getHomepage);

export default router;
