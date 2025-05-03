import prisma from "../prisma/client";
import slugify from "slugify";
import { nanoid } from "nanoid";

export const createPlant = async (data: any) => {
  const slug =
    slugify(data.botanicalName, { lower: true, strict: true }) +
    "-" +
    nanoid(8);

  const newPlant = await prisma.plant.create({
    data: {
      commonName: data.commonName,
      botanicalName: data.botanicalName,
      description: data.description,
      type: data.type,
      isPublic: data.isPublic,
      slug,
      user: data.user,
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
    },
  });

  return newPlant;
};
