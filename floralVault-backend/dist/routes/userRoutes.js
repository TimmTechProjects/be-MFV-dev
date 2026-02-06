"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyToken_1 = __importDefault(require("../middleware/verifyToken"));
const userController_1 = require("../controllers/userController");
const router = express_1.default.Router();
// GET /api/users
router.get("/", userController_1.getAllUsers);
// GET /api/users/:username
router.get("/:username", userController_1.getUserByUsername);
// GET /api/users/me
router.get("/me", verifyToken_1.default, userController_1.getCurrentUser);
// PUT /api/users/me
router.put("/me", verifyToken_1.default, userController_1.updateUser);
// DELETE /api/users/me
router.delete("/me", verifyToken_1.default, userController_1.deleteUser);
exports.default = router;
