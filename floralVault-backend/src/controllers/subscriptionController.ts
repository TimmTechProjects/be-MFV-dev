import { Request, Response } from 'express';
import prisma from '../prisma/client';
import {
  createCheckoutSession,
  getSubscriptionStatus,
  cancelSubscription,
  upgradeSubscription,
  handleWebhookEvent,
  getStripePublishableKey,
} from '../services/stripeService';
import getStripe from '../services/stripeService';
import Stripe from 'stripe';

/**
 * GET /api/subscriptions/config
 * Get Stripe publishable key for frontend
 */
export const getConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const publishableKey = getStripePublishableKey();
    res.json({ publishableKey });
  } catch (error) {
    console.error('Error getting Stripe config:', error);
    res.status(500).json({ error: 'Failed to get Stripe configuration' });
  }
};

/**
 * POST /api/subscriptions/checkout
 * Create a checkout session
 */
export const createCheckout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, plan, isAnnual } = req.body;

    // Validate input
    if (!userId || !plan || !['pro', 'premium'].includes(plan)) {
      res.status(400).json({ error: 'Invalid plan or userId' });
      return;
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Create checkout session
    const session = await createCheckoutSession(
      userId,
      plan,
      isAnnual,
      user.email,
      `${user.firstName} ${user.lastName}`,
      `${process.env.FRONTEND_URL}/membership?success=true`,
      `${process.env.FRONTEND_URL}/membership?canceled=true`
    );

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
};

/**
 * GET /api/subscriptions/:userId
 * Get subscription status for a user
 */
export const getStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const subscription = await getSubscriptionStatus(userId);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    res.json({
      subscription,
      currentPlan: user?.plan || 'free',
    });
  } catch (error) {
    console.error('Error getting subscription status:', error);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
};

/**
 * DELETE /api/subscriptions/:userId
 * Cancel a subscription
 */
export const cancel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    await cancelSubscription(userId);
    res.json({ message: 'Subscription canceled successfully' });
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: error.message || 'Failed to cancel subscription' });
  }
};

/**
 * POST /api/subscriptions/:userId/upgrade
 * Upgrade or change subscription plan
 */
export const upgrade = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { newPlan } = req.body;

    if (!newPlan || !['pro', 'premium'].includes(newPlan)) {
      res.status(400).json({ error: 'Invalid plan' });
      return;
    }

    const updated = await upgradeSubscription(userId, newPlan);
    res.json({ message: 'Subscription updated successfully', subscription: updated });
  } catch (error: any) {
    console.error('Error upgrading subscription:', error);
    res.status(500).json({ error: error.message || 'Failed to upgrade subscription' });
  }
};

/**
 * POST /api/subscriptions/webhook
 * Handle Stripe webhook events
 */
export const webhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    res.status(400).json({ error: 'Webhook secret not configured' });
    return;
  }

  try {
    const event = getStripe().webhooks.constructEvent(req.body, sig, webhookSecret);

    // Handle the event
    await handleWebhookEvent(event);

    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error);
    res.status(400).json({ error: error.message });
  }
};
