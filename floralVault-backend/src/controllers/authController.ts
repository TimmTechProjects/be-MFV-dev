import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import {
  checkForExistingEmail,
  checkForExistingUsername,
  createNewUser,
  findOrCreateGoogleUser,
  signJWT,
} from "../services/authService";
import { verifyGoogleToken } from "../config/firebase";

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
  const { username, email, password } = req.body;
  const loginIdentifier = username || email;

  try {
    // Try to find user by username or email
    let user;
    if (username) {
      user = await checkForExistingUsername(username);
    } else if (email) {
      user = await checkForExistingEmail(email);
    }

    if (!user) {
      res.status(404).json({ message: "User not found" });
    } else {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(401).json({ message: "Invalid credentials" });
      } else {
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
            bannerUrl: user.bannerUrl,
            essence: user.essence,
            joinedAt: user.joinedAt,
            plan: user.plan,
            usernameLastChangedAt: user.usernameLastChangedAt,
          },
        });
      }
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
        bannerUrl: newUser.bannerUrl,
        essence: newUser.essence,
        usernameLastChangedAt: newUser.usernameLastChangedAt,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Failed to create user" });
  }
};

// POST /api/v1/auth/google-login
export const googleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { idToken } = req.body;

  if (!idToken) {
    res.status(400).json({ message: "ID token is required" });
    return;
  }

  try {
    // Verify the Google ID token
    const decodedToken = await verifyGoogleToken(idToken);
    
    // Find or create user
    const user = await findOrCreateGoogleUser({
      email: decodedToken.email!,
      name: decodedToken.name,
      picture: decodedToken.picture,
      uid: decodedToken.uid,
    });

    // Generate JWT token
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
        bannerUrl: user.bannerUrl,
        essence: user.essence,
        joinedAt: user.joinedAt,
        plan: user.plan,
        usernameLastChangedAt: user.usernameLastChangedAt,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(401).json({ message: "Google authentication failed" });
  }
};
