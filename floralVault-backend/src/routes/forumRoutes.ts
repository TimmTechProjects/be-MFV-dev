import { Router } from "express";
import * as forumController from "../controllers/forumController";
import verifyToken from "../middleware/verifyToken";

const router = Router();

// Legacy endpoint - GET /api/forum/posts?limit=7
router.get("/posts", forumController.getPosts);

// Category routes
router.post("/categories", verifyToken, forumController.createCategory); // Admin only (TODO: add admin middleware)
router.get("/categories", forumController.getCategories);

// Thread routes
router.post("/threads", verifyToken, forumController.createThread);
router.get("/threads", forumController.getThreads);
router.get("/threads/:id", forumController.getThreadById);
router.put("/threads/:id", verifyToken, forumController.updateThread);
router.delete("/threads/:id", verifyToken, forumController.deleteThread);

// Thread actions
router.post("/threads/:id/pin", verifyToken, forumController.pinThread); // Admin only (TODO: add admin middleware)
router.post("/threads/:id/lock", verifyToken, forumController.lockThread); // Admin only (TODO: add admin middleware)
router.post("/threads/:id/subscribe", verifyToken, forumController.subscribeToThread);

// Reply routes
router.post("/threads/:id/replies", verifyToken, forumController.createReply);
router.put("/threads/:id/replies/:replyId", verifyToken, forumController.updateReply);
router.delete("/threads/:id/replies/:replyId", verifyToken, forumController.deleteReply);

// Search
router.get("/search", forumController.searchThreadsAndReplies);

export default router;
