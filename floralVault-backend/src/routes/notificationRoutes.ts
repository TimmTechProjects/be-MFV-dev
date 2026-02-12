import { Router } from 'express';
import {
  subscribeToPush,
  unsubscribeFromPush,
  getPushSubscriptions,
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../controllers/notificationController';
import verifyToken from '../middleware/verifyToken';

const router = Router();

// Push subscription routes
router.post('/push/subscribe', verifyToken, (req, res, next) => {
  subscribeToPush(req, res).catch(next);
});

router.post('/push/unsubscribe', verifyToken, (req, res, next) => {
  unsubscribeFromPush(req, res).catch(next);
});

router.get('/push/subscriptions/:userId', verifyToken, (req, res, next) => {
  getPushSubscriptions(req, res).catch(next);
});

// Notification preferences routes
router.get('/preferences/:userId', verifyToken, (req, res, next) => {
  getNotificationPreferences(req, res).catch(next);
});

router.put('/preferences/:userId', verifyToken, (req, res, next) => {
  updateNotificationPreferences(req, res).catch(next);
});

export default router;
