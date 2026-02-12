"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkMarketplaceAvailability = exports.createPriceAlert = exports.removeWishlistItem = exports.updateWishlistItem = exports.addWishlistItem = exports.getUserWishlist = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const getUserWishlist = async (userId) => {
    // First, ensure wishlist exists for user
    let wishlist = await client_1.default.wishlist.findUnique({
        where: { userId },
        include: {
            items: {
                include: {
                    plant: {
                        include: {
                            images: true,
                            user: {
                                select: {
                                    username: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    addedAt: "desc",
                },
            },
        },
    });
    // Create wishlist if it doesn't exist
    if (!wishlist) {
        wishlist = await client_1.default.wishlist.create({
            data: {
                userId,
            },
            include: {
                items: {
                    include: {
                        plant: {
                            include: {
                                images: true,
                                user: {
                                    select: {
                                        username: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    }
    return wishlist;
};
exports.getUserWishlist = getUserWishlist;
const addWishlistItem = async (userId, data) => {
    // Ensure wishlist exists
    let wishlist = await client_1.default.wishlist.findUnique({
        where: { userId },
    });
    if (!wishlist) {
        wishlist = await client_1.default.wishlist.create({
            data: { userId },
        });
    }
    // Create wishlist item
    const item = await client_1.default.wishlistItem.create({
        data: {
            wishlistId: wishlist.id,
            plantId: data.plantId,
            plantName: data.plantName,
            notes: data.notes,
            priority: data.priority || "medium",
            priceTarget: data.priceTarget,
            marketplaceUrl: data.marketplaceUrl,
            notifyOnAvailable: data.notifyOnAvailable ?? true,
        },
        include: {
            plant: {
                include: {
                    images: true,
                    user: {
                        select: {
                            username: true,
                        },
                    },
                },
            },
        },
    });
    return item;
};
exports.addWishlistItem = addWishlistItem;
const updateWishlistItem = async (userId, itemId, data) => {
    // Verify item belongs to user's wishlist
    const item = await client_1.default.wishlistItem.findFirst({
        where: {
            id: itemId,
            wishlist: {
                userId,
            },
        },
    });
    if (!item) {
        return null;
    }
    // Update item
    const updatedItem = await client_1.default.wishlistItem.update({
        where: { id: itemId },
        data: {
            plantName: data.plantName,
            notes: data.notes,
            priority: data.priority,
            priceTarget: data.priceTarget,
            marketplaceUrl: data.marketplaceUrl,
            notifyOnAvailable: data.notifyOnAvailable,
        },
        include: {
            plant: {
                include: {
                    images: true,
                    user: {
                        select: {
                            username: true,
                        },
                    },
                },
            },
        },
    });
    return updatedItem;
};
exports.updateWishlistItem = updateWishlistItem;
const removeWishlistItem = async (userId, itemId) => {
    // Verify item belongs to user's wishlist
    const item = await client_1.default.wishlistItem.findFirst({
        where: {
            id: itemId,
            wishlist: {
                userId,
            },
        },
    });
    if (!item) {
        return false;
    }
    // Delete item
    await client_1.default.wishlistItem.delete({
        where: { id: itemId },
    });
    return true;
};
exports.removeWishlistItem = removeWishlistItem;
const createPriceAlert = async (userId, data) => {
    const alert = await client_1.default.priceAlert.create({
        data: {
            userId,
            plantName: data.plantName,
            targetPrice: data.targetPrice,
            listingId: data.listingId,
        },
    });
    return alert;
};
exports.createPriceAlert = createPriceAlert;
const checkMarketplaceAvailability = async (userId) => {
    // Get user's wishlist items
    const wishlist = await (0, exports.getUserWishlist)(userId);
    // TODO: Integrate with marketplace API to check availability
    // For now, return empty array with structure for future implementation
    const available = wishlist.items.map((item) => ({
        wishlistItemId: item.id,
        plantName: item.plantName,
        isAvailable: false,
        marketplaceListings: [],
    }));
    return available;
};
exports.checkMarketplaceAvailability = checkMarketplaceAvailability;
