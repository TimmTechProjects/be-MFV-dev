import prisma from '../config/prisma';

export interface CreateJournalEntryData {
  plantId: string;
  userId: string;
  title?: string;
  notes?: string;
  photos?: string[];
  measurements?: {
    height?: number;
    width?: number;
    healthScore?: number;
  };
  conditions?: {
    temperature?: number;
    humidity?: number;
    lightLevel?: string;
  };
  activities?: string[];
  date?: Date;
}

export interface UpdateJournalEntryData {
  title?: string;
  notes?: string;
  photos?: string[];
  measurements?: object;
  conditions?: object;
  activities?: string[];
  date?: Date;
}

class JournalService {
  // Create a new journal entry
  async createEntry(data: CreateJournalEntryData) {
    try {
      const entry = await prisma.journalEntry.create({
        data: {
          plantId: data.plantId,
          userId: data.userId,
          title: data.title,
          notes: data.notes,
          photos: data.photos || [],
          measurements: data.measurements || {},
          conditions: data.conditions || {},
          activities: data.activities || [],
          date: data.date || new Date(),
        },
        include: {
          plant: {
            select: {
              id: true,
              commonName: true,
              botanicalName: true,
            },
          },
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      });

      // Update diary stats
      await this.updateDiaryStats(data.plantId);

      return entry;
    } catch (error) {
      throw new Error(`Failed to create journal entry: ${error}`);
    }
  }

  // Get all entries for a plant
  async getEntriesByPlant(plantId: string, userId: string) {
    try {
      const entries = await prisma.journalEntry.findMany({
        where: {
          plantId,
          OR: [
            { userId },
            {
              plant: {
                isPublic: true,
              },
            },
          ],
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      });

      return entries;
    } catch (error) {
      throw new Error(`Failed to fetch journal entries: ${error}`);
    }
  }

  // Get timeline view (sorted by date)
  async getTimeline(plantId: string, userId: string) {
    try {
      const entries = await this.getEntriesByPlant(plantId, userId);
      
      // Group entries by month/year
      const timeline = entries.reduce((acc: any, entry) => {
        const date = new Date(entry.date);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(entry);
        
        return acc;
      }, {});

      return timeline;
    } catch (error) {
      throw new Error(`Failed to fetch timeline: ${error}`);
    }
  }

  // Get entry by ID
  async getEntryById(id: string, userId: string) {
    try {
      const entry = await prisma.journalEntry.findFirst({
        where: {
          id,
          OR: [
            { userId },
            {
              plant: {
                isPublic: true,
              },
            },
          ],
        },
        include: {
          plant: {
            select: {
              id: true,
              commonName: true,
              botanicalName: true,
              isPublic: true,
            },
          },
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      });

      if (!entry) {
        throw new Error('Journal entry not found or access denied');
      }

      return entry;
    } catch (error) {
      throw new Error(`Failed to fetch journal entry: ${error}`);
    }
  }

  // Update entry
  async updateEntry(id: string, userId: string, data: UpdateJournalEntryData) {
    try {
      // Check ownership
      const existing = await prisma.journalEntry.findUnique({
        where: { id },
      });

      if (!existing || existing.userId !== userId) {
        throw new Error('Journal entry not found or access denied');
      }

      const updated = await prisma.journalEntry.update({
        where: { id },
        data: {
          title: data.title,
          notes: data.notes,
          photos: data.photos,
          measurements: data.measurements,
          conditions: data.conditions,
          activities: data.activities,
          date: data.date,
        },
        include: {
          plant: {
            select: {
              id: true,
              commonName: true,
              botanicalName: true,
            },
          },
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      });

      return updated;
    } catch (error) {
      throw new Error(`Failed to update journal entry: ${error}`);
    }
  }

  // Delete entry
  async deleteEntry(id: string, userId: string) {
    try {
      // Check ownership
      const existing = await prisma.journalEntry.findUnique({
        where: { id },
      });

      if (!existing || existing.userId !== userId) {
        throw new Error('Journal entry not found or access denied');
      }

      await prisma.journalEntry.delete({
        where: { id },
      });

      // Update diary stats
      await this.updateDiaryStats(existing.plantId);

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete journal entry: ${error}`);
    }
  }

  // Get or create grow diary for a plant
  async getOrCreateDiary(plantId: string, userId: string) {
    try {
      let diary = await prisma.growDiary.findUnique({
        where: { plantId },
        include: {
          plant: {
            select: {
              id: true,
              commonName: true,
              botanicalName: true,
              userId: true,
            },
          },
        },
      });

      if (!diary) {
        // Create new diary
        diary = await prisma.growDiary.create({
          data: {
            plantId,
            userId,
            startDate: new Date(),
            currentStage: 'seedling',
            isPublic: false,
            stats: {},
          },
          include: {
            plant: {
              select: {
                id: true,
                commonName: true,
                botanicalName: true,
                userId: true,
              },
            },
          },
        });
      }

      return diary;
    } catch (error) {
      throw new Error(`Failed to get/create grow diary: ${error}`);
    }
  }

  // Update diary stats
  async updateDiaryStats(plantId: string) {
    try {
      const entries = await prisma.journalEntry.findMany({
        where: { plantId },
        orderBy: { date: 'asc' },
      });

      const totalEntries = entries.length;
      const firstEntry = entries[0];
      const lastEntry = entries[entries.length - 1];

      const stats = {
        totalEntries,
        firstEntryDate: firstEntry?.date,
        lastEntryDate: lastEntry?.date,
        totalPhotos: entries.reduce((sum, e) => sum + e.photos.length, 0),
        growthRate: this.calculateGrowthRate(entries),
      };

      await prisma.growDiary.update({
        where: { plantId },
        data: { stats },
      });
    } catch (error) {
      // Diary might not exist yet
      console.error('Failed to update diary stats:', error);
    }
  }

  // Calculate growth rate from measurements
  private calculateGrowthRate(entries: any[]): number {
    const entriesWithHeight = entries.filter(
      (e) => e.measurements && typeof e.measurements.height === 'number'
    );

    if (entriesWithHeight.length < 2) return 0;

    const first = entriesWithHeight[0];
    const last = entriesWithHeight[entriesWithHeight.length - 1];

    const heightDiff = last.measurements.height - first.measurements.height;
    const timeDiff =
      (new Date(last.date).getTime() - new Date(first.date).getTime()) /
      (1000 * 60 * 60 * 24); // days

    return timeDiff > 0 ? heightDiff / timeDiff : 0;
  }

  // Get growth statistics
  async getGrowthStats(plantId: string, userId: string) {
    try {
      const entries = await this.getEntriesByPlant(plantId, userId);
      const diary = await prisma.growDiary.findUnique({
        where: { plantId },
      });

      const measurements = entries
        .filter((e) => e.measurements)
        .map((e) => ({
          date: e.date,
          ...e.measurements,
        }));

      const healthScores = entries
        .filter((e) => e.measurements && (e.measurements as any).healthScore)
        .map((e) => ({
          date: e.date,
          score: (e.measurements as any).healthScore,
        }));

      return {
        diary: diary?.stats || {},
        measurements,
        healthScores,
        activities: this.aggregateActivities(entries),
        photos: entries.flatMap((e) => e.photos),
      };
    } catch (error) {
      throw new Error(`Failed to fetch growth stats: ${error}`);
    }
  }

  // Aggregate activities across all entries
  private aggregateActivities(entries: any[]) {
    const activityCounts: Record<string, number> = {};

    entries.forEach((entry) => {
      entry.activities.forEach((activity: string) => {
        activityCounts[activity] = (activityCounts[activity] || 0) + 1;
      });
    });

    return activityCounts;
  }
}

export default new JournalService();
