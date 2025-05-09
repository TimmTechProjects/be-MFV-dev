import prisma from "../prisma/client";

export const createNewCollection = async (
  username: string,
  data: { name: string; description?: string }
) => {
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return prisma.collection.create({
    data: {
      name: data.name,
      description: data.description ?? "",
      slug: data.name.toLowerCase().replace(/\s+/g, "-"),
      userId: user.id,
    },
  });
};

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

export const getCollectionWithPlants = async (collectionId: string) => {
  return prisma.collection.findUnique({
    where: { id: collectionId },
    include: {
      plants: {
        include: {
          tags: true,
          images: true,
        },
      },
    },
  });
};
