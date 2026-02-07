"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCollectionThumbnailService = exports.addPlantToCollectionService = exports.getUsersCollectionsById = exports.getCollectionWithPlants = exports.getUserCollections = exports.createNewCollection = void 0;
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
const setCollectionThumbnailService = async ({ userId, collectionId, imageId, }) => {
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
    // Verify the image exists
    const image = await client_1.default.image.findUnique({
        where: { id: imageId },
    });
    if (!image) {
        throw new Error("Image not found");
    }
    // Update the collection thumbnail
    return await client_1.default.collection.update({
        where: { id: collectionId },
        data: { thumbnailImageId: imageId },
        include: { thumbnailImage: true },
    });
};
exports.setCollectionThumbnailService = setCollectionThumbnailService;
