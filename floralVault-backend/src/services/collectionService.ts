import prisma from "../prisma/client";

export const getUserCollections = async (username: string) => {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      collections: {
        include: {
          thumbnailImage: true,
          plants: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              images: {
                where: { isMain: true },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  if (!user) return null;

  return user?.collections || [];
};
