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

export const findOrCreateGoogleUser = async (googleData: {
  email: string;
  name?: string;
  picture?: string;
  uid: string;
}) => {
  // First, try to find user by email
  let user = await prisma.user.findUnique({
    where: { email: googleData.email },
  });

  if (user) {
    // User exists, update avatar if they don't have one
    if (!user.avatarUrl && googleData.picture) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl: googleData.picture },
      });
    }
    return user;
  }

  // User doesn't exist, create a new one
  // Generate a unique username from email
  const baseUsername = googleData.email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
  let username = baseUsername;
  let counter = 1;

  // Check for username conflicts
  while (await prisma.user.findUnique({ where: { username } })) {
    username = `${baseUsername}${counter}`;
    counter++;
  }

  // Create user with a random password (they'll use Google to sign in)
  const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);

  const nameParts = googleData.name?.split(" ") || [];
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  return await prisma.user.create({
    data: {
      email: googleData.email,
      username,
      firstName,
      lastName,
      password: randomPassword,
      avatarUrl: googleData.picture || "",
      bio: "",
      joinedAt: new Date(),
    },
  });
};
