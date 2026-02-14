import { Response } from "express";
import { AuthenticatedRequest } from "../types/express";
import prisma from "../prisma/client";
import {
  getCurrentUserById,
  getUserWithUsername,
  updateUserById,
  checkUsernameExists,
  changeUsername,
} from "../services/userService";

// GET all users
export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany();

    const publicUsers = users.map(({ id, username, bio, avatarUrl }) => ({
      id,
      username,
      bio,
      avatarUrl,
    }));

    res.status(200).json(publicUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUserByUsername = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { username } = req.params;

  try {
    const user = await getUserWithUsername(username);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
    return;
  } catch (error) {
    console.error("Error fetching user by username:", error);
    res.status(500).json({ message: "Failed to fetch user" });
    return;
  }
};

export const checkUsername = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { username } = req.params;

  if (!username || username.length < 3 || username.length > 30) {
    res.status(400).json({ available: false, message: "Invalid username format" });
    return;
  }

  if (!/^[a-zA-Z][a-zA-Z0-9_-]+$/.test(username)) {
    res.status(400).json({ available: false, message: "Invalid username format" });
    return;
  }

  try {
    const exists = await checkUsernameExists(username);
    res.status(200).json({
      available: !exists,
      message: exists ? "Username is already taken" : "Username is available",
    });
  } catch (error) {
    console.error("Error checking username:", error);
    res.status(500).json({ available: false, message: "Internal Server Error" });
  }
};

export const changeUsernameHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { id } = req.user;
  const { username } = req.body;

  if (!username) {
    res.status(400).json({ message: "Username is required" });
    return;
  }

  if (username.length < 3 || username.length > 30) {
    res.status(400).json({ message: "Username must be 3-30 characters" });
    return;
  }

  if (!/^[a-zA-Z][a-zA-Z0-9_-]+$/.test(username)) {
    res.status(400).json({ message: "Invalid username format" });
    return;
  }

  try {
    const result = await changeUsername(id, username);
    if ("error" in result) {
      res.status(400).json({ message: result.error });
      return;
    }
    res.status(200).json({ user: result.user });
  } catch (error) {
    console.error("Error changing username:", error);
    res.status(500).json({ message: "Failed to change username" });
  }
};

// GET a user by ID
export const getCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { id } = req.user;

  try {
    const user = await getCurrentUserById(id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log("Error fetching user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET profile by username (query param)
export const getProfileByUsername = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const username = req.query.username as string;

  if (!username) {
    res.status(400).json({ message: "Username query parameter is required" });
    return;
  }

  try {
    const user = await getUserWithUsername(username);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// PUT update a user
export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.user;
  const { username, firstName, lastName, email, bio, avatarUrl, bannerUrl, password } =
    req.body;

  try {
    const dataToUpdate = {
      username,
      firstName,
      lastName,
      email,
      password,
      bio,
      avatarUrl,
      bannerUrl,
    };

    const updatedUser = await updateUserById(id, dataToUpdate);

    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
};

// PATCH update avatar
export const updateAvatar = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.user;
  const { username } = req.params;
  const { avatarUrl, avatarKey } = req.body;

  if (!avatarUrl || typeof avatarUrl !== "string") {
    res.status(400).json({ message: "avatarUrl is required" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { id }, select: { username: true } });
    if (!user || user.username !== username) {
      res.status(403).json({ message: "You can only update your own profile picture" });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { avatarUrl },
    });

    res.status(200).json({ avatarUrl: updatedUser.avatarUrl });
  } catch (error) {
    console.error("Error updating avatar:", error);
    res.status(500).json({ message: "Failed to update profile picture" });
  }
};

// PATCH update banner
export const updateBanner = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.user;
  const { username } = req.params;
  const { bannerUrl, bannerKey } = req.body;

  if (!bannerUrl || typeof bannerUrl !== "string") {
    res.status(400).json({ message: "bannerUrl is required" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { id }, select: { username: true } });
    if (!user || user.username !== username) {
      res.status(403).json({ message: "You can only update your own banner" });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { bannerUrl },
    });

    res.status(200).json({ bannerUrl: updatedUser.bannerUrl });
  } catch (error) {
    console.error("Error updating banner:", error);
    res.status(500).json({ message: "Failed to update banner" });
  }
};

// DELETE a user
export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.user;

  try {
    await prisma.user.delete({
      where: { id },
    });

    res.status(200).json({ message: "User account successfully deleted." });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};
