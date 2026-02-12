"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlantLikeCount = exports.getPlantLikeStatus = exports.togglePlantLike = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const togglePlantLike = async (userId, plantId) => {
    const existing = await client_1.default.plantLike.findUnique({
        where: {
            userId_plantId: { userId, plantId },
        },
    });
    if (existing) {
        await client_1.default.plantLike.delete({
            where: { id: existing.id },
        });
        await client_1.default.plant.update({
            where: { id: plantId },
            data: { likes: { decrement: 1 } },
        });
        return { liked: false };
    }
    await client_1.default.plantLike.create({
        data: { userId, plantId },
    });
    await client_1.default.plant.update({
        where: { id: plantId },
        data: { likes: { increment: 1 } },
    });
    return { liked: true };
};
exports.togglePlantLike = togglePlantLike;
const getPlantLikeStatus = async (userId, plantId) => {
    const existing = await client_1.default.plantLike.findUnique({
        where: {
            userId_plantId: { userId, plantId },
        },
    });
    return { liked: !!existing };
};
exports.getPlantLikeStatus = getPlantLikeStatus;
const getPlantLikeCount = async (plantId) => {
    const count = await client_1.default.plantLike.count({
        where: { plantId },
    });
    return { count };
};
exports.getPlantLikeCount = getPlantLikeCount;
