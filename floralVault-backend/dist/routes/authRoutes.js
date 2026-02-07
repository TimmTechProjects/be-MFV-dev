"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
router.post("/login", authController_1.loginUser);
router.post("/register", authController_1.registerUser);
router.post("/google-login", authController_1.googleLogin);
exports.default = router;
