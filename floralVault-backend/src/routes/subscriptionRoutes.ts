import { Router } from 'express';
import {
  getConfig,
  createCheckout,
  getStatus,
  cancel,
  upgrade,
} from '../controllers/subscriptionController';

const router = Router();

/**
 * GET /api/subscriptions/config
 * Get Stripe publishable key
 */
router.get('/config', (req, res, next) => {
  getConfig(req, res).catch(next);
});

/**
 * POST /api/subscriptions/checkout
 * Create checkout session
 * Body: { userId, plan: 'pro'|'premium', isAnnual: boolean }
 */
router.post('/checkout', (req, res, next) => {
  createCheckout(req, res).catch(next);
});

/**
 * GET /api/subscriptions/:userId
 * Get subscription status for a user
 */
router.get('/:userId', (req, res, next) => {
  getStatus(req, res).catch(next);
});

/**
 * DELETE /api/subscriptions/:userId
 * Cancel subscription
 */
router.delete('/:userId', (req, res, next) => {
  cancel(req, res).catch(next);
});

/**
 * POST /api/subscriptions/:userId/upgrade
 * Upgrade subscription plan
 * Body: { newPlan: 'pro'|'premium' }
 */
router.post('/:userId/upgrade', (req, res, next) => {
  upgrade(req, res).catch(next);
});

// NOTE: Webhook is registered in main index.ts before JSON parsing
// Route: POST /api/subscriptions/webhook

export default router;
