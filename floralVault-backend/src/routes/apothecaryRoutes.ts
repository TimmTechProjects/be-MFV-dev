import { Router } from 'express';
import * as apothecaryController from '../controllers/apothecaryController';
import { verifyToken } from '../middleware/verifyToken';

const router = Router();

// Public routes - anyone can view medicinal information
router.get('/plants/:plantId', apothecaryController.getPlantMedicinalInfo);
router.get('/search', apothecaryController.searchByProperty);
router.get('/properties/:property', apothecaryController.getPlantsByProperty);
router.get('/recipes', apothecaryController.getRecipes);
router.get('/recipes/:id', apothecaryController.getRecipeById);

// Protected routes - require authentication
router.post('/recipes', verifyToken, apothecaryController.createRecipe);
router.post('/plants/:plantId/medicinal', verifyToken, apothecaryController.createOrUpdateMedicinalProperty);

export default router;
