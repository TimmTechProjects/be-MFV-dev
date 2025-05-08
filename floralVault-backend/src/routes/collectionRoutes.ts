import { Router } from "express";
import { getCollections } from "../controllers/collectionController";

const router = Router();

router.get("/:username", getCollections);

export default router;
