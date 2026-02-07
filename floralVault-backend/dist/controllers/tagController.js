"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSuggestedTags = exports.getTags = void 0;
const tagServices_1 = require("../services/tagServices");
// GET all tags
const getTags = async (req, res) => {
    try {
        const tags = await (0, tagServices_1.getAllTags)();
        // if (!tags) {
        //   res.status(404).json("Sorry, tags do not exist");
        //   return;
        // }
        res.status(200).json(tags);
        return;
    }
    catch (error) {
        console.error("Error fetching tags:", error);
        res.status(500).json({ message: "Failed to fetch tags" });
        return;
    }
};
exports.getTags = getTags;
const getSuggestedTags = async (req, res) => {
    const query = req.query.query;
    if (!query || query.length < 2) {
        res.status(400).json({ message: "Query too short" });
        return;
    }
    try {
        const matchingTags = await (0, tagServices_1.getAllSuggestionTags)(query);
        // Return empty array instead of 404 for no matches (better UX)
        if (matchingTags.length === 0) {
            res.status(200).json([]);
            return;
        }
        res.status(200).json(matchingTags);
        return;
    }
    catch (error) {
        console.error("Error fetching tag suggestions:", error);
        res.status(500).json({ message: "Failed to fetch tags" });
        return;
    }
};
exports.getSuggestedTags = getSuggestedTags;
