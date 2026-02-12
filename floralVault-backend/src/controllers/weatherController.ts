import { Request, Response } from 'express';
import * as weatherService from '../services/weatherService';

/**
 * POST /api/weather/location
 * Set user location for weather updates
 */
export async function setLocation(req: Request, res: Response) {
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
  } catch (error: any) {
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
export async function getCurrentWeather(req: Request, res: Response) {
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
    const weather = await weatherService.getCurrentWeather(
      location.latitude,
      location.longitude
    );

    return res.status(200).json({
      location: {
        city: location.city,
        state: location.state,
        country: location.country,
      },
      weather,
    });
  } catch (error: any) {
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
export async function getForecast(req: Request, res: Response) {
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
    const forecast = await weatherService.getWeatherForecast(
      location.latitude,
      location.longitude
    );

    return res.status(200).json({
      location: {
        city: location.city,
        state: location.state,
        country: location.country,
      },
      forecast,
    });
  } catch (error: any) {
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
export async function getAlerts(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    const alerts = await weatherService.getWeatherAlerts(userId);

    return res.status(200).json(alerts);
  } catch (error: any) {
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
export async function dismissAlert(req: Request, res: Response) {
  try {
    const { alertId } = req.params;

    const alert = await weatherService.dismissWeatherAlert(alertId);

    return res.status(200).json(alert);
  } catch (error: any) {
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
export async function getCareAdjustments(req: Request, res: Response) {
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
    const adjustments = await weatherService.getCareAdjustments(
      location.latitude,
      location.longitude
    );

    // Check and create alerts if needed
    await weatherService.checkAndCreateAlerts(
      userId,
      location.latitude,
      location.longitude
    );

    return res.status(200).json({
      location: {
        city: location.city,
        state: location.state,
        country: location.country,
      },
      adjustments,
    });
  } catch (error: any) {
    console.error('Error getting care adjustments:', error);
    return res.status(500).json({
      message: 'Failed to get care adjustments',
      error: error.message,
    });
  }
}
