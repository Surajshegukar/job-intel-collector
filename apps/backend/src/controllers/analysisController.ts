import { Response } from 'express';
import { Job } from '../models/Job';
import { JobAnalysis } from '../models/JobAnalysis';
import { InterviewPrep } from '../models/InterviewPrep';
import { AnalysisQueue } from '../ai/services/AnalysisQueue';
import { AuthenticatedRequest } from '../middleware/auth';

export const getAnalysis = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const job = await Job.findById(id).populate('companyId');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    let analysis = await JobAnalysis.findOne({ jobId: id, userId });
    
    // If analysis doesn't exist, queue it now and return a pending status
    if (!analysis) {
      await AnalysisQueue.addJob(id, userId);
      analysis = await JobAnalysis.findOne({ jobId: id, userId });
    }

    return res.json({
      job,
      analysis
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const triggerAnalysis = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Force analysis run
    await AnalysisQueue.addJob(id, userId);

    return res.json({ 
      message: 'Background AI analysis triggered successfully.',
      status: 'pending'
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const getMatchDetails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const analysis = await JobAnalysis.findOne({ jobId: id, userId });
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found yet. Try again shortly.' });
    }

    return res.json({
      matchScore: analysis.matchScore,
      missingSkills: analysis.missingSkills,
      scoreBreakdown: analysis.scoreBreakdown,
      scoreExplanation: analysis.scoreExplanation
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const getInterviewPrep = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Attempt to load from dedicated prep schema first
    let prep = await InterviewPrep.findOne({ jobId: id, userId });
    
    if (!prep) {
      // Pull extracted prep questions from completed analysis
      const analysis = await JobAnalysis.findOne({ jobId: id, userId, status: 'completed' });
      if (analysis && (analysis.interviewTopics?.length || (analysis as any).interviewQuestions?.length)) {
        // Create InterviewPrep record from analysis data
        prep = new InterviewPrep({
          jobId: id,
          userId,
          interviewTopics: analysis.interviewTopics || [],
          questions: (analysis as any).interviewQuestions || [],
          preparationGuidance: `Based on your compatibility profile for this ${analysis.roleCategory} position.`,
          aiProvider: analysis.aiProvider
        });
        await prep.save();
      } else {
        return res.status(404).json({ 
          message: 'Interview preparation data is not available yet. Ensure AI processing has completed.' 
        });
      }
    }

    return res.json(prep);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};
