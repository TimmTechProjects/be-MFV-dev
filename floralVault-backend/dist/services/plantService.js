"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCollectionPlantCount = exports.getUserCollectionWithPlants = exports.createPlant = exports.getPlantBySlug = exports.querySearch = exports.getAllPaginatedPlants = exports.getAllPlants = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const slugify_1 = __importDefault(require("slugify"));
const getAllPlants = async () => {
    return await client_1.default.plant.findMany({
        where: { isPublic: true },
        include: {
            user: {
                select: {
                    username: true,
                },
            },
            tags: true,
            images: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};
exports.getAllPlants = getAllPlants;
const getAllPaginatedPlants = async (page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
    const [plants, total] = await Promise.all([
        client_1.default.plant.findMany({
            where: { isPublic: true },
            include: {
                user: { select: { username: true } },
                tags: true,
                images: true,
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        client_1.default.plant.count({ where: { isPublic: true } }),
    ]);
    return { plants, total };
};
exports.getAllPaginatedPlants = getAllPaginatedPlants;
const querySearch = async (q) => {
    return await Promise.all([
        client_1.default.plant.findMany({
            where: {
                OR: [
                    { commonName: { contains: q, mode: "insensitive" } },
                    { botanicalName: { contains: q, mode: "insensitive" } },
                    { description: { contains: q, mode: "insensitive" } },
                    {
                        tags: {
                            some: { name: { contains: q, mode: "insensitive" } },
                        },
                    },
                ],
            },
            include: {
                tags: true,
                user: { select: { username: true } },
                images: true,
            },
            take: 5,
            orderBy: { createdAt: "desc" },
        }),
        client_1.default.user.findMany({
            where: {
                OR: [
                    { username: { contains: q, mode: "insensitive" } },
                    { firstName: { contains: q, mode: "insensitive" } },
                    { lastName: { contains: q, mode: "insensitive" } },
                ],
            },
            select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
            },
            take: 5,
        }),
    ]);
};
exports.querySearch = querySearch;
const getPlantBySlug = async (slug, _username) => {
    return await client_1.default.plant.findFirst({
        where: {
            slug,
        },
        include: {
            user: {
                select: {
                    username: true,
                },
            },
            collection: {
                select: {
                    slug: true,
                },
            },
            tags: true,
            images: true,
        },
    });
};
exports.getPlantBySlug = getPlantBySlug;
const createPlant = async (data) => {
    const userId = data.user.connect.id;
    if (!data.collectionId) {
        throw new Error("Collection ID is required.");
    }
    // 0. Verify the collection belongs to the authenticated user
    const collection = await client_1.default.collection.findFirst({
        where: {
            id: data.collectionId,
            userId,
        },
    });
    if (!collection) {
        throw new Error("Collection not found or you don't have permission to add plants to it.");
    }
    // 1. Check if this user already added this plant
    const existingPlant = await client_1.default.plant.findFirst({
        where: {
            botanicalName: data.botanicalName,
            userId,
        },
    });
    if (existingPlant) {
        // later extend this to return or update
        throw new Error("You already submitted this plant.");
    }
    // 2. Generate a unique slug once
    const slug = (0, slugify_1.default)(data.botanicalName, { lower: true, strict: true });
    // 3. Create the new plant
    const newPlant = await client_1.default.plant.create({
        data: {
            commonName: data.commonName,
            botanicalName: data.botanicalName,
            description: data.description,
            type: data.type,
            isPublic: data.isPublic,
            origin: data.origin,
            family: data.family,
            slug,
            user: data.user,
            collection: {
                connect: { id: data.collectionId },
            },
            originalCollection: {
                connect: { id: data.collectionId },
            },
            images: {
                create: data.images?.map((img) => ({
                    url: img.url,
                    isMain: img.isMain || false,
                })) || [],
            },
            tags: {
                connectOrCreate: data.tags?.map((tag) => ({
                    where: { name: tag },
                    create: { name: tag },
                })) || [],
            },
        },
        include: {
            tags: true,
            images: true,
            user: {
                select: {
                    username: true,
                },
            },
            collection: {
                select: { slug: true },
            },
            originalCollection: {
                select: { slug: true },
            },
        },
    });
    return newPlant;
};
exports.createPlant = createPlant;
const getUserCollectionWithPlants = async (username, collectionSlug, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    return client_1.default.collection.findFirst({
        where: {
            slug: collectionSlug,
            user: {
                is: { username },
            },
        },
        include: {
            plants: {
                include: {
                    tags: true,
                    images: true,
                    user: {
                        select: {
                            username: true,
                        },
                    },
                    collection: {
                        select: {
                            slug: true,
                        },
                    },
                    originalCollection: {
                        select: {
                            slug: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
                skip,
                take: limit,
            },
        },
    });
};
exports.getUserCollectionWithPlants = getUserCollectionWithPlants;
const getCollectionPlantCount = async (collectionId) => {
    return client_1.default.plant.count({
        where: {
            collectionId,
        },
    });
};
exports.getCollectionPlantCount = getCollectionPlantCount;
