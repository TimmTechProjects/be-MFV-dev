import prisma from "../prisma/client";

export const querySearch = async (q: string) => {
  const [plants, users, collections] = await Promise.all([
    prisma.plant.findMany({
      where: {
        OR: [
          { commonName: { contains: q, mode: "insensitive" } },
          { botanicalName: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          {
            tags: {
              some: { name: { contains: q, mode: "insensitive" } },
            },
          },
        ],
      },
      include: {
        tags: true,
        user: { select: { username: true } },
        images: true,
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),

    prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q, mode: "insensitive" } },
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
      },
      take: 5,
    }),

    prisma.collection.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      include: {
        user: { select: { username: true } },
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // ✅ Return as an object now:
  return { plants, users, collections };
};
