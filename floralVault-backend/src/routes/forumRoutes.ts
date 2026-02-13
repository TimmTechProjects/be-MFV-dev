import { Router } from "express";
import verifyToken from "../middleware/verifyToken";
import { publicApiLimiter, searchLimiter } from "../middleware/rateLimiter";
import {
  getCategories,
  createCategory,
  getThreads,
  createThread,
  getThread,
  updateThread,
  deleteThread,
  addReply,
  getReplies,
  voteThread,
  voteReply,
  pinThread,
  searchThreads,
  reportContent,
} from "../controllers/forumController";

const router = Router();

router.get("/categories", publicApiLimiter, (req, res, next) => { getCategories(req, res).catch(next); });
router.post("/categories", verifyToken, (req, res, next) => { createCategory(req, res).catch(next); });

router.get("/search", searchLimiter, (req, res, next) => { searchThreads(req, res).catch(next); });
router.post("/report", verifyToken, (req, res, next) => { reportContent(req, res).catch(next); });

router.get("/threads", publicApiLimiter, (req, res, next) => { getThreads(req, res).catch(next); });
router.post("/threads", verifyToken, (req, res, next) => { createThread(req, res).catch(next); });
router.get("/threads/:id", publicApiLimiter, (req, res, next) => { getThread(req, res).catch(next); });
router.put("/threads/:id", verifyToken, (req, res, next) => { updateThread(req, res).catch(next); });
router.delete("/threads/:id", verifyToken, (req, res, next) => { deleteThread(req, res).catch(next); });
router.get("/threads/:id/replies", publicApiLimiter, (req, res, next) => { getReplies(req, res).catch(next); });
router.post("/threads/:id/replies", verifyToken, (req, res, next) => { addReply(req, res).catch(next); });
router.post("/threads/:id/vote", verifyToken, (req, res, next) => { voteThread(req, res).catch(next); });
router.put("/threads/:id/pin", verifyToken, (req, res, next) => { pinThread(req, res).catch(next); });

router.post("/replies/:id/vote", verifyToken, (req, res, next) => { voteReply(req, res).catch(next); });

export default router;
