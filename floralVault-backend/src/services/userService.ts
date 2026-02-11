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

export const getUserWithUsername = async (username: string) => {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
      email: true,
      bio: true,
      avatarUrl: true,
      joinedAt: true,
      plan: true,
    },
  });

  if (!user) {
    return null;
  }

  return user;
};

export const checkUsernameExists = async (username: string) => {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  return !!user;
};

export const changeUsername = async (userId: string, newUsername: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { usernameLastChangedAt: true },
  });

  if (user?.usernameLastChangedAt) {
    const lastChanged = new Date(user.usernameLastChangedAt);
    const now = new Date();
    const diffMs = now.getTime() - lastChanged.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 30) {
      const daysLeft = 30 - diffDays;
      return {
        error: `You can only change your username once every 30 days. Try again in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.`,
      };
    }
  }

  const existing = await prisma.user.findUnique({
    where: { username: newUsername },
    select: { id: true },
  });
  if (existing) {
    return { error: "Username is already taken" };
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      username: newUsername,
      usernameLastChangedAt: new Date(),
    },
  });

  const { password: _password, ...userWithoutPassword } = updatedUser;
  return { user: userWithoutPassword };
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
