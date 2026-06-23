import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Building2, 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Bookmark,
  RotateCw,
  Settings,
  Cloud,
  CloudOff
} from 'lucide-react';
import { saveJob } from '../storage/jobs';
import { saveCompany } from '../storage/companies';
import { savePost } from '../storage/posts';
import { saveRecruiter } from '../storage/recruiters';
import type { Job, Company, HiringPost, Recruiter } from '../types';
import {
  getSyncSettings,
  setSyncSettings,
  loginToBackend,
  logoutFromBackend,
  syncJobToBackend,
  syncCompanyToBackend,
  syncPostToBackend,
  testBackendConnection,
  SyncSettings
} from '../api/backendClient';

type ActiveTab = 'job' | 'company' | 'post' | 'recruiter' | 'settings';

export default function Popup() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('job');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [pageUrl, setPageUrl] = useState('');

  // Sync Settings states
  const [syncSettings, setSyncSettingsState] = useState<SyncSettings>({
    baseUrl: 'http://localhost:5000/api',
    token: null,
    syncEnabled: true
  });
  const [syncStatus, setSyncStatus] = useState<'connected' | 'disconnected' | 'disabled'>('disconnected');
  const [settingsEmail, setSettingsEmail] = useState('');
  const [settingsPassword, setSettingsPassword] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  // Form States
  const [jobForm, setJobForm] = useState<Partial<Job>>({
    title: '', company: '', location: '', experience: '', salary: '', 
    employmentType: 'Full-time', skills: [], description: '', source: '', url: '', notes: '', tags: [],
    recruiterName: '', recruiterUrl: '', companyUrl: '', highlights: ''
  });
  const [companyForm, setCompanyForm] = useState<Partial<Company>>({
    name: '', website: '', linkedin: '', industry: '', size: '', location: '', description: '', notes: '', tags: []
  });
  const [postForm, setPostForm] = useState<Partial<HiringPost>>({
    author: '', authorProfile: '', company: '', content: '', source: '', url: '', tags: []
  });
  const [recruiterForm, setRecruiterForm] = useState<Partial<Recruiter>>({
    name: '', company: '', profileUrl: '', notes: ''
  });

  const [tagInput, setTagInput] = useState('');
  const [skillInput, setSkillInput] = useState('');

  const loadSettings = async () => {
    const settings = await getSyncSettings();
    setSyncSettingsState(settings);
    
    if (!settings.syncEnabled) {
      setSyncStatus('disabled');
    } else if (settings.token) {
      const active = await testBackendConnection(settings.baseUrl);
      setSyncStatus(active ? 'connected' : 'disconnected');
    } else {
      setSyncStatus('disconnected');
    }
  };

  const scrapePage = () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (!activeTab || !activeTab.id || !activeTab.url) {
        setLoading(false);
        setErrorMsg('No active tab detected.');
        return;
      }

      setPageUrl(activeTab.url);

      // Check if it's a restricted Chrome URL
      if (activeTab.url.startsWith('chrome://') || activeTab.url.startsWith('chrome-extension://')) {
        setLoading(false);
        setErrorMsg('Navigate to a job board or career page to scrape details.');
        return;
      }

      chrome.tabs.sendMessage(activeTab.id, { action: 'extract' }, (response) => {
        setLoading(false);
        const fallbackUrl = activeTab.url || '';
        const fallbackSource = getHostLabel(fallbackUrl);

        // Pre-fill fallback details in case scraping fails or is partial
        setJobForm(prev => ({ ...prev, url: fallbackUrl, source: fallbackSource }));
        setCompanyForm(prev => ({ ...prev, website: fallbackUrl }));
        setPostForm(prev => ({ ...prev, url: fallbackUrl, source: fallbackSource }));
        setRecruiterForm(prev => ({ ...prev, profileUrl: fallbackUrl }));

        if (chrome.runtime.lastError) {
          console.warn('[Popup] Message error:', chrome.runtime.lastError);
          setErrorMsg('Could not connect to the page. Please refresh the tab to load the extension scraper.');
          return;
        }

        if (response && response.success && response.data) {
          const { job, company, post, detectedType } = response.data;
          
          if (job) setJobForm(prev => ({ ...prev, ...job }));
          if (company) setCompanyForm(prev => ({ ...prev, ...company }));
          if (post) {
            setPostForm(prev => ({ ...prev, ...post }));
            setRecruiterForm(prev => ({
              ...prev,
              name: post.author,
              profileUrl: post.authorProfile || '',
              company: post.company || ''
            }));
          }

          // Switch tab based on auto-detection or URL hints
          if (detectedType !== 'none') {
            setActiveTab(detectedType);
          } else {
            // URL heuristics fallback to guess the active tab
            if (fallbackUrl.includes('/jobs')) {
              setActiveTab('job');
            } else if (fallbackUrl.includes('/company') || fallbackUrl.includes('/companies')) {
              setActiveTab('company');
            } else if (fallbackUrl.includes('/feed/update') || fallbackUrl.includes('/posts')) {
              setActiveTab('post');
            }
            setErrorMsg('No details could be auto-extracted. Pre-filled with tab URL.');
          }
        } else {
          setErrorMsg(response?.error || 'No structured details detected. Pre-filled with tab URL.');
        }
      });
    });
  };

  useEffect(() => {
    scrapePage();
    loadSettings();

    let timeoutId: any = null;

    // Listen for dynamic URL updates (e.g. currentJobId query param changes in LinkedIn SPA)
    const handleMessage = (message: any) => {
      if (message.action === 'urlChanged') {
        console.log('[Popup] Tab URL changed dynamically. Re-scraping after delay...');
        if (timeoutId) clearTimeout(timeoutId);
        // Delay re-scraping to give the DOM a chance to render the new job details
        timeoutId = setTimeout(() => {
          scrapePage();
        }, 500);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const getHostLabel = (urlStr: string): string => {
    try {
      const url = new URL(urlStr);
      return url.hostname.replace('www.', '');
    } catch {
      return 'Web';
    }
  };

  const showToast = (message: string) => {
    setSuccessMsg(message);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeTab === 'job') {
        if (!jobForm.title || !jobForm.company) {
          setErrorMsg('Job title and company name are required.');
          return;
        }
        const cleanJob: Job = {
          id: jobForm.id || crypto.randomUUID(),
          title: jobForm.title,
          company: jobForm.company,
          location: jobForm.location || 'Remote',
          experience: jobForm.experience || '',
          salary: jobForm.salary || '',
          employmentType: jobForm.employmentType || 'Full-time',
          skills: jobForm.skills || [],
          description: jobForm.description || '',
          source: jobForm.source || getHostLabel(pageUrl),
          url: jobForm.url || pageUrl,
          notes: jobForm.notes || '',
          tags: jobForm.tags || [],
          parserVersion: jobForm.parserVersion || '1.0.0',
          savedAt: new Date().toISOString(),
          
          recruiterName: jobForm.recruiterName || '',
          recruiterUrl: jobForm.recruiterUrl || '',
          companyUrl: jobForm.companyUrl || '',
          highlights: jobForm.highlights || ''
        };
        const res = await saveJob(cleanJob);
        
        if (syncSettings.token && syncSettings.syncEnabled) {
          const syncRes = await syncJobToBackend(cleanJob, syncSettings);
          if (syncRes.success) {
            showToast(`Job saved and synced to cloud!`);
          } else {
            showToast(`Job saved locally (cloud sync offline)`);
          }
        } else {
          showToast(`Job ${res.status === 'created' ? 'saved successfully!' : 'merged and updated!'}`);
        }
      } else if (activeTab === 'company') {
        if (!companyForm.name) {
          setErrorMsg('Company name is required.');
          return;
        }
        const cleanCompany: Company = {
          id: companyForm.id || crypto.randomUUID(),
          name: companyForm.name,
          website: companyForm.website || '',
          linkedin: companyForm.linkedin || '',
          industry: companyForm.industry || '',
          size: companyForm.size || '',
          location: companyForm.location || '',
          description: companyForm.description || '',
          notes: companyForm.notes || '',
          tags: companyForm.tags || [],
          parserVersion: companyForm.parserVersion || '1.0.0',
          savedAt: new Date().toISOString()
        };
        const res = await saveCompany(cleanCompany);
        
        if (syncSettings.token && syncSettings.syncEnabled) {
          const syncRes = await syncCompanyToBackend({
            name: cleanCompany.name,
            website: cleanCompany.website,
            linkedinUrl: cleanCompany.linkedin || '',
            industry: cleanCompany.industry,
            companySize: cleanCompany.size,
            locations: cleanCompany.location ? [cleanCompany.location] : [],
            description: cleanCompany.description,
            notes: cleanCompany.notes
          }, syncSettings);
          if (syncRes.success) {
            showToast(`Company saved and synced to cloud!`);
          } else {
            showToast(`Company saved locally (cloud sync offline)`);
          }
        } else {
          showToast(`Company ${res.status === 'created' ? 'saved successfully!' : 'merged and updated!'}`);
        }
      } else if (activeTab === 'post') {
        if (!postForm.author || !postForm.content) {
          setErrorMsg('Author name and content are required.');
          return;
        }
        const cleanPost: HiringPost = {
          id: postForm.id || crypto.randomUUID(),
          author: postForm.author,
          authorProfile: postForm.authorProfile || '',
          company: postForm.company || '',
          content: postForm.content,
          source: postForm.source || getHostLabel(pageUrl),
          url: postForm.url || pageUrl,
          tags: postForm.tags || [],
          parserVersion: postForm.parserVersion || '1.0.0',
          savedAt: new Date().toISOString()
        };
        const res = await savePost(cleanPost);
        
        if (syncSettings.token && syncSettings.syncEnabled) {
          const syncRes = await syncPostToBackend(cleanPost, syncSettings);
          if (syncRes.success) {
            showToast(`Hiring post saved and synced to cloud!`);
          } else {
            showToast(`Hiring post saved locally (cloud sync offline)`);
          }
        } else {
          showToast(`Hiring post ${res.status === 'created' ? 'saved successfully!' : 'merged and updated!'}`);
        }
      } else if (activeTab === 'recruiter') {
        if (!recruiterForm.name) {
          setErrorMsg('Recruiter name is required.');
          return;
        }
        const cleanRecruiter: Recruiter = {
          id: recruiterForm.id || crypto.randomUUID(),
          name: recruiterForm.name,
          company: recruiterForm.company || '',
          profileUrl: recruiterForm.profileUrl || '',
          postsCount: recruiterForm.postsCount || 1,
          notes: recruiterForm.notes || '',
          savedAt: new Date().toISOString()
        };
        const res = await saveRecruiter(cleanRecruiter);
        showToast(`Recruiter ${res.status === 'created' ? 'saved successfully!' : 'updated!'}`);
      }
      setErrorMsg(null);
    } catch (err: any) {
      setErrorMsg(`Failed to save: ${err.message}`);
    }
  };

  const openDashboard = () => {
    chrome.tabs.create({ url: 'dashboard.html' });
  };

  // Tag inputs helper
  const addTag = (type: 'job' | 'company' | 'post') => {
    if (!tagInput.trim()) return;
    const tag = tagInput.trim().toLowerCase();
    
    if (type === 'job') {
      if (!jobForm.tags?.includes(tag)) {
        setJobForm(prev => ({ ...prev, tags: [...(prev.tags || []), tag] }));
      }
    } else if (type === 'company') {
      if (!companyForm.tags?.includes(tag)) {
        setCompanyForm(prev => ({ ...prev, tags: [...(prev.tags || []), tag] }));
      }
    } else if (type === 'post') {
      if (!postForm.tags?.includes(tag)) {
        setPostForm(prev => ({ ...prev, tags: [...(prev.tags || []), tag] }));
      }
    }
    setTagInput('');
  };

  const removeTag = (type: 'job' | 'company' | 'post', tagToRemove: string) => {
    if (type === 'job') {
      setJobForm(prev => ({ ...prev, tags: (prev.tags || []).filter(t => t !== tagToRemove) }));
    } else if (type === 'company') {
      setCompanyForm(prev => ({ ...prev, tags: (prev.tags || []).filter(t => t !== tagToRemove) }));
    } else if (type === 'post') {
      setPostForm(prev => ({ ...prev, tags: (prev.tags || []).filter(t => t !== tagToRemove) }));
    }
  };

  // Skill inputs helper
  const addSkill = () => {
    if (!skillInput.trim()) return;
    const skill = skillInput.trim();
    if (!jobForm.skills?.includes(skill)) {
      setJobForm(prev => ({ ...prev, skills: [...(prev.skills || []), skill] }));
    }
    setSkillInput('');
  };

  const removeSkill = (skillToRemove: string) => {
    setJobForm(prev => ({ ...prev, skills: (prev.skills || []).filter(s => s !== skillToRemove) }));
  };

  return (
    <div className="w-full bg-zinc-950 text-zinc-100 flex flex-col min-h-[500px]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-indigo-400 fill-indigo-400" />
          <h1 className="font-semibold text-sm tracking-tight text-white">Job Intelligence</h1>
          <button 
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border font-medium transition-colors ${
              syncStatus === 'connected' 
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60' 
                : syncStatus === 'disabled'
                ? 'bg-zinc-800 text-zinc-500 border-zinc-700'
                : 'bg-amber-950/40 text-amber-400 border-amber-900/60'
            }`}
            title="Click to configure Cloud Sync"
          >
            {syncStatus === 'connected' ? (
              <>
                <Cloud className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Synced</span>
              </>
            ) : syncStatus === 'disabled' ? (
              <>
                <CloudOff className="w-3 h-3 text-zinc-500 shrink-0" />
                <span>Sync Off</span>
              </>
            ) : (
              <>
                <CloudOff className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Local-Only</span>
              </>
            )}
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            type="button"
            onClick={scrapePage}
            title="Refresh Scraper"
            className="p-1.5 hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-white"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab(activeTab === 'settings' ? 'job' : 'settings')}
            title="Cloud Sync Settings"
            className={`p-1.5 rounded transition-colors ${
              activeTab === 'settings' 
                ? 'bg-zinc-800 text-white' 
                : 'hover:bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button"
            onClick={openDashboard}
            title="Open Dashboard"
            className="p-1.5 hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-white"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Area */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10 gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-xs text-zinc-400">Scraping page details...</p>
        </div>
      ) : (
        <div className="p-4 flex-1 flex flex-col">
          {/* Notifications */}
          {successMsg && (
            <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-2 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-3 py-2 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Segmented Tab Controllers */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-900 rounded-lg border border-zinc-800 mb-4">
            <button
              onClick={() => { setActiveTab('job'); setErrorMsg(null); }}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'job' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Job</span>
            </button>
            <button
              onClick={() => { setActiveTab('company'); setErrorMsg(null); }}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'company' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Company</span>
            </button>
            <button
              onClick={() => { setActiveTab('post'); setErrorMsg(null); }}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'post' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Post</span>
            </button>
            <button
              onClick={() => { setActiveTab('settings'); setErrorMsg(null); }}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'settings' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
          </div>

          {/* Tab Content Forms */}
          <form onSubmit={handleSave} className="space-y-4 flex-1 flex flex-col">
            {activeTab === 'job' && (
              <div className="space-y-3 flex-1">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Job Title *</label>
                  <input
                    type="text"
                    value={jobForm.title}
                    onChange={e => setJobForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-zinc-700"
                    placeholder="Software Development Engineer"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Company *</label>
                    <input
                      type="text"
                      value={jobForm.company}
                      onChange={e => setJobForm(prev => ({ ...prev, company: e.target.value }))}
                      className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-zinc-700"
                      placeholder="Company Name"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Location</label>
                    <input
                      type="text"
                      value={jobForm.location}
                      onChange={e => setJobForm(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-zinc-700"
                      placeholder="Remote / San Francisco"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Experience</label>
                    <input
                      type="text"
                      value={jobForm.experience}
                      onChange={e => setJobForm(prev => ({ ...prev, experience: e.target.value }))}
                      className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-zinc-100 focus:outline-none focus:border-zinc-700"
                      placeholder="2-4 yrs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Salary</label>
                    <input
                      type="text"
                      value={jobForm.salary}
                      onChange={e => setJobForm(prev => ({ ...prev, salary: e.target.value }))}
                      className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-zinc-100 focus:outline-none focus:border-zinc-700"
                      placeholder="$120k - $140k"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Type</label>
                    <select
                      value={jobForm.employmentType}
                      onChange={e => setJobForm(prev => ({ ...prev, employmentType: e.target.value }))}
                      className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-zinc-100 focus:outline-none focus:border-zinc-700"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                </div>

                {/* Skills Section */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Extracted Skills</label>
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {jobForm.skills?.map(skill => (
                      <span key={skill} className="bg-zinc-800 text-zinc-300 text-[10px] px-2 py-0.5 rounded border border-zinc-700 flex items-center gap-1">
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} className="hover:text-rose-400">×</button>
                      </span>
                    ))}
                    {jobForm.skills?.length === 0 && <span className="text-[10px] text-zinc-600">No skills parsed yet</span>}
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                      className="flex-1 text-xs bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-zinc-100 focus:outline-none"
                      placeholder="Add tech skill (e.g. AWS)"
                    />
                    <button type="button" onClick={addSkill} className="bg-zinc-800 hover:bg-zinc-700 text-xs px-2.5 py-1 rounded">Add</button>
                  </div>
                </div>

                {/* Tags Section */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Tags (For organizing)</label>
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {jobForm.tags?.map(t => (
                      <span key={t} className="bg-indigo-950/40 text-indigo-300 text-[10px] px-2 py-0.5 rounded border border-indigo-900/60 flex items-center gap-1">
                        {t}
                        <button type="button" onClick={() => removeTag('job', t)} className="hover:text-rose-400">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag('job'); } }}
                      className="flex-1 text-xs bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-zinc-100 focus:outline-none"
                      placeholder="Add keyword tag (e.g. high-pay)"
                    />
                    <button type="button" onClick={() => addTag('job')} className="bg-zinc-800 hover:bg-zinc-700 text-xs px-2.5 py-1 rounded">Tag</button>
                  </div>
                </div>

                {/* LinkedIn Recruiter & Company Page Details */}
                {(jobForm.source?.toLowerCase().includes('linkedin') || jobForm.recruiterName || jobForm.recruiterUrl || jobForm.companyUrl) && (
                  <div className="bg-zinc-900/50 p-2.5 rounded border border-zinc-800 space-y-2">
                    <label className="block text-[9px] uppercase font-bold text-zinc-400">LinkedIn Intelligence</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[8px] uppercase font-bold text-zinc-500 mb-0.5">Recruiter Name</label>
                        <input
                          type="text"
                          value={jobForm.recruiterName || ''}
                          onChange={e => setJobForm(prev => ({ ...prev, recruiterName: e.target.value }))}
                          className="w-full text-[11px] bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-zinc-200 focus:outline-none focus:border-zinc-700 animate-fadeIn"
                          placeholder="Hiring Manager / Recruiter"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] uppercase font-bold text-zinc-500 mb-0.5">Recruiter Profile</label>
                        <input
                          type="text"
                          value={jobForm.recruiterUrl || ''}
                          onChange={e => setJobForm(prev => ({ ...prev, recruiterUrl: e.target.value }))}
                          className="w-full text-[11px] bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-zinc-200 focus:outline-none focus:border-zinc-700"
                          placeholder="https://linkedin.com/in/..."
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[8px] uppercase font-bold text-zinc-500 mb-0.5">Company LinkedIn Page</label>
                      <input
                        type="text"
                        value={jobForm.companyUrl || ''}
                        onChange={e => setJobForm(prev => ({ ...prev, companyUrl: e.target.value }))}
                        className="w-full text-[11px] bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-zinc-200 focus:outline-none focus:border-zinc-700"
                        placeholder="https://linkedin.com/company/..."
                      />
                    </div>
                  </div>
                )}

                {/* Job Highlights */}
                {(jobForm.source?.toLowerCase().includes('naukri') || jobForm.highlights) && (
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Job Highlights</label>
                    <textarea
                      value={jobForm.highlights || ''}
                      onChange={e => setJobForm(prev => ({ ...prev, highlights: e.target.value }))}
                      className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-zinc-700 h-16 resize-none"
                      placeholder="Extracted key bullet points..."
                    />
                  </div>
                )}

                {/* Job Description Textarea */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Job Description</label>
                  <textarea
                    value={jobForm.description}
                    onChange={e => setJobForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-zinc-700 h-24 resize-none"
                    placeholder="Full job description text..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Notes</label>
                  <textarea
                    value={jobForm.notes}
                    onChange={e => setJobForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-zinc-700 h-14 resize-none"
                    placeholder="Enter interview details or application pointers..."
                  />
                </div>
              </div>
            )}

            {activeTab === 'company' && (
              <div className="space-y-3 flex-1">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Company Name *</label>
                  <input
                    type="text"
                    value={companyForm.name}
                    onChange={e => setCompanyForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-zinc-700"
                    placeholder="Acme Corp"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Website</label>
                    <input
                      type="text"
                      value={companyForm.website}
                      onChange={e => setCompanyForm(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-zinc-700"
                      placeholder="https://acme.org"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">LinkedIn</label>
                    <input
                      type="text"
                      value={companyForm.linkedin}
                      onChange={e => setCompanyForm(prev => ({ ...prev, linkedin: e.target.value }))}
                      className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-zinc-700"
                      placeholder="https://linkedin.com/company/..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Industry</label>
                    <input
                      type="text"
                      value={companyForm.industry}
                      onChange={e => setCompanyForm(prev => ({ ...prev, industry: e.target.value }))}
                      className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-zinc-700"
                      placeholder="Enterprise SaaS"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Size</label>
                    <input
                      type="text"
                      value={companyForm.size}
                      onChange={e => setCompanyForm(prev => ({ ...prev, size: e.target.value }))}
                      className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-zinc-700"
                      placeholder="50-200 employees"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Tags</label>
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {companyForm.tags?.map(t => (
                      <span key={t} className="bg-indigo-950/40 text-indigo-300 text-[10px] px-2 py-0.5 rounded border border-indigo-900/60 flex items-center gap-1">
                        {t}
                        <button type="button" onClick={() => removeTag('company', t)} className="hover:text-rose-400">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag('company'); } }}
                      className="flex-1 text-xs bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-zinc-100 focus:outline-none"
                      placeholder="Add tag (e.g. startup)"
                    />
                    <button type="button" onClick={() => addTag('company')} className="bg-zinc-800 hover:bg-zinc-700 text-xs px-2.5 py-1 rounded">Tag</button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">About Company</label>
                  <textarea
                    value={companyForm.description}
                    onChange={e => setCompanyForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-zinc-700 h-16 resize-none"
                    placeholder="Enter short company details..."
                  />
                </div>
              </div>
            )}

            {activeTab === 'post' && (
              <div className="space-y-3 flex-1">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Author Name *</label>
                    <input
                      type="text"
                      value={postForm.author}
                      onChange={e => setPostForm(prev => ({ ...prev, author: e.target.value }))}
                      className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-zinc-700"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Company Guesstimate</label>
                    <input
                      type="text"
                      value={postForm.company}
                      onChange={e => setPostForm(prev => ({ ...prev, company: e.target.value }))}
                      className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-zinc-700"
                      placeholder="Stripe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Author Profile Link</label>
                  <input
                    type="text"
                    value={postForm.authorProfile}
                    onChange={e => setPostForm(prev => ({ ...prev, authorProfile: e.target.value }))}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-zinc-700"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Post URL</label>
                  <input
                    type="text"
                    value={postForm.url}
                    onChange={e => setPostForm(prev => ({ ...prev, url: e.target.value }))}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-zinc-700"
                    placeholder="https://linkedin.com/feed/update/..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Post Content *</label>
                  <textarea
                    value={postForm.content}
                    onChange={e => setPostForm(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-zinc-700 h-24 resize-none"
                    placeholder="Paste hiring text content here..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Tags</label>
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {postForm.tags?.map(t => (
                      <span key={t} className="bg-indigo-950/40 text-indigo-300 text-[10px] px-2 py-0.5 rounded border border-indigo-900/60 flex items-center gap-1">
                        {t}
                        <button type="button" onClick={() => removeTag('post', t)} className="hover:text-rose-400">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag('post'); } }}
                      className="flex-1 text-xs bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-zinc-100 focus:outline-none"
                      placeholder="Add tag"
                    />
                    <button type="button" onClick={() => addTag('post')} className="bg-zinc-800 hover:bg-zinc-700 text-xs px-2.5 py-1 rounded">Tag</button>
                  </div>
                </div>
              </div>
            )}

            {/* Commented out Recruiter tab form as requested
            {activeTab === 'recruiter' && (
              <div className="space-y-3 flex-1">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Recruiter Name *</label>
                  <input
                    type="text"
                    value={recruiterForm.name}
                    onChange={e => setRecruiterForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-zinc-700"
                    placeholder="Dave Miller"
                  />
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Company</label>
                    <input
                      type="text"
                      value={recruiterForm.company}
                      onChange={e => setRecruiterForm(prev => ({ ...prev, company: e.target.value }))}
                      className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-zinc-700"
                      placeholder="Meta"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Profile Link</label>
                    <input
                      type="text"
                      value={recruiterForm.profileUrl}
                      onChange={e => setRecruiterForm(prev => ({ ...prev, profileUrl: e.target.value }))}
                      className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-zinc-700"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Notes / Outreach log</label>
                  <textarea
                    value={recruiterForm.notes}
                    onChange={e => setRecruiterForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-zinc-700 h-28 resize-none"
                    placeholder="Sent DM on LinkedIn on 23rd June. Waiting for response..."
                  />
                </div>
              </div>
            )}
            */}

            {/* Settings Tab Form */}
            {activeTab === 'settings' && (
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="border-b border-zinc-800 pb-3">
                  <h3 className="font-semibold text-xs text-white">Cloud Sync Configuration</h3>
                  <p className="text-[10px] text-zinc-500 mt-1">Connect the extension to the Job Intelligence backend to synchronize your data automatically.</p>
                </div>

                <div className="space-y-3 flex-1">
                  {/* Backend URL */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Backend API URL</label>
                    <input
                      type="url"
                      value={syncSettings.baseUrl}
                      onChange={e => {
                        const val = e.target.value;
                        setSyncSettingsState(prev => ({ ...prev, baseUrl: val }));
                      }}
                      className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-zinc-700"
                      placeholder="http://localhost:5000/api"
                    />
                  </div>

                  {/* Sync Enabled Switch */}
                  <div className="flex items-center justify-between p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                    <div>
                      <span className="block text-xs font-semibold text-zinc-200">Auto Cloud Sync</span>
                      <span className="block text-[10px] text-zinc-500">Enable automatic syncing on save.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={syncSettings.syncEnabled}
                        onChange={async (e) => {
                          const enabled = e.target.checked;
                          setSyncSettingsState(prev => ({ ...prev, syncEnabled: enabled }));
                          await setSyncSettings({ syncEnabled: enabled });
                          if (!enabled) {
                            setSyncStatus('disabled');
                          } else {
                            loadSettings();
                          }
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-zinc-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white peer-checked:after:border-indigo-600"></div>
                    </label>
                  </div>

                  {/* Auth status block */}
                  {syncSettings.token ? (
                    <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-lg space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs text-zinc-300 font-semibold">Authenticated Session</span>
                      </div>
                      <p className="text-[10px] text-zinc-500">Your extension is currently authorized to sync jobs and companies to the cloud.</p>
                      
                      <button
                        type="button"
                        onClick={async () => {
                          await logoutFromBackend();
                          await loadSettings();
                          showToast('Logged out of cloud sync.');
                        }}
                        className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs py-1.5 rounded transition-colors font-medium border border-zinc-700"
                      >
                        Disconnect Cloud
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-zinc-900/40 border border-zinc-800 rounded-lg space-y-3">
                      <span className="block text-[10px] uppercase font-bold text-zinc-400">Account Authorization</span>
                      
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-zinc-500 mb-0.5">Email Address</label>
                        <input
                          type="email"
                          value={settingsEmail}
                          onChange={e => setSettingsEmail(e.target.value)}
                          className="w-full text-xs bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 focus:outline-none"
                          placeholder="suraj@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-zinc-500 mb-0.5">Password</label>
                        <input
                          type="password"
                          value={settingsPassword}
                          onChange={e => setSettingsPassword(e.target.value)}
                          className="w-full text-xs bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 focus:outline-none"
                          placeholder="••••••••"
                        />
                      </div>

                      <button
                        type="button"
                        disabled={isConnecting}
                        onClick={async () => {
                          if (!settingsEmail || !settingsPassword) {
                            setErrorMsg('Please enter email and password.');
                            return;
                          }
                          setIsConnecting(true);
                          setErrorMsg(null);
                          try {
                            const res = await loginToBackend(settingsEmail, settingsPassword, syncSettings.baseUrl);
                            if (res.success) {
                              showToast('Cloud Sync Connected successfully! 🚀');
                              await loadSettings();
                              setSettingsPassword('');
                            } else {
                              setErrorMsg(res.error || 'Authentication failed.');
                            }
                          } catch (err: any) {
                            setErrorMsg(err.message || 'Error authenticating.');
                          } finally {
                            setIsConnecting(false);
                          }
                        }}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/50 text-white text-xs py-2 rounded transition-colors font-medium flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10"
                      >
                        {isConnecting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Connecting...</span>
                          </>
                        ) : (
                          <span>Connect Cloud Sync</span>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Save Button */}
            {activeTab !== 'settings' && (
              <div className="pt-2 border-t border-zinc-800 mt-auto sticky bottom-0 bg-zinc-950">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-xs py-2 rounded transition-colors shadow-lg shadow-indigo-600/20"
                >
                  Save {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </button>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
