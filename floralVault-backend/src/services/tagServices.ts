import prisma from "../prisma/client";

export const getAllTags = async () => {
  return await prisma.tag.findMany();
};

export const getAllSuggestionTags = async (query: string) => {
  return await prisma.tag.findMany({
    where: {
      name: {
        contains: query,
        mode: "insensitive",
      },
    },
    take: 10,
  });
};
