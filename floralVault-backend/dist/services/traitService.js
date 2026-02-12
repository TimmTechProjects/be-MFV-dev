"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTraitsBySlugs = exports.getTraitsGroupedByCategory = exports.getAllTraits = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const getAllTraits = async () => {
    return client_1.default.trait.findMany({
        orderBy: [{ category: "asc" }, { name: "asc" }],
    });
};
exports.getAllTraits = getAllTraits;
const getTraitsGroupedByCategory = async () => {
    const traits = await client_1.default.trait.findMany({
        orderBy: [{ category: "asc" }, { name: "asc" }],
    });
    const grouped = {};
    for (const trait of traits) {
        if (!grouped[trait.category]) {
            grouped[trait.category] = [];
        }
        grouped[trait.category].push(trait);
    }
    return grouped;
};
exports.getTraitsGroupedByCategory = getTraitsGroupedByCategory;
const getTraitsBySlugs = async (slugs) => {
    return client_1.default.trait.findMany({
        where: { slug: { in: slugs } },
    });
};
exports.getTraitsBySlugs = getTraitsBySlugs;
