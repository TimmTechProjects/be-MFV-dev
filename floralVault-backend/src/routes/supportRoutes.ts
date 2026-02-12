import { Router } from "express";
import verifyToken from "../middleware/verifyToken";
import {
  createTicket,
  getUserTickets,
  getTicket,
  addMessage,
  updateTicketStatus,
  getAdminTickets,
  getAdminStats,
  adminReply,
} from "../controllers/supportController";

const router = Router();

router.get("/tickets", verifyToken, (req, res, next) => { getUserTickets(req, res).catch(next); });
router.post("/tickets", verifyToken, (req, res, next) => { createTicket(req, res).catch(next); });
router.get("/tickets/:id", verifyToken, (req, res, next) => { getTicket(req, res).catch(next); });
router.post("/tickets/:id/messages", verifyToken, (req, res, next) => { addMessage(req, res).catch(next); });
router.put("/tickets/:id/status", verifyToken, (req, res, next) => { updateTicketStatus(req, res).catch(next); });

router.get("/admin/tickets", verifyToken, (req, res, next) => { getAdminTickets(req, res).catch(next); });
router.get("/admin/stats", verifyToken, (req, res, next) => { getAdminStats(req, res).catch(next); });
router.post("/admin/tickets/:id/reply", verifyToken, (req, res, next) => { adminReply(req, res).catch(next); });

export default router;
