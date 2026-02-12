"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const userController_1 = require("../controllers/userController");
const verifyToken_1 = __importDefault(require("../middleware/verifyToken"));
const router = (0, express_1.Router)();
router.post("/login", authController_1.loginUser);
router.post("/register", authController_1.registerUser);
router.post("/google-login", authController_1.googleLogin);
router.put("/change-username", verifyToken_1.default, userController_1.changeUsernameHandler);
router.put("/update-profile", verifyToken_1.default, userController_1.updateUser);
router.get("/get-profile", userController_1.getProfileByUsername);
exports.default = router;
