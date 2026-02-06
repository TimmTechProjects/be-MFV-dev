"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tagController_1 = require("../controllers/tagController");
const router = (0, express_1.Router)();
// GET all tags
router.get("/", tagController_1.getTags);
// GET suggested tags
router.get("/suggest", tagController_1.getSuggestedTags);
exports.default = router;
