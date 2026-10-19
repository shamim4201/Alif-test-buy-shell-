import express, { Request, Response } from 'express';
import { authRouter } from '../server/routes/auth';
import { channelsRouter } from '../server/routes/channels';
import { ordersRouter } from '../server/routes/orders';
import { messagesRouter } from '../server/routes/messages';
import { reviewsRouter } from '../server/routes/reviews';
import { adminRouter } from '../server/routes/admin';
import { uploadRouter } from '../server/routes/upload';

const app = express();
app.set('trust proxy', true);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount API routers
app.use('/api/auth', authRouter);
app.use('/api/channels', channelsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/upload', uploadRouter);

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), platform: 'vercel-serverless' });
});

export default app;
