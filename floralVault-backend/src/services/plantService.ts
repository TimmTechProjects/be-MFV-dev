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
      plantTraits: { include: { trait: true } },
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
        plantTraits: { include: { trait: true } },
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
        plantTraits: { include: { trait: true } },
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
      plantTraits: { include: { trait: true } },
    },
  });
};

export const createPlant= async (data: any) => {
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
      primaryType: data.primaryType || null,
      secondaryTraits: data.secondaryTraits ?? [],
      isPublic: data.isPublic,
      isGarden: data.isGarden ?? false,
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
      plantTraits: {
        create:
          data.traitIds?.map((traitId: string) => ({
            trait: { connect: { id: traitId } },
          })) || [],
      },
    },
    include: {
      tags: true,
      images: true,
      plantTraits: { include: { trait: true } },
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
          plantTraits: { include: { trait: true } },
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

export const getPlantsByUsername = async (
  username: string,
  isGarden?: boolean
) => {
  const where: any = {
    user: { is: { username } },
  };
  if (isGarden !== undefined) {
    where.isGarden = isGarden;
  }

  return prisma.plant.findMany({
    where,
    include: {
      user: { select: { username: true } },
      tags: true,
      images: true,
      plantTraits: { include: { trait: true } },
      collection: { select: { slug: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const togglePlantGarden = async (plantId: string, userId: string) => {
  const plant = await prisma.plant.findFirst({
    where: {
      id: plantId,
      userId,
    },
  });

  if (!plant) {
    throw new Error("Plant not found or you don't have permission to modify it.");
  }

  const updated = await prisma.plant.update({
    where: { id: plantId },
    data: { isGarden: !plant.isGarden },
    select: {
      id: true,
      isGarden: true,
    },
  });

  return updated;
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
    primaryType?: string;
    traitSlugs?: string[];
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

  // Primary type filter (exact enum match)
  if (filters?.primaryType && filters.primaryType.trim()) {
    whereConditions.primaryType = filters.primaryType;
  }

  // Trait slug filter (AND logic - plant must have ALL specified traits)
  if (filters?.traitSlugs && filters.traitSlugs.length > 0) {
    if (!whereConditions.AND) whereConditions.AND = [];
    for (const slug of filters.traitSlugs) {
      whereConditions.AND.push({
        plantTraits: { some: { trait: { slug } } },
      });
    }
  }

  // Type filter (plant type field or tag match) - use AND to combine with search
  if (filters?.type && filters.type.trim()) {
    if (!whereConditions.AND) whereConditions.AND = [];
    whereConditions.AND.push({
      OR: [
        { type: { contains: filters.type, mode: "insensitive" } },
        { tags: { some: { name: { contains: filters.type, mode: "insensitive" } } } },
      ],
    });
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
        plantTraits: { include: { trait: true } },
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

/**
 * Get related plants based on similar tags, same family, or same user
 * Implements smart scoring to return the most relevant plants
 */
export const getRelatedPlants = async (plantId: string, limit = 6) => {
  // First, get the target plant to extract its properties
  const targetPlant = await prisma.plant.findUnique({
    where: { id: plantId },
    include: {
      tags: true,
      user: true,
    },
  });

  if (!targetPlant) {
    return [];
  }

  const tagIds = targetPlant.tags.map(tag => tag.id);

  // Find related plants using a combination of criteria
  const relatedPlants = await prisma.plant.findMany({
    where: {
      AND: [
        { id: { not: plantId } }, // Exclude the current plant
        { isPublic: true }, // Only show public plants
        {
          OR: [
            // Same family
            targetPlant.family ? { family: targetPlant.family } : {},
            // Similar tags (at least one common tag)
            tagIds.length > 0 ? { tags: { some: { id: { in: tagIds } } } } : {},
            // Same user
            { userId: targetPlant.userId },
          ].filter(condition => Object.keys(condition).length > 0), // Filter out empty conditions
        },
      ],
    },
    include: {
      user: { select: { username: true, id: true, avatarUrl: true } },
      tags: true,
      images: true,
      plantTraits: { include: { trait: true } },
    },
    take: limit * 3, // Fetch more than needed for scoring
  });

  // Score and sort the related plants
  const scoredPlants = relatedPlants.map(plant => {
    let score = 0;

    // Score for same family (high relevance)
    if (targetPlant.family && plant.family === targetPlant.family) {
      score += 10;
    }

    // Score for common tags
    const commonTags = plant.tags.filter(tag => tagIds.includes(tag.id)).length;
    score += commonTags * 3;

    // Score for same user (medium relevance)
    if (plant.userId === targetPlant.userId) {
      score += 5;
    }

    // Boost score based on plant popularity (likes and views)
    score += Math.log10(plant.likes + 1);
    score += Math.log10(plant.views + 1) * 0.5;

    return { plant, score };
  });

  // Sort by score descending and return top N
  scoredPlants.sort((a, b) => b.score - a.score);

  return scoredPlants.slice(0, limit).map(item => item.plant);
};

export const getTrendingPlants = async (limit: number = 8) => {
  // Calculate trending score based on recent engagement
  // Higher weight for recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Get plants with their like counts from the past week
  const plants = await prisma.plant.findMany({
    where: { 
      isPublic: true 
    },
    include: {
      user: {
        select: {
          username: true,
          avatarUrl: true,
        },
      },
      tags: true,
      images: true,
      plantTraits: { include: { trait: true } },
      plantLikes: {
        where: {
          createdAt: { gte: sevenDaysAgo }
        }
      }
    },
    orderBy: [
      { likes: 'desc' },
      { views: 'desc' },
      { createdAt: 'desc' }
    ],
    take: limit * 2 // Get more to calculate trending score
  });

  // Calculate trending score: recent likes * 3 + total likes + views/10
  const scoredPlants = plants.map(plant => {
    const recentLikes = plant.plantLikes.length;
    const trendingScore = (recentLikes * 3) + plant.likes + (plant.views / 10);
    
    return {
      ...plant,
      trendingScore,
      // Remove the plantLikes array from the response
      plantLikes: undefined
    };
  });

  // Sort by trending score and return top N
  scoredPlants.sort((a, b) => b.trendingScore - a.trendingScore);

  return scoredPlants.slice(0, limit);
};
