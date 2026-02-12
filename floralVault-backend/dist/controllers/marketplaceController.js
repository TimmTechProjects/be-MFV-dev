"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getListings = void 0;
const marketplaceService_1 = require("../services/marketplaceService");
const getListings = async (req, res) => {
    try {
        const sort = req.query.sort || "newest";
        const limit = parseInt(req.query.limit) || 6;
        // Validate limit
        if (limit < 1 || limit > 50) {
            res.status(400).json({
                error: "Invalid limit parameter. Must be between 1 and 50."
            });
            return;
        }
        const listings = await (0, marketplaceService_1.getMarketplaceListings)(sort, limit);
        res.status(200).json({
            success: true,
            count: listings.length,
            data: listings
        });
    }
    catch (error) {
        console.error("Error fetching marketplace listings:", error);
        res.status(500).json({
            error: "Failed to fetch marketplace listings",
            message: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
exports.getListings = getListings;
