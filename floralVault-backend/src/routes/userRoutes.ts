import express from "express";
import verifyToken from "../middleware/verifyToken";
import {
  deleteUser,
  getAllUsers,
  getUserByUsername,
  getCurrentUser,
  updateUser,
  checkUsername,
} from "../controllers/userController";

const router = express.Router();

// GET /api/users
router.get("/", getAllUsers);

// GET /api/users/check-username/:username
router.get("/check-username/:username", checkUsername);

// GET /api/users/:username
router.get("/:username", getUserByUsername);

// GET /api/users/me
router.get("/me", verifyToken, getCurrentUser);

// PUT /api/users/me
router.put("/me", verifyToken, updateUser);

// DELETE /api/users/me
router.delete("/me", verifyToken, deleteUser);

export default router;
