"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchDB = void 0;
const searchService_1 = require("../services/searchService");
const searchDB = async (req, res) => {
    const { q } = req.query;
    if (!q || typeof q !== "string") {
        res.status(400).json({ message: "Query required" });
        return;
    }
    try {
        const { plants, users, collections } = await (0, searchService_1.querySearch)(q);
        res.status(200).json({ plants, users, collections });
        return;
    }
    catch (error) {
        console.error("Error fetching data", error);
    }
};
exports.searchDB = searchDB;
