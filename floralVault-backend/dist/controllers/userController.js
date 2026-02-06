"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getCurrentUser = exports.getUserByUsername = exports.getAllUsers = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const userService_1 = require("../services/userService");
// GET all users
const getAllUsers = async (req, res) => {
    try {
        const users = await client_1.default.user.findMany();
        const publicUsers = users.map(({ id, username, bio, avatarUrl }) => ({
            id,
            username,
            bio,
            avatarUrl,
        }));
        res.status(200).json(publicUsers);
    }
    catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.getAllUsers = getAllUsers;
const getUserByUsername = async (req, res) => {
    const { username } = req.params;
    try {
        const user = await (0, userService_1.getUserWithUsername)(username);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json(user);
        return;
    }
    catch (error) {
        console.error("Error fetching user by username:", error);
        res.status(500).json({ message: "Failed to fetch user" });
        return;
    }
};
exports.getUserByUsername = getUserByUsername;
// GET a user by ID
const getCurrentUser = async (req, res) => {
    const { id } = req.user;
    try {
        const user = await (0, userService_1.getCurrentUserById)(id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.log("Error fetching user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.getCurrentUser = getCurrentUser;
// PUT update a user
const updateUser = async (req, res) => {
    const { id } = req.user;
    const { username, firstName, lastName, email, bio, avatarUrl, password } = req.body;
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
        const updatedUser = await (0, userService_1.updateUserById)(id, dataToUpdate);
        res.status(200).json(updatedUser);
    }
    catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Failed to update user" });
    }
};
exports.updateUser = updateUser;
// DELETE a user
const deleteUser = async (req, res) => {
    const { id } = req.user;
    try {
        await client_1.default.user.delete({
            where: { id },
        });
        res.status(200).json({ message: "User account successfully deleted." });
    }
    catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Failed to delete user" });
    }
};
exports.deleteUser = deleteUser;
