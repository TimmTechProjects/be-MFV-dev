"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSuggestionTags = exports.getAllTags = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const getAllTags = async () => {
    return await client_1.default.tag.findMany();
};
exports.getAllTags = getAllTags;
const getAllSuggestionTags = async (query) => {
    return await client_1.default.tag.findMany({
        where: {
            name: {
                contains: query,
                mode: "insensitive",
            },
        },
        take: 10,
    });
};
exports.getAllSuggestionTags = getAllSuggestionTags;
