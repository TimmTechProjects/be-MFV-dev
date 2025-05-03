import { Prisma } from "@prisma/client";
import prisma from "../prisma/client";
import bcrypt from "bcrypt";

export const getCurrentUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    return null;
  }

  const { password, ...userWithoutPassword } = user;

  return userWithoutPassword;
};

export const updateUserById = async (
  id: string,
  dataToUpdate: Prisma.UserUpdateInput
) => {
  const updatedData = { ...dataToUpdate };

  if (
    updatedData.password &&
    typeof updatedData.password === "string" &&
    updatedData.password.trim() !== ""
  ) {
    updatedData.password = await bcrypt.hash(updatedData.password, 10);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: dataToUpdate,
  });

  const { password: _password, ...userWithoutPassword } = updatedUser;

  return userWithoutPassword;
};
