import { Response } from "express";
import { AuthenticatedRequest } from "../types/express";
import prisma from "../prisma/client";
import { getCurrentUserById, updateUserById } from "../services/userService";

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

// PUT update a user
export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.user;
  const { username, firstName, lastName, email, bio, avatarUrl, password } =
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
    };

    const updatedUser = await updateUserById(id, dataToUpdate);

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Failed to update user" });
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
