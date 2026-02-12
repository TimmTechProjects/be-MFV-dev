"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserById = exports.changeUsername = exports.checkUsernameExists = exports.getUserWithUsername = exports.getCurrentUserById = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const getCurrentUserById = async (id) => {
    const user = await client_1.default.user.findUnique({
        where: { id },
    });
    if (!user) {
        return null;
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
};
exports.getCurrentUserById = getCurrentUserById;
const getUserWithUsername = async (username) => {
    const user = await client_1.default.user.findUnique({
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
exports.getUserWithUsername = getUserWithUsername;
const checkUsernameExists = async (username) => {
    const user = await client_1.default.user.findUnique({
        where: { username },
        select: { id: true },
    });
    return !!user;
};
exports.checkUsernameExists = checkUsernameExists;
const changeUsername = async (userId, newUsername) => {
    const user = await client_1.default.user.findUnique({
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
    const existing = await client_1.default.user.findUnique({
        where: { username: newUsername },
        select: { id: true },
    });
    if (existing) {
        return { error: "Username is already taken" };
    }
    const updatedUser = await client_1.default.user.update({
        where: { id: userId },
        data: {
            username: newUsername,
            usernameLastChangedAt: new Date(),
        },
    });
    const { password: _password, ...userWithoutPassword } = updatedUser;
    return { user: userWithoutPassword };
};
exports.changeUsername = changeUsername;
const updateUserById = async (id, dataToUpdate) => {
    const updatedData = { ...dataToUpdate };
    if (updatedData.password &&
        typeof updatedData.password === "string" &&
        updatedData.password.trim() !== "") {
        updatedData.password = await bcrypt_1.default.hash(updatedData.password, 10);
    }
    const updatedUser = await client_1.default.user.update({
        where: { id },
        data: dataToUpdate,
    });
    const { password: _password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
};
exports.updateUserById = updateUserById;
