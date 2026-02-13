"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyToken_1 = __importDefault(require("../middleware/verifyToken"));
const supportController_1 = require("../controllers/supportController");
const router = (0, express_1.Router)();
// Public endpoints (no auth required)
router.post("/public/tickets", (req, res, next) => { (0, supportController_1.submitPublicTicket)(req, res).catch(next); });
// User endpoints (auth required)
router.get("/tickets", verifyToken_1.default, (req, res, next) => { (0, supportController_1.listUserTickets)(req, res).catch(next); });
router.post("/tickets", verifyToken_1.default, (req, res, next) => { (0, supportController_1.createTicket)(req, res).catch(next); });
router.get("/tickets/:id", verifyToken_1.default, (req, res, next) => { (0, supportController_1.getTicket)(req, res).catch(next); });
router.post("/tickets/:id/messages", verifyToken_1.default, (req, res, next) => { (0, supportController_1.addMessage)(req, res).catch(next); });
// Admin endpoints (auth required)
router.get("/admin/tickets", verifyToken_1.default, (req, res, next) => { (0, supportController_1.listAdminTickets)(req, res).catch(next); });
router.get("/admin/tickets/:id", verifyToken_1.default, (req, res, next) => { (0, supportController_1.getAdminTicket)(req, res).catch(next); });
router.post("/admin/tickets/:id/reply", verifyToken_1.default, (req, res, next) => { (0, supportController_1.adminReplyToTicket)(req, res).catch(next); });
router.put("/admin/tickets/:id/assign", verifyToken_1.default, (req, res, next) => { (0, supportController_1.assignTicketHandler)(req, res).catch(next); });
router.put("/admin/tickets/:id/status", verifyToken_1.default, (req, res, next) => { (0, supportController_1.updateStatus)(req, res).catch(next); });
router.put("/admin/tickets/:id/priority", verifyToken_1.default, (req, res, next) => { (0, supportController_1.updatePriority)(req, res).catch(next); });
router.get("/admin/stats", verifyToken_1.default, (req, res, next) => { (0, supportController_1.adminStats)(req, res).catch(next); });
// Email webhook endpoint
router.post("/webhook/email", (req, res, next) => { (0, supportController_1.emailWebhook)(req, res).catch(next); });
exports.default = router;
