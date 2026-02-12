import { Router } from 'express';
import {
  setLocation,
  getCurrentWeather,
  getForecast,
  getAlerts,
  dismissAlert,
  getCareAdjustments,
} from '../controllers/weatherController';
import verifyToken from '../middleware/verifyToken';

const router = Router();

// Set user location
router.post('/location', verifyToken, (req, res, next) => {
  setLocation(req, res).catch(next);
});

// Get current weather
router.get('/current/:userId', verifyToken, (req, res, next) => {
  getCurrentWeather(req, res).catch(next);
});

// Get 7-day forecast
router.get('/forecast/:userId', verifyToken, (req, res, next) => {
  getForecast(req, res).catch(next);
});

// Get weather alerts
router.get('/alerts/:userId', verifyToken, (req, res, next) => {
  getAlerts(req, res).catch(next);
});

// Dismiss alert
router.post('/alerts/:alertId/dismiss', verifyToken, (req, res, next) => {
  dismissAlert(req, res).catch(next);
});

// Get care adjustments based on weather
router.post('/care-adjust', verifyToken, (req, res, next) => {
  getCareAdjustments(req, res).catch(next);
});

export default router;
