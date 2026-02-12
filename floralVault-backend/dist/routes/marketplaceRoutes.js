"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const marketplaceController_1 = require("../controllers/marketplaceController");
const router = (0, express_1.Router)();
// GET /api/marketplace/listings?sort=newest&limit=6
router.get("/listings", marketplaceController_1.getListings);
exports.default = router;
