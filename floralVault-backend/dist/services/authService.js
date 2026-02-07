"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOrCreateGoogleUser = exports.createNewUser = exports.loginUserById = exports.checkForExistingEmail = exports.checkForExistingUsername = exports.signJWT = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const signJWT = async (userId, secret) => {
    const expiresIn = process.env.JWT_EXPIRES_IN || "30d";
    return jsonwebtoken_1.default.sign({ id: userId }, secret, { expiresIn });
};
exports.signJWT = signJWT;
const checkForExistingUsername = async (username) => {
    return await client_1.default.user.findUnique({
        where: {
            username,
        },
    });
};
exports.checkForExistingUsername = checkForExistingUsername;
const checkForExistingEmail = async (email) => {
    return await client_1.default.user.findUnique({
        where: {
            email,
        },
    });
};
exports.checkForExistingEmail = checkForExistingEmail;
const loginUserById = async (username, password) => {
    return await client_1.default.user.findUnique({
        where: { username },
    });
};
exports.loginUserById = loginUserById;
const createNewUser = async (dataToCreate) => {
    const hashedPassword = await bcrypt_1.default.hash(dataToCreate.password, 10);
    return await client_1.default.user.create({
        data: {
            ...dataToCreate,
            password: hashedPassword,
            bio: dataToCreate.bio ?? "",
            joinedAt: new Date(),
        },
    });
};
exports.createNewUser = createNewUser;
const findOrCreateGoogleUser = async (googleData) => {
    // First, try to find user by email
    let user = await client_1.default.user.findUnique({
        where: { email: googleData.email },
    });
    if (user) {
        // User exists, update avatar if they don't have one
        if (!user.avatarUrl && googleData.picture) {
            user = await client_1.default.user.update({
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
    while (await client_1.default.user.findUnique({ where: { username } })) {
        username = `${baseUsername}${counter}`;
        counter++;
    }
    // Create user with a random password (they'll use Google to sign in)
    const randomPassword = await bcrypt_1.default.hash(Math.random().toString(36), 10);
    const nameParts = googleData.name?.split(" ") || [];
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";
    return await client_1.default.user.create({
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
exports.findOrCreateGoogleUser = findOrCreateGoogleUser;
