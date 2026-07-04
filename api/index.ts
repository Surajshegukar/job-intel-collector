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
  return app(req, res);
}
