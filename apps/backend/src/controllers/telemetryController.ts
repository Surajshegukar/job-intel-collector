import { Response } from 'express';
import { JobAnalysis } from '../models/JobAnalysis';
import { AIAuditLog } from '../models/AIAuditLog';
import { AIRecommendationFeedback } from '../models/AIRecommendationFeedback';
import { AIFeatureStore } from '../models/AIFeatureStore';
import { TrainingDataPipeline } from '../ai/services/TrainingDataPipeline';
import { AuthenticatedRequest } from '../middleware/auth';

export const submitFeedback = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { jobId, recommendationType, recommendationText, feedback, comment } = req.body;
    if (!jobId || !recommendationType || !recommendationText || !feedback) {
      return res.status(400).json({ message: 'Missing required feedback fields.' });
    }

    const doc = new AIRecommendationFeedback({
      jobId,
      userId,
      recommendationType,
      recommendationText,
      feedback,
      comment
    });

    await doc.save();
    return res.status(201).json({ message: 'Feedback logged successfully.', feedback: doc });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const getMetrics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // 1. Queue statistics
    const completedCount = await JobAnalysis.countDocuments({ status: 'completed' });
    const failedCount = await JobAnalysis.countDocuments({ status: 'failed' });
    const processingCount = await JobAnalysis.countDocuments({ status: 'processing' });
    const pendingCount = await JobAnalysis.countDocuments({ status: 'pending' });

    // 2. Average Latency and Cost
    const telemetryStats = await JobAnalysis.aggregate([
      { $match: { status: 'completed' } },
      { 
        $group: {
          _id: null,
          avgLatency: { $avg: '$providerMetadata.latencyMs' },
          totalCost: { $sum: '$providerMetadata.costUSD' },
          totalTokens: { $sum: { $add: ['$providerMetadata.promptTokens', '$providerMetadata.completionTokens'] } }
        }
      }
    ]);

    // 3. Provider Specific stats
    const providerStats = await AIAuditLog.aggregate([
      { $match: { event: 'analysis_completed' } },
      {
        $group: {
          _id: '$provider',
          count: { $sum: 1 },
          avgLatency: { $avg: '$latencyMs' }
        }
      }
    ]);

    // 4. Score Accuracy vs Outcome (Correlating score to real interview results)
    const outcomeAccuracy = await AIFeatureStore.aggregate([
      {
        $group: {
          _id: '$actualOutcome',
          avgMatchScore: { $avg: '$calculatedMatchScore' },
          sampleCount: { $sum: 1 }
        }
      },
      { $sort: { avgMatchScore: -1 } }
    ]);

    return res.json({
      queues: {
        completed: completedCount,
        failed: failedCount,
        processing: processingCount,
        pending: pendingCount
      },
      telemetry: {
        avgLatencyMs: telemetryStats[0]?.avgLatency || 0,
        totalCostUSD: telemetryStats[0]?.totalCost || 0,
        totalTokensUsed: telemetryStats[0]?.totalTokens || 0
      },
      providers: providerStats.map(p => ({
        name: p._id || 'unknown',
        count: p.count,
        avgLatencyMs: Math.round(p.avgLatency || 0)
      })),
      accuracy: outcomeAccuracy.map(a => ({
        outcome: a._id,
        avgMatchScore: Math.round(a.avgMatchScore),
        count: a.sampleCount
      }))
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const exportTrainingData = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const dataset = await TrainingDataPipeline.exportFineTuningDataset();
    
    res.setHeader('Content-Type', 'application/x-jsonlines');
    res.setHeader('Content-Disposition', 'attachment; filename="training_dataset.jsonl"');
    return res.send(dataset);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};
