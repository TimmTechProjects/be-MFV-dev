"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTraitsGrouped = exports.getTraits = void 0;
const traitService_1 = require("../services/traitService");
const getTraits = async (_req, res) => {
    try {
        const traits = await (0, traitService_1.getAllTraits)();
        res.status(200).json(traits);
    }
    catch (error) {
        console.error("Error fetching traits:", error);
        res.status(500).json({ message: "Failed to fetch traits" });
    }
};
exports.getTraits = getTraits;
const getTraitsGrouped = async (_req, res) => {
    try {
        const grouped = await (0, traitService_1.getTraitsGroupedByCategory)();
        res.status(200).json(grouped);
    }
    catch (error) {
        console.error("Error fetching grouped traits:", error);
        res.status(500).json({ message: "Failed to fetch grouped traits" });
    }
};
exports.getTraitsGrouped = getTraitsGrouped;
