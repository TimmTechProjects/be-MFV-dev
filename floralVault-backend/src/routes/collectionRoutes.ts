import { Router } from "express";
import {
  createCollection,
  getCollections,
  getCollectionsForUser,
  getCollectionWithPlants,
  addPlantToCollection,
  setCollectionThumbnail,
} from "../controllers/collectionController";
import verifyToken from "../middleware/verifyToken";

const router = Router();

router.get("/me", verifyToken, getCollectionsForUser);

router.get("/:username", getCollections);

router.post("/:username/collections", verifyToken, createCollection);

router.get("/:username/collections/:collectionSlug", getCollectionWithPlants);

router.post("/:collectionId/add-plant", verifyToken, addPlantToCollection);

router.patch("/:collectionId/set-thumbnail", verifyToken, setCollectionThumbnail);

export default router;
