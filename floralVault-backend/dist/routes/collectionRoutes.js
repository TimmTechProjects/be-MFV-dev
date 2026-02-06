"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const collectionController_1 = require("../controllers/collectionController");
const verifyToken_1 = __importDefault(require("../middleware/verifyToken"));
const router = (0, express_1.Router)();
router.get("/me", verifyToken_1.default, collectionController_1.getCollectionsForUser);
router.get("/:username", collectionController_1.getCollections);
router.post("/:username/collections", verifyToken_1.default, collectionController_1.createCollection);
router.get("/:username/collections/:collectionSlug", collectionController_1.getCollectionWithPlants);
router.post("/:collectionId/add-plant", verifyToken_1.default, collectionController_1.addPlantToCollection);
exports.default = router;
