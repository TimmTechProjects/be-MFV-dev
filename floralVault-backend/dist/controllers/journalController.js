"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JournalController = void 0;
const journalService_1 = __importDefault(require("../services/journalService"));
class JournalController {
    // POST /api/journal/entries - Create a new journal entry
    async createEntry(req, res) {
        try {
            const userId = req.user.id;
            const { plantId, title, notes, photos, measurements, conditions, activities, date } = req.body;
            if (!plantId) {
                return res.status(400).json({ error: 'Plant ID is required' });
            }
            const entry = await journalService_1.default.createEntry({
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
        }
        catch (error) {
            console.error('Error creating journal entry:', error);
            res.status(500).json({ error: error.message || 'Failed to create journal entry' });
        }
    }
    // GET /api/journal/entries/:plantId - Get all entries for a plant
    async getEntriesByPlant(req, res) {
        try {
            const userId = req.user?.id || '';
            const { plantId } = req.params;
            const entries = await journalService_1.default.getEntriesByPlant(plantId, userId);
            res.json(entries);
        }
        catch (error) {
            console.error('Error fetching journal entries:', error);
            res.status(500).json({ error: error.message || 'Failed to fetch journal entries' });
        }
    }
    // GET /api/journal/timeline/:plantId - Get timeline view
    async getTimeline(req, res) {
        try {
            const userId = req.user?.id || '';
            const { plantId } = req.params;
            const timeline = await journalService_1.default.getTimeline(plantId, userId);
            res.json(timeline);
        }
        catch (error) {
            console.error('Error fetching timeline:', error);
            res.status(500).json({ error: error.message || 'Failed to fetch timeline' });
        }
    }
    // GET /api/journal/entry/:id - Get single entry
    async getEntryById(req, res) {
        try {
            const userId = req.user?.id || '';
            const { id } = req.params;
            const entry = await journalService_1.default.getEntryById(id, userId);
            res.json(entry);
        }
        catch (error) {
            console.error('Error fetching journal entry:', error);
            res.status(404).json({ error: error.message || 'Journal entry not found' });
        }
    }
    // PUT /api/journal/entries/:id - Update entry
    async updateEntry(req, res) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const { title, notes, photos, measurements, conditions, activities, date } = req.body;
            const updated = await journalService_1.default.updateEntry(id, userId, {
                title,
                notes,
                photos,
                measurements,
                conditions,
                activities,
                date: date ? new Date(date) : undefined,
            });
            res.json(updated);
        }
        catch (error) {
            console.error('Error updating journal entry:', error);
            res.status(500).json({ error: error.message || 'Failed to update journal entry' });
        }
    }
    // DELETE /api/journal/entries/:id - Delete entry
    async deleteEntry(req, res) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            await journalService_1.default.deleteEntry(id, userId);
            res.json({ success: true, message: 'Journal entry deleted' });
        }
        catch (error) {
            console.error('Error deleting journal entry:', error);
            res.status(500).json({ error: error.message || 'Failed to delete journal entry' });
        }
    }
    // GET /api/journal/diary/:plantId - Get grow diary
    async getDiary(req, res) {
        try {
            const userId = req.user.id;
            const { plantId } = req.params;
            const diary = await journalService_1.default.getOrCreateDiary(plantId, userId);
            res.json(diary);
        }
        catch (error) {
            console.error('Error fetching diary:', error);
            res.status(500).json({ error: error.message || 'Failed to fetch diary' });
        }
    }
    // GET /api/journal/stats/:plantId - Get growth statistics
    async getStats(req, res) {
        try {
            const userId = req.user?.id || '';
            const { plantId } = req.params;
            const stats = await journalService_1.default.getGrowthStats(plantId, userId);
            res.json(stats);
        }
        catch (error) {
            console.error('Error fetching stats:', error);
            res.status(500).json({ error: error.message || 'Failed to fetch statistics' });
        }
    }
}
exports.JournalController = JournalController;
exports.default = new JournalController();
