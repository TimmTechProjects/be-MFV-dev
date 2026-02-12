"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const weatherController_1 = require("../controllers/weatherController");
const verifyToken_1 = __importDefault(require("../middleware/verifyToken"));
const router = (0, express_1.Router)();
// Set user location
router.post('/location', verifyToken_1.default, (req, res, next) => {
    (0, weatherController_1.setLocation)(req, res).catch(next);
});
// Get current weather
router.get('/current/:userId', verifyToken_1.default, (req, res, next) => {
    (0, weatherController_1.getCurrentWeather)(req, res).catch(next);
});
// Get 7-day forecast
router.get('/forecast/:userId', verifyToken_1.default, (req, res, next) => {
    (0, weatherController_1.getForecast)(req, res).catch(next);
});
// Get weather alerts
router.get('/alerts/:userId', verifyToken_1.default, (req, res, next) => {
    (0, weatherController_1.getAlerts)(req, res).catch(next);
});
// Dismiss alert
router.post('/alerts/:alertId/dismiss', verifyToken_1.default, (req, res, next) => {
    (0, weatherController_1.dismissAlert)(req, res).catch(next);
});
// Get care adjustments based on weather
router.post('/care-adjust', verifyToken_1.default, (req, res, next) => {
    (0, weatherController_1.getCareAdjustments)(req, res).catch(next);
});
exports.default = router;
