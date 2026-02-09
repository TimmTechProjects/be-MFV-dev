"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subscriptionController_1 = require("../controllers/subscriptionController");
const router = (0, express_1.Router)();
/**
 * GET /api/subscriptions/config
 * Get Stripe publishable key
 */
router.get('/config', (req, res, next) => {
    (0, subscriptionController_1.getConfig)(req, res).catch(next);
});
/**
 * POST /api/subscriptions/checkout
 * Create checkout session
 * Body: { userId, plan: 'pro'|'premium', isAnnual: boolean }
 */
router.post('/checkout', (req, res, next) => {
    (0, subscriptionController_1.createCheckout)(req, res).catch(next);
});
/**
 * GET /api/subscriptions/:userId
 * Get subscription status for a user
 */
router.get('/:userId', (req, res, next) => {
    (0, subscriptionController_1.getStatus)(req, res).catch(next);
});
/**
 * DELETE /api/subscriptions/:userId
 * Cancel subscription
 */
router.delete('/:userId', (req, res, next) => {
    (0, subscriptionController_1.cancel)(req, res).catch(next);
});
/**
 * POST /api/subscriptions/:userId/upgrade
 * Upgrade subscription plan
 * Body: { newPlan: 'pro'|'premium' }
 */
router.post('/:userId/upgrade', (req, res, next) => {
    (0, subscriptionController_1.upgrade)(req, res).catch(next);
});
// NOTE: Webhook is registered in main index.ts before JSON parsing
// Route: POST /api/subscriptions/webhook
exports.default = router;
