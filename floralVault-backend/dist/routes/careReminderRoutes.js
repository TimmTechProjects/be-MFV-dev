"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const careReminderController_1 = require("../controllers/careReminderController");
const verifyToken_1 = __importDefault(require("../middleware/verifyToken"));
const router = (0, express_1.Router)();
router.get('/:userId', verifyToken_1.default, (req, res, next) => {
    (0, careReminderController_1.getReminders)(req, res).catch(next);
});
router.get('/:userId/due', verifyToken_1.default, (req, res, next) => {
    (0, careReminderController_1.getDueReminders)(req, res).catch(next);
});
router.post('/', verifyToken_1.default, (req, res, next) => {
    (0, careReminderController_1.createReminder)(req, res).catch(next);
});
router.put('/:id', verifyToken_1.default, (req, res, next) => {
    (0, careReminderController_1.updateReminder)(req, res).catch(next);
});
router.post('/:id/complete', verifyToken_1.default, (req, res, next) => {
    (0, careReminderController_1.completeReminder)(req, res).catch(next);
});
router.delete('/:id', verifyToken_1.default, (req, res, next) => {
    (0, careReminderController_1.deleteReminder)(req, res).catch(next);
});
exports.default = router;
