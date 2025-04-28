import prisma from "../prisma/client";

export const getCurrentUserById = async (id: string) => {
  return await prisma.user.findUnique({
    where: { id },
  });
};
