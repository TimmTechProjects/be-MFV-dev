import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Push subscription endpoints
export async function subscribeToPush(req: Request, res: Response) {
  const { userId, subscription } = req.body;

  if (!userId || !subscription || !subscription.endpoint) {
    return res.status(400).json({ message: 'userId and subscription are required' });
  }

  try {
    const pushSubscription = await prisma.pushSubscription.upsert({
      where: {
        userId_endpoint: {
          userId,
          endpoint: subscription.endpoint,
        },
      },
      create: {
        userId,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        userAgent: req.headers['user-agent'] || null,
      },
      update: {
        keys: subscription.keys,
        userAgent: req.headers['user-agent'] || null,
      },
    });

    return res.status(201).json(pushSubscription);
  } catch (error) {
    console.error('Error subscribing to push:', error);
    return res.status(500).json({ message: 'Failed to subscribe to push notifications' });
  }
}

export async function unsubscribeFromPush(req: Request, res: Response) {
  const { userId, endpoint } = req.body;

  if (!userId || !endpoint) {
    return res.status(400).json({ message: 'userId and endpoint are required' });
  }

  try {
    await prisma.pushSubscription.deleteMany({
      where: {
        userId,
        endpoint,
      },
    });

    return res.status(204).send();
  } catch (error) {
    console.error('Error unsubscribing from push:', error);
    return res.status(500).json({ message: 'Failed to unsubscribe from push notifications' });
  }
}

export async function getPushSubscriptions(req: Request, res: Response) {
  const { userId } = req.params;

  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    return res.json(subscriptions);
  } catch (error) {
    console.error('Error getting push subscriptions:', error);
    return res.status(500).json({ message: 'Failed to get push subscriptions' });
  }
}

// Notification preferences endpoints
export async function getNotificationPreferences(req: Request, res: Response) {
  const { userId } = req.params;

  try {
    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    // Create default preferences if none exist
    if (!preferences) {
      preferences = await prisma.notificationPreference.create({
        data: {
          userId,
          pushEnabled: false,
          emailEnabled: true,
          enabledTypes: ['water', 'fertilize', 'pruning'],
        },
      });
    }

    return res.json(preferences);
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return res.status(500).json({ message: 'Failed to get notification preferences' });
  }
}

export async function updateNotificationPreferences(req: Request, res: Response) {
  const { userId } = req.params;
  const { pushEnabled, emailEnabled, quietStart, quietEnd, enabledTypes } = req.body;

  try {
    const preferences = await prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        pushEnabled: pushEnabled ?? false,
        emailEnabled: emailEnabled ?? true,
        quietStart,
        quietEnd,
        enabledTypes: enabledTypes ?? [],
      },
      update: {
        ...(pushEnabled !== undefined && { pushEnabled }),
        ...(emailEnabled !== undefined && { emailEnabled }),
        ...(quietStart !== undefined && { quietStart }),
        ...(quietEnd !== undefined && { quietEnd }),
        ...(enabledTypes !== undefined && { enabledTypes }),
      },
    });

    return res.json(preferences);
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return res.status(500).json({ message: 'Failed to update notification preferences' });
  }
}
