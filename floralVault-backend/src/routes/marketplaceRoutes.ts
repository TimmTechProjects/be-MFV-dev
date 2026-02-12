import { Router } from "express";
import {
  getMarketplaceListings,
  getUserMarketplaceListings,
} from "../controllers/marketplaceController";

const router = Router();

// General marketplace listings endpoint
router.get("/listings", getMarketplaceListings);

// User-specific marketplace listings endpoint
// Must come before any dynamic routes
router.get("/users/:username/listings", getUserMarketplaceListings);

export default router;
