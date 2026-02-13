"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComments = exports.deleteComment = exports.sharePost = exports.toggleSave = exports.addComment = exports.toggleLike = exports.deletePost = exports.getUserPosts = exports.updatePost = exports.getPost = exports.getPosts = exports.createPost = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const userSelect = {
    id: true,
    username: true,
    firstName: true,
    lastName: true,
    avatarUrl: true,
};
const createPost = async (req, res) => {
    const userId = req.user;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const { content, images, privacy } = req.body;
    if (!content) {
        res.status(400).json({ message: "Content is required" });
        return;
    }
    try {
        const post = await prisma.post.create({
            data: { userId, content, images: images || [], privacy: privacy || "PUBLIC" },
            include: {
                user: { select: userSelect },
                likes: true,
                comments: { include: { user: { select: userSelect } } },
            },
        });
        res.status(201).json({ success: true, data: post });
    }
    catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ message: "Failed to create post" });
    }
};
exports.createPost = createPost;
const getPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const userId = req.query.userId;
        const skip = (page - 1) * limit;
        const where = {};
        if (userId) {
            where.userId = userId;
        }
        else {
            where.privacy = "PUBLIC";
        }
        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where,
                include: {
                    user: { select: userSelect },
                    likes: true,
                    comments: {
                        where: { parentId: null },
                        include: { user: { select: userSelect } },
                        orderBy: { createdAt: "desc" },
                        take: 3,
                    },
                    _count: { select: { comments: true, likes: true } },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.post.count({ where }),
        ]);
        res.json({ success: true, data: posts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    }
    catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ message: "Failed to fetch posts" });
    }
};
exports.getPosts = getPosts;
const getPost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await prisma.post.findUnique({
            where: { id },
            include: {
                user: { select: userSelect },
                likes: true,
                comments: {
                    where: { parentId: null },
                    include: {
                        user: { select: userSelect },
                        replies: {
                            include: { user: { select: userSelect }, replies: { include: { user: { select: userSelect } } } },
                        },
                    },
                    orderBy: { createdAt: "asc" },
                },
                _count: { select: { comments: true, likes: true } },
            },
        });
        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }
        res.json({ success: true, data: post });
    }
    catch (error) {
        console.error("Error fetching post:", error);
        res.status(500).json({ message: "Failed to fetch post" });
    }
};
exports.getPost = getPost;
const updatePost = async (req, res) => {
    const userId = req.user;
    const { id } = req.params;
    const { content, privacy } = req.body;
    try {
        const post = await prisma.post.findUnique({ where: { id } });
        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }
        if (post.userId !== userId) {
            res.status(403).json({ message: "Forbidden" });
            return;
        }
        const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000);
        if (post.createdAt < fifteenMinAgo) {
            res.status(400).json({ message: "Posts can only be edited within 15 minutes" });
            return;
        }
        const updated = await prisma.post.update({
            where: { id },
            data: { ...(content !== undefined && { content }), ...(privacy !== undefined && { privacy }) },
            include: { user: { select: userSelect }, likes: true, _count: { select: { comments: true, likes: true } } },
        });
        res.json({ success: true, data: updated });
    }
    catch (error) {
        console.error("Error updating post:", error);
        res.status(500).json({ message: "Failed to update post" });
    }
};
exports.updatePost = updatePost;
const getUserPosts = async (req, res) => {
    try {
        const { username } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const where = { userId: user.id };
        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where,
                include: {
                    user: { select: userSelect },
                    likes: true,
                    comments: {
                        where: { parentId: null },
                        include: { user: { select: userSelect } },
                        orderBy: { createdAt: "desc" },
                        take: 3,
                    },
                    _count: { select: { comments: true, likes: true } },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.post.count({ where }),
        ]);
        res.json({ success: true, data: posts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    }
    catch (error) {
        console.error("Error fetching user posts:", error);
        res.status(500).json({ message: "Failed to fetch user posts" });
    }
};
exports.getUserPosts = getUserPosts;
const deletePost = async (req, res) => {
    const userId = req.user;
    const { id } = req.params;
    try {
        const post = await prisma.post.findUnique({ where: { id } });
        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }
        if (post.userId !== userId) {
            res.status(403).json({ message: "Forbidden" });
            return;
        }
        await prisma.post.delete({ where: { id } });
        res.status(204).send();
    }
    catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ message: "Failed to delete post" });
    }
};
exports.deletePost = deletePost;
const toggleLike = async (req, res) => {
    const userId = req.user;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const { id } = req.params;
    try {
        const existing = await prisma.postLike.findUnique({
            where: { postId_userId: { postId: id, userId } },
        });
        if (existing) {
            await prisma.postLike.delete({ where: { id: existing.id } });
            res.json({ success: true, liked: false });
            return;
        }
        await prisma.postLike.create({ data: { postId: id, userId } });
        const post = await prisma.post.findUnique({ where: { id } });
        if (post && post.userId !== userId) {
            await prisma.notification.create({
                data: { userId: post.userId, type: "POST_LIKE", title: "New like on your post", message: "Someone liked your post", link: `/posts/${id}` },
            });
        }
        res.json({ success: true, liked: true });
    }
    catch (error) {
        console.error("Error toggling like:", error);
        res.status(500).json({ message: "Failed to toggle like" });
    }
};
exports.toggleLike = toggleLike;
const addComment = async (req, res) => {
    const userId = req.user;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const { id } = req.params;
    const { content, parentId } = req.body;
    if (!content) {
        res.status(400).json({ message: "Content is required" });
        return;
    }
    try {
        const comment = await prisma.postComment.create({
            data: { postId: id, userId, content, parentId: parentId || null },
            include: { user: { select: userSelect } },
        });
        const post = await prisma.post.findUnique({ where: { id } });
        if (post && post.userId !== userId) {
            await prisma.notification.create({
                data: { userId: post.userId, type: "POST_COMMENT", title: "New comment on your post", message: content.substring(0, 100), link: `/posts/${id}` },
            });
        }
        res.status(201).json({ success: true, data: comment });
    }
    catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ message: "Failed to add comment" });
    }
};
exports.addComment = addComment;
const toggleSave = async (req, res) => {
    const userId = req.user;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    res.json({ success: true, saved: true });
};
exports.toggleSave = toggleSave;
const sharePost = async (req, res) => {
    const userId = req.user;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    res.json({ success: true, message: "Post shared" });
};
exports.sharePost = sharePost;
const deleteComment = async (req, res) => {
    const userId = req.user;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const { commentId } = req.params;
    try {
        const comment = await prisma.postComment.findUnique({ where: { id: commentId } });
        if (!comment) {
            res.status(404).json({ message: "Comment not found" });
            return;
        }
        if (comment.userId !== userId) {
            res.status(403).json({ message: "Forbidden" });
            return;
        }
        await prisma.postComment.delete({ where: { id: commentId } });
        res.json({ success: true, message: "Comment deleted" });
    }
    catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ message: "Failed to delete comment" });
    }
};
exports.deleteComment = deleteComment;
const getComments = async (req, res) => {
    try {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const [comments, total] = await Promise.all([
            prisma.postComment.findMany({
                where: { postId: id, parentId: null },
                include: {
                    user: { select: userSelect },
                    replies: {
                        include: { user: { select: userSelect }, replies: { include: { user: { select: userSelect } } } },
                        orderBy: { createdAt: "asc" },
                    },
                },
                orderBy: { createdAt: "asc" },
                skip,
                take: limit,
            }),
            prisma.postComment.count({ where: { postId: id, parentId: null } }),
        ]);
        res.json({ success: true, data: comments, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    }
    catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ message: "Failed to fetch comments" });
    }
};
exports.getComments = getComments;
