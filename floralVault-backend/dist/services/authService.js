"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewUser = exports.loginUserById = exports.checkForExistingEmail = exports.checkForExistingUsername = exports.signJWT = void 0;
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
