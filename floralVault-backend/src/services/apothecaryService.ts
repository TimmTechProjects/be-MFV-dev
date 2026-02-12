import prisma from '../prisma/client';

interface SearchParams {
  query?: string;
  property?: string;
  compound?: string;
}

interface RecipeFilters {
  plantId?: string;
  authorId?: string;
  difficulty?: string;
  purpose?: string;
}

interface MedicinalPropertyData {
  properties?: string[];
  traditionalUses?: string[];
  modernUses?: string[];
  activeCompounds?: string[];
  preparations?: string[];
  dosage?: string;
  safetyWarnings?: string[];
  contraindications?: string[];
  drugInteractions?: string[];
  references?: string[];
}

interface RecipeData {
  title: string;
  description: string;
  authorId: string;
  plantIds: string[];
  ingredients: string[];
  instructions: string;
  prepTime?: number;
  difficulty?: string;
  purpose: string[];
  safetyNotes?: string;
  images?: string[];
}

/**
 * Get medicinal properties for a specific plant
 */
export const getPlantMedicinalInfo = async (plantId: string) => {
  return await prisma.medicinalProperty.findUnique({
    where: { plantId },
    include: {
      plant: {
        include: {
          images: true,
          tags: true,
        },
      },
    },
  });
};

/**
 * Search plants by medicinal properties, compounds, or general query
 */
export const searchByProperty = async (params: SearchParams) => {
  const { query, property, compound } = params;
  
  const where: any = {};
  
  if (property) {
    where.properties = {
      has: property,
    };
  }
  
  if (compound) {
    where.activeCompounds = {
      has: compound,
    };
  }
  
  // If there's a general query, search across multiple fields
  if (query) {
    where.OR = [
      {
        properties: {
          hasSome: [query],
        },
      },
      {
        activeCompounds: {
          hasSome: [query],
        },
      },
      {
        plant: {
          commonName: {
            contains: query,
            mode: 'insensitive',
          },
        },
      },
      {
        plant: {
          botanicalName: {
            contains: query,
            mode: 'insensitive',
          },
        },
      },
    ];
  }
  
  return await prisma.medicinalProperty.findMany({
    where,
    include: {
      plant: {
        include: {
          images: true,
          tags: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
};

/**
 * Get all plants with a specific medicinal property
 */
export const getPlantsByProperty = async (property: string) => {
  return await prisma.medicinalProperty.findMany({
    where: {
      properties: {
        has: property,
      },
    },
    include: {
      plant: {
        include: {
          images: true,
          tags: true,
        },
      },
    },
    orderBy: {
      plant: {
        commonName: 'asc',
      },
    },
  });
};

/**
 * Create a new herbal recipe
 */
export const createRecipe = async (data: RecipeData) => {
  return await prisma.herbalRecipe.create({
    data: {
      title: data.title,
      description: data.description,
      authorId: data.authorId,
      plantIds: data.plantIds,
      ingredients: data.ingredients,
      instructions: data.instructions,
      prepTime: data.prepTime,
      difficulty: data.difficulty,
      purpose: data.purpose,
      safetyNotes: data.safetyNotes,
      images: data.images || [],
    },
  });
};

/**
 * Get recipes with optional filters
 */
export const getRecipes = async (filters: RecipeFilters) => {
  const where: any = {};
  
  if (filters.plantId) {
    where.plantIds = {
      has: filters.plantId,
    };
  }
  
  if (filters.authorId) {
    where.authorId = filters.authorId;
  }
  
  if (filters.difficulty) {
    where.difficulty = filters.difficulty;
  }
  
  if (filters.purpose) {
    where.purpose = {
      has: filters.purpose,
    };
  }
  
  return await prisma.herbalRecipe.findMany({
    where,
    orderBy: {
      createdAt: 'desc',
    },
    take: 50, // Limit to 50 recipes
  });
};

/**
 * Get a specific recipe by ID
 */
export const getRecipeById = async (id: string) => {
  return await prisma.herbalRecipe.findUnique({
    where: { id },
  });
};

/**
 * Create or update medicinal properties for a plant
 */
export const createOrUpdateMedicinalProperty = async (
  plantId: string,
  data: MedicinalPropertyData
) => {
  // Check if medicinal property already exists
  const existing = await prisma.medicinalProperty.findUnique({
    where: { plantId },
  });
  
  if (existing) {
    return await prisma.medicinalProperty.update({
      where: { plantId },
      data: {
        properties: data.properties,
        traditionalUses: data.traditionalUses,
        modernUses: data.modernUses,
        activeCompounds: data.activeCompounds,
        preparations: data.preparations,
        dosage: data.dosage,
        safetyWarnings: data.safetyWarnings,
        contraindications: data.contraindications,
        drugInteractions: data.drugInteractions,
        references: data.references,
      },
    });
  }
  
  return await prisma.medicinalProperty.create({
    data: {
      plantId,
      properties: data.properties || [],
      traditionalUses: data.traditionalUses || [],
      modernUses: data.modernUses || [],
      activeCompounds: data.activeCompounds || [],
      preparations: data.preparations || [],
      dosage: data.dosage,
      safetyWarnings: data.safetyWarnings || [],
      contraindications: data.contraindications || [],
      drugInteractions: data.drugInteractions || [],
      references: data.references || [],
    },
  });
};
