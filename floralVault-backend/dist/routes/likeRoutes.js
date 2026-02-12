"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyToken_1 = __importDefault(require("../middleware/verifyToken"));
const likeController_1 = require("../controllers/likeController");
const router = (0, express_1.Router)();
router.post("/:plantId/toggle", verifyToken_1.default, likeController_1.toggleLike);
router.get("/:plantId/status", verifyToken_1.default, likeController_1.getLikeStatus);
router.get("/:plantId/count", likeController_1.getLikeCount);
exports.default = router;
