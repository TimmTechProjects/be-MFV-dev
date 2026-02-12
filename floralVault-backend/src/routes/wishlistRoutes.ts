import { Router } from "express";
import verifyToken from "../middleware/verifyToken";
import {
  getWishlist,
  addItem,
  updateItem,
  deleteItem,
  addPriceAlert,
  checkAvailability,
} from "../controllers/wishlistController";

const router = Router();

// All wishlist routes require authentication
router.use(verifyToken);

// Wishlist endpoints
router.get("/", getWishlist);
router.post("/items", addItem);
router.put("/items/:id", updateItem);
router.delete("/items/:id", deleteItem);

// Price alert endpoints
router.post("/price-alerts", addPriceAlert);

// Marketplace integration
router.get("/available", checkAvailability);

export default router;
