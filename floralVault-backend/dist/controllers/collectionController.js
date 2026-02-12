"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCollectionThumbnail = exports.getPublicCollections = exports.removePlantFromCollection = exports.addPlantToCollection = exports.getCollectionsForUser = exports.getCollectionWithPlants = exports.getCollections = exports.createCollection = void 0;
const collectionService_1 = require("../services/collectionService");
const plantService_1 = require("../services/plantService");
const createCollection = async (req, res) => {
    try {
        const { username } = req.params;
        const { name, description } = req.body;
        const userId = req.user;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        if (!username || !name) {
            res
                .status(400)
                .json({ message: "Username and collection name are required" });
            return;
        }
        // Verify the authenticated user matches the requested username
        const newCollection = await (0, collectionService_1.createNewCollection)(username, {
            name,
            description,
        }, userId);
        res.status(201).json(newCollection);
    }
    catch (error) {
        console.error("Error creating collection:", error);
        if (error.message === "Unauthorized: User mismatch") {
            res.status(403).json({ message: "You can only create collections for your own account" });
            return;
        }
        res.status(500).json({ message: "Server error while creating collection" });
    }
};
exports.createCollection = createCollection;
const getCollections = async (req, res) => {
    try {
        const { username } = req.params;
        if (!username) {
            res.status(400).json({ message: "Username is required" });
        }
        const collections = await (0, collectionService_1.getUserCollections)(username);
        res.status(200).json(collections);
        return;
    }
    catch (error) {
        console.error("Error creating plant post:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
exports.getCollections = getCollections;
const getCollectionWithPlants = async (req, res) => {
    try {
        const { username, collectionSlug } = req.params;
        if (!username || !collectionSlug) {
            res.status(400).json({ message: "Missing username or collectionSlug" });
            return;
        }
        const collectionPlants = await (0, plantService_1.getUserCollectionWithPlants)(username, collectionSlug);
        if (!collectionPlants) {
            res.status(404).json({ message: "Collection not found" });
            return;
        }
        res.status(200).json(collectionPlants);
    }
    catch (error) {
        console.error("Error fetching collection:", error);
        res.status(500).json({ message: "Server error while fetching collection" });
    }
};
exports.getCollectionWithPlants = getCollectionWithPlants;
const getCollectionsForUser = async (req, res) => {
    const userId = req.user;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    try {
        const collections = await (0, collectionService_1.getUsersCollectionsById)(userId);
        res.status(200).json(collections);
        return;
    }
    catch (error) {
        console.error("Error fetching user collections:", error);
        res
            .status(500)
            .json({ message: "Server error while fetching collections" });
        return;
    }
};
exports.getCollectionsForUser = getCollectionsForUser;
const addPlantToCollection = async (req, res) => {
    const userId = req.user;
    const { collectionId } = req.params;
    const { plantId } = req.body;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    if (!collectionId || !plantId) {
        res
            .status(400)
            .json({ message: "Both collectionId and plantId are required." });
        return;
    }
    try {
        const result = await (0, collectionService_1.addPlantToCollectionService)({
            userId,
            collectionId,
            plantId,
        });
        res.status(200).json(result);
        return;
    }
    catch (error) {
        console.error("Failed to add plant to collection:", error);
        res.status(500).json({ message: "Server error" });
        return;
    }
};
exports.addPlantToCollection = addPlantToCollection;
const removePlantFromCollection = async (req, res) => {
    const userId = req.user;
    const { collectionId } = req.params;
    const { plantId } = req.body;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    if (!collectionId || !plantId) {
        res
            .status(400)
            .json({ message: "Both collectionId and plantId are required." });
        return;
    }
    try {
        const result = await (0, collectionService_1.removePlantFromCollectionService)({
            userId,
            collectionId,
            plantId,
        });
        res.status(200).json({
            ...result.collection,
            movedToUncategorized: result.movedToUncategorized,
        });
        return;
    }
    catch (error) {
        if (error instanceof Error && error.message === "LAST_ALBUM") {
            res.status(409).json({
                message: "This plant must belong to at least one album. It has been kept in this album.",
            });
            return;
        }
        console.error("Failed to remove plant from collection:", error);
        res.status(500).json({ message: "Server error" });
        return;
    }
};
exports.removePlantFromCollection = removePlantFromCollection;
const getPublicCollections = async (req, res) => {
    try {
        const limit = Math.min(Number(req.query.limit) || 8, 50);
        const collections = await (0, collectionService_1.getPublicCollections)(limit);
        res.status(200).json(collections);
    }
    catch (error) {
        console.error("Error fetching public collections:", error);
        res.status(500).json({ message: "Server error while fetching public collections" });
    }
};
exports.getPublicCollections = getPublicCollections;
const setCollectionThumbnail = async (req, res) => {
    const userId = req.user;
    const { collectionId } = req.params;
    const { imageId } = req.body;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    if (!collectionId) {
        res
            .status(400)
            .json({ message: "collectionId is required." });
        return;
    }
    try {
        const result = await (0, collectionService_1.setCollectionThumbnailService)({
            userId,
            collectionId,
            imageId: imageId ?? null,
        });
        res.status(200).json(result);
        return;
    }
    catch (error) {
        console.error("Failed to set collection thumbnail:", error);
        if (error.message === "Collection not found or access denied") {
            res.status(403).json({ message: error.message });
            return;
        }
        if (error.message === "Image not found") {
            res.status(404).json({ message: error.message });
            return;
        }
        res.status(500).json({ message: "Server error" });
        return;
    }
};
exports.setCollectionThumbnail = setCollectionThumbnail;
