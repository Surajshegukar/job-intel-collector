import { useState } from 'react';
import { 
  Bot, Sparkles, AlertCircle, RefreshCw, ThumbsUp, ThumbsDown, 
  ChevronDown, ChevronUp, CheckCircle2, DollarSign, Calendar, 
  Briefcase, Activity, Check
} from 'lucide-react';
import { 
  useJobAnalysis, useTriggerJobAnalysis, useSubmitRecommendationFeedback 
} from '../api/hooks';
import { AnalysisPanelSkeleton } from '../components/Skeleton';

interface AnalysisPanelProps {
  jobId: string;
}

export default function AnalysisPanel({ jobId }: AnalysisPanelProps) {
  const { data, isLoading, isError } = useJobAnalysis(jobId);
  const triggerAnalysis = useTriggerJobAnalysis();
  const submitFeedback = useSubmitRecommendationFeedback();

  const [activeTab, setActiveTab] = useState<'match' | 'resume' | 'interview'>('match');
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<Record<string, 'helpful' | 'unhelpful'>>({});

  const analysis = data?.analysis;
  const isProcessing = analysis?.status === 'pending' || analysis?.status === 'processing';
  const isFailed = analysis?.status === 'failed';

  async function handleReanalyze() {
    if (isProcessing) return;
    try {
      await triggerAnalysis.mutateAsync(jobId);
    } catch (err) {
      console.error('Failed to trigger analysis:', err);
    }
  }

  async function handleFeedback(type: 'project' | 'resume_section', text: string, feedbackValue: 'helpful' | 'unhelpful') {
    const key = `${type}-${text}`;
    if (feedbackSubmitted[key]) return;

    try {
      await submitFeedback.mutateAsync({
        jobId,
        recommendationType: type,
        recommendationText: text,
        feedback: feedbackValue
      });
      setFeedbackSubmitted(prev => ({ ...prev, [key]: feedbackValue }));
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  }

  if (isLoading) return <AnalysisPanelSkeleton />;

  if (isError || !analysis) {
    return (
      <div className="glass-card p-6 flex flex-col items-center justify-center space-y-4 min-h-[300px]">
        <AlertCircle className="text-rose-500" size={32} />
        <div className="text-center">
          <p className="text-sm font-semibold text-dark-200">Failed to load AI Intelligence</p>
          <p className="text-xs text-dark-400 mt-1">There was an issue fetching the analysis report.</p>
        </div>
        <button onClick={handleReanalyze} className="btn-primary px-4 py-2 text-xs">
          <RefreshCw size={12} className="mr-1" /> Retry Analysis
        </button>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="glass-card p-6 flex flex-col items-center justify-center space-y-4 min-h-[350px]">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-brand-500/20 border-t-brand-400 rounded-full animate-spin"></div>
          <Bot className="absolute text-brand-300" size={24} />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-dark-100">AI Engine Analyzing Job...</p>
          <p className="text-xs text-dark-400">Status: <span className="text-brand-400 capitalize animate-pulse font-medium">{analysis.status}</span></p>
          <p className="text-[10px] text-dark-500 max-w-[250px] mt-2">Normalizing titles, extracting key skills, and matching against your profile. This usually takes 5-10 seconds.</p>
        </div>
      </div>
    );
  }

  if (isFailed) {
    return (
      <div className="glass-card p-6 border-rose-900/50 bg-rose-950/10 flex flex-col items-center justify-center space-y-4 min-h-[300px]">
        <AlertCircle className="text-rose-400" size={32} />
        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-rose-300">AI Job Analysis Failed</p>
          <p className="text-xs text-dark-400 px-4 max-w-sm">{analysis.error || 'Unknown error occurred during LLM prompt parsing.'}</p>
        </div>
        <button onClick={handleReanalyze} className="btn-primary bg-rose-800 hover:bg-rose-700 border-rose-600/30 px-4 py-2 text-xs">
          <RefreshCw size={12} className="mr-1" /> Retry Pipeline
        </button>
      </div>
    );
  }

  // Circular gauge config
  const score = analysis.matchScore || 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const scoreColor = score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-rose-400';
  const scoreBg = score >= 80 ? 'stroke-emerald-950' : score >= 50 ? 'stroke-amber-950' : 'stroke-rose-950';
  const scoreStroke = score >= 80 ? 'stroke-emerald-400' : score >= 50 ? 'stroke-amber-400' : 'stroke-rose-400';

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top Banner and Tabs */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-700/30 flex items-center justify-center text-brand-400">
              <Bot size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-dark-50">AI Job Intelligence</h2>
              <p className="text-[10px] text-dark-400">Powered by {analysis.aiProvider} · v{analysis.analysisVersion}</p>
            </div>
          </div>
          <button 
            onClick={handleReanalyze} 
            disabled={triggerAnalysis.isPending}
            className="px-3 py-1.5 bg-dark-800 hover:bg-dark-700 border border-dark-700 text-[11px] font-semibold text-dark-300 rounded-lg flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <RefreshCw size={10} className={triggerAnalysis.isPending ? 'animate-spin' : ''} /> Re-Run
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-dark-800">
          {(['match', 'resume', 'interview'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-all capitalize -mb-[2px] ${
                activeTab === tab 
                  ? 'border-brand-500 text-brand-300' 
                  : 'border-transparent text-dark-400 hover:text-dark-200'
              }`}
            >
              {tab === 'match' ? 'Match Breakdown' : tab === 'resume' ? 'Tailoring Advice' : 'Interview Prep'}
            </button>
          ))}
        </div>

        {/* TAB 1: MATCH BREAKDOWN */}
        {activeTab === 'match' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-2">
            {/* Left: Circular gauge and parameters */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-3 border border-dark-800/40 bg-dark-900/10 rounded-2xl">
              <div className="relative flex items-center justify-center w-28 h-28">
                <svg className="w-full h-full transform -rotate-90">
                  <circle 
                    cx="56" cy="56" r={radius} 
                    className={`${scoreBg} stroke-[7] fill-transparent`} 
                  />
                  <circle 
                    cx="56" cy="56" r={radius} 
                    className={`${scoreStroke} stroke-[7] fill-transparent transition-all duration-1000`}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className={`text-2xl font-extrabold tracking-tight ${scoreColor}`}>{score}%</span>
                  <p className="text-[9px] font-semibold text-dark-400 uppercase tracking-wider">Match</p>
                </div>
              </div>
              <div className="mt-3 text-center">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                  analysis.applicationPriority === 'high' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/20' :
                  analysis.applicationPriority === 'low' ? 'bg-rose-950 text-rose-400 border border-rose-800/20' :
                  'bg-amber-950 text-amber-400 border border-amber-800/20'
                }`}>
                  Priority: {analysis.applicationPriority}
                </span>
              </div>
            </div>

            {/* Right: Heuristic parameters & score breakdown */}
            <div className="md:col-span-8 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-dark-800/25 border border-dark-800/50 rounded-xl flex items-center gap-2">
                  <Briefcase size={13} className="text-brand-400 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-dark-400">Classified Role</p>
                    <p className="font-bold text-dark-100">{analysis.roleCategory}</p>
                  </div>
                </div>
                <div className="p-2.5 bg-dark-800/25 border border-dark-800/50 rounded-xl flex items-center gap-2">
                  <Calendar size={13} className="text-purple-400 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-dark-400">Seniority & Exp</p>
                    <p className="font-bold text-dark-100">{analysis.seniority} ({analysis.experienceRequired || 'N/A'})</p>
                  </div>
                </div>
                <div className="p-2.5 bg-dark-800/25 border border-dark-800/50 rounded-xl flex items-center gap-2">
                  <DollarSign size={13} className="text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-dark-400">Salary Estimate</p>
                    <p className="font-bold text-dark-100">{analysis.salaryEstimate || 'Not specified'}</p>
                  </div>
                </div>
                <div className="p-2.5 bg-dark-800/25 border border-dark-800/50 rounded-xl flex items-center gap-2">
                  <Activity size={13} className="text-amber-400 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-dark-400">Hiring Urgency</p>
                    <p className="font-bold text-dark-100 capitalize">{analysis.hiringUrgency}</p>
                  </div>
                </div>
              </div>

              {/* Progress bars for deterministic criteria */}
              <div className="space-y-2 border-t border-dark-800 pt-3">
                <p className="text-[10px] font-bold text-dark-300 uppercase tracking-wider">Score Breakdown</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <div className="flex justify-between mb-0.5 text-[10px]">
                      <span className="text-dark-400">Skills Overlap</span>
                      <span className="font-bold text-dark-200">{analysis.scoreBreakdown?.skillsScore}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-dark-800 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: `${analysis.scoreBreakdown?.skillsScore}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-0.5 text-[10px]">
                      <span className="text-dark-400">Projects Relevance</span>
                      <span className="font-bold text-dark-200">{analysis.scoreBreakdown?.projectsScore}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-dark-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${analysis.scoreBreakdown?.projectsScore}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-0.5 text-[10px]">
                      <span className="text-dark-400">Experience Alignment</span>
                      <span className="font-bold text-dark-200">{analysis.scoreBreakdown?.experienceScore}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-dark-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${analysis.scoreBreakdown?.experienceScore}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-0.5 text-[10px]">
                      <span className="text-dark-400">Certifications</span>
                      <span className="font-bold text-dark-200">{analysis.scoreBreakdown?.certificationScore}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-dark-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${analysis.scoreBreakdown?.certificationScore}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Explanation box */}
            <div className="col-span-12 p-3 bg-dark-800/20 border border-dark-800 rounded-xl text-xs text-dark-300 leading-relaxed">
              <span className="font-bold text-brand-400">Analysis Fit Summary: </span>{analysis.scoreExplanation}
            </div>

            {/* Missing Skills Alerts */}
            {analysis.missingSkills?.length > 0 && (
              <div className="col-span-12 space-y-1.5">
                <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                  <AlertCircle size={10} /> Skill Gaps Detected
                </p>
                <div className="flex flex-wrap gap-1">
                  {analysis.missingSkills.map(skill => (
                    <span key={skill} className="px-2 py-0.5 bg-rose-950/40 border border-rose-800/30 rounded text-[10px] text-rose-400 font-semibold">{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TAILORING ADVICE */}
        {activeTab === 'resume' && (
          <div className="space-y-4 pt-2">
            {/* Suggested Projects */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-dark-200 flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-400" /> Recommended Custom Projects
              </h3>
              <div className="space-y-2">
                {analysis.recommendedProjects?.map((proj, i) => {
                  const key = `project-${proj}`;
                  const feedback = feedbackSubmitted[key];
                  return (
                    <div key={i} className="p-3 bg-dark-800/40 border border-dark-800/80 rounded-xl flex items-start justify-between gap-4">
                      <p className="text-xs text-dark-300 leading-relaxed">{proj}</p>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button 
                          onClick={() => handleFeedback('project', proj, 'helpful')}
                          disabled={!!feedback}
                          className={`p-1 rounded hover:bg-dark-700 transition-all ${feedback === 'helpful' ? 'text-emerald-400 bg-emerald-950/20' : 'text-dark-400'}`}
                        >
                          {feedback === 'helpful' ? <Check size={11} /> : <ThumbsUp size={11} />}
                        </button>
                        <button 
                          onClick={() => handleFeedback('project', proj, 'unhelpful')}
                          disabled={!!feedback}
                          className={`p-1 rounded hover:bg-dark-700 transition-all ${feedback === 'unhelpful' ? 'text-rose-400 bg-rose-950/20' : 'text-dark-400'}`}
                        >
                          <ThumbsDown size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {(!analysis.recommendedProjects || analysis.recommendedProjects.length === 0) && (
                  <p className="text-xs text-dark-500">No project recommendations available.</p>
                )}
              </div>
            </div>

            {/* Resume Tweaks */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-dark-200 flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-emerald-400" /> Resume Section Suggestions
              </h3>
              <div className="space-y-2">
                {analysis.recommendedResumeSections?.map((section, i) => {
                  const key = `resume_section-${section}`;
                  const feedback = feedbackSubmitted[key];
                  return (
                    <div key={i} className="p-3 bg-dark-800/40 border border-dark-800/80 rounded-xl flex items-start justify-between gap-4">
                      <p className="text-xs text-dark-300 leading-relaxed">{section}</p>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button 
                          onClick={() => handleFeedback('resume_section', section, 'helpful')}
                          disabled={!!feedback}
                          className={`p-1 rounded hover:bg-dark-700 transition-all ${feedback === 'helpful' ? 'text-emerald-400 bg-emerald-950/20' : 'text-dark-400'}`}
                        >
                          {feedback === 'helpful' ? <Check size={11} /> : <ThumbsUp size={11} />}
                        </button>
                        <button 
                          onClick={() => handleFeedback('resume_section', section, 'unhelpful')}
                          disabled={!!feedback}
                          className={`p-1 rounded hover:bg-dark-700 transition-all ${feedback === 'unhelpful' ? 'text-rose-400 bg-rose-950/20' : 'text-dark-400'}`}
                        >
                          <ThumbsDown size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: INTERVIEW PREPARATION */}
        {activeTab === 'interview' && (
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-dark-200">Suggested Technical Prep Questions</h3>
            <div className="space-y-2">
              {analysis.interviewQuestions?.map((q, i) => (
                <div key={i} className="border border-dark-800 rounded-xl overflow-hidden bg-dark-900/5">
                  <button
                    onClick={() => setExpandedQuestion(expandedQuestion === i ? null : i)}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-dark-800/20 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                        q.difficulty === 'easy' ? 'bg-emerald-950 text-emerald-400' :
                        q.difficulty === 'hard' ? 'bg-rose-950 text-rose-400' :
                        'bg-amber-950 text-amber-400'
                      }`}>
                        {q.difficulty}
                      </span>
                      <p className="text-xs font-semibold text-dark-100">{q.question}</p>
                    </div>
                    {expandedQuestion === i ? <ChevronUp size={12} className="text-dark-400" /> : <ChevronDown size={12} className="text-dark-400" />}
                  </button>

                  {expandedQuestion === i && (
                    <div className="p-3.5 bg-dark-800/30 border-t border-dark-800 text-xs leading-relaxed space-y-2">
                      <div className="text-dark-300">
                        <span className="font-bold text-brand-400">Suggested Answer: </span>
                        {q.suggestedAnswer}
                      </div>
                      {q.topic && (
                        <p className="text-[10px] text-dark-500 font-medium">Topic tags: {q.topic}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {(!analysis.interviewQuestions || analysis.interviewQuestions.length === 0) && (
                <p className="text-xs text-dark-500 text-center py-4">No preparation questions generated.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
