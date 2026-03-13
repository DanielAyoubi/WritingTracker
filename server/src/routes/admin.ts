import { Router, Request, Response } from 'express';
import { z } from 'zod';
import db from '../db/connection';
import { comparePassword, generateToken, hashToken } from '../utils/crypto';
import { adminLoginRateLimiter } from '../middleware/rateLimiter';
import { adminAuth } from '../middleware/adminAuth';
import { generateCsv } from '../utils/csvExport';

const router = Router();

const LoginSchema = z.object({
  password: z.string().min(1),
});

// POST /api/admin/login
router.post('/login', adminLoginRateLimiter, async (req: Request, res: Response): Promise<void> => {
  const result = LoginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Password is required' });
    return;
  }

  const { password } = result.data;
  const storedHash = process.env.ADMIN_PASSWORD_HASH;

  if (!storedHash) {
    res.status(500).json({ error: 'Admin password not configured. Run hashPassword.ts to set it up.' });
    return;
  }

  const valid = await comparePassword(password, storedHash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid password' });
    return;
  }

  // Clean up expired tokens
  const now = new Date().toISOString();
  db.prepare('DELETE FROM admin_tokens WHERE expires_at <= ?').run(now);

  // Generate new token
  const token = await generateToken();
  const tokenHash = await hashToken(token);
  const issuedAt = now;
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(); // 8 hours

  db.prepare('INSERT INTO admin_tokens (token_hash, issued_at, expires_at) VALUES (?, ?, ?)').run(
    tokenHash,
    issuedAt,
    expiresAt
  );

  res.json({ token, expiresAt });
});

// All routes below require admin auth
router.use(adminAuth);

// GET /api/admin/stats
router.get('/stats', async (req: Request, res: Response): Promise<void> => {
  const totalParticipants = (db.prepare('SELECT COUNT(*) as count FROM participants').get() as { count: number }).count;
  const totalSessions = (db.prepare('SELECT COUNT(*) as count FROM sessions').get() as { count: number }).count;
  const totalWords = (
    db.prepare('SELECT COALESCE(SUM(word_count), 0) as total FROM sessions').get() as { total: number }
  ).total;
  const totalMinutes = (
    db.prepare('SELECT COALESCE(SUM(duration_minutes), 0) as total FROM sessions').get() as { total: number }
  ).total;

  const avgWordsPerSession =
    totalSessions > 0 ? Math.round(totalWords / totalSessions) : 0;

  const timeOfDayBreakdown = db
    .prepare('SELECT time_of_day, COUNT(*) as count FROM sessions GROUP BY time_of_day ORDER BY count DESC')
    .all() as { time_of_day: string; count: number }[];

  const recentActivity = db
    .prepare(
      `SELECT session_date, COUNT(*) as sessions, SUM(word_count) as words
       FROM sessions
       WHERE session_date >= date('now', '-30 days')
       GROUP BY session_date
       ORDER BY session_date ASC`
    )
    .all();

  res.json({
    totalParticipants,
    totalSessions,
    totalWords,
    totalMinutes,
    avgWordsPerSession,
    timeOfDayBreakdown,
    recentActivity,
  });
});

// GET /api/admin/participants
router.get('/participants', async (req: Request, res: Response): Promise<void> => {
  const participants = db
    .prepare(
      `SELECT
         p.pseudonym,
         p.created_at,
         COUNT(s.id) as session_count,
         COALESCE(SUM(s.word_count), 0) as total_words,
         COALESCE(SUM(s.duration_minutes), 0) as total_minutes,
         MAX(s.session_date) as last_session_date
       FROM participants p
       LEFT JOIN sessions s ON p.pseudonym = s.pseudonym
       GROUP BY p.pseudonym
       ORDER BY last_session_date DESC NULLS LAST, p.created_at DESC`
    )
    .all();

  res.json(participants);
});

// GET /api/admin/participants/:pseudonym
router.get('/participants/:pseudonym', async (req: Request, res: Response): Promise<void> => {
  const { pseudonym } = req.params;

  const participant = db
    .prepare('SELECT * FROM participants WHERE pseudonym = ?')
    .get(pseudonym) as { pseudonym: string; created_at: string } | undefined;

  if (!participant) {
    res.status(404).json({ error: 'Participant not found' });
    return;
  }

  const sessions = db
    .prepare('SELECT * FROM sessions WHERE pseudonym = ? ORDER BY session_date DESC, logged_at DESC')
    .all(pseudonym);

  const stats = db
    .prepare(
      `SELECT
         COUNT(*) as session_count,
         COALESCE(SUM(word_count), 0) as total_words,
         COALESCE(SUM(duration_minutes), 0) as total_minutes,
         COALESCE(AVG(word_count), 0) as avg_words_per_session
       FROM sessions WHERE pseudonym = ?`
    )
    .get(pseudonym) as {
    session_count: number;
    total_words: number;
    total_minutes: number;
    avg_words_per_session: number;
  };

  res.json({ participant, sessions, stats });
});

// GET /api/admin/export
router.get('/export', async (req: Request, res: Response): Promise<void> => {
  const { pseudonym } = req.query;

  let query = 'SELECT pseudonym, session_date, duration_minutes, word_count, time_of_day, topic, logged_at FROM sessions';
  const params: string[] = [];

  if (pseudonym) {
    query += ' WHERE pseudonym = ?';
    params.push(pseudonym as string);
  }

  query += ' ORDER BY pseudonym ASC, session_date ASC';

  const sessions = db.prepare(query).all(...params) as {
    pseudonym: string;
    session_date: string;
    duration_minutes: number;
    word_count: number;
    time_of_day: string;
    topic: string;
    logged_at: string;
  }[];

  const csv = generateCsv(sessions);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="writing_sessions.csv"');
  res.send(csv);
});

export default router;
