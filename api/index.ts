import express, { Request, Response } from 'express';
import { authRouter } from '../server/routes/auth';
import { channelsRouter } from '../server/routes/channels';
import { ordersRouter } from '../server/routes/orders';
import { messagesRouter } from '../server/routes/messages';
import { reviewsRouter } from '../server/routes/reviews';
import { adminRouter } from '../server/routes/admin';
import { uploadRouter } from '../server/routes/upload';
import { db } from '../server/db';

const app = express();
app.set('trust proxy', true);

// Enable CORS for custom domain and dev server
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Safe body parser (handles serverless pre-parsed bodies without stream error)
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    return next();
  }
  express.json({ limit: '10mb' })(req, res, (err) => {
    if (err) {
      console.warn('JSON parsing warning:', err);
    }
    next();
  });
});
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount routers with both /api prefix and direct path for Vercel rewrites compatibility
app.use(['/api/auth', '/auth'], authRouter);
app.use(['/api/channels', '/channels'], channelsRouter);
app.use(['/api/orders', '/orders'], ordersRouter);
app.use(['/api/messages', '/messages'], messagesRouter);
app.use(['/api/reviews', '/reviews'], reviewsRouter);
app.use(['/api/admin', '/admin'], adminRouter);
app.use(['/api/upload', '/upload'], uploadRouter);

// Public settings endpoint
app.get(['/api/settings', '/settings'], (_req: Request, res: Response) => {
  res.json({ settings: db.getSettings() });
});

app.put(['/api/settings', '/settings'], (req: Request, res: Response) => {
  const updated = db.updateSettings(req.body);
  res.json({ settings: updated, message: 'Settings successfully updated' });
});

// Health check
app.get(['/api/health', '/health'], (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), platform: 'vercel-serverless' });
});

// Global error handling middleware - prevents unhandled crash returning 500 HTML
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('API Error handler:', err);
  res.status(400).json({ error: err?.message || 'Request could not be processed' });
});

export default app;
