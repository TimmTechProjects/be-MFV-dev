"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.setLocation = setLocation;
exports.getCurrentWeather = getCurrentWeather;
exports.getForecast = getForecast;
exports.getAlerts = getAlerts;
exports.dismissAlert = dismissAlert;
exports.getCareAdjustments = getCareAdjustments;
const weatherService = __importStar(require("../services/weatherService"));
/**
 * POST /api/weather/location
 * Set user location for weather updates
 */
async function setLocation(req, res) {
    try {
        const { userId, city, state, country, latitude, longitude, timezone } = req.body;
        if (!userId || !city || !country || latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                message: 'userId, city, country, latitude, and longitude are required',
            });
        }
        const location = await weatherService.setUserLocation(userId, {
            city,
            state,
            country,
            latitude,
            longitude,
            timezone: timezone || 'America/New_York',
        });
        return res.status(200).json(location);
    }
    catch (error) {
        console.error('Error setting location:', error);
        return res.status(500).json({
            message: 'Failed to set location',
            error: error.message,
        });
    }
}
/**
 * GET /api/weather/current/:userId
 * Get current weather for user's location
 */
async function getCurrentWeather(req, res) {
    try {
        const { userId } = req.params;
        // Get user's location
        const location = await weatherService.getUserLocation(userId);
        if (!location) {
            return res.status(404).json({
                message: 'User location not found. Please set your location first.',
            });
        }
        // Get current weather
        const weather = await weatherService.getCurrentWeather(location.latitude, location.longitude);
        return res.status(200).json({
            location: {
                city: location.city,
                state: location.state,
                country: location.country,
            },
            weather,
        });
    }
    catch (error) {
        console.error('Error fetching current weather:', error);
        return res.status(500).json({
            message: 'Failed to fetch current weather',
            error: error.message,
        });
    }
}
/**
 * GET /api/weather/forecast/:userId
 * Get 7-day weather forecast for user's location
 */
async function getForecast(req, res) {
    try {
        const { userId } = req.params;
        // Get user's location
        const location = await weatherService.getUserLocation(userId);
        if (!location) {
            return res.status(404).json({
                message: 'User location not found. Please set your location first.',
            });
        }
        // Get weather forecast
        const forecast = await weatherService.getWeatherForecast(location.latitude, location.longitude);
        return res.status(200).json({
            location: {
                city: location.city,
                state: location.state,
                country: location.country,
            },
            forecast,
        });
    }
    catch (error) {
        console.error('Error fetching forecast:', error);
        return res.status(500).json({
            message: 'Failed to fetch weather forecast',
            error: error.message,
        });
    }
}
/**
 * GET /api/weather/alerts/:userId
 * Get weather alerts for user
 */
async function getAlerts(req, res) {
    try {
        const { userId } = req.params;
        const alerts = await weatherService.getWeatherAlerts(userId);
        return res.status(200).json(alerts);
    }
    catch (error) {
        console.error('Error fetching alerts:', error);
        return res.status(500).json({
            message: 'Failed to fetch weather alerts',
            error: error.message,
        });
    }
}
/**
 * POST /api/weather/alerts/:alertId/dismiss
 * Dismiss a weather alert
 */
async function dismissAlert(req, res) {
    try {
        const { alertId } = req.params;
        const alert = await weatherService.dismissWeatherAlert(alertId);
        return res.status(200).json(alert);
    }
    catch (error) {
        console.error('Error dismissing alert:', error);
        return res.status(500).json({
            message: 'Failed to dismiss alert',
            error: error.message,
        });
    }
}
/**
 * POST /api/weather/care-adjust
 * Get care recommendations based on weather
 */
async function getCareAdjustments(req, res) {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({
                message: 'userId is required',
            });
        }
        // Get user's location
        const location = await weatherService.getUserLocation(userId);
        if (!location) {
            return res.status(404).json({
                message: 'User location not found. Please set your location first.',
            });
        }
        // Get care adjustments
        const adjustments = await weatherService.getCareAdjustments(location.latitude, location.longitude);
        // Check and create alerts if needed
        await weatherService.checkAndCreateAlerts(userId, location.latitude, location.longitude);
        return res.status(200).json({
            location: {
                city: location.city,
                state: location.state,
                country: location.country,
            },
            adjustments,
        });
    }
    catch (error) {
        console.error('Error getting care adjustments:', error);
        return res.status(500).json({
            message: 'Failed to get care adjustments',
            error: error.message,
        });
    }
}
