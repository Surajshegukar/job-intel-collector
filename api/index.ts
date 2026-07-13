// Polyfill browser globals for pdf-parse compatibility in Vercel serverless environments
if (typeof (global as any).DOMMatrix === 'undefined') {
  (global as any).DOMMatrix = class DOMMatrix {};
}
if (typeof (global as any).ImageData === 'undefined') {
  (global as any).ImageData = class ImageData {};
}
if (typeof (global as any).Path2D === 'undefined') {
  (global as any).Path2D = class Path2D {};
}

import app from '../apps/backend/src/app';
import { connectDB } from '../apps/backend/src/config/db';
import { AnalysisQueue } from '../apps/backend/src/ai/services/AnalysisQueue';
import mongoose from 'mongoose';
import { parse, format } from 'url';

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

  // Parse request URL to extract original sub-path from Vercel rewrite
  const parsedUrl = parse(req.url, true);
  const pathParam = parsedUrl.query.path;

  if (pathParam) {
    const subPath = Array.isArray(pathParam) ? pathParam[0] : pathParam;
    
    // Remove path param so it does not pollute req.query inside Express controllers
    delete parsedUrl.query.path;
    delete parsedUrl.search; // Allow url.format to regenerate search string from query object

    const formattedSubPath = subPath.startsWith('/') ? subPath : `/${subPath}`;
    parsedUrl.pathname = `/api${formattedSubPath}`;
    
    req.url = format(parsedUrl);
  } else {
    // Fallback: if no path parameter was passed (e.g. hitting base /api directly or local development fallback)
    const originalUrl = req.headers['x-matched-path'] || req.url;
    if (originalUrl && originalUrl !== '/api' && !originalUrl.startsWith('/api/index')) {
      const qPos = req.url.indexOf('?');
      const query = qPos !== -1 ? req.url.substring(qPos) : '';
      req.url = originalUrl + query;
    }
  }

  return app(req, res);
}
