"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificationController_1 = require("../controllers/notificationController");
const verifyToken_1 = __importDefault(require("../middleware/verifyToken"));
const router = (0, express_1.Router)();
// Push subscription routes
router.post('/push/subscribe', verifyToken_1.default, (req, res, next) => {
    (0, notificationController_1.subscribeToPush)(req, res).catch(next);
});
router.post('/push/unsubscribe', verifyToken_1.default, (req, res, next) => {
    (0, notificationController_1.unsubscribeFromPush)(req, res).catch(next);
});
router.get('/push/subscriptions/:userId', verifyToken_1.default, (req, res, next) => {
    (0, notificationController_1.getPushSubscriptions)(req, res).catch(next);
});
// Notification preferences routes
router.get('/preferences/:userId', verifyToken_1.default, (req, res, next) => {
    (0, notificationController_1.getNotificationPreferences)(req, res).catch(next);
});
router.put('/preferences/:userId', verifyToken_1.default, (req, res, next) => {
    (0, notificationController_1.updateNotificationPreferences)(req, res).catch(next);
});
exports.default = router;
