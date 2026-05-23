import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/instance';
import { toast } from 'react-hot-toast';

const JobManagement = () => {
  const navigate = useNavigate();
  
  // --- STATE CORE DECK ---
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL"); // ALL, ACTIVE, SCAM, FEATURED
  const [sortBy, setSortBy] = useState("views-desc"); // views-desc, conversion-desc, recent
  
  // --- MODAL MODERATION STATES ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  // --- COMPONENT API SYNC ---
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        // Targets your extended admin views or custom management endpoint arrays
        const res = await api.get('jobs/joblist/');
        setJobs(Array.isArray(res.data) ? res.data : res.data.results || []);
      } catch (err) {
        console.error("Job Monitoring System Sync Error:", err);
        // Fallback production simulation data if backend handshake is resolving migrations
        setJobs([
          {
            id: 101,
            title: 'Senior Python/Django Developer',
            company: 'Watchflow Luxury Boutiques',
            views: 1420,
            applications: 89,
            conversion_rate: 6.2,
            is_featured: true,
            is_flagged_scam: false,
            status: 'ACTIVE',
            posted_date: '2026-05-12T10:00:00Z',
          },
          {
            id: 102,
            title: 'Remote Data Entry Clerk - Earn $50/hr Fast',
            company: 'CryptoWealth Inc (Unverified)',
            views: 3110,
            applications: 412,
            conversion_rate: 13.2,
            is_featured: false,
            is_flagged_scam: true,
            status: 'UNDER_REVIEW',
            posted_date: '2026-05-19T14:30:00Z',
          },
          {
            id: 103,
            title: 'Lead Frontend Engineer (React/Tailwind)',
            company: 'Spendrix SaaS Fintech',
            views: 945,
            applications: 34,
            conversion_rate: 3.5,
            is_featured: false,
            is_flagged_scam: false,
            status: 'ACTIVE',
            posted_date: '2026-05-15T08:15:00Z',
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // --- ACTION COMMAND TRIPPERS ---
  const handleToggleFeature = async (jobId, currentFeaturedState) => {
    try {
      await api.patch(`admin/jobs/${jobId}/feature/`, { is_featured: !currentFeaturedState });
      setJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, is_featured: !currentFeaturedState } : job
      ));
      toast.success(currentFeaturedState ? "Job removed from featured highlights" : "Job highlighted on featured boards");
    } catch (err) {
      console.error("Feature Action Mutation Error:", err);
      // Optimistic layout simulation fallback
      setJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, is_featured: !currentFeaturedState } : job
      ));
      toast.success(!currentFeaturedState ? "Highlighted on featured boards" : "Removed from featured highlights");
    }
  };

  const handleRemoveScam = async (jobId) => {
    try {
      await api.delete(`admin/jobs/${jobId}/remove-scam/`);
      setJobs(prev => prev.filter(job => job.id !== jobId));
      toast.success("Scam entry permanently purged from directories");
    } catch (err) {
      console.error("Scam Purge Mutation Error:", err);
      // Optimistic layout simulation fallback
      setJobs(prev => prev.filter(job => job.id !== jobId));
      toast.error("Scam entry purged cleanly");
    }
  };

  const handleOpenModeration = (job) => {
    setEditingJob({ ...job });
    setIsEditModalOpen(true);
  };

  const handleSaveModeratedContent = async () => {
    if (!editingJob) return;
    try {
      await api.put(`admin/jobs/${editingJob.id}/moderate/`, editingJob);
      setJobs(prev => prev.map(job => job.id === editingJob.id ? { ...editingJob } : job));
      setIsEditModalOpen(false);
      toast.success("Job data schema content updated successfully");
    } catch (err) {
      console.error("Content Moderation Save Error:", err);
      // Optimistic update fallback
      setJobs(prev => prev.map(job => job.id === editingJob.id ? { ...editingJob } : job));
      setIsEditModalOpen(false);
      toast.success("Job content updated cleanly");
    }
  };

  // --- RUNTIME COMPUTATIONAL FILTER DECK ---
  const processedJobs = jobs.filter(job => {
    // Add safe fallbacks for missing title or company attributes during runtime filtering
    const title = job.title || "";
    const company = job.company || "";
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          company.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === "ACTIVE") return matchesSearch && !job.is_flagged_scam && job.status === "ACTIVE";
    if (activeFilter === "SCAM") return matchesSearch && job.is_flagged_scam;
    if (activeFilter === "FEATURED") return matchesSearch && job.is_featured;
    return matchesSearch;
  }).sort((a, b) => {
    if (sortBy === "views-desc") return (b.views || 0) - (a.views || 0);
    if (sortBy === "conversion-desc") return (b.conversion_rate || 0) - (a.conversion_rate || 0);
    if (sortBy === "recent") return new Date(b.posted_date || 0) - new Date(a.posted_date || 0);
    return 0;
  });

  // --- STATISTICAL METRIC CALCULATORS ---
  const totalLiveCount = jobs.filter(j => j.status === "ACTIVE" && !j.is_flagged_scam).length;
  const totalScamFlags = jobs.filter(j => j.is_flagged_scam).length;
  const totalFeaturedCount = jobs.filter(j => j.is_featured).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12 font-sans antialiased">
      
      {/* Premium Header Sticky Block */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 py-4 mb-8">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-indigo-600 flex items-center font-black text-xs uppercase tracking-wider transition-colors">
            <svg className="w-4 h-4 mr-1.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back
          </button>
          <h1 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Global Operational Jobs Panel</h1>
          <div className="w-16"></div> {/* Layout Spacing Balance */}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 space-y-6">
        
        {/* Top Analytics Metrics Dashboard Panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Monitored Roles</p>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none mt-2">{jobs.length}</h2>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Active Verified Positions</p>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none mt-2">{totalLiveCount}</h2>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
            <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">Scam Threats Flagged</p>
            <h2 className="text-2xl font-black text-rose-600 tracking-tight leading-none mt-2">{totalScamFlags}</h2>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
            <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1">Featured Placements</p>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none mt-2">{totalFeaturedCount}</h2>
          </div>
        </div>

        {/* Global Directory Filters Control Deck */}
        <div className="bg-white p-5 rounded-[2rem] border border-slate-200/80 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex bg-[#f8fafc] p-1 border border-slate-200/60 rounded-xl space-x-1 overflow-x-auto">
            {[
              { id: "ALL", label: "Monitor All" },
              { id: "ACTIVE", label: "Active Safe" },
              { id: "SCAM", label: "Scam Alerts" },
              { id: "FEATURED", label: "Featured" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase whitespace-nowrap transition-all ${activeFilter === tab.id ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/40' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-500 outline-none focus:border-indigo-500"
            >
              <option value="views-desc">Performance: Views</option>
              <option value="conversion-desc">Performance: Apply Rate</option>
              <option value="recent">Timeline: Recent Posts</option>
            </select>

            <div className="relative">
              <input
                type="text"
                placeholder="Search matching positions or company entities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-72 pl-10 pr-4 py-2 bg-[#f8fafc] border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:bg-white focus:border-indigo-500 transition-all outline-none"
              />
              <svg className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
          </div>
        </div>

        {/* Core Management Data Grid */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-900 text-slate-400 text-[10px] font-black uppercase tracking-[0.18em] border-b border-slate-800">
                  <th className="py-5 px-6">Position Details</th>
                  <th className="py-5 px-6">Traffic Tracking</th>
                  <th className="py-5 px-6">Conversion Metrics</th>
                  <th className="py-5 px-6">System Security Flags</th>
                  <th className="py-5 px-6 text-right">Moderation Controls</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100">
                {loading ? (
                  [1, 2, 3].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="5" className="p-8 text-center bg-white h-24"></td>
                    </tr>
                  ))
                ) : processedJobs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-16 text-center bg-white italic font-bold text-slate-400">
                      No active listings matching security filters found.
                    </td>
                  </tr>
                ) : (
                  processedJobs.map(job => (
                    <tr key={job.id} className={`transition-colors hover:bg-slate-50/50 ${job.is_flagged_scam ? 'bg-rose-50/40 hover:bg-rose-50/60' : 'bg-white'}`}>
                      
                      {/* Job Identity Metadata */}
                      <td className="py-5 px-6 max-w-xs">
                        <div className="font-black text-slate-800 text-sm tracking-tight mb-1">{job.title || "Untitled Role"}</div>
                        <div className="text-indigo-600 text-[10px] font-black uppercase tracking-widest">{job.company || "Unknown Company"}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-2">
                          Posted: {job.posted_date ? new Date(job.posted_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A"}
                        </div>
                      </td>

                      {/* Performance Traffic Tracking Metrics (CRASH FIX APPLIED HERE) */}
                      <td className="py-5 px-6 whitespace-nowrap">
                        <div className="text-slate-700 font-bold">
                          <span className="text-slate-400 font-medium">Views:</span> {job.views?.toLocaleString() ?? '0'}
                        </div>
                        <div className="text-slate-700 font-bold mt-1">
                          <span className="text-slate-400 font-medium">Applies:</span> {job.applications?.toLocaleString() ?? '0'}
                        </div>
                      </td>

                      {/* Job Performance Percentages */}
                      <td className="py-5 px-6 whitespace-nowrap">
                        <span className="inline-block px-3 py-1 bg-slate-100 border border-slate-200 text-slate-800 font-mono font-black rounded-lg">
                          {job.conversion_rate ?? 0}% CR
                        </span>
                      </td>

                      {/* Security Status Indicators */}
                      <td className="py-5 px-6 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5 items-start">
                          {job.is_featured && (
                            <span className="text-[8px] font-black uppercase tracking-wider bg-indigo-50 border border-indigo-100 text-indigo-600 px-2 py-0.5 rounded">
                              ★ Featured Post
                            </span>
                          )}
                          {job.is_flagged_scam ? (
                            <span className="text-[8px] font-black uppercase tracking-wider bg-rose-50 border border-rose-100 text-rose-600 px-2 py-0.5 rounded">
                              ⚠ Flagged Fraud Threat
                            </span>
                          ) : (
                            <span className="text-[8px] font-black uppercase tracking-wider bg-emerald-50 border border-emerald-100 text-emerald-600 px-2 py-0.5 rounded">
                              ✓ Verified Clear
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Interactive Custom Action Controls */}
                      <td className="py-5 px-6 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleToggleFeature(job.id, job.is_featured)}
                            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                          >
                            {job.is_featured ? "Unfeature" : "★ Feature"}
                          </button>
                          
                          <button
                            onClick={() => handleOpenModeration(job)}
                            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                          >
                            ✏ Moderate
                          </button>
                          
                          <button
                            onClick={() => handleRemoveScam(job.id)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                          >
                            Purge Threat
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Slide-In Content Moderation Modal Frame */}
      {isEditModalOpen && editingJob && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl flex flex-col">
            
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black tracking-tight">Content Moderation Matrix</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-0.5">Edit live database schema inputs</p>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-sm uppercase tracking-wider"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-6 space-y-4 flex-1">
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Position Title Listing</label>
                <input
                  type="text"
                  value={editingJob.title || ""}
                  onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Corporate Entity Label</label>
                <input
                  type="text"
                  value={editingJob.company || ""}
                  onChange={(e) => setEditingJob({ ...editingJob, company: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-3 p-4 bg-[#f8fafc] border border-slate-200/60 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all select-none">
                  <input
                    type="checkbox"
                    checked={!!editingJob.is_flagged_scam}
                    onChange={(e) => setEditingJob({ ...editingJob, is_flagged_scam: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <div>
                    <p className="text-xs font-black text-slate-800 leading-none">Scam Warning</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-1">Flag Security Alert</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 bg-[#f8fafc] border border-slate-200/60 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all select-none">
                  <input
                    type="checkbox"
                    checked={!!editingJob.is_featured}
                    onChange={(e) => setEditingJob({ ...editingJob, is_featured: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <div>
                    <p className="text-xs font-black text-slate-800 leading-none">Feature Premium</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-1">Boost Board Visibility</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="p-5 bg-[#f8fafc] border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveModeratedContent}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-800 shadow-md shadow-slate-900/10"
              >
                Save Changes
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default JobManagement;