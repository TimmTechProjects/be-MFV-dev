import { Router } from 'express';
import * as apothecaryController from '../controllers/apothecaryController';
import * as aiController from '../controllers/aiController';
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

// AI routes - public Q&A, admin-only generation
router.post('/ai/ask', aiController.askAI); // Public - anyone can ask AI questions
router.post('/ai/generate/:plantId', verifyToken, aiController.generateContent); // Admin only
router.post('/ai/generate/bulk', verifyToken, aiController.bulkGenerateContent); // Admin only
router.get('/ai/pending', verifyToken, aiController.getPendingContent); // Admin only
router.post('/ai/approve/:contentId', verifyToken, aiController.approveContent); // Admin only
router.post('/ai/reject/:contentId', verifyToken, aiController.rejectContent); // Admin only
router.get('/ai/stats', verifyToken, aiController.getUsageStats); // Admin only

export default router;
