import prisma from "../prisma/client";
import slugify from "slugify";

// Types
export interface ForumPost {
  id: string;
  title: string;
  content: string;
  slug: string;
  images: string[];
  author: {
    id: string;
    username: string;
    avatarUrl: string | null;
    essence: number;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  tags: string[];
  replyCount: number;
  viewCount: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastReplyAt: Date | null;
}

export interface CreateThreadInput {
  title: string;
  content: string;
  categoryId: string;
  tags?: string[];
  images?: string[];
}

export interface CreateReplyInput {
  content: string;
  threadId: string;
  parentId?: string;
  images?: string[];
}

// Service Functions

export const createCategory = async (data: {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  order?: number;
}) => {
  const slug = data.slug || slugify(data.name, { lower: true, strict: true });
  
  return await prisma.forumCategory.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      icon: data.icon,
      order: data.order || 0,
    },
  });
};

export const getCategories = async () => {
  return await prisma.forumCategory.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: {
        select: { threads: true },
      },
    },
  });
};

export const createThread = async (authorId: string, input: CreateThreadInput) => {
  const slug = slugify(input.title, { lower: true, strict: true }) + `-${Date.now()}`;
  
  return await prisma.forumThread.create({
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

export const getThreads = async (filters?: {
  categoryId?: string;
  limit?: number;
  offset?: number;
  sortBy?: "recent" | "popular" | "replies";
}) => {
  const { categoryId, limit = 20, offset = 0, sortBy = "recent" } = filters || {};
  
  const where = categoryId ? { categoryId } : {};
  
  let orderBy: any = { createdAt: "desc" };
  if (sortBy === "popular") {
    orderBy = { viewCount: "desc" };
  } else if (sortBy === "replies") {
    orderBy = { lastReplyAt: "desc" };
  }
  
  // Always show pinned threads first
  const [pinnedThreads, regularThreads] = await Promise.all([
    prisma.forumThread.findMany({
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
    prisma.forumThread.findMany({
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

export const getThreadById = async (threadId: string) => {
  const thread = await prisma.forumThread.findUnique({
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
    await prisma.forumThread.update({
      where: { id: threadId },
      data: { viewCount: { increment: 1 } },
    });
  }
  
  return thread;
};

export const updateThread = async (
  threadId: string,
  authorId: string,
  data: { title?: string; content?: string; tags?: string[]; images?: string[] }
) => {
  // Check if user is the author
  const thread = await prisma.forumThread.findUnique({
    where: { id: threadId },
  });
  
  if (!thread || thread.authorId !== authorId) {
    throw new Error("Not authorized to update this thread");
  }
  
  if (thread.isLocked) {
    throw new Error("Thread is locked and cannot be edited");
  }
  
  return await prisma.forumThread.update({
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

export const deleteThread = async (threadId: string, userId: string) => {
  const thread = await prisma.forumThread.findUnique({
    where: { id: threadId },
  });
  
  if (!thread || thread.authorId !== userId) {
    throw new Error("Not authorized to delete this thread");
  }
  
  await prisma.forumThread.delete({
    where: { id: threadId },
  });
};

export const createReply = async (authorId: string, input: CreateReplyInput) => {
  const thread = await prisma.forumThread.findUnique({
    where: { id: input.threadId },
  });
  
  if (!thread) {
    throw new Error("Thread not found");
  }
  
  if (thread.isLocked) {
    throw new Error("Thread is locked");
  }
  
  const reply = await prisma.forumReply.create({
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
  await prisma.forumThread.update({
    where: { id: input.threadId },
    data: { lastReplyAt: new Date() },
  });
  
  return reply;
};

export const updateReply = async (
  replyId: string,
  userId: string,
  data: { content?: string; images?: string[] }
) => {
  const reply = await prisma.forumReply.findUnique({
    where: { id: replyId },
    include: { thread: true },
  });
  
  if (!reply || reply.authorId !== userId) {
    throw new Error("Not authorized to update this reply");
  }
  
  if (reply.thread.isLocked) {
    throw new Error("Thread is locked");
  }
  
  return await prisma.forumReply.update({
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

export const deleteReply = async (replyId: string, userId: string) => {
  const reply = await prisma.forumReply.findUnique({
    where: { id: replyId },
  });
  
  if (!reply || reply.authorId !== userId) {
    throw new Error("Not authorized to delete this reply");
  }
  
  await prisma.forumReply.delete({
    where: { id: replyId },
  });
};

export const pinThread = async (threadId: string) => {
  return await prisma.forumThread.update({
    where: { id: threadId },
    data: { isPinned: true },
  });
};

export const unpinThread = async (threadId: string) => {
  return await prisma.forumThread.update({
    where: { id: threadId },
    data: { isPinned: false },
  });
};

export const lockThread = async (threadId: string) => {
  return await prisma.forumThread.update({
    where: { id: threadId },
    data: { isLocked: true },
  });
};

export const unlockThread = async (threadId: string) => {
  return await prisma.forumThread.update({
    where: { id: threadId },
    data: { isLocked: false },
  });
};

export const subscribeToThread = async (threadId: string, userId: string) => {
  await prisma.forumThread.update({
    where: { id: threadId },
    data: {
      subscribers: {
        connect: { id: userId },
      },
    },
  });
};

export const unsubscribeFromThread = async (threadId: string, userId: string) => {
  await prisma.forumThread.update({
    where: { id: threadId },
    data: {
      subscribers: {
        disconnect: { id: userId },
      },
    },
  });
};

export const searchThreadsAndReplies = async (query: string, limit: number = 20) => {
  const [threads, replies] = await Promise.all([
    prisma.forumThread.findMany({
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
    prisma.forumReply.findMany({
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

// Legacy function for backward compatibility
export const getForumPosts = async (limit: number = 7): Promise<ForumPost[]> => {
  const threads = await getThreads({ limit });
  
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
