import { Request, Response } from 'express';
import * as apothecaryService from '../services/apothecaryService';

/**
 * GET /api/apothecary/plants/:plantId
 * Get medicinal properties for a specific plant
 */
export const getPlantMedicinalInfo = async (req: Request, res: Response) => {
  try {
    const { plantId } = req.params;
    
    const medicinalInfo = await apothecaryService.getPlantMedicinalInfo(plantId);
    
    if (!medicinalInfo) {
      return res.status(404).json({ error: 'Medicinal information not found for this plant' });
    }
    
    res.json(medicinalInfo);
  } catch (error) {
    console.error('Error fetching plant medicinal info:', error);
    res.status(500).json({ error: 'Failed to fetch medicinal information' });
  }
};

/**
 * GET /api/apothecary/search
 * Search plants by medicinal properties
 */
export const searchByProperty = async (req: Request, res: Response) => {
  try {
    const { query, property, compound } = req.query;
    
    const results = await apothecaryService.searchByProperty({
      query: query as string,
      property: property as string,
      compound: compound as string,
    });
    
    res.json(results);
  } catch (error) {
    console.error('Error searching medicinal plants:', error);
    res.status(500).json({ error: 'Failed to search medicinal plants' });
  }
};

/**
 * GET /api/apothecary/properties/:property
 * Get all plants with a specific medicinal property
 */
export const getPlantsByProperty = async (req: Request, res: Response) => {
  try {
    const { property } = req.params;
    
    const plants = await apothecaryService.getPlantsByProperty(property);
    
    res.json(plants);
  } catch (error) {
    console.error('Error fetching plants by property:', error);
    res.status(500).json({ error: 'Failed to fetch plants by property' });
  }
};

/**
 * POST /api/apothecary/recipes
 * Create a new herbal recipe
 */
export const createRecipe = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ error: 'Failed to create recipe' });
  }
};

/**
 * GET /api/apothecary/recipes
 * Get herbal recipes with optional filters
 */
export const getRecipes = async (req: Request, res: Response) => {
  try {
    const { plantId, authorId, difficulty, purpose } = req.query;
    
    const recipes = await apothecaryService.getRecipes({
      plantId: plantId as string,
      authorId: authorId as string,
      difficulty: difficulty as string,
      purpose: purpose as string,
    });
    
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
};

/**
 * GET /api/apothecary/recipes/:id
 * Get a specific recipe by ID
 */
export const getRecipeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const recipe = await apothecaryService.getRecipeById(id);
    
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    res.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
};

/**
 * POST /api/apothecary/plants/:plantId/medicinal
 * Create or update medicinal properties for a plant (admin/premium only)
 */
export const createOrUpdateMedicinalProperty = async (req: Request, res: Response) => {
  try {
    const { plantId } = req.params;
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const medicinalProperty = await apothecaryService.createOrUpdateMedicinalProperty(
      plantId,
      req.body
    );
    
    res.json(medicinalProperty);
  } catch (error) {
    console.error('Error creating/updating medicinal property:', error);
    res.status(500).json({ error: 'Failed to create/update medicinal property' });
  }
};
