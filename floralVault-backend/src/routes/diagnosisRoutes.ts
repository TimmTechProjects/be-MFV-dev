import express from 'express';
import { diagnosisController } from '../controllers/diagnosisController';
import verifyToken from '../middleware/verifyToken';

const router = express.Router();

// Create diagnosis request
router.post('/', verifyToken, diagnosisController.createDiagnosis);

// Get diagnosis by ID
router.get('/:id', diagnosisController.getDiagnosis);

// Generate AI diagnosis
router.post('/:id/ai', verifyToken, diagnosisController.generateAIDiagnosis);

// Add community comment
router.post('/:id/comments', verifyToken, diagnosisController.addComment);

// Update diagnosis status
router.put('/:id/status', verifyToken, diagnosisController.updateStatus);

// Search by symptoms
router.get('/symptoms/search', diagnosisController.searchBySymptoms);

// Get user's diagnoses
router.get('/user/me', verifyToken, diagnosisController.getUserDiagnoses);

// Browse community diagnoses
router.get('/browse/all', diagnosisController.browseDiagnoses);

// Mark comment as helpful
router.post('/comments/:commentId/helpful', verifyToken, diagnosisController.markCommentHelpful);

export default router;
