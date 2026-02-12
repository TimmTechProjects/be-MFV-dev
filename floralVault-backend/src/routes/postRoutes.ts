import { Router } from "express";
import verifyToken from "../middleware/verifyToken";
import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  getComments,
} from "../controllers/postController";

const router = Router();

router.get("/", (req, res, next) => { getPosts(req, res).catch(next); });
router.get("/:id", (req, res, next) => { getPost(req, res).catch(next); });
router.get("/:id/comments", (req, res, next) => { getComments(req, res).catch(next); });

router.post("/", verifyToken, (req, res, next) => { createPost(req, res).catch(next); });
router.put("/:id", verifyToken, (req, res, next) => { updatePost(req, res).catch(next); });
router.delete("/:id", verifyToken, (req, res, next) => { deletePost(req, res).catch(next); });
router.post("/:id/like", verifyToken, (req, res, next) => { toggleLike(req, res).catch(next); });
router.post("/:id/comments", verifyToken, (req, res, next) => { addComment(req, res).catch(next); });

export default router;
