"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilterOptions = exports.searchAndFilterPlants = exports.deletePlant = exports.getCollectionPlantCount = exports.getUserCollectionWithPlants = exports.createPlant = exports.getPlantBySlug = exports.querySearch = exports.getAllPaginatedPlants = exports.getAllPlants = void 0;
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
                    name: true,
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
    // 4. Auto-set collection thumbnail if it doesn't have one
    if (!collection.thumbnailImageId && newPlant.images?.length > 0) {
        const mainImage = newPlant.images.find((img) => img.isMain) || newPlant.images[0];
        if (mainImage) {
            await client_1.default.collection.update({
                where: { id: data.collectionId },
                data: { thumbnailImageId: mainImage.id },
            });
        }
    }
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
const deletePlant = async (plantId, userId) => {
    // Verify ownership before deleting
    const plant = await client_1.default.plant.findFirst({
        where: {
            id: plantId,
            userId,
        },
        include: {
            images: true,
        },
    });
    if (!plant) {
        throw new Error("Plant not found or you don't have permission to delete it.");
    }
    // Delete associated images first
    await client_1.default.image.deleteMany({
        where: {
            plantId,
        },
    });
    // Delete the plant
    await client_1.default.plant.delete({
        where: {
            id: plantId,
        },
    });
    return { success: true, deletedPlantId: plantId };
};
exports.deletePlant = deletePlant;
/**
 * Enhanced search with filters for plant discovery
 */
const searchAndFilterPlants = async (searchQuery, filters, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
    const whereConditions = {
        isPublic: true,
    };
    // Text search across common name, botanical name, and description
    if (searchQuery && searchQuery.trim()) {
        whereConditions.OR = [
            { commonName: { contains: searchQuery, mode: "insensitive" } },
            { botanicalName: { contains: searchQuery, mode: "insensitive" } },
            { description: { contains: searchQuery, mode: "insensitive" } },
            {
                tags: {
                    some: { name: { contains: searchQuery, mode: "insensitive" } },
                },
            },
        ];
    }
    // Type filter (common name contains or tag match)
    if (filters?.type && filters.type.trim()) {
        if (!whereConditions.OR)
            whereConditions.OR = [];
        whereConditions.OR.push({ type: { contains: filters.type, mode: "insensitive" } }, { tags: { some: { name: { contains: filters.type, mode: "insensitive" } } } });
    }
    // Light requirements filter (via tags or description)
    if (filters?.light && filters.light.trim()) {
        if (!whereConditions.AND)
            whereConditions.AND = [];
        whereConditions.AND.push({
            OR: [
                { description: { contains: filters.light, mode: "insensitive" } },
                { tags: { some: { name: { contains: filters.light, mode: "insensitive" } } } },
            ],
        });
    }
    // Water requirements filter (via tags or description)
    if (filters?.water && filters.water.trim()) {
        if (!whereConditions.AND)
            whereConditions.AND = [];
        whereConditions.AND.push({
            OR: [
                { description: { contains: filters.water, mode: "insensitive" } },
                { tags: { some: { name: { contains: filters.water, mode: "insensitive" } } } },
            ],
        });
    }
    // Difficulty filter (via tags or description)
    if (filters?.difficulty && filters.difficulty.trim()) {
        if (!whereConditions.AND)
            whereConditions.AND = [];
        whereConditions.AND.push({
            OR: [
                { description: { contains: filters.difficulty, mode: "insensitive" } },
                { tags: { some: { name: { contains: filters.difficulty, mode: "insensitive" } } } },
            ],
        });
    }
    const [plants, total] = await Promise.all([
        client_1.default.plant.findMany({
            where: whereConditions,
            include: {
                user: { select: { username: true, id: true, avatarUrl: true } },
                tags: true,
                images: true,
            },
            orderBy: { likes: "desc" },
            skip,
            take: limit,
        }),
        client_1.default.plant.count({ where: whereConditions }),
    ]);
    return {
        plants,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
};
exports.searchAndFilterPlants = searchAndFilterPlants;
/**
 * Get all available filter options for plant discovery
 */
const getFilterOptions = async () => {
    const plants = await client_1.default.plant.findMany({
        where: { isPublic: true },
        select: { type: true, tags: true, description: true },
    });
    // Extract unique types
    const types = new Set();
    plants.forEach(p => {
        if (p.type)
            types.add(p.type);
    });
    // Extract unique tags that might indicate light, water, or difficulty
    const tags = new Set();
    const lightTags = new Set();
    const waterTags = new Set();
    const difficultyTags = new Set();
    plants.forEach(p => {
        p.tags.forEach(tag => {
            tags.add(tag.name);
            if (/light|bright|shade|partial|full/i.test(tag.name))
                lightTags.add(tag.name);
            if (/water|moist|dry|humid|drought/i.test(tag.name))
                waterTags.add(tag.name);
            if (/easy|beginner|intermediate|difficult|advanced/i.test(tag.name))
                difficultyTags.add(tag.name);
        });
    });
    return {
        types: Array.from(types).filter(t => t).sort(),
        tags: Array.from(tags).sort(),
        light: Array.from(lightTags).sort(),
        water: Array.from(waterTags).sort(),
        difficulty: Array.from(difficultyTags).sort(),
    };
};
exports.getFilterOptions = getFilterOptions;
