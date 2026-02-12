import { Router } from "express";
import { getListings } from "../controllers/marketplaceController";

const router = Router();

// GET /api/marketplace/listings?sort=newest&limit=6
router.get("/listings", getListings);

export default router;
