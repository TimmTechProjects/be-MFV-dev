import prisma from "../prisma/client";

export const togglePlantLike = async (userId: string, plantId: string) => {
  const existing = await prisma.plantLike.findUnique({
    where: {
      userId_plantId: { userId, plantId },
    },
  });

  if (existing) {
    await prisma.plantLike.delete({
      where: { id: existing.id },
    });

    await prisma.plant.update({
      where: { id: plantId },
      data: { likes: { decrement: 1 } },
    });

    return { liked: false };
  }

  await prisma.plantLike.create({
    data: { userId, plantId },
  });

  await prisma.plant.update({
    where: { id: plantId },
    data: { likes: { increment: 1 } },
  });

  return { liked: true };
};

export const getPlantLikeStatus = async (userId: string, plantId: string) => {
  const existing = await prisma.plantLike.findUnique({
    where: {
      userId_plantId: { userId, plantId },
    },
  });

  return { liked: !!existing };
};

export const getPlantLikeCount = async (plantId: string) => {
  const count = await prisma.plantLike.count({
    where: { plantId },
  });

  return { count };
};
