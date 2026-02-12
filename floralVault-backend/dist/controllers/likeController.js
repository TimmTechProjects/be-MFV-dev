"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLikeCount = exports.getLikeStatus = exports.toggleLike = void 0;
const likeService_1 = require("../services/likeService");
const toggleLike = async (req, res) => {
    const userId = req.user;
    const { plantId } = req.params;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    if (!plantId) {
        res.status(400).json({ message: "Plant ID is required" });
        return;
    }
    try {
        const result = await (0, likeService_1.togglePlantLike)(userId, plantId);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error toggling like:", error);
        res.status(500).json({ message: "Failed to toggle like" });
    }
};
exports.toggleLike = toggleLike;
const getLikeStatus = async (req, res) => {
    const userId = req.user;
    const { plantId } = req.params;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    if (!plantId) {
        res.status(400).json({ message: "Plant ID is required" });
        return;
    }
    try {
        const result = await (0, likeService_1.getPlantLikeStatus)(userId, plantId);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error getting like status:", error);
        res.status(500).json({ message: "Failed to get like status" });
    }
};
exports.getLikeStatus = getLikeStatus;
const getLikeCount = async (req, res) => {
    const { plantId } = req.params;
    if (!plantId) {
        res.status(400).json({ message: "Plant ID is required" });
        return;
    }
    try {
        const result = await (0, likeService_1.getPlantLikeCount)(plantId);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error getting like count:", error);
        res.status(500).json({ message: "Failed to get like count" });
    }
};
exports.getLikeCount = getLikeCount;
