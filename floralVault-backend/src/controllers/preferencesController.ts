import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getPreferences(req: Request, res: Response) {
  const { userId } = req.params;

  const prefs = await prisma.userPreference.findUnique({
    where: { userId },
  });

  if (!prefs) {
    const defaultPrefs = await prisma.userPreference.create({
      data: { userId },
    });
    return res.json(defaultPrefs);
  }

  return res.json(prefs);
}

export async function updatePreferences(req: Request, res: Response) {
  const { userId } = req.params;
  const {
    theme,
    language,
    emailNotifications,
    pushNotifications,
    careReminders,
    reminderTime,
    timezone,
  } = req.body;

  const prefs = await prisma.userPreference.upsert({
    where: { userId },
    update: {
      ...(theme !== undefined && { theme }),
      ...(language !== undefined && { language }),
      ...(emailNotifications !== undefined && { emailNotifications }),
      ...(pushNotifications !== undefined && { pushNotifications }),
      ...(careReminders !== undefined && { careReminders }),
      ...(reminderTime !== undefined && { reminderTime }),
      ...(timezone !== undefined && { timezone }),
    },
    create: {
      userId,
      ...(theme !== undefined && { theme }),
      ...(language !== undefined && { language }),
      ...(emailNotifications !== undefined && { emailNotifications }),
      ...(pushNotifications !== undefined && { pushNotifications }),
      ...(careReminders !== undefined && { careReminders }),
      ...(reminderTime !== undefined && { reminderTime }),
      ...(timezone !== undefined && { timezone }),
    },
  });

  return res.json(prefs);
}
