"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const statsController_1 = require("../controllers/statsController");
const router = (0, express_1.Router)();
// GET /api/stats/homepage
router.get("/homepage", statsController_1.getHomepage);
exports.default = router;
