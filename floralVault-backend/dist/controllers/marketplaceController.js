"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserMarketplaceListings = exports.getMarketplaceListings = void 0;
const marketplaceService_1 = require("../services/marketplaceService");
/**
 * Get all marketplace listings
 * Query params: sort (newest/oldest/price), status (active/draft/sold), limit
 */
const getMarketplaceListings = async (req, res) => {
    try {
        const sort = req.query.sort || "newest";
        const status = req.query.status;
        const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
        const listings = (0, marketplaceService_1.getAllListings)({ sort, status, limit });
        res.status(200).json({
            success: true,
            count: listings.length,
            listings,
        });
    }
    catch (error) {
        console.error("Error fetching marketplace listings:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch marketplace listings",
        });
    }
};
exports.getMarketplaceListings = getMarketplaceListings;
/**
 * Get marketplace listings for a specific user
 * Route: GET /api/marketplace/users/:username/listings
 * Query params: sort (newest/oldest/price), status (active/draft/sold), limit
 */
const getUserMarketplaceListings = async (req, res) => {
    try {
        const { username } = req.params;
        if (!username) {
            res.status(400).json({
                success: false,
                message: "Username is required",
            });
            return;
        }
        const sort = req.query.sort || "newest";
        const status = req.query.status;
        const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
        const listings = (0, marketplaceService_1.getListingsByUsername)(username, { sort, status, limit });
        res.status(200).json({
            success: true,
            username,
            count: listings.length,
            listings,
        });
    }
    catch (error) {
        console.error("Error fetching user marketplace listings:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user marketplace listings",
        });
    }
};
exports.getUserMarketplaceListings = getUserMarketplaceListings;
