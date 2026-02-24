import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { getDatabase } from '../db/database';
import { CreatePromptDto, UpdatePromptDto, PromptQuery } from '../models/Prompt';
import { logger } from '../utils/logger';

const router = Router();
const db = getDatabase();

// Validation schemas
const createPromptSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  source: z.enum(['browser', 'cursor', 'vscode', 'manual']),
  url: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  tags: z.string().optional(),
  category: z.string().optional()
});

const updatePromptSchema = z.object({
  content: z.string().min(1).optional(),
  tags: z.string().optional(),
  category: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

// Create a new prompt
router.post('/', async (req: Request, res: Response) => {
  try {
    const validated = createPromptSchema.parse(req.body);
    const prompt = await db.create(validated as CreatePromptDto);
    logger.info(`Created prompt ${prompt.id} from ${prompt.source}`);
    res.status(201).json(prompt);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Validation error:', error.errors);
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      logger.error('Error creating prompt:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      res.status(500).json({ 
        error: 'Internal server error',
        message: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
      });
    }
  }
});

// Get all prompts with query parameters
router.get('/', async (req: Request, res: Response) => {
  try {
    const query: PromptQuery = {
      search: req.query.search as string,
      source: req.query.source as string,
      tags: req.query.tags as string,
      category: req.query.category as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      llm: req.query.llm as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
      sortBy: (req.query.sortBy as 'timestamp' | 'id') || 'timestamp',
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
    };

    const result = await db.findAll(query);
    res.json(result);
  } catch (error) {
    logger.error('Error fetching prompts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single prompt by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const prompt = await db.findById(id);
    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    res.json(prompt);
  } catch (error) {
    logger.error('Error fetching prompt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete all prompts (clear database) - MUST be before /:id route
router.delete('/all', async (req: Request, res: Response) => {
  try {
    const deletedCount = await db.deleteAll();
    
    logger.info(`Deleted all ${deletedCount} prompts`);
    res.json({ 
      message: `Successfully deleted ${deletedCount} prompts`,
      deletedCount 
    });
  } catch (error) {
    logger.error('Error deleting all prompts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a prompt
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const validated = updatePromptSchema.parse(req.body);
    const prompt = await db.update(id, validated as UpdatePromptDto);

    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    logger.info(`Updated prompt ${id}`);
    res.json(prompt);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Validation error:', error.errors);
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      logger.error('Error updating prompt:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Delete a prompt
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const deleted = await db.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    logger.info(`Deleted prompt ${id}`);
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting prompt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get statistics
router.get('/stats/summary', async (req: Request, res: Response) => {
  try {
    const stats = await db.getStats();
    res.json(stats);
  } catch (error) {
    logger.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export prompts as CSV
router.get('/export/csv', async (req: Request, res: Response) => {
  try {
    // Support query parameters for filtering
    const query: PromptQuery = {
      search: req.query.search as string,
      source: req.query.source as string,
      tags: req.query.tags as string,
      category: req.query.category as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      limit: 10000, // Large limit for export
      sortBy: (req.query.sortBy as 'timestamp' | 'id') || 'timestamp',
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
    };

    const { prompts } = await db.findAll(query);
    
    // Generate CSV with UTF-8 BOM for Excel compatibility
    const headers = ['ID', 'Content', 'Source', 'URL', 'Timestamp', 'Tags', 'Category', 'AI Platform'];
    const rows = prompts.map(p => {
      // Extract platform from metadata
      let platform = '';
      if (p.metadata && typeof p.metadata === 'object') {
        platform = p.metadata.platform || p.metadata.llm || '';
      }
      
      // Helper function to escape CSV fields
      const escapeCsvField = (field: any): string => {
        if (field === null || field === undefined) return '';
        const str = String(field);
        // If field contains comma, quote, or newline, wrap in quotes and escape quotes
        if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };
      
      return [
        p.id,
        escapeCsvField(p.content),
        escapeCsvField(p.source),
        escapeCsvField(p.url),
        escapeCsvField(p.timestamp),
        escapeCsvField(p.tags),
        escapeCsvField(p.category),
        escapeCsvField(platform)
      ];
    });

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Add UTF-8 BOM for Excel compatibility
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csv;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=prompts.csv');
    res.send(csvWithBOM);
  } catch (error) {
    logger.error('Error exporting CSV:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export prompts as JSON
router.get('/export/json', async (req: Request, res: Response) => {
  try {
    // Support query parameters for filtering
    const query: PromptQuery = {
      search: req.query.search as string,
      source: req.query.source as string,
      tags: req.query.tags as string,
      category: req.query.category as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      limit: 10000,
      sortBy: (req.query.sortBy as 'timestamp' | 'id') || 'timestamp',
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
    };

    const { prompts } = await db.findAll(query);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=prompts.json');
    res.json(prompts);
  } catch (error) {
    logger.error('Error exporting JSON:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
