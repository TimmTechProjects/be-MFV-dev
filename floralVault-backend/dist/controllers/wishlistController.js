"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAvailability = exports.addPriceAlert = exports.deleteItem = exports.updateItem = exports.addItem = exports.getWishlist = void 0;
const wishlistService_1 = require("../services/wishlistService");
const getWishlist = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const wishlist = await (0, wishlistService_1.getUserWishlist)(userId);
        res.status(200).json(wishlist);
    }
    catch (error) {
        console.error("Error fetching wishlist:", error);
        res.status(500).json({ message: "Failed to fetch wishlist" });
    }
};
exports.getWishlist = getWishlist;
const addItem = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const { plantId, plantName, notes, priority, priceTarget, marketplaceUrl, notifyOnAvailable, } = req.body;
        if (!plantName) {
            res.status(400).json({ message: "Plant name is required" });
            return;
        }
        const item = await (0, wishlistService_1.addWishlistItem)(userId, {
            plantId,
            plantName,
            notes,
            priority,
            priceTarget,
            marketplaceUrl,
            notifyOnAvailable,
        });
        res.status(201).json(item);
    }
    catch (error) {
        console.error("Error adding wishlist item:", error);
        res.status(500).json({ message: "Failed to add wishlist item" });
    }
};
exports.addItem = addItem;
const updateItem = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const updateData = req.body;
        const item = await (0, wishlistService_1.updateWishlistItem)(userId, id, updateData);
        if (!item) {
            res.status(404).json({ message: "Wishlist item not found" });
            return;
        }
        res.status(200).json(item);
    }
    catch (error) {
        console.error("Error updating wishlist item:", error);
        res.status(500).json({ message: "Failed to update wishlist item" });
    }
};
exports.updateItem = updateItem;
const deleteItem = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const success = await (0, wishlistService_1.removeWishlistItem)(userId, id);
        if (!success) {
            res.status(404).json({ message: "Wishlist item not found" });
            return;
        }
        res.status(200).json({ message: "Item removed from wishlist" });
    }
    catch (error) {
        console.error("Error deleting wishlist item:", error);
        res.status(500).json({ message: "Failed to delete wishlist item" });
    }
};
exports.deleteItem = deleteItem;
const addPriceAlert = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const { plantName, targetPrice, listingId } = req.body;
        if (!plantName || !targetPrice) {
            res.status(400).json({
                message: "Plant name and target price are required",
            });
            return;
        }
        const alert = await (0, wishlistService_1.createPriceAlert)(userId, {
            plantName,
            targetPrice,
            listingId,
        });
        res.status(201).json(alert);
    }
    catch (error) {
        console.error("Error creating price alert:", error);
        res.status(500).json({ message: "Failed to create price alert" });
    }
};
exports.addPriceAlert = addPriceAlert;
const checkAvailability = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const availability = await (0, wishlistService_1.checkMarketplaceAvailability)(userId);
        res.status(200).json(availability);
    }
    catch (error) {
        console.error("Error checking availability:", error);
        res.status(500).json({ message: "Failed to check availability" });
    }
};
exports.checkAvailability = checkAvailability;
