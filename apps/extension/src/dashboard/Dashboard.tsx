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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col p-5 shrink-0 select-none">
        <div className="flex items-center gap-3 mb-8 px-1">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/35">
            <Bookmark className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <h1 className="font-semibold text-sm tracking-wide text-white">Job Intelligence</h1>
            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Collector Console</p>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          <button
            onClick={() => { setActiveTab('jobs'); setSearchTerm(''); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'jobs' 
                ? 'bg-zinc-800 text-white border border-zinc-700' 
                : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              <span>Saved Jobs</span>
            </div>
            <span className="bg-zinc-950 text-[10px] px-2 py-0.5 rounded border border-zinc-800 text-zinc-500">{jobs.length}</span>
          </button>

          <button
            onClick={() => { setActiveTab('companies'); setSearchTerm(''); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'companies' 
                ? 'bg-zinc-800 text-white border border-zinc-700' 
                : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Saved Companies</span>
            </div>
            <span className="bg-zinc-950 text-[10px] px-2 py-0.5 rounded border border-zinc-800 text-zinc-500">{companies.length}</span>
          </button>

          <button
            onClick={() => { setActiveTab('posts'); setSearchTerm(''); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'posts' 
                ? 'bg-zinc-800 text-white border border-zinc-700' 
                : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Hiring Posts</span>
            </div>
            <span className="bg-zinc-950 text-[10px] px-2 py-0.5 rounded border border-zinc-800 text-zinc-500">{posts.length}</span>
          </button>


          {/* Commented out Recruiters tab button as requested
          <button
            onClick={() => { setActiveTab('recruiters'); setSearchTerm(''); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'recruiters' 
                ? 'bg-zinc-800 text-white border border-zinc-700' 
                : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <UserSquare2 className="w-4 h-4 text-violet-400" />
              <span>Recruiters</span>
            </div>
            <span className="bg-zinc-950 text-[10px] px-2 py-0.5 rounded border border-zinc-800 text-zinc-500">{recruiters.length}</span>
          </button>
          */}

          <button
            onClick={() => { setActiveTab('pipeline'); setSearchTerm(''); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'pipeline' 
                ? 'bg-zinc-800 text-white border border-zinc-700' 
                : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Kanban className="w-4 h-4 text-rose-400" />
              <span>Application Pipeline</span>
            </div>
          </button>
        </nav>

        {/* Footer Area */}
        <div className="border-t border-zinc-800 pt-4 text-center mt-auto flex flex-col items-center">
          <div className="flex items-center gap-2 text-zinc-500 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Job Intelligence v1.0</span>
          </div>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header Actions */}
        <header className="h-16 border-b border-zinc-800 px-8 flex items-center justify-between bg-zinc-900/10 backdrop-blur-md sticky top-0 z-10">
          <div className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Exporters dropdown buttons */}
            {activeTab !== 'recruiters' && activeTab !== 'pipeline' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleExport('json')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[11px] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>JSON</span>
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[11px] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
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
            <div className="flex items-center gap-4 mb-6 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-zinc-500" />
                <span>Filters:</span>
              </div>
              
              {/* Source filter */}
              {(activeTab === 'jobs' || activeTab === 'posts') && (
                <select
                  value={sourceFilter}
                  onChange={e => setSourceFilter(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300 focus:outline-none"
                >
                  <option value="">All Sources</option>
                  {allSources.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              )}

              {/* Tag filter */}
              <select
                value={tagFilter}
                onChange={e => setTagFilter(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300 focus:outline-none"
              >
                <option value="">All Tags</option>
                {allTags.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              {/* Sort filter */}
              <div className="flex items-center gap-2 ml-auto">
                <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300 focus:outline-none"
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredJobs.map(job => (
                <div 
                  key={job.id} 
                  onClick={() => openJobDrawer(job)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/50"
                >
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <h3 className="font-semibold text-xs text-white line-clamp-1">{job.title}</h3>
                    <span className="bg-indigo-950 text-[10px] text-indigo-400 px-2 py-0.5 rounded border border-indigo-900/60 shrink-0 font-medium">
                      {jobStatusMap.get(job.id) || 'Saved'}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-[11px] mb-4 font-medium">{job.company}</p>
                  
                  <div className="space-y-1.5 text-[11px] text-zinc-500 mb-4 border-t border-zinc-800 pt-3">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="line-clamp-1">{job.location}</span>
                    </div>
                    {job.salary && (
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 shrink-0" />
                        <span>{job.salary}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>Saved {new Date(job.savedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-auto">
                    {job.skills?.slice(0, 3).map(skill => (
                      <span key={skill} className="bg-zinc-800 text-zinc-400 text-[9px] px-2 py-0.5 rounded border border-zinc-700/50">
                        {skill}
                      </span>
                    ))}
                    {job.tags?.slice(0, 2).map(tag => (
                      <span key={tag} className="bg-indigo-950/30 text-indigo-400 text-[9px] px-2 py-0.5 rounded border border-indigo-900/30">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {filteredJobs.length === 0 && <EmptyState label="No job listings found" />}
            </div>
          )}

          {/* Section: Companies */}
          {activeTab === 'companies' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredCompanies.map(c => (
                <div 
                  key={c.id}
                  onClick={() => openCompanyDrawer(c)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 cursor-pointer transition-all hover:-translate-y-0.5"
                >
                  <h3 className="font-semibold text-xs text-white mb-2 line-clamp-1">{c.name}</h3>
                  {c.industry && <p className="text-zinc-500 text-[10px] mb-3 uppercase tracking-wider font-bold">{c.industry}</p>}
                  <p className="text-zinc-400 text-[11px] line-clamp-2 mb-4 h-8">{c.description || 'No description available.'}</p>
                  
                  <div className="flex items-center justify-between border-t border-zinc-800 pt-3 text-[11px] text-zinc-500">
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
            <div className="space-y-4 max-w-4xl mx-auto">
              {filteredPosts.map(post => (
                <div 
                  key={post.id}
                  onClick={() => openPostDrawer(post)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 cursor-pointer transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-xs text-white">{post.author}</h3>
                      <p className="text-zinc-500 text-[10px]">{post.company ? `Recruiting at ${post.company}` : 'Hiring Recruiter'}</p>
                    </div>
                    <span className="text-[10px] text-zinc-500">{new Date(post.savedAt).toLocaleDateString()}</span>
                  </div>
                  
                  <p className="text-zinc-300 text-xs line-clamp-3 mb-4 whitespace-pre-wrap">{post.content}</p>
                  
                  <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
                    <span className="text-[10px] text-indigo-400 font-semibold uppercase">{post.source}</span>
                    <div className="flex gap-1">
                      {post.tags?.map(t => (
                        <span key={t} className="bg-zinc-800 text-zinc-400 text-[9px] px-2 py-0.5 rounded border border-zinc-700/50">
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
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-[calc(100vh-170px)]">
              {(['Saved', 'Applied', 'Interview', 'Rejected', 'Offer'] as Application['status'][]).map(colStatus => (
                <div key={colStatus} className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl flex flex-col p-4">
                  <div className="flex justify-between items-center mb-4 px-1">
                    <span className="font-bold text-xs uppercase tracking-wider text-zinc-400">{colStatus}</span>
                    <span className="bg-zinc-900 text-zinc-500 text-[10px] px-2 py-0.5 rounded border border-zinc-800 font-bold">
                      {pipelineJobs[colStatus]?.length || 0}
                    </span>
                  </div>
                  
                  <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                    {pipelineJobs[colStatus]?.map(job => (
                      <div
                        key={job.id}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 hover:border-zinc-700 transition-colors shadow shadow-black/30"
                      >
                        <h4 className="font-semibold text-xs text-white line-clamp-1 mb-1">{job.title}</h4>
                        <p className="text-zinc-400 text-[10px] mb-3 font-medium">{job.company}</p>
                        
                        <div className="flex items-center justify-between text-[9px] text-zinc-500">
                          <span className="truncate max-w-[80px]">{job.location}</span>
                          
                          {/* Selector to shift status directly */}
                          <select
                            value={colStatus}
                            onChange={e => handleUpdateStatus(job.id, e.target.value as any)}
                            className="bg-zinc-950 border border-zinc-800 text-[9px] text-zinc-400 rounded px-1 py-0.5 focus:outline-none"
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
                      <div className="h-24 border border-dashed border-zinc-800/60 rounded-lg flex items-center justify-center">
                        <span className="text-[10px] text-zinc-600 uppercase font-medium tracking-wider">Empty</span>
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="absolute inset-0" onClick={() => setSelectedJob(null)} />
          <div className="w-[500px] bg-zinc-950 border-l border-zinc-800 h-full flex flex-col p-6 animate-slide-over relative z-10 shadow-2xl">
            <header className="flex justify-between items-center pb-4 border-b border-zinc-800 mb-6">
              <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded uppercase font-bold tracking-widest">{selectedJob.source}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-1.5 hover:bg-zinc-900 border border-zinc-850 rounded text-zinc-400 hover:text-white"
                  title="Edit details"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={async () => { if (confirm('Delete job listing?')) { await deleteJob(selectedJob.id); setSelectedJob(null); } }}
                  className="p-1.5 hover:bg-rose-950/30 border border-zinc-850 hover:border-rose-900/50 rounded text-zinc-400 hover:text-rose-400"
                  title="Delete job"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedJob(null)} className="p-1.5 hover:bg-zinc-900 rounded text-zinc-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              <div>
                <h2 className="text-base font-semibold text-white mb-1.5">{selectedJob.title}</h2>
                <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                  <span>{selectedJob.company}</span>
                  <span>•</span>
                  <span>{selectedJob.location}</span>
                </div>
              </div>

              {/* Quick details block */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-lg text-xs">
                <div>
                  <span className="block text-[9px] uppercase font-bold text-zinc-500 mb-0.5">Salary</span>
                  <span className="text-zinc-200 font-semibold">{selectedJob.salary || 'Not specified'}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase font-bold text-zinc-500 mb-0.5">Experience</span>
                  <span className="text-zinc-200 font-semibold">{selectedJob.experience || 'Not specified'}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase font-bold text-zinc-500 mb-0.5">Type</span>
                  <span className="text-zinc-200 font-semibold">{selectedJob.employmentType || 'Full-time'}</span>
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-2">Application Tracking Status</label>
                <select
                  value={jobStatusMap.get(selectedJob.id) || 'Saved'}
                  onChange={e => handleUpdateStatus(selectedJob.id, e.target.value as any)}
                  className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:border-zinc-700"
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
                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5">Notes</label>
                      <textarea
                        value={editNotes}
                        onChange={e => setEditNotes(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-200 focus:outline-none h-28 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5">Tags</label>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {editTags.map(t => (
                          <span key={t} className="bg-indigo-950/40 text-indigo-300 text-[10px] px-2 py-0.5 rounded border border-indigo-900/60 flex items-center gap-1">
                            {t}
                            <button type="button" onClick={() => removeTagFromEdit(t)} className="hover:text-rose-400">×</button>
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
                          className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs focus:outline-none"
                        />
                        <button type="button" onClick={addTagToEdit} className="bg-zinc-800 hover:bg-zinc-700 text-xs px-3 rounded">Add</button>
                      </div>
                    </div>
                    <button
                      onClick={saveJobEdits}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 py-2 rounded text-xs font-semibold text-white"
                    >
                      Save Changes
                    </button>
                  </>
                ) : (
                  <>
                    {/* View mode Notes */}
                    <div>
                      <h4 className="text-[10px] uppercase font-bold text-zinc-500 mb-1.5">My Notes</h4>
                      <div className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-lg text-xs text-zinc-300 whitespace-pre-wrap italic h-24 overflow-y-auto">
                        {selectedJob.notes || 'No notes added yet. Click edit to append notes.'}
                      </div>
                    </div>

                    {/* View mode Tags */}
                    <div>
                      <h4 className="text-[10px] uppercase font-bold text-zinc-500 mb-1.5">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedJob.tags?.map(t => (
                          <span key={t} className="bg-indigo-950/30 text-indigo-400 text-[10px] px-2.5 py-0.5 rounded border border-indigo-900/30">
                            {t}
                          </span>
                        ))}
                        {selectedJob.tags?.length === 0 && <span className="text-[11px] text-zinc-600">No tags added yet.</span>}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Skills required */}
              <div>
                <h4 className="text-[10px] uppercase font-bold text-zinc-500 mb-2">Target Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedJob.skills?.map(skill => (
                    <span key={skill} className="bg-zinc-900 text-zinc-400 text-[10px] px-3 py-1 rounded border border-zinc-800/80">
                      {skill}
                    </span>
                  ))}
                  {selectedJob.skills?.length === 0 && <span className="text-zinc-650 text-xs">No specific skill matches detected.</span>}
                </div>
              </div>

              {/* Link out */}
              <div className="pt-2 border-t border-zinc-800">
                <a
                  href={selectedJob.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-zinc-800 py-2 rounded text-xs transition-colors"
                >
                  <span>Open Original Job Posting</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Job Highlights */}
              {selectedJob.highlights && (
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-zinc-500 mb-2">Job Highlights</h4>
                  <div className="bg-zinc-900/30 border border-zinc-850 p-3 rounded-lg text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
                    {selectedJob.highlights}
                  </div>
                </div>
              )}

              {/* LinkedIn Recruiter & Company Page Details */}
              {(selectedJob.recruiterName || selectedJob.recruiterUrl || selectedJob.companyUrl) && (
                <div className="bg-zinc-900/20 p-4 rounded-lg border border-zinc-850 space-y-3">
                  <h4 className="text-[10px] uppercase font-bold text-zinc-400">LinkedIn Intelligence</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedJob.recruiterName && (
                      <div>
                        <span className="block text-[8px] uppercase font-semibold text-zinc-500 mb-0.5">Recruiter</span>
                        {selectedJob.recruiterUrl ? (
                          <a 
                            href={selectedJob.recruiterUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 inline-flex"
                          >
                            <span>{selectedJob.recruiterName}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-zinc-300">{selectedJob.recruiterName}</span>
                        )}
                      </div>
                    )}
                    {selectedJob.companyUrl && (
                      <div>
                        <span className="block text-[8px] uppercase font-semibold text-zinc-500 mb-0.5">Company Page</span>
                        <a 
                          href={selectedJob.companyUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 inline-flex"
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
                <h4 className="text-[10px] uppercase font-bold text-zinc-500 mb-2">Parsed Description</h4>
                <div 
                  className="bg-zinc-950 p-4 border border-zinc-850 rounded-lg text-xs text-zinc-400 leading-relaxed overflow-x-auto select-text break-words h-64 overflow-y-auto scrollbar-thin markdown-body"
                  dangerouslySetInnerHTML={{ __html: selectedJob.description || 'No description extracted.' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drawer: Company details */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="absolute inset-0" onClick={() => setSelectedCompany(null)} />
          <div className="w-[500px] bg-zinc-950 border-l border-zinc-800 h-full flex flex-col p-6 animate-slide-over relative z-10 shadow-2xl">
            <header className="flex justify-between items-center pb-4 border-b border-zinc-800 mb-6">
              <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded uppercase font-bold tracking-widest">Company Profile</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-1.5 hover:bg-zinc-900 border border-zinc-850 rounded text-zinc-400 hover:text-white"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={async () => { if (confirm('Delete company?')) { await deleteCompany(selectedCompany.id); setSelectedCompany(null); } }}
                  className="p-1.5 hover:bg-rose-950/30 border border-zinc-855 rounded text-zinc-400 hover:text-rose-455"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedCompany(null)} className="p-1.5 hover:bg-zinc-900 rounded text-zinc-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              <div>
                <h2 className="text-base font-semibold text-white mb-2">{selectedCompany.name}</h2>
                <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
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
                    className="flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 py-1.5 rounded text-zinc-300 hover:text-white"
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
                    className="flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-855 border border-zinc-800 py-1.5 rounded text-zinc-300 hover:text-white"
                  >
                    <span>LinkedIn Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Description */}
              <div>
                <h4 className="text-[10px] uppercase font-bold text-zinc-500 mb-2">Description / Bio</h4>
                <div className="bg-zinc-900/30 p-4 border border-zinc-850 rounded-lg text-xs text-zinc-300 leading-relaxed max-h-48 overflow-y-auto">
                  {selectedCompany.description || 'No description profile available.'}
                </div>
              </div>

              {/* Editing Notes & Tags */}
              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5">Notes</label>
                      <textarea
                        value={editNotes}
                        onChange={e => setEditNotes(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-200 focus:outline-none h-28 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5">Tags</label>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {editTags.map(t => (
                          <span key={t} className="bg-indigo-950/40 text-indigo-300 text-[10px] px-2 py-0.5 rounded border border-indigo-900/60 flex items-center gap-1">
                            {t}
                            <button type="button" onClick={() => removeTagFromEdit(t)} className="hover:text-rose-400">×</button>
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
                          className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs focus:outline-none"
                        />
                        <button type="button" onClick={addTagToEdit} className="bg-zinc-800 hover:bg-zinc-700 text-xs px-3 rounded">Add</button>
                      </div>
                    </div>
                    <button
                      onClick={saveCompanyEdits}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 py-2 rounded text-xs font-semibold text-white"
                    >
                      Save Changes
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <h4 className="text-[10px] uppercase font-bold text-zinc-500 mb-1.5">My Notes</h4>
                      <div className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-lg text-xs text-zinc-300 whitespace-pre-wrap italic h-24 overflow-y-auto">
                        {selectedCompany.notes || 'No notes added.'}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[10px] uppercase font-bold text-zinc-500 mb-1.5">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedCompany.tags?.map(t => (
                          <span key={t} className="bg-indigo-950/30 text-indigo-400 text-[10px] px-2.5 py-0.5 rounded border border-indigo-900/30">
                            {t}
                          </span>
                        ))}
                        {selectedCompany.tags?.length === 0 && <span className="text-[11px] text-zinc-650">No tags.</span>}
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="absolute inset-0" onClick={() => setSelectedPost(null)} />
          <div className="w-[500px] bg-zinc-950 border-l border-zinc-800 h-full flex flex-col p-6 animate-slide-over relative z-10 shadow-2xl">
            <header className="flex justify-between items-center pb-4 border-b border-zinc-800 mb-6">
              <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded uppercase font-bold tracking-widest">Hiring Post</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-1.5 hover:bg-zinc-900 border border-zinc-850 rounded text-zinc-400 hover:text-white"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={async () => { if (confirm('Delete post?')) { await deletePost(selectedPost.id); setSelectedPost(null); } }}
                  className="p-1.5 hover:bg-rose-950/30 border border-zinc-855 rounded text-zinc-400 hover:text-rose-455"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedPost(null)} className="p-1.5 hover:bg-zinc-900 rounded text-zinc-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              <div>
                <h2 className="text-base font-semibold text-white mb-1.5">{selectedPost.author}</h2>
                <p className="text-xs text-zinc-400">{selectedPost.company ? `Recruiter at ${selectedPost.company}` : 'Hiring Post Publisher'}</p>
              </div>

              {selectedPost.authorProfile && (
                <a
                  href={selectedPost.authorProfile}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 py-2 rounded text-xs text-zinc-350 hover:text-white"
                >
                  <span>Open Recruiter Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              {/* Content */}
              <div>
                <h4 className="text-[10px] uppercase font-bold text-zinc-500 mb-2">Post Content</h4>
                <div className="bg-zinc-900/30 p-4 border border-zinc-850 rounded-lg text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap overflow-y-auto max-h-64">
                  {selectedPost.content}
                </div>
              </div>

              {/* Edit/Tags section */}
              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5">Tags</label>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {editTags.map(t => (
                          <span key={t} className="bg-indigo-950/40 text-indigo-300 text-[10px] px-2 py-0.5 rounded border border-indigo-900/60 flex items-center gap-1">
                            {t}
                            <button type="button" onClick={() => removeTagFromEdit(t)} className="hover:text-rose-400">×</button>
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
                          className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs focus:outline-none"
                        />
                        <button type="button" onClick={addTagToEdit} className="bg-zinc-800 hover:bg-zinc-700 text-xs px-3 rounded">Add</button>
                      </div>
                    </div>
                    <button
                      onClick={savePostEdits}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 py-2 rounded text-xs font-semibold text-white"
                    >
                      Save Tags
                    </button>
                  </>
                ) : (
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-zinc-500 mb-1.5">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedPost.tags?.map(t => (
                        <span key={t} className="bg-indigo-950/30 text-indigo-400 text-[10px] px-2.5 py-0.5 rounded border border-indigo-900/30">
                          {t}
                        </span>
                      ))}
                      {selectedPost.tags?.length === 0 && <span className="text-[11px] text-zinc-650">No tags.</span>}
                    </div>
                  </div>
                )}
              </div>

              {selectedPost.url && (
                <div className="pt-2 border-t border-zinc-800">
                  <a
                    href={selectedPost.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-zinc-800 py-2 rounded text-xs transition-colors"
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
    <div className="col-span-full border border-dashed border-zinc-800 bg-zinc-900/10 rounded-2xl flex flex-col items-center justify-center py-20 px-4 text-center">
      <Briefcase className="w-10 h-10 text-zinc-700 stroke-[1.5] mb-3" />
      <h4 className="font-semibold text-sm text-zinc-400 mb-1">{label}</h4>
      <p className="text-xs text-zinc-650 max-w-xs">Use the Chrome extension popup to collect items from supported sites, and they will sync here.</p>
    </div>
  );
}
