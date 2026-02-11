import { Router } from "express";
import { getTraits, getTraitsGrouped } from "../controllers/traitController";

const router = Router();

router.get("/", getTraits);
router.get("/grouped", getTraitsGrouped);

export default router;
