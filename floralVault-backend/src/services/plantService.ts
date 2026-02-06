import prisma from "../prisma/client";
import slugify from "slugify";

export const getAllPlants = async () => {
  return await prisma.plant.findMany({
    where: { isPublic: true },
    include: {
      user: {
        select: {
          username: true,
        },
      },
      tags: true,
      images: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getAllPaginatedPlants = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [plants, total] = await Promise.all([
    prisma.plant.findMany({
      where: { isPublic: true },
      include: {
        user: { select: { username: true } },
        tags: true,
        images: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.plant.count({ where: { isPublic: true } }),
  ]);

  return { plants, total };
};

export const querySearch = async (q: string) => {
  return await Promise.all([
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
  ]);
};

export const getPlantBySlug = async (slug: string, _username: string) => {
  return await prisma.plant.findFirst({
    where: {
      slug,
    },
    include: {
      user: {
        select: {
          username: true,
        },
      },
      collection: {
        select: {
          slug: true,
        },
      },
      tags: true,
      images: true,
    },
  });
};

export const createPlant = async (data: any) => {
  const userId = data.user.connect.id;

  if (!data.collectionId) {
    throw new Error("Collection ID is required.");
  }

  // 0. Verify the collection belongs to the authenticated user
  const collection = await prisma.collection.findFirst({
    where: {
      id: data.collectionId,
      userId,
    },
  });

  if (!collection) {
    throw new Error("Collection not found or you don't have permission to add plants to it.");
  }

  // 1. Check if this user already added this plant
  const existingPlant = await prisma.plant.findFirst({
    where: {
      botanicalName: data.botanicalName,
      userId,
    },
  });

  if (existingPlant) {
    // later extend this to return or update
    throw new Error("You already submitted this plant.");
  }

  // 2. Generate a unique slug once
  const slug = slugify(data.botanicalName, { lower: true, strict: true });

  // 3. Create the new plant
  const newPlant = await prisma.plant.create({
    data: {
      commonName: data.commonName,
      botanicalName: data.botanicalName,
      description: data.description,
      type: data.type,
      isPublic: data.isPublic,
      origin: data.origin,
      family: data.family,
      slug,
      user: data.user,
      collection: {
        connect: { id: data.collectionId },
      },
      originalCollection: {
        connect: { id: data.collectionId },
      },
      images: {
        create:
          data.images?.map((img: any) => ({
            url: img.url,
            isMain: img.isMain || false,
          })) || [],
      },
      tags: {
        connectOrCreate:
          data.tags?.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag },
          })) || [],
      },
    },
    include: {
      tags: true,
      images: true,
      user: {
        select: {
          username: true,
        },
      },
      collection: {
        select: { slug: true },
      },
      originalCollection: {
        select: { slug: true },
      },
    },
  });

  return newPlant;
};

export const getUserCollectionWithPlants = async (
  username: string,
  collectionSlug: string,
  page = 1,
  limit = 10
) => {
  const skip = (page - 1) * limit;

  return prisma.collection.findFirst({
    where: {
      slug: collectionSlug,
      user: {
        is: { username },
      },
    },
    include: {
      plants: {
        include: {
          tags: true,
          images: true,
          user: {
            select: {
              username: true,
            },
          },
          collection: {
            select: {
              slug: true,
            },
          },
          originalCollection: {
            select: {
              slug: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      },
    },
  });
};

export const getCollectionPlantCount = async (collectionId: string) => {
  return prisma.plant.count({
    where: {
      collectionId,
    },
  });
};
