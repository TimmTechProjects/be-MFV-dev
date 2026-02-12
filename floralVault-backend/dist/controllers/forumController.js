"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPosts = void 0;
const forumService_1 = require("../services/forumService");
const getPosts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 7;
        // Validate limit
        if (limit < 1 || limit > 50) {
            res.status(400).json({
                error: "Invalid limit parameter. Must be between 1 and 50."
            });
            return;
        }
        const posts = await (0, forumService_1.getForumPosts)(limit);
        res.status(200).json({
            success: true,
            count: posts.length,
            data: posts
        });
    }
    catch (error) {
        console.error("Error fetching forum posts:", error);
        res.status(500).json({
            error: "Failed to fetch forum posts",
            message: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
exports.getPosts = getPosts;
