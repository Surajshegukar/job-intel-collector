import app from '../apps/backend/src/app';
import { connectDB } from '../apps/backend/src/config/db';
import { AnalysisQueue } from '../apps/backend/src/ai/services/AnalysisQueue';
import mongoose from 'mongoose';

let isInitialized = false;

async function init() {
  if (!isInitialized) {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }
    await AnalysisQueue.initialize();
    isInitialized = true;
  }
}

export default async function handler(req: any, res: any) {
  await init();

  // Restore the original request URL from Vercel's rewrite header so Express can route correctly.
  const originalUrl = req.headers['x-matched-path'] || req.url;
  if (originalUrl && originalUrl !== '/api') {
    const qPos = req.url.indexOf('?');
    const query = qPos !== -1 ? req.url.substring(qPos) : '';
    req.url = originalUrl + query;
  }

  return app(req, res);
}
