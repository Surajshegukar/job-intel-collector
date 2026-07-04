import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api';
import { connectDB } from './config/db';
import { AnalysisQueue } from './ai/services/AnalysisQueue';
import mongoose from 'mongoose';

const app = express();

// Enable CORS for all domains during local development (including localhost frontend and chrome extensions)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Lazy initialization for serverless environments (like Vercel)
let isInitialized = false;
app.use(async (_req, _res, next) => {
  if (!isInitialized) {
    try {
      if (mongoose.connection.readyState === 0) {
        await connectDB();
      }
      await AnalysisQueue.initialize();
      isInitialized = true;
    } catch (err) {
      console.error('[Lazy Init Middleware Error]', err);
      return next(err);
    }
  }
  next();
});

// Mount API routes
app.use('/api', apiRouter);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Global Error Handler]', err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

export default app;
