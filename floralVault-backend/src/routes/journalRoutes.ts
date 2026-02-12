import express from 'express';
import journalController from '../controllers/journalController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication except GET endpoints (which support public access)
router.post('/entries', authenticate, journalController.createEntry);
router.get('/entries/:plantId', journalController.getEntriesByPlant);
router.get('/entry/:id', journalController.getEntryById);
router.put('/entries/:id', authenticate, journalController.updateEntry);
router.delete('/entries/:id', authenticate, journalController.deleteEntry);
router.get('/diary/:plantId', authenticate, journalController.getDiary);
router.get('/timeline/:plantId', journalController.getTimeline);
router.get('/stats/:plantId', journalController.getStats);

export default router;
