import prisma from "../prisma/client";
import slugify from "slugify";

export const createPlant = async (data: any) => {
  const baseSlug = slugify(data.botanicalName, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  while (await prisma.plant.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }

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
