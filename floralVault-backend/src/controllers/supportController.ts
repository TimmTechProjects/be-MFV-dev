import { Request, Response } from 'express';
import { supportService } from '../services/supportService';

// Extend Request to include user
interface AuthRequest extends Request {
  user?: string; // userId from JWT
}

export const supportController = {
  // Support Tickets
  async createTicket(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { subject, description, priority, category, attachments } = req.body;
      const userId = req.user;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!subject || !description || !category) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const ticket = await supportService.createTicket({
        subject,
        description,
        priority: priority || 'medium',
        category,
        userId,
        attachments,
      });

      res.status(201).json(ticket);
    } catch (error) {
      console.error('Error creating ticket:', error);
      res.status(500).json({ error: 'Failed to create ticket' });
    }
  },

  async getTickets(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user;
      const { status, all } = req.query;

      // If 'all' param is true and user is admin, get all tickets
      // Otherwise, get only user's tickets
      const tickets = await supportService.getTickets(
        all === 'true' ? undefined : userId,
        status as string
      );

      res.json(tickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      res.status(500).json({ error: 'Failed to fetch tickets' });
    }
  },

  async getTicketById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const ticket = await supportService.getTicketById(id);

      if (!ticket) {
        res.status(404).json({ error: 'Ticket not found' });
        return;
      }

      res.json(ticket);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      res.status(500).json({ error: 'Failed to fetch ticket' });
    }
  },

  async updateTicketStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, assignedTo } = req.body;

      const ticket = await supportService.updateTicketStatus(id, status, assignedTo);
      res.json(ticket);
    } catch (error) {
      console.error('Error updating ticket:', error);
      res.status(500).json({ error: 'Failed to update ticket' });
    }
  },

  async addTicketMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { message, isStaff } = req.body;
      const userId = req.user;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!message) {
        res.status(400).json({ error: 'Message is required' });
        return;
      }

      const ticketMessage = await supportService.addTicketMessage({
        ticketId: id,
        userId,
        message,
        isStaff: isStaff || false,
      });

      res.status(201).json(ticketMessage);
    } catch (error) {
      console.error('Error adding ticket message:', error);
      res.status(500).json({ error: 'Failed to add message' });
    }
  },

  // User Suggestions
  async createSuggestion(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { title, description, category } = req.body;
      const userId = req.user;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!title || !description || !category) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const suggestion = await supportService.createSuggestion({
        title,
        description,
        category,
        userId,
      });

      res.status(201).json(suggestion);
    } catch (error) {
      console.error('Error creating suggestion:', error);
      res.status(500).json({ error: 'Failed to create suggestion' });
    }
  },

  async getSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.query;
      const suggestions = await supportService.getSuggestions(status as string);
      res.json(suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      res.status(500).json({ error: 'Failed to fetch suggestions' });
    }
  },

  async voteSuggestion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { increment } = req.body;

      const suggestion = await supportService.voteSuggestion(id, increment !== false);
      res.json(suggestion);
    } catch (error) {
      console.error('Error voting suggestion:', error);
      res.status(500).json({ error: 'Failed to vote suggestion' });
    }
  },

  async updateSuggestionStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;

      const suggestion = await supportService.updateSuggestionStatus(id, status, adminNotes);
      res.json(suggestion);
    } catch (error) {
      console.error('Error updating suggestion:', error);
      res.status(500).json({ error: 'Failed to update suggestion' });
    }
  },

  // Bug Reports
  async createBugReport(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { title, description, stepsToReproduce, severity, screenshots, browserInfo } =
        req.body;
      const userId = req.user;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!title || !description) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const bugReport = await supportService.createBugReport({
        title,
        description,
        stepsToReproduce,
        severity: severity || 'medium',
        userId,
        screenshots,
        browserInfo,
      });

      res.status(201).json(bugReport);
    } catch (error) {
      console.error('Error creating bug report:', error);
      res.status(500).json({ error: 'Failed to create bug report' });
    }
  },

  async getBugReports(req: Request, res: Response): Promise<void> {
    try {
      const { status, severity } = req.query;
      const bugReports = await supportService.getBugReports(status as string, severity as string);
      res.json(bugReports);
    } catch (error) {
      console.error('Error fetching bug reports:', error);
      res.status(500).json({ error: 'Failed to fetch bug reports' });
    }
  },

  async updateBugReportStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const bugReport = await supportService.updateBugReportStatus(id, status);
      res.json(bugReport);
    } catch (error) {
      console.error('Error updating bug report:', error);
      res.status(500).json({ error: 'Failed to update bug report' });
    }
  },

  // Admin Stats
  async getAdminStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await supportService.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
  },
};
