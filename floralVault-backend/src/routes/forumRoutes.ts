import { Router } from "express";
import { getPosts } from "../controllers/forumController";

const router = Router();

// GET /api/forum/posts?limit=7
router.get("/posts", getPosts);

export default router;
