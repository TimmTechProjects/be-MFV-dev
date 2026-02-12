"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const forumController = __importStar(require("../controllers/forumController"));
const verifyToken_1 = __importDefault(require("../middleware/verifyToken"));
const router = (0, express_1.Router)();
// Legacy endpoint - GET /api/forum/posts?limit=7
router.get("/posts", forumController.getPosts);
// Category routes
router.post("/categories", verifyToken_1.default, forumController.createCategory); // Admin only (TODO: add admin middleware)
router.get("/categories", forumController.getCategories);
// Thread routes
router.post("/threads", verifyToken_1.default, forumController.createThread);
router.get("/threads", forumController.getThreads);
router.get("/threads/:id", forumController.getThreadById);
router.put("/threads/:id", verifyToken_1.default, forumController.updateThread);
router.delete("/threads/:id", verifyToken_1.default, forumController.deleteThread);
// Thread actions
router.post("/threads/:id/pin", verifyToken_1.default, forumController.pinThread); // Admin only (TODO: add admin middleware)
router.post("/threads/:id/lock", verifyToken_1.default, forumController.lockThread); // Admin only (TODO: add admin middleware)
router.post("/threads/:id/subscribe", verifyToken_1.default, forumController.subscribeToThread);
// Reply routes
router.post("/threads/:id/replies", verifyToken_1.default, forumController.createReply);
router.put("/threads/:id/replies/:replyId", verifyToken_1.default, forumController.updateReply);
router.delete("/threads/:id/replies/:replyId", verifyToken_1.default, forumController.deleteReply);
// Search
router.get("/search", forumController.searchThreadsAndReplies);
exports.default = router;
