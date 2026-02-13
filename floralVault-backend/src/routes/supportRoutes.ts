import { Router } from "express";
import verifyToken from "../middleware/verifyToken";
import {
  submitPublicTicket,
  createTicket,
  listUserTickets,
  getTicket,
  addMessage,
  listAdminTickets,
  getAdminTicket,
  adminReplyToTicket,
  assignTicketHandler,
  updateStatus,
  updatePriority,
  adminStats,
  emailWebhook,
} from "../controllers/supportController";

const router = Router();

// Public endpoints (no auth required)
router.post("/public/tickets", (req, res, next) => { submitPublicTicket(req, res).catch(next); });

// User endpoints (auth required)
router.get("/tickets", verifyToken, (req, res, next) => { listUserTickets(req, res).catch(next); });
router.post("/tickets", verifyToken, (req, res, next) => { createTicket(req, res).catch(next); });
router.get("/tickets/:id", verifyToken, (req, res, next) => { getTicket(req, res).catch(next); });
router.post("/tickets/:id/messages", verifyToken, (req, res, next) => { addMessage(req, res).catch(next); });

// Admin endpoints (auth required)
router.get("/admin/tickets", verifyToken, (req, res, next) => { listAdminTickets(req, res).catch(next); });
router.get("/admin/tickets/:id", verifyToken, (req, res, next) => { getAdminTicket(req, res).catch(next); });
router.post("/admin/tickets/:id/reply", verifyToken, (req, res, next) => { adminReplyToTicket(req, res).catch(next); });
router.put("/admin/tickets/:id/assign", verifyToken, (req, res, next) => { assignTicketHandler(req, res).catch(next); });
router.put("/admin/tickets/:id/status", verifyToken, (req, res, next) => { updateStatus(req, res).catch(next); });
router.put("/admin/tickets/:id/priority", verifyToken, (req, res, next) => { updatePriority(req, res).catch(next); });
router.get("/admin/stats", verifyToken, (req, res, next) => { adminStats(req, res).catch(next); });

// Email webhook endpoint
router.post("/webhook/email", (req, res, next) => { emailWebhook(req, res).catch(next); });

export default router;
