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
      plants: {
        select: { id: true },
      },
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
  const updatedCollection = await prisma.collection.update({
    where: { id: collectionId },
    data: {
      plants: {
        connect: { id: plantId },
      },
    },
  });

  // Auto-set thumbnail if collection doesn't have one
  if (!collection.thumbnailImageId) {
    const plantWithImage = await prisma.plant.findUnique({
      where: { id: plantId },
      include: {
        images: {
          where: { isMain: true },
          take: 1,
        },
      },
    });

    if (plantWithImage?.images?.[0]?.id) {
      await prisma.collection.update({
        where: { id: collectionId },
        data: { thumbnailImageId: plantWithImage.images[0].id },
      });
    }
  }

  return updatedCollection;
};

const getOrCreateUncategorizedCollection = async (userId: string) => {
  const slug = `uncategorized-${userId}`;

  const existing = await prisma.collection.findFirst({
    where: {
      userId,
      slug,
    },
  });

  if (existing) return existing;

  try {
    return await prisma.collection.create({
      data: {
        name: "Uncategorized",
        slug,
        description: "Plants that have been removed from all other albums",
        userId,
      },
    });
  } catch {
    const found = await prisma.collection.findFirst({
      where: { userId, slug },
    });
    if (found) return found;
    throw new Error("Failed to create uncategorized collection");
  }
};

export const removePlantFromCollectionService = async ({
  userId,
  collectionId,
  plantId,
}: {
  userId: string;
  collectionId: string;
  plantId: string;
}) => {
  const collection = await prisma.collection.findFirst({
    where: {
      id: collectionId,
      userId,
    },
  });

  if (!collection) {
    throw new Error("Collection not found or access denied");
  }

  const plant = await prisma.plant.findUnique({
    where: { id: plantId },
  });

  if (!plant) {
    throw new Error("Plant not found");
  }

  if (plant.collectionId !== collectionId) {
    throw new Error("Plant is not in this collection");
  }

  const isOwner = plant.userId === userId;

  if (isOwner) {
    const ownerCollectionsWithPlant = await prisma.collection.findMany({
      where: {
        userId,
        plants: { some: { id: plantId } },
      },
    });

    if (ownerCollectionsWithPlant.length <= 1) {
      const uncategorized = await getOrCreateUncategorizedCollection(userId);

      if (uncategorized.id === collectionId) {
        throw new Error("LAST_ALBUM");
      }

      await prisma.plant.update({
        where: { id: plantId },
        data: { collectionId: uncategorized.id },
      });

      return { collection, movedToUncategorized: true };
    }
  }

  const targetCollectionId = plant.originalCollectionId || collectionId;

  if (targetCollectionId === collectionId) {
    const otherCollection = await prisma.collection.findFirst({
      where: {
        userId,
        plants: { some: { id: plantId } },
        id: { not: collectionId },
      },
    });

    if (otherCollection) {
      await prisma.plant.update({
        where: { id: plantId },
        data: { collectionId: otherCollection.id },
      });
    }

    return { collection, movedToUncategorized: false };
  }

  await prisma.plant.update({
    where: { id: plantId },
    data: { collectionId: targetCollectionId },
  });

  return { collection, movedToUncategorized: false };
};

export const setCollectionThumbnailService = async ({
  userId,
  collectionId,
  imageId,
}: {
  userId: string;
  collectionId: string;
  imageId: string;
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

  // Verify the image exists
  const image = await prisma.image.findUnique({
    where: { id: imageId },
  });

  if (!image) {
    throw new Error("Image not found");
  }

  // Update the collection thumbnail
  return await prisma.collection.update({
    where: { id: collectionId },
    data: { thumbnailImageId: imageId },
    include: { thumbnailImage: true },
  });
};
