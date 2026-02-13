"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyToken_1 = __importDefault(require("../middleware/verifyToken"));
const notificationController_1 = require("../controllers/notificationController");
const router = (0, express_1.Router)();
router.get("/", verifyToken_1.default, (req, res, next) => { (0, notificationController_1.getNotifications)(req, res).catch(next); });
router.put("/read-all", verifyToken_1.default, (req, res, next) => { (0, notificationController_1.markAllAsRead)(req, res).catch(next); });
router.put("/:id/read", verifyToken_1.default, (req, res, next) => { (0, notificationController_1.markAsRead)(req, res).catch(next); });
router.delete("/:id", verifyToken_1.default, (req, res, next) => { (0, notificationController_1.deleteNotification)(req, res).catch(next); });
exports.default = router;
