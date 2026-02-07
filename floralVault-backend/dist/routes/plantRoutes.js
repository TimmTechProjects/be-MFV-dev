"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyToken_1 = __importDefault(require("../middleware/verifyToken"));
const plantController_1 = require("../controllers/plantController");
const router = (0, express_1.Router)();
router.get("/", plantController_1.getPaginatedPlants);
router.get("/search", plantController_1.searchPlants);
router.get("/:username/:slug", plantController_1.getPlantBySlug);
router.post("/new", verifyToken_1.default, plantController_1.createPlantPost);
router.delete("/:plantId", verifyToken_1.default, plantController_1.deletePlantPost);
exports.default = router;
