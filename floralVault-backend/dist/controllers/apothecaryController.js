"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrUpdateMedicinalProperty = exports.getRecipeById = exports.getRecipes = exports.createRecipe = exports.getPlantsByProperty = exports.searchByProperty = exports.getPlantMedicinalInfo = void 0;
const apothecaryService = __importStar(require("../services/apothecaryService"));
/**
 * GET /api/apothecary/plants/:plantId
 * Get medicinal properties for a specific plant
 */
const getPlantMedicinalInfo = async (req, res) => {
    try {
        const { plantId } = req.params;
        const medicinalInfo = await apothecaryService.getPlantMedicinalInfo(plantId);
        if (!medicinalInfo) {
            return res.status(404).json({ error: 'Medicinal information not found for this plant' });
        }
        res.json(medicinalInfo);
    }
    catch (error) {
        console.error('Error fetching plant medicinal info:', error);
        res.status(500).json({ error: 'Failed to fetch medicinal information' });
    }
};
exports.getPlantMedicinalInfo = getPlantMedicinalInfo;
/**
 * GET /api/apothecary/search
 * Search plants by medicinal properties
 */
const searchByProperty = async (req, res) => {
    try {
        const { query, property, compound } = req.query;
        const results = await apothecaryService.searchByProperty({
            query: query,
            property: property,
            compound: compound,
        });
        res.json(results);
    }
    catch (error) {
        console.error('Error searching medicinal plants:', error);
        res.status(500).json({ error: 'Failed to search medicinal plants' });
    }
};
exports.searchByProperty = searchByProperty;
/**
 * GET /api/apothecary/properties/:property
 * Get all plants with a specific medicinal property
 */
const getPlantsByProperty = async (req, res) => {
    try {
        const { property } = req.params;
        const plants = await apothecaryService.getPlantsByProperty(property);
        res.json(plants);
    }
    catch (error) {
        console.error('Error fetching plants by property:', error);
        res.status(500).json({ error: 'Failed to fetch plants by property' });
    }
};
exports.getPlantsByProperty = getPlantsByProperty;
/**
 * POST /api/apothecary/recipes
 * Create a new herbal recipe
 */
const createRecipe = async (req, res) => {
    try {
        const userId = req.user?.uid;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const recipeData = {
            ...req.body,
            authorId: userId,
        };
        const recipe = await apothecaryService.createRecipe(recipeData);
        res.status(201).json(recipe);
    }
    catch (error) {
        console.error('Error creating recipe:', error);
        res.status(500).json({ error: 'Failed to create recipe' });
    }
};
exports.createRecipe = createRecipe;
/**
 * GET /api/apothecary/recipes
 * Get herbal recipes with optional filters
 */
const getRecipes = async (req, res) => {
    try {
        const { plantId, authorId, difficulty, purpose } = req.query;
        const recipes = await apothecaryService.getRecipes({
            plantId: plantId,
            authorId: authorId,
            difficulty: difficulty,
            purpose: purpose,
        });
        res.json(recipes);
    }
    catch (error) {
        console.error('Error fetching recipes:', error);
        res.status(500).json({ error: 'Failed to fetch recipes' });
    }
};
exports.getRecipes = getRecipes;
/**
 * GET /api/apothecary/recipes/:id
 * Get a specific recipe by ID
 */
const getRecipeById = async (req, res) => {
    try {
        const { id } = req.params;
        const recipe = await apothecaryService.getRecipeById(id);
        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }
        res.json(recipe);
    }
    catch (error) {
        console.error('Error fetching recipe:', error);
        res.status(500).json({ error: 'Failed to fetch recipe' });
    }
};
exports.getRecipeById = getRecipeById;
/**
 * POST /api/apothecary/plants/:plantId/medicinal
 * Create or update medicinal properties for a plant (admin/premium only)
 */
const createOrUpdateMedicinalProperty = async (req, res) => {
    try {
        const { plantId } = req.params;
        const userId = req.user?.uid;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const medicinalProperty = await apothecaryService.createOrUpdateMedicinalProperty(plantId, req.body);
        res.json(medicinalProperty);
    }
    catch (error) {
        console.error('Error creating/updating medicinal property:', error);
        res.status(500).json({ error: 'Failed to create/update medicinal property' });
    }
};
exports.createOrUpdateMedicinalProperty = createOrUpdateMedicinalProperty;
