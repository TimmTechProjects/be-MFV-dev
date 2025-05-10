import { Router } from "express";
import { searchDB } from "../controllers/searchController";

const router = Router();

router.get("/", searchDB);

export default router;
