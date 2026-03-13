import { Router, Request, Response } from 'express';
import { z } from 'zod';
import db from '../db/connection';

const router = Router();

const RegisterSchema = z.object({
  pseudonym: z
    .string()
    .min(2, 'Pseudonym must be at least 2 characters')
    .max(50, 'Pseudonym must be at most 50 characters')
    .regex(/^[a-zA-Z0-9_\-\s]+$/, 'Pseudonym can only contain letters, numbers, spaces, hyphens, and underscores'),
});

// POST /api/participants - Register a new pseudonym
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const result = RegisterSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.errors[0].message });
    return;
  }

  const { pseudonym } = result.data;
  const trimmed = pseudonym.trim();

  try {
    db.prepare('INSERT INTO participants (pseudonym) VALUES (?)').run(trimmed);
    res.status(201).json({ pseudonym: trimmed, message: 'Participant registered successfully' });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('UNIQUE constraint failed')) {
      res.status(409).json({ error: 'Pseudonym already taken. Please choose another.' });
    } else {
      throw err;
    }
  }
});

// GET /api/participants/:pseudonym - Check if pseudonym exists
router.get('/:pseudonym', async (req: Request, res: Response): Promise<void> => {
  const { pseudonym } = req.params;

  const participant = db
    .prepare('SELECT pseudonym, created_at FROM participants WHERE pseudonym = ?')
    .get(pseudonym) as { pseudonym: string; created_at: string } | undefined;

  if (!participant) {
    res.status(404).json({ error: 'Participant not found' });
    return;
  }

  res.json(participant);
});

export default router;
