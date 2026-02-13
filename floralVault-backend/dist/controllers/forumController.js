"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = getCategories;
exports.createCategory = createCategory;
exports.getThreads = getThreads;
exports.createThread = createThread;
exports.getThread = getThread;
exports.updateThread = updateThread;
exports.deleteThread = deleteThread;
exports.addReply = addReply;
exports.voteThread = voteThread;
exports.voteReply = voteReply;
exports.getReplies = getReplies;
exports.searchThreads = searchThreads;
exports.reportContent = reportContent;
exports.pinThread = pinThread;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const userSelect = {
    id: true,
    username: true,
    firstName: true,
    lastName: true,
    avatarUrl: true,
};
async function getCategories(_req, res) {
    try {
        const categories = await prisma.forumCategory.findMany({
            include: {
                _count: { select: { threads: true } },
            },
            orderBy: { name: "asc" },
        });
        return res.json({ success: true, data: categories });
    }
    catch (error) {
        console.error("Error fetching categories:", error);
        return res.status(500).json({ message: "Failed to fetch categories" });
    }
}
async function createCategory(req, res) {
    try {
        const { name, description, icon } = req.body;
        if (!name)
            return res.status(400).json({ message: "Name is required" });
        const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        const category = await prisma.forumCategory.create({
            data: { name, slug, description, icon },
        });
        return res.status(201).json({ success: true, data: category });
    }
    catch (error) {
        console.error("Error creating category:", error);
        return res.status(500).json({ message: "Failed to create category" });
    }
}
async function getThreads(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const categoryId = req.query.categoryId;
        const sort = req.query.sort || "new";
        const skip = (page - 1) * limit;
        const where = {};
        if (categoryId)
            where.categoryId = categoryId;
        let orderBy;
        switch (sort) {
            case "hot":
                orderBy = [{ views: "desc" }, { createdAt: "desc" }];
                break;
            case "top":
                orderBy = [{ createdAt: "desc" }];
                break;
            default:
                orderBy = [{ isPinned: "desc" }, { createdAt: "desc" }];
        }
        const [threads, total] = await Promise.all([
            prisma.forumThread.findMany({
                where,
                include: {
                    user: { select: userSelect },
                    category: true,
                    votes: true,
                    _count: { select: { replies: true, votes: true } },
                },
                orderBy,
                skip,
                take: limit,
            }),
            prisma.forumThread.count({ where }),
        ]);
        return res.json({
            success: true,
            data: threads,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    }
    catch (error) {
        console.error("Error fetching threads:", error);
        return res.status(500).json({ message: "Failed to fetch threads" });
    }
}
async function createThread(req, res) {
    try {
        const userId = req.user;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const { categoryId, title, content } = req.body;
        if (!categoryId || !title || !content) {
            return res.status(400).json({ message: "categoryId, title, and content are required" });
        }
        const thread = await prisma.forumThread.create({
            data: { categoryId, userId, title, content },
            include: {
                user: { select: userSelect },
                category: true,
                _count: { select: { replies: true, votes: true } },
            },
        });
        return res.status(201).json({ success: true, data: thread });
    }
    catch (error) {
        console.error("Error creating thread:", error);
        return res.status(500).json({ message: "Failed to create thread" });
    }
}
async function getThread(req, res) {
    try {
        const { id } = req.params;
        const thread = await prisma.forumThread.update({
            where: { id },
            data: { views: { increment: 1 } },
            include: {
                user: { select: userSelect },
                category: true,
                votes: true,
                replies: {
                    where: { parentId: null },
                    include: {
                        user: { select: userSelect },
                        votes: true,
                        replies: {
                            include: {
                                user: { select: userSelect },
                                votes: true,
                                replies: { include: { user: { select: userSelect }, votes: true } },
                            },
                            orderBy: { createdAt: "asc" },
                        },
                    },
                    orderBy: { createdAt: "asc" },
                },
                _count: { select: { replies: true, votes: true } },
            },
        });
        return res.json({ success: true, data: thread });
    }
    catch (error) {
        console.error("Error fetching thread:", error);
        return res.status(500).json({ message: "Failed to fetch thread" });
    }
}
async function updateThread(req, res) {
    try {
        const userId = req.user;
        const { id } = req.params;
        const { title, content } = req.body;
        const thread = await prisma.forumThread.findUnique({ where: { id } });
        if (!thread)
            return res.status(404).json({ message: "Thread not found" });
        if (thread.userId !== userId)
            return res.status(403).json({ message: "Forbidden" });
        const updated = await prisma.forumThread.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(content !== undefined && { content }),
            },
            include: { user: { select: userSelect }, category: true },
        });
        return res.json({ success: true, data: updated });
    }
    catch (error) {
        console.error("Error updating thread:", error);
        return res.status(500).json({ message: "Failed to update thread" });
    }
}
async function deleteThread(req, res) {
    try {
        const userId = req.user;
        const { id } = req.params;
        const thread = await prisma.forumThread.findUnique({ where: { id } });
        if (!thread)
            return res.status(404).json({ message: "Thread not found" });
        if (thread.userId !== userId)
            return res.status(403).json({ message: "Forbidden" });
        await prisma.forumThread.delete({ where: { id } });
        return res.status(204).send();
    }
    catch (error) {
        console.error("Error deleting thread:", error);
        return res.status(500).json({ message: "Failed to delete thread" });
    }
}
async function addReply(req, res) {
    try {
        const userId = req.user;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const { id } = req.params;
        const { content, parentId } = req.body;
        if (!content)
            return res.status(400).json({ message: "Content is required" });
        const thread = await prisma.forumThread.findUnique({ where: { id } });
        if (!thread)
            return res.status(404).json({ message: "Thread not found" });
        if (thread.isLocked)
            return res.status(403).json({ message: "Thread is locked" });
        const reply = await prisma.forumReply.create({
            data: { threadId: id, userId, content, parentId: parentId || null },
            include: { user: { select: userSelect }, votes: true },
        });
        if (thread.userId !== userId) {
            await prisma.notification.create({
                data: {
                    userId: thread.userId,
                    type: "FORUM_REPLY",
                    title: "New reply to your thread",
                    message: content.substring(0, 100),
                    link: `/forum/thread/${id}`,
                },
            });
        }
        return res.status(201).json({ success: true, data: reply });
    }
    catch (error) {
        console.error("Error adding reply:", error);
        return res.status(500).json({ message: "Failed to add reply" });
    }
}
async function voteThread(req, res) {
    try {
        const userId = req.user;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const { id } = req.params;
        const { value } = req.body;
        if (value !== 1 && value !== -1) {
            return res.status(400).json({ message: "Value must be 1 or -1" });
        }
        const existing = await prisma.forumThreadVote.findUnique({
            where: { threadId_userId: { threadId: id, userId } },
        });
        if (existing) {
            if (existing.value === value) {
                await prisma.forumThreadVote.delete({ where: { id: existing.id } });
                return res.json({ success: true, vote: null });
            }
            const updated = await prisma.forumThreadVote.update({
                where: { id: existing.id },
                data: { value },
            });
            return res.json({ success: true, vote: updated });
        }
        const vote = await prisma.forumThreadVote.create({
            data: { threadId: id, userId, value },
        });
        return res.json({ success: true, vote });
    }
    catch (error) {
        console.error("Error voting on thread:", error);
        return res.status(500).json({ message: "Failed to vote" });
    }
}
async function voteReply(req, res) {
    try {
        const userId = req.user;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const { id } = req.params;
        const { value } = req.body;
        if (value !== 1 && value !== -1) {
            return res.status(400).json({ message: "Value must be 1 or -1" });
        }
        const existing = await prisma.forumReplyVote.findUnique({
            where: { replyId_userId: { replyId: id, userId } },
        });
        if (existing) {
            if (existing.value === value) {
                await prisma.forumReplyVote.delete({ where: { id: existing.id } });
                return res.json({ success: true, vote: null });
            }
            const updated = await prisma.forumReplyVote.update({
                where: { id: existing.id },
                data: { value },
            });
            return res.json({ success: true, vote: updated });
        }
        const vote = await prisma.forumReplyVote.create({
            data: { replyId: id, userId, value },
        });
        return res.json({ success: true, vote });
    }
    catch (error) {
        console.error("Error voting on reply:", error);
        return res.status(500).json({ message: "Failed to vote" });
    }
}
async function getReplies(req, res) {
    try {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const [replies, total] = await Promise.all([
            prisma.forumReply.findMany({
                where: { threadId: id, parentId: null },
                include: {
                    user: { select: userSelect },
                    votes: true,
                    replies: {
                        include: {
                            user: { select: userSelect },
                            votes: true,
                            replies: { include: { user: { select: userSelect }, votes: true } },
                        },
                        orderBy: { createdAt: "asc" },
                    },
                },
                orderBy: { createdAt: "asc" },
                skip,
                take: limit,
            }),
            prisma.forumReply.count({ where: { threadId: id, parentId: null } }),
        ]);
        return res.json({
            success: true,
            data: replies,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    }
    catch (error) {
        console.error("Error fetching replies:", error);
        return res.status(500).json({ message: "Failed to fetch replies" });
    }
}
async function searchThreads(req, res) {
    try {
        const q = req.query.q || "";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const where = q
            ? {
                OR: [
                    { title: { contains: q, mode: "insensitive" } },
                    { content: { contains: q, mode: "insensitive" } },
                ],
            }
            : {};
        const [threads, total] = await Promise.all([
            prisma.forumThread.findMany({
                where,
                include: {
                    user: { select: userSelect },
                    category: true,
                    _count: { select: { replies: true, votes: true } },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.forumThread.count({ where }),
        ]);
        return res.json({
            success: true,
            data: threads,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    }
    catch (error) {
        console.error("Error searching threads:", error);
        return res.status(500).json({ message: "Failed to search threads" });
    }
}
async function reportContent(req, res) {
    try {
        const userId = req.user;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        return res.json({ success: true, message: "Report submitted" });
    }
    catch (error) {
        console.error("Error reporting content:", error);
        return res.status(500).json({ message: "Failed to submit report" });
    }
}
async function pinThread(req, res) {
    try {
        const { id } = req.params;
        const { isPinned } = req.body;
        const thread = await prisma.forumThread.update({
            where: { id },
            data: { isPinned: isPinned !== undefined ? isPinned : true },
            include: { user: { select: userSelect }, category: true },
        });
        return res.json({ success: true, data: thread });
    }
    catch (error) {
        console.error("Error pinning thread:", error);
        return res.status(500).json({ message: "Failed to pin thread" });
    }
}
