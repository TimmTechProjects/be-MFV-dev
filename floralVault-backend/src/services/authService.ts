import prisma from "../prisma/client";
import { Prisma } from "@prisma/client";
import jwt, { Secret } from "jsonwebtoken";
import bcrypt from "bcrypt";

export const signJWT = async (userId: string, secret: string) => {
  const expiresIn: string | number = process.env.JWT_EXPIRES_IN || "30d";

  return jwt.sign({ id: userId }, secret as Secret, { expiresIn });
};

export const checkForExistingUsername = async (username: string) => {
  return await prisma.user.findUnique({
    where: {
      username,
    },
  });
};

export const checkForExistingEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: {
      email,
    },
  });
};

export const loginUserById = async (username: string, password: string) => {
  return await prisma.user.findUnique({
    where: { username },
  });
};

export const createNewUser = async (dataToCreate: Prisma.UserCreateInput) => {
  const hashedPassword = await bcrypt.hash(dataToCreate.password, 10);

  return await prisma.user.create({
    data: {
      ...dataToCreate,
      password: hashedPassword,
      bio: dataToCreate.bio ?? "",
      joinedAt: new Date(),
    },
  });
};
