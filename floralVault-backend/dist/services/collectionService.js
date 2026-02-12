"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCollectionThumbnailService = exports.getPublicCollections = exports.removePlantFromCollectionService = exports.addPlantToCollectionService = exports.getUsersCollectionsById = exports.getCollectionWithPlants = exports.getUserCollections = exports.createNewCollection = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const createNewCollection = async (username, data, authenticatedUserId) => {
    const user = await client_1.default.user.findUnique({
        where: { username },
    });
    if (!user) {
        throw new Error("User not found");
    }
    // If authenticatedUserId is provided, verify it matches the target user
    if (authenticatedUserId && user.id !== authenticatedUserId) {
        throw new Error("Unauthorized: User mismatch");
    }
    // Generate a unique slug by appending a timestamp if needed
    const baseSlug = data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    let slug = baseSlug;
    let counter = 1;
    // Check for existing slugs and make unique if necessary
    while (await client_1.default.collection.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    return client_1.default.collection.create({
        data: {
            name: data.name,
            description: data.description ?? "",
            slug,
            userId: user.id,
        },
    });
};
exports.createNewCollection = createNewCollection;
const getUserCollections = async (username) => {
    const user = await client_1.default.user.findUnique({
        where: { username },
        include: {
            collections: {
                include: {
                    thumbnailImage: true,
                    _count: {
                        select: { plants: true },
                    },
                    plants: {
                        orderBy: { createdAt: "desc" },
                        take: 1,
                        include: {
                            images: {
                                where: { isMain: true },
                                take: 1,
                            },
                        },
                    },
                },
            },
        },
    });
    if (!user)
        return null;
    return user?.collections || [];
};
exports.getUserCollections = getUserCollections;
const getCollectionWithPlants = async (collectionId) => {
    return client_1.default.collection.findUnique({
        where: { id: collectionId },
        include: {
            plants: {
                include: {
                    tags: true,
                    images: true,
                },
            },
        },
    });
};
exports.getCollectionWithPlants = getCollectionWithPlants;
const getUsersCollectionsById = async (userId) => {
    return await client_1.default.collection.findMany({
        where: { userId },
        include: {
            thumbnailImage: true,
            plants: {
                select: { id: true },
            },
            _count: {
                select: { plants: true },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};
exports.getUsersCollectionsById = getUsersCollectionsById;
const addPlantToCollectionService = async ({ userId, collectionId, plantId, }) => {
    // Confirm the collection belongs to the user
    const collection = await client_1.default.collection.findFirst({
        where: {
            id: collectionId,
            userId,
        },
    });
    if (!collection) {
        throw new Error("Collection not found or access denied");
    }
    // Add the plant to the collection
    const updatedCollection = await client_1.default.collection.update({
        where: { id: collectionId },
        data: {
            plants: {
                connect: { id: plantId },
            },
        },
    });
    // Auto-set thumbnail if collection doesn't have one
    if (!collection.thumbnailImageId) {
        const plantWithImage = await client_1.default.plant.findUnique({
            where: { id: plantId },
            include: {
                images: {
                    where: { isMain: true },
                    take: 1,
                },
            },
        });
        if (plantWithImage?.images?.[0]?.id) {
            await client_1.default.collection.update({
                where: { id: collectionId },
                data: { thumbnailImageId: plantWithImage.images[0].id },
            });
        }
    }
    return updatedCollection;
};
exports.addPlantToCollectionService = addPlantToCollectionService;
const getOrCreateUncategorizedCollection = async (userId) => {
    const slug = `uncategorized-${userId}`;
    const existing = await client_1.default.collection.findFirst({
        where: {
            userId,
            slug,
        },
    });
    if (existing)
        return existing;
    try {
        return await client_1.default.collection.create({
            data: {
                name: "Uncategorized",
                slug,
                description: "Plants that have been removed from all other albums",
                userId,
            },
        });
    }
    catch {
        const found = await client_1.default.collection.findFirst({
            where: { userId, slug },
        });
        if (found)
            return found;
        throw new Error("Failed to create uncategorized collection");
    }
};
const removePlantFromCollectionService = async ({ userId, collectionId, plantId, }) => {
    const collection = await client_1.default.collection.findFirst({
        where: {
            id: collectionId,
            userId,
        },
    });
    if (!collection) {
        throw new Error("Collection not found or access denied");
    }
    const plant = await client_1.default.plant.findUnique({
        where: { id: plantId },
    });
    if (!plant) {
        throw new Error("Plant not found");
    }
    if (plant.collectionId !== collectionId) {
        throw new Error("Plant is not in this collection");
    }
    const isOwner = plant.userId === userId;
    if (isOwner) {
        const ownerCollectionsWithPlant = await client_1.default.collection.findMany({
            where: {
                userId,
                plants: { some: { id: plantId } },
            },
        });
        if (ownerCollectionsWithPlant.length <= 1) {
            const uncategorized = await getOrCreateUncategorizedCollection(userId);
            if (uncategorized.id === collectionId) {
                throw new Error("LAST_ALBUM");
            }
            await client_1.default.plant.update({
                where: { id: plantId },
                data: { collectionId: uncategorized.id },
            });
            return { collection, movedToUncategorized: true };
        }
    }
    const targetCollectionId = plant.originalCollectionId || collectionId;
    if (targetCollectionId === collectionId) {
        const otherCollection = await client_1.default.collection.findFirst({
            where: {
                userId,
                plants: { some: { id: plantId } },
                id: { not: collectionId },
            },
        });
        if (otherCollection) {
            await client_1.default.plant.update({
                where: { id: plantId },
                data: { collectionId: otherCollection.id },
            });
        }
        return { collection, movedToUncategorized: false };
    }
    await client_1.default.plant.update({
        where: { id: plantId },
        data: { collectionId: targetCollectionId },
    });
    return { collection, movedToUncategorized: false };
};
exports.removePlantFromCollectionService = removePlantFromCollectionService;
const getPublicCollections = async (limit = 8) => {
    return client_1.default.collection.findMany({
        where: { isPublic: true },
        include: {
            user: {
                select: { username: true },
            },
            thumbnailImage: true,
            plants: {
                take: 1,
                orderBy: { createdAt: "desc" },
                include: {
                    images: {
                        where: { isMain: true },
                        take: 1,
                    },
                },
            },
            _count: {
                select: { plants: true },
            },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
    });
};
exports.getPublicCollections = getPublicCollections;
const setCollectionThumbnailService = async ({ userId, collectionId, imageId, }) => {
    const collection = await client_1.default.collection.findFirst({
        where: {
            id: collectionId,
            userId,
        },
    });
    if (!collection) {
        throw new Error("Collection not found or access denied");
    }
    if (imageId === null) {
        return await client_1.default.collection.update({
            where: { id: collectionId },
            data: { thumbnailImageId: null },
            include: { thumbnailImage: true },
        });
    }
    const image = await client_1.default.image.findUnique({
        where: { id: imageId },
    });
    if (!image) {
        throw new Error("Image not found");
    }
    return await client_1.default.collection.update({
        where: { id: collectionId },
        data: { thumbnailImageId: imageId },
        include: { thumbnailImage: true },
    });
};
exports.setCollectionThumbnailService = setCollectionThumbnailService;
