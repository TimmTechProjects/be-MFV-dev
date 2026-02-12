"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getForumPosts = exports.searchThreadsAndReplies = exports.unsubscribeFromThread = exports.subscribeToThread = exports.unlockThread = exports.lockThread = exports.unpinThread = exports.pinThread = exports.deleteReply = exports.updateReply = exports.createReply = exports.deleteThread = exports.updateThread = exports.getThreadById = exports.getThreads = exports.createThread = exports.getCategories = exports.createCategory = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const slugify_1 = __importDefault(require("slugify"));
// Service Functions
const createCategory = async (data) => {
    const slug = data.slug || (0, slugify_1.default)(data.name, { lower: true, strict: true });
    return await client_1.default.forumCategory.create({
        data: {
            name: data.name,
            slug,
            description: data.description,
            icon: data.icon,
            order: data.order || 0,
        },
    });
};
exports.createCategory = createCategory;
const getCategories = async () => {
    return await client_1.default.forumCategory.findMany({
        orderBy: { order: "asc" },
        include: {
            _count: {
                select: { threads: true },
            },
        },
    });
};
exports.getCategories = getCategories;
const createThread = async (authorId, input) => {
    const slug = (0, slugify_1.default)(input.title, { lower: true, strict: true }) + `-${Date.now()}`;
    return await client_1.default.forumThread.create({
        data: {
            title: input.title,
            content: input.content,
            slug,
            categoryId: input.categoryId,
            authorId,
            tags: input.tags || [],
            images: input.images || [],
        },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    avatarUrl: true,
                    essence: true,
                },
            },
            category: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
            _count: {
                select: { replies: true },
            },
        },
    });
};
exports.createThread = createThread;
const getThreads = async (filters) => {
    const { categoryId, limit = 20, offset = 0, sortBy = "recent" } = filters || {};
    const where = categoryId ? { categoryId } : {};
    let orderBy = { createdAt: "desc" };
    if (sortBy === "popular") {
        orderBy = { viewCount: "desc" };
    }
    else if (sortBy === "replies") {
        orderBy = { lastReplyAt: "desc" };
    }
    // Always show pinned threads first
    const [pinnedThreads, regularThreads] = await Promise.all([
        client_1.default.forumThread.findMany({
            where: { ...where, isPinned: true },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true,
                        essence: true,
                    },
                },
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                _count: {
                    select: { replies: true },
                },
            },
            orderBy: { createdAt: "desc" },
        }),
        client_1.default.forumThread.findMany({
            where: { ...where, isPinned: false },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true,
                        essence: true,
                    },
                },
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                _count: {
                    select: { replies: true },
                },
            },
            orderBy,
            take: limit,
            skip: offset,
        }),
    ]);
    return [...pinnedThreads, ...regularThreads];
};
exports.getThreads = getThreads;
const getThreadById = async (threadId) => {
    const thread = await client_1.default.forumThread.findUnique({
        where: { id: threadId },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    avatarUrl: true,
                    essence: true,
                },
            },
            category: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
            replies: {
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            avatarUrl: true,
                            essence: true,
                        },
                    },
                    _count: {
                        select: {
                            likes: true,
                            replies: true,
                        },
                    },
                },
                orderBy: { createdAt: "asc" },
            },
            _count: {
                select: { replies: true },
            },
        },
    });
    // Increment view count
    if (thread) {
        await client_1.default.forumThread.update({
            where: { id: threadId },
            data: { viewCount: { increment: 1 } },
        });
    }
    return thread;
};
exports.getThreadById = getThreadById;
const updateThread = async (threadId, authorId, data) => {
    // Check if user is the author
    const thread = await client_1.default.forumThread.findUnique({
        where: { id: threadId },
    });
    if (!thread || thread.authorId !== authorId) {
        throw new Error("Not authorized to update this thread");
    }
    if (thread.isLocked) {
        throw new Error("Thread is locked and cannot be edited");
    }
    return await client_1.default.forumThread.update({
        where: { id: threadId },
        data: {
            ...(data.title && { title: data.title }),
            ...(data.content && { content: data.content }),
            ...(data.tags && { tags: data.tags }),
            ...(data.images && { images: data.images }),
        },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    avatarUrl: true,
                    essence: true,
                },
            },
            category: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
        },
    });
};
exports.updateThread = updateThread;
const deleteThread = async (threadId, userId) => {
    const thread = await client_1.default.forumThread.findUnique({
        where: { id: threadId },
    });
    if (!thread || thread.authorId !== userId) {
        throw new Error("Not authorized to delete this thread");
    }
    await client_1.default.forumThread.delete({
        where: { id: threadId },
    });
};
exports.deleteThread = deleteThread;
const createReply = async (authorId, input) => {
    const thread = await client_1.default.forumThread.findUnique({
        where: { id: input.threadId },
    });
    if (!thread) {
        throw new Error("Thread not found");
    }
    if (thread.isLocked) {
        throw new Error("Thread is locked");
    }
    const reply = await client_1.default.forumReply.create({
        data: {
            content: input.content,
            threadId: input.threadId,
            authorId,
            parentId: input.parentId,
            images: input.images || [],
        },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    avatarUrl: true,
                    essence: true,
                },
            },
            _count: {
                select: {
                    likes: true,
                    replies: true,
                },
            },
        },
    });
    // Update thread's lastReplyAt
    await client_1.default.forumThread.update({
        where: { id: input.threadId },
        data: { lastReplyAt: new Date() },
    });
    return reply;
};
exports.createReply = createReply;
const updateReply = async (replyId, userId, data) => {
    const reply = await client_1.default.forumReply.findUnique({
        where: { id: replyId },
        include: { thread: true },
    });
    if (!reply || reply.authorId !== userId) {
        throw new Error("Not authorized to update this reply");
    }
    if (reply.thread.isLocked) {
        throw new Error("Thread is locked");
    }
    return await client_1.default.forumReply.update({
        where: { id: replyId },
        data: {
            ...(data.content && { content: data.content }),
            ...(data.images && { images: data.images }),
        },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    avatarUrl: true,
                    essence: true,
                },
            },
        },
    });
};
exports.updateReply = updateReply;
const deleteReply = async (replyId, userId) => {
    const reply = await client_1.default.forumReply.findUnique({
        where: { id: replyId },
    });
    if (!reply || reply.authorId !== userId) {
        throw new Error("Not authorized to delete this reply");
    }
    await client_1.default.forumReply.delete({
        where: { id: replyId },
    });
};
exports.deleteReply = deleteReply;
const pinThread = async (threadId) => {
    return await client_1.default.forumThread.update({
        where: { id: threadId },
        data: { isPinned: true },
    });
};
exports.pinThread = pinThread;
const unpinThread = async (threadId) => {
    return await client_1.default.forumThread.update({
        where: { id: threadId },
        data: { isPinned: false },
    });
};
exports.unpinThread = unpinThread;
const lockThread = async (threadId) => {
    return await client_1.default.forumThread.update({
        where: { id: threadId },
        data: { isLocked: true },
    });
};
exports.lockThread = lockThread;
const unlockThread = async (threadId) => {
    return await client_1.default.forumThread.update({
        where: { id: threadId },
        data: { isLocked: false },
    });
};
exports.unlockThread = unlockThread;
const subscribeToThread = async (threadId, userId) => {
    await client_1.default.forumThread.update({
        where: { id: threadId },
        data: {
            subscribers: {
                connect: { id: userId },
            },
        },
    });
};
exports.subscribeToThread = subscribeToThread;
const unsubscribeFromThread = async (threadId, userId) => {
    await client_1.default.forumThread.update({
        where: { id: threadId },
        data: {
            subscribers: {
                disconnect: { id: userId },
            },
        },
    });
};
exports.unsubscribeFromThread = unsubscribeFromThread;
const searchThreadsAndReplies = async (query, limit = 20) => {
    const [threads, replies] = await Promise.all([
        client_1.default.forumThread.findMany({
            where: {
                OR: [
                    { title: { contains: query, mode: "insensitive" } },
                    { content: { contains: query, mode: "insensitive" } },
                    { tags: { has: query } },
                ],
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true,
                        essence: true,
                    },
                },
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                _count: {
                    select: { replies: true },
                },
            },
            take: limit,
            orderBy: { viewCount: "desc" },
        }),
        client_1.default.forumReply.findMany({
            where: {
                content: { contains: query, mode: "insensitive" },
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true,
                        essence: true,
                    },
                },
                thread: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                    },
                },
            },
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
    ]);
    return { threads, replies };
};
exports.searchThreadsAndReplies = searchThreadsAndReplies;
// Legacy function for backward compatibility
const getForumPosts = async (limit = 7) => {
    const threads = await (0, exports.getThreads)({ limit });
    return threads.map((thread) => ({
        id: thread.id,
        title: thread.title,
        content: thread.content,
        slug: thread.slug,
        images: thread.images,
        author: thread.author,
        category: thread.category,
        tags: thread.tags,
        replyCount: thread._count.replies,
        viewCount: thread.viewCount,
        isPinned: thread.isPinned,
        isLocked: thread.isLocked,
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt,
        lastReplyAt: thread.lastReplyAt,
    }));
};
exports.getForumPosts = getForumPosts;
