import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import songsRoutes from './routes/songs.routes';
import playlistsRoutes from './routes/playlists.routes';
import mediaRoutes from './routes/media.routes';
import telegramRoutes from './routes/telegram.routes';
import playerRoutes from './routes/player.routes';
import interactionsRoutes from './routes/interactions.routes';
import { cleanupExpiredSessions } from './services/session.service';
import { botUsername } from './config';

const app = express();

// Express Config
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

// Routes
app.use('/api', authRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/interactions', interactionsRoutes);
app.use('/music', songsRoutes);
app.use('/songs', songsRoutes);
app.use('/api/songs', songsRoutes);
app.use('/api/music', songsRoutes);
app.use('/api/playlists', playlistsRoutes);
app.use('/api/player', playerRoutes);
app.use('/', mediaRoutes);

app.get('/', (_req: Request, res: Response) => {
  res.json({
    app: "Tone Backend API",
    version: "2.0.0",
    engine: "TypeScript + Drizzle + Timing-Safe Auth",
    bot: `@${botUsername}`,
    status: "operational"
  });
});

// Initialize Telegram Bot services
import { initTelegramBot } from './services/telegram.service';
initTelegramBot();

// Periodic expired session pruner (runs once every 24 hours)
setInterval(async () => {
  try {
    const pruned = await cleanupExpiredSessions();
    if (pruned > 0) {
      console.log(`[Tone] Pruned ${pruned} expired sessions from database.`);
    }
  } catch (err: any) {
    console.warn('[Tone] Session pruning cycle error:', err?.message || err);
  }
}, 24 * 60 * 60 * 1000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[Tone Backend] Listening on port ${PORT}... (Bot: @${botUsername})`);
});

process.on('uncaughtException', (err) => {
  console.error('[Tone Backend] UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Tone Backend] UNHANDLED REJECTION at:', promise, 'reason:', reason);
});

export default app;
