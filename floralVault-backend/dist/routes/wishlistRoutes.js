"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyToken_1 = __importDefault(require("../middleware/verifyToken"));
const wishlistController_1 = require("../controllers/wishlistController");
const router = (0, express_1.Router)();
// All wishlist routes require authentication
router.use(verifyToken_1.default);
// Wishlist endpoints
router.get("/", wishlistController_1.getWishlist);
router.post("/items", wishlistController_1.addItem);
router.put("/items/:id", wishlistController_1.updateItem);
router.delete("/items/:id", wishlistController_1.deleteItem);
// Price alert endpoints
router.post("/price-alerts", wishlistController_1.addPriceAlert);
// Marketplace integration
router.get("/available", wishlistController_1.checkAvailability);
exports.default = router;
