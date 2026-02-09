"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDiscoverFilters = exports.discoverPlants = exports.deletePlantPost = exports.createPlantPost = exports.getPlantBySlug = exports.searchPlants = exports.getPaginatedPlants = exports.getPlants = void 0;
const plantService_1 = require("../services/plantService");
const getPlants = async (req, res) => {
    const plants = await (0, plantService_1.getAllPlants)();
    if (!plants) {
        res.status(400).json({ message: "Could not find plants" });
    }
    res.status(200).json(plants);
};
exports.getPlants = getPlants;
const getPaginatedPlants = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { plants, total } = await (0, plantService_1.getAllPaginatedPlants)(page, limit);
    res.status(200).json({ plants, total });
};
exports.getPaginatedPlants = getPaginatedPlants;
const searchPlants = async (req, res) => {
    const query = req.query.q;
    if (!query) {
        res.status(400).json({ message: "Query required" });
        return;
    }
    try {
        const results = await (0, plantService_1.querySearch)(query);
        res.status(200).json(results);
    }
    catch (error) {
        console.error("Error fetching data", error);
    }
};
exports.searchPlants = searchPlants;
const getPlantBySlug = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { slug, username } = req.params;
    const plant = await (0, plantService_1.getPlantBySlug)(slug, username);
    if (!plant) {
        res.status(404).json({ message: "Plant not found" });
    }
    res.status(200).json(plant);
};
exports.getPlantBySlug = getPlantBySlug;
const createPlantPost = async (req, res) => {
    try {
        const { commonName, botanicalName, description, origin, family, tags, images, type, isPublic = true, collectionId, } = req.body;
        const userId = req.user;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        if (!collectionId) {
            res.status(400).json({ message: "Collection ID is required." });
            return;
        }
        // FIX: Prevent double-encoding of HTML entities in descriptions
        // When descriptions contain HTML (from rich text editors), ensure they're stored
        // as-is without extra encoding that causes issues during retrieval
        let processedDescription = description || "";
        if (typeof processedDescription === "string" && processedDescription.length > 0) {
            // If description is already HTML-entity-encoded, decode it once before storage
            // This prevents double-encoding when sending via JSON
            if (processedDescription.includes("&lt;") || processedDescription.includes("&gt;") || processedDescription.includes("&quot;")) {
                try {
                    processedDescription = decodeHTMLEntities(processedDescription);
                }
                catch (e) {
                    // If decoding fails, use original - this maintains backwards compatibility
                    console.warn("Could not decode HTML entities in description:", e);
                }
            }
        }
        const newPlant = await (0, plantService_1.createPlant)({
            commonName,
            botanicalName,
            description: processedDescription,
            origin,
            family,
            type,
            isPublic,
            user: { connect: { id: userId } },
            tags,
            images,
            collectionId,
        });
        res.status(201).json(newPlant);
    }
    catch (error) {
        console.error("Error creating plant post:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
exports.createPlantPost = createPlantPost;
// Helper function to decode HTML entities at the backend level
// This is a workaround for the JSON body parsing issue that was blocking image uploads
// Reference: PR #6 - HTML entities in plant descriptions were being double-encoded
function decodeHTMLEntities(text) {
    const entities = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&#39;": "'",
        "&apos;": "'",
        "&#x27;": "'",
        "&#x2F;": "/",
        "&slash;": "/",
    };
    let decoded = text;
    for (const [entity, char] of Object.entries(entities)) {
        decoded = decoded.replace(new RegExp(entity, "g"), char);
    }
    return decoded;
}
const deletePlantPost = async (req, res) => {
    try {
        const { plantId } = req.params;
        const userId = req.user;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        if (!plantId) {
            res.status(400).json({ message: "Plant ID is required." });
            return;
        }
        const result = await (0, plantService_1.deletePlant)(plantId, userId);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error deleting plant:", error);
        if (error.message.includes("not found") || error.message.includes("permission")) {
            res.status(403).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "Something went wrong" });
        }
    }
};
exports.deletePlantPost = deletePlantPost;
/**
 * GET /api/plants/discover/search
 * Advanced search with filtering for plant discovery
 */
const discoverPlants = async (req, res) => {
    try {
        const { q, type, light, water, difficulty, page = 1, limit = 20, } = req.query;
        const filters = {
            type: type,
            light: light,
            water: water,
            difficulty: difficulty,
        };
        const result = await (0, plantService_1.searchAndFilterPlants)(q, filters, parseInt(page) || 1, parseInt(limit) || 20);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error discovering plants:", error);
        res.status(500).json({ message: "Failed to search plants" });
    }
};
exports.discoverPlants = discoverPlants;
/**
 * GET /api/plants/discover/filters
 * Get available filter options
 */
const getDiscoverFilters = async (req, res) => {
    try {
        const filters = await (0, plantService_1.getFilterOptions)();
        res.status(200).json(filters);
    }
    catch (error) {
        console.error("Error getting filter options:", error);
        res.status(500).json({ message: "Failed to get filter options" });
    }
};
exports.getDiscoverFilters = getDiscoverFilters;
