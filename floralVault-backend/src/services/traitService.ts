import prisma from "../prisma/client";

export const getAllTraits = async () => {
  return prisma.trait.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
};

export const getTraitsGroupedByCategory = async () => {
  const traits = await prisma.trait.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  const grouped: Record<string, typeof traits> = {};
  for (const trait of traits) {
    if (!grouped[trait.category]) {
      grouped[trait.category] = [];
    }
    grouped[trait.category].push(trait);
  }

  return grouped;
};

export const getTraitsBySlugs = async (slugs: string[]) => {
  return prisma.trait.findMany({
    where: { slug: { in: slugs } },
  });
};
