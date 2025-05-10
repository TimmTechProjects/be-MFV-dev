import { Router } from "express";
import {
  createCollection,
  getCollections,
  getCollectionWithPlants,
} from "../controllers/collectionController";

const router = Router();

router.get("/:username", getCollections);

router.post("/:username/collections", createCollection);

router.get("/:username/collections/:collectionSlug", getCollectionWithPlants);

export default router;
