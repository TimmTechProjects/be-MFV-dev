"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyToken_1 = __importDefault(require("../middleware/verifyToken"));
const plantController_1 = require("../controllers/plantController");
const router = (0, express_1.Router)();
// Discovery endpoints (must be before dynamic routes)
router.get("/discover/search", plantController_1.discoverPlants);
router.get("/discover/filters", plantController_1.getDiscoverFilters);
// Standard endpoints
router.get("/", plantController_1.getPaginatedPlants);
router.get("/search", plantController_1.searchPlants);
router.post("/new", verifyToken_1.default, plantController_1.createPlantPost);
router.delete("/:plantId", verifyToken_1.default, plantController_1.deletePlantPost);
// Dynamic routes (must be last)
router.get("/:username/:slug", plantController_1.getPlantBySlug);
exports.default = router;
