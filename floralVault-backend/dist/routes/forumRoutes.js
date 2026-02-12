"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const forumController_1 = require("../controllers/forumController");
const router = (0, express_1.Router)();
// GET /api/forum/posts?limit=7
router.get("/posts", forumController_1.getPosts);
exports.default = router;
