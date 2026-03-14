import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { errorHandler, notFound } from './middleware/errorHandler';

// Route imports
import authRoutes from './routes/auth';
import recipeRoutes from './routes/recipes';
import userRoutes from './routes/users';
import interactionRoutes from './routes/interactions';
import searchRoutes from './routes/search';
import { collectionRouter, mealPlanRouter } from './routes/collections';
import shoppingRoutes from './routes/shopping';
import notificationRoutes from './routes/notifications';
import adminRoutes from './routes/admin';
import chatbotRoutes from './routes/chatbot';
import reportRoutes from './routes/reports';

const app = express();

// ─── Security & Parsing ─────────────────────────────

app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);

// Auth rate limiter (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many auth attempts, please try again later' },
});

// ─── Static uploads ─────────────────────────────────
app.use('/uploads', express.static('uploads'));

// ─── API Routes ─────────────────────────────────────

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/collections', collectionRouter);
app.use('/api/meal-plans', mealPlanRouter);
app.use('/api/shopping-list', shoppingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/reports', reportRoutes);

// ─── Health check ───────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

// ─── Error handling ─────────────────────────────────

app.use(notFound);
app.use(errorHandler);

// ─── Start server ───────────────────────────────────

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════╗
  ║                                               ║
  ║   🍳 RecipeShare API Server                   ║
  ║                                               ║
  ║   Running on: http://localhost:${PORT}          ║
  ║   Environment: ${config.nodeEnv.padEnd(15)}           ║
  ║                                               ║
  ╚═══════════════════════════════════════════════╝
  `);
});

export default app;
