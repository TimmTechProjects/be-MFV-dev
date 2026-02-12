"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const marketplaceController_1 = require("../controllers/marketplaceController");
const router = (0, express_1.Router)();
// General marketplace listings endpoint
router.get("/listings", marketplaceController_1.getMarketplaceListings);
// User-specific marketplace listings endpoint
// Must come before any dynamic routes
router.get("/users/:username/listings", marketplaceController_1.getUserMarketplaceListings);
exports.default = router;
