import { Router, Request, Response } from 'express';
import { z } from 'zod';
import db from '../db/connection';

const router = Router();

function getTimeOfDay(isoString: string): string {
  const hour = new Date(isoString).getUTCHours();
  if (hour >= 5 && hour <= 11) return 'morning';
  if (hour >= 12 && hour <= 16) return 'afternoon';
  if (hour >= 17 && hour <= 20) return 'evening';
  return 'night'; // 21-04
}

const SessionSchema = z.object({
  pseudonym: z.string().min(1),
  session_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'session_date must be YYYY-MM-DD'),
  duration_minutes: z.number().int().positive(),
  word_count: z.number().int().min(0),
  topic: z.string().min(1).max(200),
});

// POST /api/sessions - Log a writing session
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const result = SessionSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.errors[0].message });
    return;
  }

  const { pseudonym, session_date, duration_minutes, word_count, topic } = result.data;

  // Verify participant exists
  const participant = db
    .prepare('SELECT pseudonym FROM participants WHERE pseudonym = ?')
    .get(pseudonym);

  if (!participant) {
    res.status(404).json({ error: 'Participant not found. Please register first.' });
    return;
  }

  const logged_at = new Date().toISOString();
  const time_of_day = getTimeOfDay(logged_at);
  const normalizedTopic = topic.trim().toLowerCase();

  const stmt = db.prepare(`
    INSERT INTO sessions (pseudonym, session_date, duration_minutes, word_count, time_of_day, topic, logged_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(pseudonym, session_date, duration_minutes, word_count, time_of_day, normalizedTopic, logged_at);

  res.status(201).json({
    id: info.lastInsertRowid,
    pseudonym,
    session_date,
    duration_minutes,
    word_count,
    time_of_day,
    topic: normalizedTopic,
    logged_at,
  });
});

// GET /api/sessions/:pseudonym - Fetch sessions for a participant
router.get('/:pseudonym', async (req: Request, res: Response): Promise<void> => {
  const { pseudonym } = req.params;
  const { from, to, limit = '100', offset = '0' } = req.query;

  // Verify participant exists
  const participant = db
    .prepare('SELECT pseudonym FROM participants WHERE pseudonym = ?')
    .get(pseudonym);

  if (!participant) {
    res.status(404).json({ error: 'Participant not found' });
    return;
  }

  let query = 'SELECT * FROM sessions WHERE pseudonym = ?';
  const params: (string | number)[] = [pseudonym];

  if (from) {
    query += ' AND session_date >= ?';
    params.push(from as string);
  }
  if (to) {
    query += ' AND session_date <= ?';
    params.push(to as string);
  }

  query += ' ORDER BY session_date DESC, logged_at DESC';
  query += ' LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const sessions = db.prepare(query).all(...params);
  res.json(sessions);
});

export default router;
