import 'express-async-errors';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

import { runMigrations } from './db/migrations';
import participantsRouter from './routes/participants';
import sessionsRouter from './routes/sessions';
import adminRouter from './routes/admin';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

// Run database migrations before starting
runMigrations();

// Routes
app.use('/api/participants', participantsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/admin', adminRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve built React app in production
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`WritingTracker server running on http://localhost:${PORT}`);
});

export default app;
