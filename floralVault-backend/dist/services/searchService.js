"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.querySearch = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const querySearch = async (q) => {
    const [plants, users, collections] = await Promise.all([
        client_1.default.plant.findMany({
            where: {
                OR: [
                    { commonName: { contains: q, mode: "insensitive" } },
                    { botanicalName: { contains: q, mode: "insensitive" } },
                    { description: { contains: q, mode: "insensitive" } },
                    {
                        tags: {
                            some: { name: { contains: q, mode: "insensitive" } },
                        },
                    },
                ],
            },
            include: {
                tags: true,
                user: { select: { username: true } },
                images: true,
            },
            take: 5,
            orderBy: { createdAt: "desc" },
        }),
        client_1.default.user.findMany({
            where: {
                OR: [
                    { username: { contains: q, mode: "insensitive" } },
                    { firstName: { contains: q, mode: "insensitive" } },
                    { lastName: { contains: q, mode: "insensitive" } },
                ],
            },
            select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
            },
            take: 5,
        }),
        client_1.default.collection.findMany({
            where: {
                OR: [
                    { name: { contains: q, mode: "insensitive" } },
                    { description: { contains: q, mode: "insensitive" } },
                ],
            },
            include: {
                user: { select: { username: true } },
            },
            take: 5,
            orderBy: { createdAt: "desc" },
        }),
    ]);
    // ✅ Return as an object now:
    return { plants, users, collections };
};
exports.querySearch = querySearch;
