"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserById = exports.getUserWithUsername = exports.getCurrentUserById = void 0;
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
