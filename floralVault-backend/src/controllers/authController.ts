import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import {
  checkForExistingEmail,
  checkForExistingUsername,
  createNewUser,
  signJWT,
} from "../services/authService";

const generateToken = async (userId: string) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET missing from env");
  }

  const signedJWT = await signJWT(userId, secret);

  return signedJWT;
};

// POST /api/auth/login
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, password } = req.body;

  try {
    const user = await checkForExistingUsername(username);

    if (!user) {
      res.status(404).json({ message: "User not found" });
    } else {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(401).json({ message: "Invalid credentials" });
      }
      const token = await generateToken(user.id);

      res.status(200).json({
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          essence: user.essence,
        },
      });
    }
  } catch (error) {
    console.error("Error logging in user: ", error);
    res.status(500).json({ message: "Failed to login user" });
  }
};

// POST create a new user
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, firstName, lastName, email, password, bio, avatarUrl } =
    req.body;

  const dataToCreate = {
    username,
    firstName,
    lastName,
    email,
    password,
    bio,
    avatarUrl,
  };

  const errors = [];

  const existingUserEmail = await checkForExistingEmail(email);

  const existingUserUsername = await checkForExistingUsername(username);

  if (existingUserEmail) {
    errors.push({ message: "Email is already registered", field: "email" });
  }

  if (existingUserUsername) {
    errors.push({ message: "Username is already taken", field: "username" });
  }

  if (errors.length > 0) {
    res.status(409).json({ errors });
  }

  try {
    const newUser = await createNewUser(dataToCreate);

    const token = await generateToken(newUser.id);

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        username: newUser.username,
        email: newUser.email,
        bio: newUser.bio,
        avatarUrl: newUser.avatarUrl,
        essence: newUser.essence,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Failed to create user" });
  }
};
