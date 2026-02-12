"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrUpdateMedicinalProperty = exports.getRecipeById = exports.getRecipes = exports.createRecipe = exports.getPlantsByProperty = exports.searchByProperty = exports.getPlantMedicinalInfo = void 0;
const client_1 = __importDefault(require("../prisma/client"));
/**
 * Get medicinal properties for a specific plant
 */
const getPlantMedicinalInfo = async (plantId) => {
    return await client_1.default.medicinalProperty.findUnique({
        where: { plantId },
        include: {
            plant: {
                include: {
                    images: true,
                    tags: true,
                },
            },
        },
    });
};
exports.getPlantMedicinalInfo = getPlantMedicinalInfo;
/**
 * Search plants by medicinal properties, compounds, or general query
 */
const searchByProperty = async (params) => {
    const { query, property, compound } = params;
    const where = {};
    if (property) {
        where.properties = {
            has: property,
        };
    }
    if (compound) {
        where.activeCompounds = {
            has: compound,
        };
    }
    // If there's a general query, search across multiple fields
    if (query) {
        where.OR = [
            {
                properties: {
                    hasSome: [query],
                },
            },
            {
                activeCompounds: {
                    hasSome: [query],
                },
            },
            {
                plant: {
                    commonName: {
                        contains: query,
                        mode: 'insensitive',
                    },
                },
            },
            {
                plant: {
                    botanicalName: {
                        contains: query,
                        mode: 'insensitive',
                    },
                },
            },
        ];
    }
    return await client_1.default.medicinalProperty.findMany({
        where,
        include: {
            plant: {
                include: {
                    images: true,
                    tags: true,
                },
            },
        },
        orderBy: {
            updatedAt: 'desc',
        },
    });
};
exports.searchByProperty = searchByProperty;
/**
 * Get all plants with a specific medicinal property
 */
const getPlantsByProperty = async (property) => {
    return await client_1.default.medicinalProperty.findMany({
        where: {
            properties: {
                has: property,
            },
        },
        include: {
            plant: {
                include: {
                    images: true,
                    tags: true,
                },
            },
        },
        orderBy: {
            plant: {
                commonName: 'asc',
            },
        },
    });
};
exports.getPlantsByProperty = getPlantsByProperty;
/**
 * Create a new herbal recipe
 */
const createRecipe = async (data) => {
    return await client_1.default.herbalRecipe.create({
        data: {
            title: data.title,
            description: data.description,
            authorId: data.authorId,
            plantIds: data.plantIds,
            ingredients: data.ingredients,
            instructions: data.instructions,
            prepTime: data.prepTime,
            difficulty: data.difficulty,
            purpose: data.purpose,
            safetyNotes: data.safetyNotes,
            images: data.images || [],
        },
    });
};
exports.createRecipe = createRecipe;
/**
 * Get recipes with optional filters
 */
const getRecipes = async (filters) => {
    const where = {};
    if (filters.plantId) {
        where.plantIds = {
            has: filters.plantId,
        };
    }
    if (filters.authorId) {
        where.authorId = filters.authorId;
    }
    if (filters.difficulty) {
        where.difficulty = filters.difficulty;
    }
    if (filters.purpose) {
        where.purpose = {
            has: filters.purpose,
        };
    }
    return await client_1.default.herbalRecipe.findMany({
        where,
        orderBy: {
            createdAt: 'desc',
        },
        take: 50, // Limit to 50 recipes
    });
};
exports.getRecipes = getRecipes;
/**
 * Get a specific recipe by ID
 */
const getRecipeById = async (id) => {
    return await client_1.default.herbalRecipe.findUnique({
        where: { id },
    });
};
exports.getRecipeById = getRecipeById;
/**
 * Create or update medicinal properties for a plant
 */
const createOrUpdateMedicinalProperty = async (plantId, data) => {
    // Check if medicinal property already exists
    const existing = await client_1.default.medicinalProperty.findUnique({
        where: { plantId },
    });
    if (existing) {
        return await client_1.default.medicinalProperty.update({
            where: { plantId },
            data: {
                properties: data.properties,
                traditionalUses: data.traditionalUses,
                modernUses: data.modernUses,
                activeCompounds: data.activeCompounds,
                preparations: data.preparations,
                dosage: data.dosage,
                safetyWarnings: data.safetyWarnings,
                contraindications: data.contraindications,
                drugInteractions: data.drugInteractions,
                references: data.references,
            },
        });
    }
    return await client_1.default.medicinalProperty.create({
        data: {
            plantId,
            properties: data.properties || [],
            traditionalUses: data.traditionalUses || [],
            modernUses: data.modernUses || [],
            activeCompounds: data.activeCompounds || [],
            preparations: data.preparations || [],
            dosage: data.dosage,
            safetyWarnings: data.safetyWarnings || [],
            contraindications: data.contraindications || [],
            drugInteractions: data.drugInteractions || [],
            references: data.references || [],
        },
    });
};
exports.createOrUpdateMedicinalProperty = createOrUpdateMedicinalProperty;
