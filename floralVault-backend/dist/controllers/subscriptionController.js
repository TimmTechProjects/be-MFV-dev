"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhook = exports.upgrade = exports.cancel = exports.getStatus = exports.createCheckout = exports.getConfig = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const stripeService_1 = require("../services/stripeService");
const stripeService_2 = __importDefault(require("../services/stripeService"));
/**
 * GET /api/subscriptions/config
 * Get Stripe publishable key for frontend
 */
const getConfig = async (req, res) => {
    try {
        const publishableKey = (0, stripeService_1.getStripePublishableKey)();
        res.json({ publishableKey });
    }
    catch (error) {
        console.error('Error getting Stripe config:', error);
        res.status(500).json({ error: 'Failed to get Stripe configuration' });
    }
};
exports.getConfig = getConfig;
/**
 * POST /api/subscriptions/checkout
 * Create a checkout session
 */
const createCheckout = async (req, res) => {
    try {
        const { userId, plan, isAnnual } = req.body;
        // Validate input
        if (!userId || !plan || !['pro', 'premium'].includes(plan)) {
            res.status(400).json({ error: 'Invalid plan or userId' });
            return;
        }
        // Get user details
        const user = await client_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        // Create checkout session
        const session = await (0, stripeService_1.createCheckoutSession)(userId, plan, isAnnual, user.email, `${user.firstName} ${user.lastName}`, `${process.env.FRONTEND_URL}/membership?success=true`, `${process.env.FRONTEND_URL}/membership?canceled=true`);
        res.json({ sessionId: session.id, url: session.url });
    }
    catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
};
exports.createCheckout = createCheckout;
/**
 * GET /api/subscriptions/:userId
 * Get subscription status for a user
 */
const getStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const subscription = await (0, stripeService_1.getSubscriptionStatus)(userId);
        const user = await client_1.default.user.findUnique({
            where: { id: userId },
            select: { plan: true },
        });
        res.json({
            subscription,
            currentPlan: user?.plan || 'free',
        });
    }
    catch (error) {
        console.error('Error getting subscription status:', error);
        res.status(500).json({ error: 'Failed to get subscription status' });
    }
};
exports.getStatus = getStatus;
/**
 * DELETE /api/subscriptions/:userId
 * Cancel a subscription
 */
const cancel = async (req, res) => {
    try {
        const { userId } = req.params;
        await (0, stripeService_1.cancelSubscription)(userId);
        res.json({ message: 'Subscription canceled successfully' });
    }
    catch (error) {
        console.error('Error canceling subscription:', error);
        res.status(500).json({ error: error.message || 'Failed to cancel subscription' });
    }
};
exports.cancel = cancel;
/**
 * POST /api/subscriptions/:userId/upgrade
 * Upgrade or change subscription plan
 */
const upgrade = async (req, res) => {
    try {
        const { userId } = req.params;
        const { newPlan } = req.body;
        if (!newPlan || !['pro', 'premium'].includes(newPlan)) {
            res.status(400).json({ error: 'Invalid plan' });
            return;
        }
        const updated = await (0, stripeService_1.upgradeSubscription)(userId, newPlan);
        res.json({ message: 'Subscription updated successfully', subscription: updated });
    }
    catch (error) {
        console.error('Error upgrading subscription:', error);
        res.status(500).json({ error: error.message || 'Failed to upgrade subscription' });
    }
};
exports.upgrade = upgrade;
/**
 * POST /api/subscriptions/webhook
 * Handle Stripe webhook events
 */
const webhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        res.status(400).json({ error: 'Webhook secret not configured' });
        return;
    }
    try {
        const event = (0, stripeService_2.default)().webhooks.constructEvent(req.body, sig, webhookSecret);
        // Handle the event
        await (0, stripeService_1.handleWebhookEvent)(event);
        res.json({ received: true });
    }
    catch (error) {
        console.error('Webhook signature verification failed:', error);
        res.status(400).json({ error: error.message });
    }
};
exports.webhook = webhook;
