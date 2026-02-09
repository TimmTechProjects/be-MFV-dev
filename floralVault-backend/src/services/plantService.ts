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
          name: true,
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

  // 4. Auto-set collection thumbnail if it doesn't have one
  if (!collection.thumbnailImageId && newPlant.images?.length > 0) {
    const mainImage = newPlant.images.find((img) => img.isMain) || newPlant.images[0];
    if (mainImage) {
      await prisma.collection.update({
        where: { id: data.collectionId },
        data: { thumbnailImageId: mainImage.id },
      });
    }
  }

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

export const deletePlant = async (plantId: string, userId: string) => {
  // Verify ownership before deleting
  const plant = await prisma.plant.findFirst({
    where: {
      id: plantId,
      userId,
    },
    include: {
      images: true,
    },
  });

  if (!plant) {
    throw new Error("Plant not found or you don't have permission to delete it.");
  }

  // Delete associated images first
  await prisma.image.deleteMany({
    where: {
      plantId,
    },
  });

  // Delete the plant
  await prisma.plant.delete({
    where: {
      id: plantId,
    },
  });

  return { success: true, deletedPlantId: plantId };
};

/**
 * Enhanced search with filters for plant discovery
 */
export const searchAndFilterPlants = async (
  searchQuery?: string,
  filters?: {
    type?: string;
    light?: string;
    water?: string;
    difficulty?: string;
  },
  page = 1,
  limit = 20
) => {
  const skip = (page - 1) * limit;

  const whereConditions: any = {
    isPublic: true,
  };

  // Text search across common name, botanical name, and description
  if (searchQuery && searchQuery.trim()) {
    whereConditions.OR = [
      { commonName: { contains: searchQuery, mode: "insensitive" } },
      { botanicalName: { contains: searchQuery, mode: "insensitive" } },
      { description: { contains: searchQuery, mode: "insensitive" } },
      {
        tags: {
          some: { name: { contains: searchQuery, mode: "insensitive" } },
        },
      },
    ];
  }

  // Type filter (common name contains or tag match)
  if (filters?.type && filters.type.trim()) {
    if (!whereConditions.OR) whereConditions.OR = [];
    whereConditions.OR.push(
      { type: { contains: filters.type, mode: "insensitive" } },
      { tags: { some: { name: { contains: filters.type, mode: "insensitive" } } } }
    );
  }

  // Light requirements filter (via tags or description)
  if (filters?.light && filters.light.trim()) {
    if (!whereConditions.AND) whereConditions.AND = [];
    whereConditions.AND.push({
      OR: [
        { description: { contains: filters.light, mode: "insensitive" } },
        { tags: { some: { name: { contains: filters.light, mode: "insensitive" } } } },
      ],
    });
  }

  // Water requirements filter (via tags or description)
  if (filters?.water && filters.water.trim()) {
    if (!whereConditions.AND) whereConditions.AND = [];
    whereConditions.AND.push({
      OR: [
        { description: { contains: filters.water, mode: "insensitive" } },
        { tags: { some: { name: { contains: filters.water, mode: "insensitive" } } } },
      ],
    });
  }

  // Difficulty filter (via tags or description)
  if (filters?.difficulty && filters.difficulty.trim()) {
    if (!whereConditions.AND) whereConditions.AND = [];
    whereConditions.AND.push({
      OR: [
        { description: { contains: filters.difficulty, mode: "insensitive" } },
        { tags: { some: { name: { contains: filters.difficulty, mode: "insensitive" } } } },
      ],
    });
  }

  const [plants, total] = await Promise.all([
    prisma.plant.findMany({
      where: whereConditions,
      include: {
        user: { select: { username: true, id: true, avatarUrl: true } },
        tags: true,
        images: true,
      },
      orderBy: { likes: "desc" },
      skip,
      take: limit,
    }),
    prisma.plant.count({ where: whereConditions }),
  ]);

  return {
    plants,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Get all available filter options for plant discovery
 */
export const getFilterOptions = async () => {
  const plants = await prisma.plant.findMany({
    where: { isPublic: true },
    select: { type: true, tags: true, description: true },
  });

  // Extract unique types
  const types = new Set<string>();
  plants.forEach(p => {
    if (p.type) types.add(p.type);
  });

  // Extract unique tags that might indicate light, water, or difficulty
  const tags = new Set<string>();
  const lightTags = new Set<string>();
  const waterTags = new Set<string>();
  const difficultyTags = new Set<string>();

  plants.forEach(p => {
    p.tags.forEach(tag => {
      tags.add(tag.name);
      
      if (/light|bright|shade|partial|full/i.test(tag.name)) lightTags.add(tag.name);
      if (/water|moist|dry|humid|drought/i.test(tag.name)) waterTags.add(tag.name);
      if (/easy|beginner|intermediate|difficult|advanced/i.test(tag.name)) difficultyTags.add(tag.name);
    });
  });

  return {
    types: Array.from(types).filter(t => t).sort(),
    tags: Array.from(tags).sort(),
    light: Array.from(lightTags).sort(),
    water: Array.from(waterTags).sort(),
    difficulty: Array.from(difficultyTags).sort(),
  };
};
