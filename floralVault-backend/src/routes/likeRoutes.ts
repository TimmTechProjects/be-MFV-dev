import { Router } from "express";
import verifyToken from "../middleware/verifyToken";
import {
  toggleLike,
  getLikeStatus,
  getLikeCount,
} from "../controllers/likeController";

const router = Router();

router.post("/:plantId/toggle", verifyToken, toggleLike);
router.get("/:plantId/status", verifyToken, getLikeStatus);
router.get("/:plantId/count", getLikeCount);

export default router;
