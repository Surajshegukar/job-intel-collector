import { GoogleGenerativeAI } from '@google/generative-ai';

interface GeminiCallOptions {
  apiKey: string;
  prompt: string;
  responseMimeType?: string;
  maxRetries?: number;
  initialDelayMs?: number;
}

export interface GeminiHelperResult {
  text: string;
  modelUsed: string;
}

export async function generateContentWithRetry(options: GeminiCallOptions): Promise<GeminiHelperResult> {
  const {
    apiKey,
    prompt,
    responseMimeType,
    maxRetries = 3,
    initialDelayMs = 1500
  } = options;

  // Let the user configure the model name, defaulting to gemini-2.5-flash
  // If it's failing, we fallback to gemini-1.5-flash
  const primaryModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const fallbackModel = process.env.GEMINI_FALLBACK_MODEL || 'gemini-1.5-flash';

  const genAI = new GoogleGenerativeAI(apiKey);
  
  let lastError: any;
  let delay = initialDelayMs;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    // Switch to fallback model on subsequent retry attempts if primary model is failing
    const modelToUse = (attempt > 1 && fallbackModel) ? fallbackModel : primaryModel;
    
    try {
      console.log(`[GeminiHelper] Call attempt ${attempt}/${maxRetries} using model '${modelToUse}'...`);
      const model = genAI.getGenerativeModel({
        model: modelToUse,
        generationConfig: responseMimeType ? { responseMimeType } : undefined
      });

      const result = await model.generateContent(prompt);
      
      if (result && result.response) {
        const text = result.response.text();
        if (text) {
          return {
            text,
            modelUsed: modelToUse
          };
        }
      }
      throw new Error('Empty response received from Gemini API');
    } catch (error: any) {
      lastError = error;
      const errorMessage = error?.message || String(error);
      console.error(`[GeminiHelper] Attempt ${attempt} failed with error:`, errorMessage);

      // If we've reached the max retries, don't wait anymore
      if (attempt === maxRetries) {
        break;
      }

      // Check if the error is retryable (like 503, 504, 429, or fetch/network errors)
      const isRetryable = 
        errorMessage.includes('503') ||
        errorMessage.includes('504') ||
        errorMessage.includes('429') ||
        errorMessage.includes('Service Unavailable') ||
        errorMessage.includes('Too Many Requests') ||
        errorMessage.includes('high demand') ||
        errorMessage.includes('fetch failed') ||
        errorMessage.includes('network');

      if (!isRetryable) {
        console.error('[GeminiHelper] Non-retryable error encountered. Aborting retries.');
        throw error;
      }

      console.warn(`[GeminiHelper] Retryable error. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }

  throw lastError;
}
