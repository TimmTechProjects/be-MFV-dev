"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const journalController_1 = __importDefault(require("../controllers/journalController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// All routes require authentication except GET endpoints (which support public access)
router.post('/entries', authMiddleware_1.authenticate, journalController_1.default.createEntry);
router.get('/entries/:plantId', journalController_1.default.getEntriesByPlant);
router.get('/entry/:id', journalController_1.default.getEntryById);
router.put('/entries/:id', authMiddleware_1.authenticate, journalController_1.default.updateEntry);
router.delete('/entries/:id', authMiddleware_1.authenticate, journalController_1.default.deleteEntry);
router.get('/diary/:plantId', authMiddleware_1.authenticate, journalController_1.default.getDiary);
router.get('/timeline/:plantId', journalController_1.default.getTimeline);
router.get('/stats/:plantId', journalController_1.default.getStats);
exports.default = router;
