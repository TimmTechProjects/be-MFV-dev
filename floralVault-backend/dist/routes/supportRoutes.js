"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supportController_1 = require("../controllers/supportController");
const verifyToken_1 = __importDefault(require("../middleware/verifyToken"));
const router = express_1.default.Router();
// Support Tickets
router.post('/tickets', verifyToken_1.default, supportController_1.supportController.createTicket);
router.get('/tickets', verifyToken_1.default, supportController_1.supportController.getTickets);
router.get('/tickets/:id', verifyToken_1.default, supportController_1.supportController.getTicketById);
router.patch('/tickets/:id/status', verifyToken_1.default, supportController_1.supportController.updateTicketStatus);
router.post('/tickets/:id/messages', verifyToken_1.default, supportController_1.supportController.addTicketMessage);
// User Suggestions
router.post('/suggestions', verifyToken_1.default, supportController_1.supportController.createSuggestion);
router.get('/suggestions', verifyToken_1.default, supportController_1.supportController.getSuggestions);
router.post('/suggestions/:id/vote', verifyToken_1.default, supportController_1.supportController.voteSuggestion);
router.patch('/suggestions/:id/status', verifyToken_1.default, supportController_1.supportController.updateSuggestionStatus);
// Bug Reports
router.post('/bugs', verifyToken_1.default, supportController_1.supportController.createBugReport);
router.get('/bugs', verifyToken_1.default, supportController_1.supportController.getBugReports);
router.patch('/bugs/:id/status', verifyToken_1.default, supportController_1.supportController.updateBugReportStatus);
// Admin Stats
router.get('/admin/stats', verifyToken_1.default, supportController_1.supportController.getAdminStats);
exports.default = router;
