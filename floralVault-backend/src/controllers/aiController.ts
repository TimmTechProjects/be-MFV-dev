import { Request, Response } from 'express';
import * as aiService from '../services/aiService';
import prisma from '../prisma/client';

/**
 * POST /api/apothecary/ai/ask
 * AI Q&A for medicinal plant questions
 */
export const askAI = async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    const userId = req.user?.uid;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ error: 'Query is required' });
    }

    if (query.length > 500) {
      return res.status(400).json({ error: 'Query too long. Maximum 500 characters.' });
    }

    const result = await aiService.askAI({
      query: query.trim(),
      userId,
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error in AI ask endpoint:', error);
    
    if (error.message?.includes('API key')) {
      return res.status(500).json({ error: 'AI service not configured' });
    }

    res.status(500).json({ error: 'Failed to process AI request' });
  }
};

/**
 * POST /api/apothecary/ai/generate/:plantId
 * Generate medicinal content for a plant (admin only)
 */
export const generateContent = async (req: Request, res: Response) => {
  try {
    const { plantId } = req.params;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get plant information
    const plant = await prisma.plant.findUnique({
      where: { id: plantId },
    });

    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    // Check if medicinal property already exists
    const existingProperty = await prisma.medicinalProperty.findUnique({
      where: { plantId },
    });

    if (existingProperty) {
      return res.status(400).json({
        error: 'Medicinal property already exists for this plant',
      });
    }

    const result = await aiService.generateMedicinalContent({
      plantId,
      plantName: plant.commonName,
      botanicalName: plant.botanicalName,
      family: plant.family || undefined,
      userId,
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error in AI generate endpoint:', error);
    
    if (error.message?.includes('already pending')) {
      return res.status(409).json({ error: error.message });
    }

    if (error.message?.includes('API key')) {
      return res.status(500).json({ error: 'AI service not configured' });
    }

    res.status(500).json({ error: 'Failed to generate content' });
  }
};

/**
 * POST /api/apothecary/ai/generate/bulk
 * Bulk generate medicinal content for multiple plants (admin only)
 */
export const bulkGenerateContent = async (req: Request, res: Response) => {
  try {
    const { plantIds } = req.body;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!Array.isArray(plantIds) || plantIds.length === 0) {
      return res.status(400).json({ error: 'Plant IDs array is required' });
    }

    if (plantIds.length > 10) {
      return res.status(400).json({ error: 'Maximum 10 plants per bulk request' });
    }

    const results = [];
    const errors = [];

    for (const plantId of plantIds) {
      try {
        const plant = await prisma.plant.findUnique({
          where: { id: plantId },
        });

        if (!plant) {
          errors.push({ plantId, error: 'Plant not found' });
          continue;
        }

        const existingProperty = await prisma.medicinalProperty.findUnique({
          where: { plantId },
        });

        if (existingProperty) {
          errors.push({ plantId, error: 'Medicinal property already exists' });
          continue;
        }

        const result = await aiService.generateMedicinalContent({
          plantId,
          plantName: plant.commonName,
          botanicalName: plant.botanicalName,
          family: plant.family || undefined,
          userId,
        });

        results.push({ plantId, ...result });

        // Rate limiting: wait 1 second between requests
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error: any) {
        errors.push({ plantId, error: error.message });
      }
    }

    res.json({
      success: results.length,
      failed: errors.length,
      results,
      errors,
    });
  } catch (error) {
    console.error('Error in bulk generate endpoint:', error);
    res.status(500).json({ error: 'Failed to bulk generate content' });
  }
};

/**
 * GET /api/apothecary/ai/pending
 * Get pending AI-generated content for review (admin only)
 */
export const getPendingContent = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const pendingContent = await aiService.getPendingContent();

    // Enrich with plant data
    const enrichedContent = await Promise.all(
      pendingContent.map(async (content) => {
        const plant = await prisma.plant.findUnique({
          where: { id: content.plantId },
          include: {
            images: true,
          },
        });

        return {
          ...content,
          plant: plant ? {
            id: plant.id,
            commonName: plant.commonName,
            botanicalName: plant.botanicalName,
            mainImage: plant.images.find((img) => img.isMain)?.url,
          } : null,
        };
      })
    );

    res.json(enrichedContent);
  } catch (error) {
    console.error('Error fetching pending content:', error);
    res.status(500).json({ error: 'Failed to fetch pending content' });
  }
};

/**
 * POST /api/apothecary/ai/approve/:contentId
 * Approve AI-generated content (admin only)
 */
export const approveContent = async (req: Request, res: Response) => {
  try {
    const { contentId } = req.params;
    const { reviewNotes } = req.body;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const medicinalProperty = await aiService.approveContent(
      contentId,
      userId,
      reviewNotes
    );

    res.json({
      message: 'Content approved and published',
      medicinalProperty,
    });
  } catch (error: any) {
    console.error('Error approving content:', error);
    
    if (error.message?.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }

    if (error.message?.includes('already reviewed')) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to approve content' });
  }
};

/**
 * POST /api/apothecary/ai/reject/:contentId
 * Reject AI-generated content (admin only)
 */
export const rejectContent = async (req: Request, res: Response) => {
  try {
    const { contentId } = req.params;
    const { reviewNotes } = req.body;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!reviewNotes || typeof reviewNotes !== 'string') {
      return res.status(400).json({ error: 'Review notes are required for rejection' });
    }

    const result = await aiService.rejectContent(
      contentId,
      userId,
      reviewNotes
    );

    res.json(result);
  } catch (error: any) {
    console.error('Error rejecting content:', error);
    
    if (error.message?.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }

    if (error.message?.includes('already reviewed')) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to reject content' });
  }
};

/**
 * GET /api/apothecary/ai/stats
 * Get AI usage statistics (admin only)
 */
export const getUsageStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    const stats = await aiService.getUsageStats(start, end);

    res.json(stats);
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    res.status(500).json({ error: 'Failed to fetch usage statistics' });
  }
};
