import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  db 
} from '../storage/db';
import { 
  deleteJob, 
  updateJob 
} from '../storage/jobs';
import { 
  deleteCompany, 
  updateCompany 
} from '../storage/companies';
import { 
  deletePost, 
  updatePost 
} from '../storage/posts';
/* Commented out unused recruiter storage imports
import { 
  deleteRecruiter, 
  updateRecruiter 
} from '../storage/recruiters';
*/
import { 
  updateApplicationStatus 
} from '../storage/applications';
import { 
  exportJobsJson, 
  exportJobsCsv, 
  exportCompaniesJson, 
  exportCompaniesCsv, 
  exportPostsJson, 
  exportPostsCsv 
} from '../utils/export';
import { 
  Briefcase, 
  Building2, 
  FileText, 
  Kanban, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Trash2, 
  X, 
  Download, 
  Bookmark, 
  MapPin, 
  DollarSign, 
  Clock, 
  Sparkles,
  Edit3,
  ExternalLink
} from 'lucide-react';
import type { Job, Company, HiringPost, Application } from '../types';

type SidebarTab = 'jobs' | 'companies' | 'posts' | 'recruiters' | 'pipeline';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<SidebarTab>('jobs');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'company'>('newest');
  const [sourceFilter, setSourceFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  // Selected item for the details drawer
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedPost, setSelectedPost] = useState<HiringPost | null>(null);
  // const [selectedRecruiter, setSelectedRecruiter] = useState<Recruiter | null>(null);
  
  // Edit mode in drawer
  const [isEditing, setIsEditing] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // ----------------------------------------------------
  // Database Queries (Dexie live sync)
  // ----------------------------------------------------
  const jobs = useLiveQuery(() => db.jobs.toArray()) || [];
  const companies = useLiveQuery(() => db.companies.toArray()) || [];
  const posts = useLiveQuery(() => db.posts.toArray()) || [];
  // const recruiters = useLiveQuery(() => db.recruiters.toArray()) || [];
  const applications = useLiveQuery(() => db.applications.toArray()) || [];

  // Match Job with Application status
  const jobStatusMap = React.useMemo(() => {
    const map = new Map<string, Application['status']>();
    applications.forEach(app => {
      map.set(app.jobId, app.status);
    });
    return map;
  }, [applications]);

  // Unique tags list for filters
  const allTags = React.useMemo(() => {
    const tagsSet = new Set<string>();
    jobs.forEach(j => j.tags?.forEach(t => tagsSet.add(t)));
    companies.forEach(c => c.tags?.forEach(t => tagsSet.add(t)));
    posts.forEach(p => p.tags?.forEach(t => tagsSet.add(t)));
    return Array.from(tagsSet);
  }, [jobs, companies, posts]);

  // Unique sources list for filters
  const allSources = React.useMemo(() => {
    const srcSet = new Set<string>();
    jobs.forEach(j => j.source && srcSet.add(j.source));
    posts.forEach(p => p.source && srcSet.add(p.source));
    return Array.from(srcSet);
  }, [jobs, posts]);

  // ----------------------------------------------------
  // Filtering & Sorting Logic
  // ----------------------------------------------------
  const filteredJobs = React.useMemo(() => {
    return jobs
      .filter(job => {
        const matchesSearch = 
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSource = sourceFilter ? job.source === sourceFilter : true;
        const matchesTag = tagFilter ? job.tags?.includes(tagFilter) : true;
        return matchesSearch && matchesSource && matchesTag;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
        if (sortBy === 'oldest') return new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime();
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'company') return a.company.localeCompare(b.company);
        return 0;
      });
  }, [jobs, searchTerm, sortBy, sourceFilter, tagFilter]);

  const filteredCompanies = React.useMemo(() => {
    return companies
      .filter(c => {
        const matchesSearch = 
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.industry || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTag = tagFilter ? c.tags?.includes(tagFilter) : true;
        return matchesSearch && matchesTag;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
        if (sortBy === 'oldest') return new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime();
        if (sortBy === 'title') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [companies, searchTerm, sortBy, tagFilter]);

  const filteredPosts = React.useMemo(() => {
    return posts
      .filter(p => {
        const matchesSearch = 
          p.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.company || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSource = sourceFilter ? p.source === sourceFilter : true;
        const matchesTag = tagFilter ? p.tags?.includes(tagFilter) : true;
        return matchesSearch && matchesSource && matchesTag;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
        if (sortBy === 'oldest') return new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime();
        return 0;
      });
  }, [posts, searchTerm, sortBy, sourceFilter, tagFilter]);

  /* Commented out unused filteredRecruiters as requested
  const filteredRecruiters = React.useMemo(() => {
    return recruiters
      .filter(r => {
        const matchesSearch = 
          r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.company || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
      })
      .sort((a, b) => {
        return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
      });
  }, [recruiters, searchTerm]);
  */

  // Pipeline columns sorting
  const pipelineJobs = React.useMemo(() => {
    const states: Record<Application['status'], Job[]> = {
      Saved: [],
      Applied: [],
      Interview: [],
      Rejected: [],
      Offer: []
    };
    jobs.forEach(job => {
      const status = jobStatusMap.get(job.id) || 'Saved';
      if (states[status]) {
        states[status].push(job);
      }
    });
    return states;
  }, [jobs, jobStatusMap]);

  // ----------------------------------------------------
  // Drawer Editing Handlers
  // ----------------------------------------------------
  const openJobDrawer = (job: Job) => {
    setSelectedJob(job);
    setEditNotes(job.notes || '');
    setEditTags(job.tags || []);
    setIsEditing(false);
  };

  const saveJobEdits = async () => {
    if (!selectedJob) return;
    await updateJob(selectedJob.id, {
      notes: editNotes,
      tags: editTags
    });
    setSelectedJob(prev => prev ? { ...prev, notes: editNotes, tags: editTags } : null);
    setIsEditing(false);
  };

  const handleUpdateStatus = async (jobId: string, status: Application['status']) => {
    await updateApplicationStatus(jobId, status);
  };

  const openCompanyDrawer = (c: Company) => {
    setSelectedCompany(c);
    setEditNotes(c.notes || '');
    setEditTags(c.tags || []);
    setIsEditing(false);
  };

  const saveCompanyEdits = async () => {
    if (!selectedCompany) return;
    await updateCompany(selectedCompany.id, {
      notes: editNotes,
      tags: editTags
    });
    setSelectedCompany(prev => prev ? { ...prev, notes: editNotes, tags: editTags } : null);
    setIsEditing(false);
  };

  const openPostDrawer = (p: HiringPost) => {
    setSelectedPost(p);
    setEditTags(p.tags || []);
    setIsEditing(false);
  };

  const savePostEdits = async () => {
    if (!selectedPost) return;
    await updatePost(selectedPost.id, {
      tags: editTags
    });
    setSelectedPost(prev => prev ? { ...prev, tags: editTags } : null);
    setIsEditing(false);
  };

  /* Commented out unused recruiter drawer functions as requested
  const openRecruiterDrawer = (r: Recruiter) => {
    setSelectedRecruiter(r);
    setEditNotes(r.notes || '');
    setIsEditing(false);
  };

  const saveRecruiterEdits = async () => {
    if (!selectedRecruiter) return;
    await updateRecruiter(selectedRecruiter.id, {
      notes: editNotes
    });
    setSelectedRecruiter(prev => prev ? { ...prev, notes: editNotes } : null);
    setIsEditing(false);
  };
  */

  const addTagToEdit = () => {
    if (!tagInput.trim()) return;
    const tag = tagInput.trim().toLowerCase();
    if (!editTags.includes(tag)) {
      setEditTags([...editTags, tag]);
    }
    setTagInput('');
  };

  const removeTagFromEdit = (tagToRemove: string) => {
    setEditTags(editTags.filter(t => t !== tagToRemove));
  };

  // ----------------------------------------------------
  // Export Click Handlers
  // ----------------------------------------------------
  const handleExport = (type: 'json' | 'csv') => {
    if (activeTab === 'jobs') {
      type === 'json' ? exportJobsJson(jobs) : exportJobsCsv(jobs);
    } else if (activeTab === 'companies') {
      type === 'json' ? exportCompaniesJson(companies) : exportCompaniesCsv(companies);
    } else if (activeTab === 'posts') {
      type === 'json' ? exportPostsJson(posts) : exportPostsCsv(posts);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans antialiased">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col p-5 shrink-0 select-none">
        <div className="flex items-center gap-3 mb-8 px-1">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center shadow-md shadow-brand-500/10">
            <Bookmark className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wide text-slate-800">Intel<span className="text-brand-600">JET</span></h1>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Collector Console</p>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          <button
            onClick={() => { setActiveTab('jobs'); setSearchTerm(''); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'jobs' 
                ? 'bg-brand-50 text-brand-600 border border-brand-100/50' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-brand-600 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Briefcase className="w-4 h-4 text-brand-600 animate-pulse" />
              <span>Saved Jobs</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-lg border font-bold ${
              activeTab === 'jobs' 
                ? 'bg-white border-brand-100/55 text-brand-600 shadow-sm shadow-brand-500/5' 
                : 'bg-slate-50 border-slate-100 text-slate-400'
            }`}>{jobs.length}</span>
          </button>

          <button
            onClick={() => { setActiveTab('companies'); setSearchTerm(''); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'companies' 
                ? 'bg-brand-50 text-brand-600 border border-brand-100/50' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-brand-600 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-emerald-500" />
              <span>Saved Companies</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-lg border font-bold ${
              activeTab === 'companies' 
                ? 'bg-white border-emerald-100/55 text-emerald-600 shadow-sm shadow-emerald-500/5' 
                : 'bg-slate-50 border-slate-100 text-slate-400'
            }`}>{companies.length}</span>
          </button>

          <button
            onClick={() => { setActiveTab('posts'); setSearchTerm(''); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'posts' 
                ? 'bg-brand-50 text-brand-600 border border-brand-100/50' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-brand-600 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-amber-500" />
              <span>Hiring Posts</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-lg border font-bold ${
              activeTab === 'posts' 
                ? 'bg-white border-amber-100/55 text-amber-600 shadow-sm shadow-amber-500/5' 
                : 'bg-slate-50 border-slate-100 text-slate-400'
            }`}>{posts.length}</span>
          </button>

          <button
            onClick={() => { setActiveTab('pipeline'); setSearchTerm(''); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'pipeline' 
                ? 'bg-brand-50 text-brand-600 border border-brand-100/50' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-brand-600 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Kanban className="w-4 h-4 text-rose-500" />
              <span>Application Pipeline</span>
            </div>
          </button>
        </nav>

        {/* Footer Area */}
        <div className="border-t border-slate-100 pt-4 text-center mt-auto flex flex-col items-center">
          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-medium">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>IntelJET Console v1.0</span>
          </div>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header Actions */}
        <header className="h-16 border-b border-slate-100 px-8 flex items-center justify-between bg-white/90 backdrop-blur-md sticky top-0 z-10">
          <div className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Exporters dropdown buttons */}
            {activeTab !== 'recruiters' && activeTab !== 'pipeline' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleExport('json')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[11px] text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-colors shadow-sm font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>JSON</span>
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[11px] text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-colors shadow-sm font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Dashboard Panels */}
        <div className="p-8 flex-1 overflow-y-auto">
          {/* Sub Filters Header (Only for items, not pipeline) */}
          {activeTab !== 'pipeline' && activeTab !== 'recruiters' && (
            <div className="flex items-center gap-4 mb-6 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold">Filters:</span>
              </div>
              
              {/* Source filter */}
              {(activeTab === 'jobs' || activeTab === 'posts') && (
                <select
                  value={sourceFilter}
                  onChange={e => setSourceFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:border-brand-500 transition-all font-medium"
                >
                  <option value="">All Sources</option>
                  {allSources.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              )}

              {/* Tag filter */}
              <select
                value={tagFilter}
                onChange={e => setTagFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:border-brand-500 transition-all font-medium"
              >
                <option value="">All Tags</option>
                {allTags.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              {/* Sort filter */}
              <div className="flex items-center gap-2 ml-auto">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:border-brand-500 transition-all font-medium"
                >
                  <option value="newest">Saved (Newest)</option>
                  <option value="oldest">Saved (Oldest)</option>
                  <option value="title">Alphabetical (Title/Name)</option>
                  {activeTab === 'jobs' && <option value="company">Company</option>}
                </select>
              </div>
            </div>
          )}

          {/* Section: Jobs */}
          {activeTab === 'jobs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-fade-in">
              {filteredJobs.map(job => {
                const status = jobStatusMap.get(job.id) || 'Saved';
                const statusClass = status === 'Saved' ? 'status-saved' : status === 'Applied' ? 'status-applied' : status === 'Interview' ? 'status-interview' : status === 'Rejected' ? 'status-rejected' : 'status-offer';
                return (
                  <div 
                    key={job.id} 
                    onClick={() => openJobDrawer(job)}
                    className="glass-card-hover p-5 cursor-pointer transition-all duration-350 hover:-translate-y-1 hover:shadow-md hover:shadow-slate-100/50 flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <h3 className="font-bold text-xs text-slate-800 line-clamp-1">{job.title}</h3>
                      <span className={statusClass}>
                        {status}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] mb-4 font-semibold">{job.company}</p>
                    
                    <div className="space-y-1.5 text-[11px] text-slate-500 mb-4 border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="line-clamp-1">{job.location}</span>
                      </div>
                      {job.salary && (
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          <span>{job.salary}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span>Saved {new Date(job.savedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-auto">
                      {job.skills?.slice(0, 3).map(skill => (
                        <span key={skill} className="bg-slate-50 text-slate-600 text-[9px] px-2 py-0.5 rounded border border-slate-100 font-medium">
                          {skill}
                        </span>
                      ))}
                      {job.tags?.slice(0, 2).map(tag => (
                        <span key={tag} className="bg-brand-50 text-brand-600 text-[9px] px-2 py-0.5 rounded border border-brand-100/40 font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
              {filteredJobs.length === 0 && <EmptyState label="No job listings found" />}
            </div>
          )}

          {/* Section: Companies */}
          {activeTab === 'companies' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-fade-in">
              {filteredCompanies.map(c => (
                <div 
                  key={c.id}
                  onClick={() => openCompanyDrawer(c)}
                  className="glass-card-hover p-5 cursor-pointer transition-all duration-350 hover:-translate-y-1 hover:shadow-md hover:shadow-slate-100/50"
                >
                  <h3 className="font-bold text-xs text-slate-800 mb-2 line-clamp-1">{c.name}</h3>
                  {c.industry && <p className="text-slate-400 text-[10px] mb-3 uppercase tracking-wider font-bold">{c.industry}</p>}
                  <p className="text-slate-500 text-[11px] line-clamp-2 mb-4 h-8">{c.description || 'No description available.'}</p>
                  
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-450 font-medium">
                    <span>{c.size || 'Unknown Size'}</span>
                    <span>Saved {new Date(c.savedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {filteredCompanies.length === 0 && <EmptyState label="No company profiles found" />}
            </div>
          )}

          {/* Section: Hiring Posts */}
          {activeTab === 'posts' && (
            <div className="space-y-4 max-w-4xl mx-auto animate-fade-in">
              {filteredPosts.map(post => (
                <div 
                  key={post.id}
                  onClick={() => openPostDrawer(post)}
                  className="glass-card p-6 cursor-pointer transition-all duration-350 hover:border-brand-500/20 hover:shadow-md hover:shadow-slate-200/50 hover:-translate-y-0.5"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-xs text-slate-800">{post.author}</h3>
                      <p className="text-slate-500 text-[10px]">{post.company ? `Recruiting at ${post.company}` : 'Hiring Recruiter'}</p>
                    </div>
                    <span className="text-[10px] text-slate-450 font-medium">{new Date(post.savedAt).toLocaleDateString()}</span>
                  </div>
                  
                  <p className="text-slate-600 text-xs line-clamp-3 mb-4 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                  
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-[10px] text-brand-600 font-bold uppercase">{post.source}</span>
                    <div className="flex gap-1">
                      {post.tags?.map(t => (
                        <span key={t} className="bg-slate-50 text-slate-500 text-[9px] px-2 py-0.5 rounded border border-slate-100 font-semibold">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {filteredPosts.length === 0 && <EmptyState label="No hiring posts found" />}
            </div>
          )}


          {/* Commented out Section: Recruiters as requested
          {activeTab === 'recruiters' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredRecruiters.map(r => (
                <div 
                  key={r.id}
                  onClick={() => openRecruiterDrawer(r)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 cursor-pointer transition-all hover:-translate-y-0.5"
                >
                  <h3 className="font-semibold text-xs text-white mb-1">{r.name}</h3>
                  <p className="text-zinc-500 text-[11px] mb-3">{r.company || 'Independent Recruiter'}</p>
                  
                  {r.notes && <p className="text-zinc-400 text-[11px] line-clamp-2 h-8 mb-4 italic">"{r.notes}"</p>}

                  <div className="flex items-center justify-between text-[10px] border-t border-zinc-800 pt-3 text-zinc-500">
                    <span>{r.profileUrl ? 'LinkedIn Profile linked' : 'No link'}</span>
                    <span>Posts saved: {r.postsCount || 1}</span>
                  </div>
                </div>
              ))}
              {filteredRecruiters.length === 0 && <EmptyState label="No recruiter contacts saved" />}
            </div>
          )}
          */}

          {/* Section: Application Pipeline Kanban */}
          {activeTab === 'pipeline' && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-[calc(100vh-170px)] animate-fade-in">
              {(['Saved', 'Applied', 'Interview', 'Rejected', 'Offer'] as Application['status'][]).map(colStatus => (
                <div key={colStatus} className="bg-slate-100/60 border border-slate-200/50 rounded-2xl flex flex-col p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-4 px-1">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-500">{colStatus}</span>
                    <span className="bg-white text-slate-400 text-[10px] px-2 py-0.5 rounded-lg border border-slate-200 font-bold">
                      {pipelineJobs[colStatus]?.length || 0}
                    </span>
                  </div>
                  
                  <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                    {pipelineJobs[colStatus]?.map(job => (
                      <div
                        key={job.id}
                        onClick={() => openJobDrawer(job)}
                        className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm hover:border-brand-500/20 hover:shadow transition-all cursor-pointer"
                      >
                        <h4 className="font-bold text-xs text-slate-800 line-clamp-1 mb-1">{job.title}</h4>
                        <p className="text-slate-500 text-[10px] mb-3 font-semibold">{job.company}</p>
                        
                        <div className="flex items-center justify-between text-[9px] text-slate-400">
                          <span className="truncate max-w-[80px] font-medium">{job.location}</span>
                          
                          {/* Selector to shift status directly */}
                          <select
                            value={colStatus}
                            onClick={e => e.stopPropagation()}
                            onChange={e => handleUpdateStatus(job.id, e.target.value as any)}
                            className="bg-slate-50 border border-slate-200 text-[9px] text-slate-600 rounded px-1.5 py-0.5 focus:outline-none focus:border-brand-500 transition-all font-medium"
                          >
                            <option value="Saved">Saved</option>
                            <option value="Applied">Applied</option>
                            <option value="Interview">Interview</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Offer">Offer</option>
                          </select>
                        </div>
                      </div>
                    ))}
                    {pipelineJobs[colStatus]?.length === 0 && (
                      <div className="h-24 border border-dashed border-slate-200/50 rounded-xl flex items-center justify-center bg-slate-50/50">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Empty</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ---------------------------------------------------- */}
      {/* DETAILS DRAWER COMPONENT (SLIDE OVER)               */}
      {/* ---------------------------------------------------- */}

      {/* Drawer: Job details */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end animate-fade-in">
          <div className="absolute inset-0" onClick={() => setSelectedJob(null)} />
          <div className="w-[500px] bg-white border-l border-slate-200 h-full flex flex-col p-6 animate-slide-over relative z-10 shadow-2xl">
            <header className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
              <span className="text-[10px] bg-slate-50 border border-slate-200/50 text-slate-500 px-2 py-0.5 rounded-lg uppercase font-bold tracking-widest">{selectedJob.source}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-1.5 hover:bg-slate-100 border border-slate-200/60 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                  title="Edit details"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={async () => { if (confirm('Delete job listing?')) { await deleteJob(selectedJob.id); setSelectedJob(null); } }}
                  className="p-1.5 hover:bg-rose-50 border border-slate-200/60 hover:border-rose-100 rounded-lg text-slate-500 hover:text-rose-600 transition-colors"
                  title="Delete job"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedJob(null)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              <div>
                <h2 className="text-base font-bold text-slate-800 mb-1.5">{selectedJob.title}</h2>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                  <span>{selectedJob.company}</span>
                  <span>•</span>
                  <span>{selectedJob.location}</span>
                </div>
              </div>

              {/* Quick details block */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600">
                <div>
                  <span className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Salary</span>
                  <span className="text-slate-800 font-bold">{selectedJob.salary || 'Not specified'}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Experience</span>
                  <span className="text-slate-800 font-bold">{selectedJob.experience || 'Not specified'}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Type</span>
                  <span className="text-slate-800 font-bold">{selectedJob.employmentType || 'Full-time'}</span>
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-450 mb-2">Application Tracking Status</label>
                <select
                  value={jobStatusMap.get(selectedJob.id) || 'Saved'}
                  onChange={e => handleUpdateStatus(selectedJob.id, e.target.value as any)}
                  className="bg-white border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-2 w-full focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all font-semibold"
                >
                  <option value="Saved">Saved</option>
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Offer">Offer</option>
                </select>
              </div>

              {/* Edit Block (Notes / Tags) */}
              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1.5">Notes</label>
                      <textarea
                        value={editNotes}
                        onChange={e => setEditNotes(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-805 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all h-28 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1.5">Tags</label>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {editTags.map(t => (
                          <span key={t} className="bg-brand-50 text-brand-600 text-[10px] px-2 py-0.5 rounded-lg border border-brand-100/50 flex items-center gap-1 font-medium">
                            {t}
                            <button type="button" onClick={() => removeTagFromEdit(t)} className="hover:text-rose-600 font-bold">×</button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={e => setTagInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTagToEdit(); } }}
                          placeholder="New tag..."
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-850 focus:outline-none focus:border-brand-500 transition-all"
                        />
                        <button type="button" onClick={addTagToEdit} className="bg-slate-200 hover:bg-slate-350 text-slate-700 text-xs px-3 rounded-xl font-semibold transition-colors">Add</button>
                      </div>
                    </div>
                    <button
                      onClick={saveJobEdits}
                      className="w-full btn-primary bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all active:scale-95"
                    >
                      Save Changes
                    </button>
                  </>
                ) : (
                  <>
                    {/* View mode Notes */}
                    <div>
                      <h4 className="text-[10px] uppercase font-bold text-slate-450 mb-1.5">My Notes</h4>
                      <div className="bg-slate-50/60 border border-slate-100 p-4 rounded-xl text-xs text-slate-600 whitespace-pre-wrap italic h-24 overflow-y-auto">
                        {selectedJob.notes || 'No notes added yet. Click edit to append notes.'}
                      </div>
                    </div>

                    {/* View mode Tags */}
                    <div>
                      <h4 className="text-[10px] uppercase font-bold text-slate-450 mb-1.5">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedJob.tags?.map(t => (
                          <span key={t} className="bg-brand-50 text-brand-600 text-[10px] px-2.5 py-0.5 rounded-lg border border-brand-100/40 font-semibold">
                            {t}
                          </span>
                        ))}
                        {selectedJob.tags?.length === 0 && <span className="text-[11px] text-slate-400">No tags added yet.</span>}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Skills required */}
              <div>
                <h4 className="text-[10px] uppercase font-bold text-slate-450 mb-2">Target Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedJob.skills?.map(skill => (
                    <span key={skill} className="bg-slate-100 text-slate-600 text-[10px] px-3 py-1 rounded-lg border border-slate-200/50 font-medium">
                      {skill}
                    </span>
                  ))}
                  {selectedJob.skills?.length === 0 && <span className="text-slate-400 text-xs font-medium">No specific skill matches detected.</span>}
                </div>
              </div>

              {/* Link out */}
              <div className="pt-2 border-t border-slate-100">
                <a
                  href={selectedJob.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-200 py-2 rounded-xl text-xs font-bold transition-colors"
                >
                  <span>Open Original Job Posting</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Job Highlights */}
              {selectedJob.highlights && (
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-slate-450 mb-2">Job Highlights</h4>
                  <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-xl text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
                    {selectedJob.highlights}
                  </div>
                </div>
              )}

              {/* LinkedIn Recruiter & Company Page Details */}
              {(selectedJob.recruiterName || selectedJob.recruiterUrl || selectedJob.companyUrl) && (
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-3 animate-fade-in">
                  <h4 className="text-[10px] uppercase font-bold text-slate-500">LinkedIn Intelligence</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedJob.recruiterName && (
                      <div>
                        <span className="block text-[8px] uppercase font-bold text-slate-400 mb-0.5">Recruiter</span>
                        {selectedJob.recruiterUrl ? (
                          <a 
                            href={selectedJob.recruiterUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-xs text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <span>{selectedJob.recruiterName}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-slate-800 font-semibold">{selectedJob.recruiterName}</span>
                        )}
                      </div>
                    )}
                    {selectedJob.companyUrl && (
                      <div>
                        <span className="block text-[8px] uppercase font-bold text-slate-400 mb-0.5">Company Page</span>
                        <a 
                          href={selectedJob.companyUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-xs text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <span>View on LinkedIn</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Job Description details (HTML) */}
              <div>
                <h4 className="text-[10px] uppercase font-bold text-slate-455 mb-2">Parsed Description</h4>
                <div 
                  className="bg-slate-50 p-4 border border-slate-100 rounded-xl text-xs text-slate-600 leading-relaxed overflow-x-auto select-text break-words h-64 overflow-y-auto scrollbar-thin html-description"
                  dangerouslySetInnerHTML={{ __html: selectedJob.description || 'No description extracted.' }}
                />
              </div>
            </div>
          </div>
        </div>
      )} )      {/* Drawer: Company details */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end animate-fade-in">
          <div className="absolute inset-0" onClick={() => setSelectedCompany(null)} />
          <div className="w-[500px] bg-white border-l border-slate-200 h-full flex flex-col p-6 animate-slide-over relative z-10 shadow-2xl">
            <header className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
              <span className="text-[10px] bg-slate-50 border border-slate-200/50 text-slate-500 px-2 py-0.5 rounded-lg uppercase font-bold tracking-widest">Company Profile</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-1.5 hover:bg-slate-100 border border-slate-200/60 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={async () => { if (confirm('Delete company?')) { await deleteCompany(selectedCompany.id); setSelectedCompany(null); } }}
                  className="p-1.5 hover:bg-rose-50 border border-slate-200/60 hover:border-rose-100 rounded-lg text-slate-500 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedCompany(null)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              <div>
                <h2 className="text-base font-bold text-slate-800 mb-2">{selectedCompany.name}</h2>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                  <span>{selectedCompany.industry || 'No Industry listed'}</span>
                  <span>•</span>
                  <span>{selectedCompany.size || 'Unknown size'}</span>
                </div>
              </div>

              {/* Website links */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {selectedCompany.website && (
                  <a
                    href={selectedCompany.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 py-1.5 rounded-xl text-slate-600 hover:text-slate-800 font-bold transition-colors"
                  >
                    <span>Website</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {selectedCompany.linkedin && (
                  <a
                    href={selectedCompany.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 py-1.5 rounded-xl text-slate-600 hover:text-slate-800 font-bold transition-colors"
                  >
                    <span>LinkedIn Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Description */}
              <div>
                <h4 className="text-[10px] uppercase font-bold text-slate-450 mb-2">Description / Bio</h4>
                <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-xl text-xs text-slate-600 leading-relaxed max-h-48 overflow-y-auto">
                  {selectedCompany.description || 'No description profile available.'}
                </div>
              </div>

              {/* Editing Notes & Tags */}
              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1.5">Notes</label>
                      <textarea
                        value={editNotes}
                        onChange={e => setEditNotes(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-805 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all h-28 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1.5">Tags</label>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {editTags.map(t => (
                          <span key={t} className="bg-brand-50 text-brand-600 text-[10px] px-2 py-0.5 rounded-lg border border-brand-100/50 flex items-center gap-1 font-medium">
                            {t}
                            <button type="button" onClick={() => removeTagFromEdit(t)} className="hover:text-rose-600 font-bold">×</button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={e => setTagInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTagToEdit(); } }}
                          placeholder="New tag..."
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-850 focus:outline-none focus:border-brand-500 transition-all"
                        />
                        <button type="button" onClick={addTagToEdit} className="bg-slate-200 hover:bg-slate-350 text-slate-700 text-xs px-3 rounded-xl font-semibold transition-colors">Add</button>
                      </div>
                    </div>
                    <button
                      onClick={saveCompanyEdits}
                      className="w-full btn-primary bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all active:scale-95"
                    >
                      Save Changes
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <h4 className="text-[10px] uppercase font-bold text-slate-450 mb-1.5">My Notes</h4>
                      <div className="bg-slate-50/60 border border-slate-100 p-4 rounded-xl text-xs text-slate-600 whitespace-pre-wrap italic h-24 overflow-y-auto">
                        {selectedCompany.notes || 'No notes added.'}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[10px] uppercase font-bold text-slate-450 mb-1.5">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedCompany.tags?.map(t => (
                          <span key={t} className="bg-brand-50 text-brand-600 text-[10px] px-2.5 py-0.5 rounded-lg border border-brand-100/40 font-semibold">
                            {t}
                          </span>
                        ))}
                        {selectedCompany.tags?.length === 0 && <span className="text-[11px] text-slate-400">No tags.</span>}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drawer: Hiring Post details */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end animate-fade-in">
          <div className="absolute inset-0" onClick={() => setSelectedPost(null)} />
          <div className="w-[500px] bg-white border-l border-slate-200 h-full flex flex-col p-6 animate-slide-over relative z-10 shadow-2xl">
            <header className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
              <span className="text-[10px] bg-slate-50 border border-slate-200/50 text-slate-500 px-2 py-0.5 rounded-lg uppercase font-bold tracking-widest font-semibold">Hiring Post</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-1.5 hover:bg-slate-100 border border-slate-200/60 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={async () => { if (confirm('Delete post?')) { await deletePost(selectedPost.id); setSelectedPost(null); } }}
                  className="p-1.5 hover:bg-rose-50 border border-slate-200/60 hover:border-rose-100 rounded-lg text-slate-500 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedPost(null)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              <div>
                <h2 className="text-base font-bold text-slate-800 mb-1.5">{selectedPost.author}</h2>
                <p className="text-xs text-slate-500 font-semibold">{selectedPost.company ? `Recruiter at ${selectedPost.company}` : 'Hiring Post Publisher'}</p>
              </div>

              {selectedPost.authorProfile && (
                <a
                  href={selectedPost.authorProfile}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 py-2 rounded-xl text-xs text-slate-700 font-bold transition-colors"
                >
                  <span>Open Recruiter Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              {/* Content */}
              <div>
                <h4 className="text-[10px] uppercase font-bold text-slate-450 mb-2">Post Content</h4>
                <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-xl text-xs text-slate-600 leading-relaxed whitespace-pre-wrap overflow-y-auto max-h-64">
                  {selectedPost.content}
                </div>
              </div>

              {/* Edit/Tags section */}
              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1.5">Tags</label>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {editTags.map(t => (
                          <span key={t} className="bg-brand-50 text-brand-600 text-[10px] px-2 py-0.5 rounded-lg border border-brand-100/50 flex items-center gap-1 font-medium">
                            {t}
                            <button type="button" onClick={() => removeTagFromEdit(t)} className="hover:text-rose-600 font-bold">×</button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={e => setTagInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTagToEdit(); } }}
                          placeholder="New tag..."
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-850 focus:outline-none focus:border-brand-500 transition-all"
                        />
                        <button type="button" onClick={addTagToEdit} className="bg-slate-200 hover:bg-slate-350 text-slate-700 text-xs px-3 rounded-xl font-semibold transition-colors">Add</button>
                      </div>
                    </div>
                    <button
                      onClick={savePostEdits}
                      className="w-full btn-primary bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all active:scale-95"
                    >
                      Save Tags
                    </button>
                  </>
                ) : (
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-slate-450 mb-1.5">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedPost.tags?.map(t => (
                        <span key={t} className="bg-brand-50 text-brand-600 text-[10px] px-2.5 py-0.5 rounded-lg border border-brand-100/40 font-semibold">
                          {t}
                        </span>
                      ))}
                      {selectedPost.tags?.length === 0 && <span className="text-[11px] text-slate-400">No tags.</span>}
                    </div>
                  </div>
                )}
              </div>

              {selectedPost.url && (
                <div className="pt-2 border-t border-slate-100">
                  <a
                    href={selectedPost.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-200 py-2 rounded-xl text-xs font-bold transition-colors"
                  >
                    <span>View original update post</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Drawer: Recruiter details commented out */}
    </div>
  );
}

// ----------------------------------------------------
// UI Sub-Components
// ----------------------------------------------------

function EmptyState({ label }: { label: string }) {
  return (
    <div className="col-span-full border border-dashed border-slate-200 bg-slate-100/30 rounded-2xl flex flex-col items-center justify-center py-20 px-4 text-center animate-fade-in">
      <Briefcase className="w-10 h-10 text-slate-300 stroke-[1.5] mb-3 animate-pulse" />
      <h4 className="font-bold text-sm text-slate-600 mb-1">{label}</h4>
      <p className="text-xs text-slate-450 max-w-xs leading-relaxed font-medium">Use the Chrome extension popup to collect items from supported sites, and they will sync here.</p>
    </div>
  );
}
