import { Router } from "express";
import verifyToken from "../middleware/verifyToken";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notificationController";

const router = Router();

router.get("/", verifyToken, (req, res, next) => { getNotifications(req, res).catch(next); });
router.put("/read-all", verifyToken, (req, res, next) => { markAllAsRead(req, res).catch(next); });
router.put("/:id/read", verifyToken, (req, res, next) => { markAsRead(req, res).catch(next); });
router.delete("/:id", verifyToken, (req, res, next) => { deleteNotification(req, res).catch(next); });

export default router;
