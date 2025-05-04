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

export const getPlantBySlug = async (slug: string, username: string) => {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!user) return null;

  return await prisma.plant.findUnique({
    where: {
      slug_userId: {
        slug,
        userId: user.id,
      },
    },
    include: {
      user: {
        select: {
          username: true,
        },
      },
      tags: true,
      images: true,
    },
  });
};

export const createPlant = async (data: any) => {
  const userId = data.user.connect.id;

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
    },
  });

  return newPlant;
};
