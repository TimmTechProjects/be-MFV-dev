"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHomepage = void 0;
const statsService_1 = require("../services/statsService");
const getHomepage = async (req, res) => {
    try {
        const stats = await (0, statsService_1.getHomepageStats)();
        res.status(200).json({
            success: true,
            data: stats,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error("Error fetching homepage stats:", error);
        res.status(500).json({
            error: "Failed to fetch homepage statistics",
            message: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
exports.getHomepage = getHomepage;
