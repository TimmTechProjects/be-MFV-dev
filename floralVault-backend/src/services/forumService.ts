import prisma from "../prisma/client";

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: {
    username: string;
    avatarUrl: string | null;
    essence: number;
  };
  category: string;
  tags: string[];
  replies: number;
  views: number;
  likes: number;
  createdAt: Date;
  lastActivity: Date;
  isPinned: boolean;
  isAnswered: boolean;
}

export const getForumPosts = async (limit: number = 7): Promise<ForumPost[]> => {
  // TODO: Replace with actual database query when forum tables are created
  // For now, returning mock data to unblock frontend development
  
  const mockPosts: ForumPost[] = [
    {
      id: "1",
      title: "Best fertilizer for Monstera deliciosa?",
      content: "I've been growing Monsteras for a year now and looking to optimize my fertilizing routine. What do you all recommend?",
      author: {
        username: "tropicalplants",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=tropicalplants",
        essence: 1250
      },
      category: "Care Tips",
      tags: ["monstera", "fertilizer", "indoor-plants"],
      replies: 23,
      views: 456,
      likes: 12,
      createdAt: new Date("2026-02-11T10:30:00"),
      lastActivity: new Date("2026-02-11T15:45:00"),
      isPinned: false,
      isAnswered: true
    },
    {
      id: "2",
      title: "📌 Welcome to the Floral Vault Community!",
      content: "New here? Start by introducing yourself and your favorite plants! This community is all about sharing knowledge and growing together.",
      author: {
        username: "admin",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
        essence: 9999
      },
      category: "Announcements",
      tags: ["welcome", "introduction", "community"],
      replies: 148,
      views: 2341,
      likes: 89,
      createdAt: new Date("2026-01-15T09:00:00"),
      lastActivity: new Date("2026-02-11T14:20:00"),
      isPinned: true,
      isAnswered: false
    },
    {
      id: "3",
      title: "Help! My snake plant is turning yellow",
      content: "I've had this snake plant for 3 months. Recently noticed yellowing leaves. I water once every 2 weeks. Photos attached.",
      author: {
        username: "newbieplanter",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=newbieplanter",
        essence: 85
      },
      category: "Plant Problems",
      tags: ["snake-plant", "yellowing", "help"],
      replies: 15,
      views: 234,
      likes: 8,
      createdAt: new Date("2026-02-10T16:20:00"),
      lastActivity: new Date("2026-02-11T12:10:00"),
      isPinned: false,
      isAnswered: true
    },
    {
      id: "4",
      title: "Show off your rare plants! 🌿✨",
      content: "Let's see those rare beauties in your collection. I'll start with my variegated Monstera adansonii!",
      author: {
        username: "rarecollector",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=rarecollector",
        essence: 2340
      },
      category: "Show & Tell",
      tags: ["rare-plants", "collection", "variegated"],
      replies: 67,
      views: 1523,
      likes: 94,
      createdAt: new Date("2026-02-09T11:15:00"),
      lastActivity: new Date("2026-02-11T11:30:00"),
      isPinned: false,
      isAnswered: false
    },
    {
      id: "5",
      title: "DIY self-watering planter tutorial",
      content: "Just finished making self-watering planters from recycled materials. Here's a step-by-step guide...",
      author: {
        username: "diygardener",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=diygardener",
        essence: 1876
      },
      category: "DIY Projects",
      tags: ["diy", "self-watering", "tutorial"],
      replies: 34,
      views: 892,
      likes: 56,
      createdAt: new Date("2026-02-08T14:45:00"),
      lastActivity: new Date("2026-02-11T09:15:00"),
      isPinned: false,
      isAnswered: false
    },
    {
      id: "6",
      title: "Best plants for low light apartments?",
      content: "Moving to a new apartment with limited natural light. What plants would thrive in these conditions?",
      author: {
        username: "citydweller",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=citydweller",
        essence: 543
      },
      category: "Plant Selection",
      tags: ["low-light", "apartment", "beginner"],
      replies: 41,
      views: 678,
      likes: 28,
      createdAt: new Date("2026-02-07T13:00:00"),
      lastActivity: new Date("2026-02-10T18:45:00"),
      isPinned: false,
      isAnswered: true
    },
    {
      id: "7",
      title: "Propagation success stories thread 🌱",
      content: "Share your propagation wins! What method works best for you? Water vs soil propagation debate welcome!",
      author: {
        username: "propagationpro",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=propagationpro",
        essence: 3120
      },
      category: "Propagation",
      tags: ["propagation", "cuttings", "success"],
      replies: 89,
      views: 1845,
      likes: 112,
      createdAt: new Date("2026-02-06T10:30:00"),
      lastActivity: new Date("2026-02-10T16:20:00"),
      isPinned: false,
      isAnswered: false
    }
  ];

  // Sort by last activity (most recent first)
  const sortedPosts = mockPosts.sort((a, b) => {
    // Pinned posts always come first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    // Then sort by last activity
    return b.lastActivity.getTime() - a.lastActivity.getTime();
  });

  return sortedPosts.slice(0, limit);
};
