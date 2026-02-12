"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWebhookEvent = exports.upgradeSubscription = exports.cancelSubscription = exports.getSubscriptionStatus = exports.createCheckoutSession = exports.getOrCreateStripeCustomer = exports.getStripePublishableKey = void 0;
const stripe_1 = __importDefault(require("stripe"));
const client_1 = __importDefault(require("../prisma/client"));
let _stripe = null;
function getStripe() {
    if (!_stripe) {
        const key = process.env.STRIPE_SECRET_KEY;
        if (!key) {
            throw new Error('STRIPE_SECRET_KEY is not configured. Set it in your environment variables.');
        }
        _stripe = new stripe_1.default(key, {
            apiVersion: '2026-01-28.clover',
        });
    }
    return _stripe;
}
const getStripePublishableKey = () => {
    return process.env.STRIPE_PUBLISHABLE_KEY;
};
exports.getStripePublishableKey = getStripePublishableKey;
// Price IDs mapping (configure these in Stripe and add to .env)
const PRICE_IDS = {
    free: '', // Free tier has no price ID
    pro: process.env.STRIPE_PRICE_ID_PRO || '',
    premium: process.env.STRIPE_PRICE_ID_PREMIUM || '',
};
/**
 * Get or create a Stripe customer for a user
 */
const getOrCreateStripeCustomer = async (userId, email, name) => {
    try {
        // Check if customer already exists in database
        let customer = await client_1.default.stripeCustomer.findUnique({
            where: { userId },
        });
        if (customer) {
            return customer.stripeCustomerId;
        }
        // Create new Stripe customer
        const stripeCustomer = await getStripe().customers.create({
            email,
            name,
            metadata: {
                userId,
            },
        });
        // Save to database
        await client_1.default.stripeCustomer.create({
            data: {
                stripeCustomerId: stripeCustomer.id,
                userId,
            },
        });
        return stripeCustomer.id;
    }
    catch (error) {
        console.error('Error getting or creating Stripe customer:', error);
        throw error;
    }
};
exports.getOrCreateStripeCustomer = getOrCreateStripeCustomer;
/**
 * Create a checkout session for subscription
 */
const createCheckoutSession = async (userId, plan, isAnnual, email, name, successUrl, cancelUrl) => {
    try {
        const customerId = await (0, exports.getOrCreateStripeCustomer)(userId, email, name);
        const priceId = PRICE_IDS[plan];
        if (!priceId) {
            throw new Error(`No price ID configured for plan: ${plan}`);
        }
        const session = await getStripe().checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            billing_address_collection: 'required',
            mode: 'subscription',
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                userId,
                plan,
            },
        });
        return session;
    }
    catch (error) {
        console.error('Error creating checkout session:', error);
        throw error;
    }
};
exports.createCheckoutSession = createCheckoutSession;
/**
 * Get subscription status for a user
 */
const getSubscriptionStatus = async (userId) => {
    try {
        const subscriptions = await client_1.default.subscription.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 1,
        });
        if (subscriptions.length === 0) {
            return null;
        }
        return subscriptions[0];
    }
    catch (error) {
        console.error('Error getting subscription status:', error);
        throw error;
    }
};
exports.getSubscriptionStatus = getSubscriptionStatus;
/**
 * Cancel a subscription
 */
const cancelSubscription = async (userId) => {
    try {
        const subscription = await client_1.default.subscription.findFirst({
            where: {
                userId,
                status: 'active',
            },
        });
        if (!subscription) {
            throw new Error('No active subscription found');
        }
        // Cancel in Stripe
        const canceled = await getStripe().subscriptions.update(subscription.stripeSubscriptionId, { cancel_at_period_end: true });
        // Update database
        await client_1.default.subscription.update({
            where: { id: subscription.id },
            data: {
                cancelAtPeriodEnd: true,
            },
        });
        return canceled;
    }
    catch (error) {
        console.error('Error canceling subscription:', error);
        throw error;
    }
};
exports.cancelSubscription = cancelSubscription;
/**
 * Upgrade/change subscription plan
 */
const upgradeSubscription = async (userId, newPlan) => {
    try {
        const subscription = await client_1.default.subscription.findFirst({
            where: {
                userId,
                status: 'active',
            },
        });
        if (!subscription) {
            throw new Error('No active subscription found');
        }
        const newPriceId = PRICE_IDS[newPlan];
        if (!newPriceId) {
            throw new Error(`No price ID configured for plan: ${newPlan}`);
        }
        // Update subscription in Stripe
        const updated = await getStripe().subscriptions.update(subscription.stripeSubscriptionId, {
            items: [
                {
                    id: subscription.priceId,
                    price: newPriceId,
                },
            ],
        });
        // Update database
        await client_1.default.subscription.update({
            where: { id: subscription.id },
            data: {
                plan: newPlan,
            },
        });
        return updated;
    }
    catch (error) {
        console.error('Error upgrading subscription:', error);
        throw error;
    }
};
exports.upgradeSubscription = upgradeSubscription;
/**
 * Handle Stripe webhook events
 */
const handleWebhookEvent = async (event) => {
    try {
        // Store event in database to avoid duplicate processing
        const existingEvent = await client_1.default.stripeEvent.findUnique({
            where: { stripeEventId: event.id },
        });
        if (existingEvent && existingEvent.processed) {
            console.log('Event already processed:', event.id);
            return;
        }
        // Handle different event types
        switch (event.type) {
            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object);
                break;
            case 'invoice.payment_succeeded':
                await handlePaymentSucceeded(event.data.object);
                break;
            case 'invoice.payment_failed':
                await handlePaymentFailed(event.data.object);
                break;
            default:
                console.log('Unhandled event type:', event.type);
        }
        // Mark event as processed
        await client_1.default.stripeEvent.upsert({
            where: { stripeEventId: event.id },
            update: { processed: true },
            create: {
                stripeEventId: event.id,
                type: event.type,
                data: JSON.stringify(event.data),
                processed: true,
            },
        });
    }
    catch (error) {
        console.error('Error handling webhook event:', error);
        throw error;
    }
};
exports.handleWebhookEvent = handleWebhookEvent;
/**
 * Handle subscription updated event
 */
const handleSubscriptionUpdated = async (subscription) => {
    try {
        const userId = subscription.metadata?.userId;
        if (!userId) {
            console.error('No userId in subscription metadata');
            return;
        }
        const plan = (subscription.metadata?.plan || 'pro');
        const sub = subscription;
        const currentPeriodStart = new Date((sub.current_period_start || 0) * 1000);
        const currentPeriodEnd = new Date((sub.current_period_end || 0) * 1000);
        await client_1.default.subscription.upsert({
            where: { stripeSubscriptionId: subscription.id },
            update: {
                status: subscription.status,
                currentPeriodStart,
                currentPeriodEnd,
                canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : null,
                trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
            },
            create: {
                stripeSubscriptionId: subscription.id,
                userId,
                plan,
                status: subscription.status,
                currentPeriodStart,
                currentPeriodEnd,
                trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
                priceId: subscription.items.data[0]?.price.id || '',
            },
        });
        // Update user plan if subscription is active
        if (subscription.status === 'active') {
            await client_1.default.user.update({
                where: { id: userId },
                data: { plan },
            });
        }
    }
    catch (error) {
        console.error('Error handling subscription updated:', error);
        throw error;
    }
};
/**
 * Handle subscription deleted event
 */
const handleSubscriptionDeleted = async (subscription) => {
    try {
        const userId = subscription.metadata?.userId;
        if (!userId) {
            console.error('No userId in subscription metadata');
            return;
        }
        await client_1.default.subscription.update({
            where: { stripeSubscriptionId: subscription.id },
            data: {
                status: 'canceled',
                canceledAt: new Date(),
            },
        });
        // Downgrade user to free plan
        await client_1.default.user.update({
            where: { id: userId },
            data: { plan: 'free' },
        });
    }
    catch (error) {
        console.error('Error handling subscription deleted:', error);
        throw error;
    }
};
/**
 * Handle payment succeeded event
 */
const handlePaymentSucceeded = async (invoice) => {
    try {
        const inv = invoice;
        const subscriptionId = inv.subscription;
        if (!subscriptionId)
            return;
        console.log('Payment succeeded for subscription:', subscriptionId);
        // Additional logic can be added here (e.g., send email, etc.)
    }
    catch (error) {
        console.error('Error handling payment succeeded:', error);
        throw error;
    }
};
/**
 * Handle payment failed event
 */
const handlePaymentFailed = async (invoice) => {
    try {
        const inv = invoice;
        const subscriptionId = inv.subscription;
        if (!subscriptionId)
            return;
        console.log('Payment failed for subscription:', subscriptionId);
        // Additional logic can be added here (e.g., send notification, etc.)
    }
    catch (error) {
        console.error('Error handling payment failed:', error);
        throw error;
    }
};
exports.default = getStripe;
