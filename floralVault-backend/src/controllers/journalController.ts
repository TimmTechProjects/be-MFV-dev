import { Request, Response } from 'express';
import journalService from '../services/journalService';

export class JournalController {
  // POST /api/journal/entries - Create a new journal entry
  async createEntry(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { plantId, title, notes, photos, measurements, conditions, activities, date } = req.body;

      if (!plantId) {
        return res.status(400).json({ error: 'Plant ID is required' });
      }

      const entry = await journalService.createEntry({
        plantId,
        userId,
        title,
        notes,
        photos,
        measurements,
        conditions,
        activities,
        date: date ? new Date(date) : undefined,
      });

      res.status(201).json(entry);
    } catch (error: any) {
      console.error('Error creating journal entry:', error);
      res.status(500).json({ error: error.message || 'Failed to create journal entry' });
    }
  }

  // GET /api/journal/entries/:plantId - Get all entries for a plant
  async getEntriesByPlant(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || '';
      const { plantId } = req.params;

      const entries = await journalService.getEntriesByPlant(plantId, userId);
      res.json(entries);
    } catch (error: any) {
      console.error('Error fetching journal entries:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch journal entries' });
    }
  }

  // GET /api/journal/timeline/:plantId - Get timeline view
  async getTimeline(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || '';
      const { plantId } = req.params;

      const timeline = await journalService.getTimeline(plantId, userId);
      res.json(timeline);
    } catch (error: any) {
      console.error('Error fetching timeline:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch timeline' });
    }
  }

  // GET /api/journal/entry/:id - Get single entry
  async getEntryById(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || '';
      const { id } = req.params;

      const entry = await journalService.getEntryById(id, userId);
      res.json(entry);
    } catch (error: any) {
      console.error('Error fetching journal entry:', error);
      res.status(404).json({ error: error.message || 'Journal entry not found' });
    }
  }

  // PUT /api/journal/entries/:id - Update entry
  async updateEntry(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const { title, notes, photos, measurements, conditions, activities, date } = req.body;

      const updated = await journalService.updateEntry(id, userId, {
        title,
        notes,
        photos,
        measurements,
        conditions,
        activities,
        date: date ? new Date(date) : undefined,
      });

      res.json(updated);
    } catch (error: any) {
      console.error('Error updating journal entry:', error);
      res.status(500).json({ error: error.message || 'Failed to update journal entry' });
    }
  }

  // DELETE /api/journal/entries/:id - Delete entry
  async deleteEntry(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      await journalService.deleteEntry(id, userId);
      res.json({ success: true, message: 'Journal entry deleted' });
    } catch (error: any) {
      console.error('Error deleting journal entry:', error);
      res.status(500).json({ error: error.message || 'Failed to delete journal entry' });
    }
  }

  // GET /api/journal/diary/:plantId - Get grow diary
  async getDiary(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { plantId } = req.params;

      const diary = await journalService.getOrCreateDiary(plantId, userId);
      res.json(diary);
    } catch (error: any) {
      console.error('Error fetching diary:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch diary' });
    }
  }

  // GET /api/journal/stats/:plantId - Get growth statistics
  async getStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || '';
      const { plantId } = req.params;

      const stats = await journalService.getGrowthStats(plantId, userId);
      res.json(stats);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch statistics' });
    }
  }
}

export default new JournalController();
