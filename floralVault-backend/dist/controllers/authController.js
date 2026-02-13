"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleLogin = exports.registerUser = exports.loginUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const authService_1 = require("../services/authService");
const firebase_1 = require("../config/firebase");
const generateToken = async (userId) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET missing from env");
    }
    const signedJWT = await (0, authService_1.signJWT)(userId, secret);
    return signedJWT;
};
// POST /api/auth/login
const loginUser = async (req, res, next) => {
    const { username, email, password } = req.body;
    const loginIdentifier = username || email;
    try {
        // Try to find user by username or email
        let user;
        if (username) {
            user = await (0, authService_1.checkForExistingUsername)(username);
        }
        else if (email) {
            user = await (0, authService_1.checkForExistingEmail)(email);
        }
        if (!user) {
            res.status(404).json({ message: "User not found" });
        }
        else {
            const isMatch = await bcrypt_1.default.compare(password, user.password);
            if (!isMatch) {
                res.status(401).json({ message: "Invalid credentials" });
            }
            else {
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
    }
    catch (error) {
        console.error("Error logging in user: ", error);
        res.status(500).json({ message: "Failed to login user" });
    }
};
exports.loginUser = loginUser;
// POST create a new user
const registerUser = async (req, res, next) => {
    const { username, firstName, lastName, email, password, bio, avatarUrl } = req.body;
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
    const existingUserEmail = await (0, authService_1.checkForExistingEmail)(email);
    const existingUserUsername = await (0, authService_1.checkForExistingUsername)(username);
    if (existingUserEmail) {
        errors.push({ message: "Email is already registered", field: "email" });
    }
    if (existingUserUsername) {
        errors.push({ message: "Username is already taken", field: "username" });
    }
    if (errors.length > 0) {
        res.status(409).json({ errors });
        return;
    }
    try {
        const newUser = await (0, authService_1.createNewUser)(dataToCreate);
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
    }
    catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Failed to create user" });
    }
};
exports.registerUser = registerUser;
// POST /api/v1/auth/google-login
const googleLogin = async (req, res, next) => {
    const { idToken } = req.body;
    if (!idToken) {
        res.status(400).json({ message: "ID token is required" });
        return;
    }
    try {
        // Verify the Google ID token
        const decodedToken = await (0, firebase_1.verifyGoogleToken)(idToken);
        // Find or create user
        const user = await (0, authService_1.findOrCreateGoogleUser)({
            email: decodedToken.email,
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
    }
    catch (error) {
        console.error("Google login error:", error);
        res.status(401).json({ message: "Google authentication failed" });
    }
};
exports.googleLogin = googleLogin;
