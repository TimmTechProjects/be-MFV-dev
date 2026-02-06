import prisma from "../prisma/client";

export const createNewCollection = async (
  username: string,
  data: { name: string; description?: string },
  authenticatedUserId?: string
) => {
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // If authenticatedUserId is provided, verify it matches the target user
  if (authenticatedUserId && user.id !== authenticatedUserId) {
    throw new Error("Unauthorized: User mismatch");
  }

  // Generate a unique slug by appending a timestamp if needed
  const baseSlug = data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  let slug = baseSlug;
  let counter = 1;
  
  // Check for existing slugs and make unique if necessary
  while (await prisma.collection.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return prisma.collection.create({
    data: {
      name: data.name,
      description: data.description ?? "",
      slug,
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

export const getUsersCollectionsById = async (userId: string) => {
  return await prisma.collection.findMany({
    where: { userId },
    include: {
      thumbnailImage: true,
      _count: {
        select: { plants: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const addPlantToCollectionService = async ({
  userId,
  collectionId,
  plantId,
}: {
  userId: string;
  collectionId: string;
  plantId: string;
}) => {
  // Confirm the collection belongs to the user
  const collection = await prisma.collection.findFirst({
    where: {
      id: collectionId,
      userId,
    },
  });

  if (!collection) {
    throw new Error("Collection not found or access denied");
  }

  // Add the plant to the collection
  return await prisma.collection.update({
    where: { id: collectionId },
    data: {
      plants: {
        connect: { id: plantId },
      },
    },
  });
};
