import express from 'express';
import { supportController } from '../controllers/supportController';
import verifyToken from '../middleware/verifyToken';

const router = express.Router();

// Support Tickets
router.post('/tickets', verifyToken, supportController.createTicket);
router.get('/tickets', verifyToken, supportController.getTickets);
router.get('/tickets/:id', verifyToken, supportController.getTicketById);
router.patch('/tickets/:id/status', verifyToken, supportController.updateTicketStatus);
router.post('/tickets/:id/messages', verifyToken, supportController.addTicketMessage);

// User Suggestions
router.post('/suggestions', verifyToken, supportController.createSuggestion);
router.get('/suggestions', verifyToken, supportController.getSuggestions);
router.post('/suggestions/:id/vote', verifyToken, supportController.voteSuggestion);
router.patch('/suggestions/:id/status', verifyToken, supportController.updateSuggestionStatus);

// Bug Reports
router.post('/bugs', verifyToken, supportController.createBugReport);
router.get('/bugs', verifyToken, supportController.getBugReports);
router.patch('/bugs/:id/status', verifyToken, supportController.updateBugReportStatus);

// Admin Stats
router.get('/admin/stats', verifyToken, supportController.getAdminStats);

export default router;
