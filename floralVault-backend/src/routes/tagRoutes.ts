import { Router } from "express";
import { getSuggestedTags, getTags } from "../controllers/tagController";

const router = Router();

// GET all tags
router.get("/", getTags);

// GET suggested tags
router.get("/suggest", getSuggestedTags);

export default router;
