import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/instance';
import { toast } from 'react-hot-toast';
import { FiSearch, FiMapPin, FiBriefcase, FiDollarSign, FiAward, FiInfo, FiChevronRight } from 'react-icons/fi';

const JobListPage = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [hasPagination, setHasPagination] = useState({ next: null, previous: null, totalCount: 0 });

  const handleFilterChange = (e, filterType) => {
    setPage(1);
    if (filterType === 'search') setSearch(e.target.value);
    if (filterType === 'type') setType(e.target.value);
  };

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('jobs/availablejob/', {
        params: { search, type, page } 
      });
      const data = response.data;
      const resultsArray = data.results !== undefined ? data.results : data;
      setJobs(resultsArray);
      setHasPagination({
        next: data.next || null,
        previous: data.previous || null,
        totalCount: data.count || resultsArray.length
      });
      if (resultsArray.length > 0) {
        setSelectedJob(resultsArray[0]);
      } else {
        setSelectedJob(null);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired.");
        navigate('/loginpage');
      } else {
        toast.error("Failed to sync job listings.");
      }
    } finally {
      setLoading(false);
    }
  }, [search, type, page, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => fetchJobs(), 400);
    return () => clearTimeout(timer);
  }, [fetchJobs]);

  const handleApply = async (e, jobId) => {
    e.stopPropagation(); 
    if (!jobId) return;
    const loadingToast = toast.loading("Filing application...");
    try {
      const res = await api.post(`applications/applyjob/${jobId}/`);
      toast.success(res.data?.detail || "Applied successfully!", { id: loadingToast });
    } catch (error) {
      console.error("Application error:", error);
      let errMsg = "You have already applied to this job.";
      if (error.response?.data) {
        const data = error.response.data;
        if (data.detail) {
          errMsg = data.detail;
        } else {
          const values = Object.values(data);
          if (values.length > 0) {
            const firstError = values[0];
            errMsg = Array.isArray(firstError) ? firstError[0] : String(firstError);
          }
        }
      }
      toast.error(errMsg, { id: loadingToast });
    }
  };

  const getJobTypeLabel = (type) => {
    switch (type) {
      case 'FULL_TIME': return 'Full-time';
      case 'PART_TIME': return 'Part-time';
      case 'REMOTE': return 'Remote';
      case 'INTERN_SHIP': return 'Internship';
      default: return type || 'Full-time';
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto h-[calc(100vh-120px)] flex flex-col p-4 gap-6 font-sans">
      
      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-3 flex flex-col md:flex-row items-center gap-3 w-full shadow-sm">
        <div className="flex-1 flex items-center px-4 gap-3 w-full bg-slate-50 rounded-xl border border-slate-100">
          <FiSearch className="text-slate-400" size={18} />
          <input 
            type="text" 
            value={search} 
            onChange={(e) => handleFilterChange(e, 'search')}
            placeholder="Search roles, skills, or companies..."
            className="w-full border-none outline-none text-sm font-semibold py-3 bg-transparent text-slate-800 placeholder-slate-400"
          />
        </div>
        
        <div className="w-full md:w-56 bg-slate-50 rounded-xl border border-slate-100 px-4">
          <select 
            value={type}
            onChange={(e) => handleFilterChange(e, 'type')}
            className="w-full bg-transparent border-none text-xs font-bold text-slate-600 py-3.5 outline-none cursor-pointer uppercase tracking-wider"
          >
            <option value="">All Arrangements</option>
            <option value="FULL_TIME">Full-time</option>
            <option value="PART_TIME">Part-time</option>
            <option value="REMOTE">Remote</option>
            <option value="INTERN_SHIP">Internship</option>
          </select>
        </div>

        <button 
          onClick={fetchJobs}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 w-full md:w-auto rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-98 shadow-md cursor-pointer"
        >
          Search
        </button>
      </div>

      {/* Main Split Panels */}
      <div className="flex flex-1 gap-6 overflow-hidden w-full items-stretch">
        
        {/* Left: Job Card Deck */}
        <div className="w-full md:w-[400px] lg:w-[450px] flex flex-col h-full gap-4 flex-shrink-0">
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : jobs.length > 0 ? (
              jobs.map((job) => (
                <div 
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`p-6 bg-white rounded-2xl border transition-all duration-300 cursor-pointer relative ${
                    selectedJob?.id === job.id 
                      ? 'border-indigo-600 shadow-md shadow-indigo-600/5 bg-indigo-50/10' 
                      : 'border-slate-100 hover:border-slate-200/80 hover:shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                      <p className="text-xs font-semibold text-slate-500 mt-1">{job.company_name || "Enterprise Block"}</p>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded uppercase tracking-wider">
                      {getJobTypeLabel(job.job_type)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-4 text-xs text-slate-400 font-medium">
                    <FiMapPin size={13} />
                    <span>{job.location}</span>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100/60">
                    <button 
                      type="button"
                      onClick={(e) => handleApply(e, job.id)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer bg-transparent border-none p-0"
                    >
                      Apply Now
                    </button>
                    <FiChevronRight size={16} className="text-slate-400" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-8 text-slate-400 font-medium text-sm">
                No jobs match your filter options.
              </div>
            )}
          </div>

          {/* Left Panel Pagination */}
          {hasPagination.totalCount > 0 && (
            <div className="bg-white border border-slate-100 rounded-xl p-3 flex justify-between items-center shadow-sm">
              <button
                disabled={!hasPagination.previous || loading}
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                className="px-4 py-2 text-xs font-bold uppercase border border-slate-200 rounded-lg tracking-wider text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all cursor-pointer bg-white"
              >
                Prev
              </button>
              <span className="text-xs font-bold text-slate-400">
                Page <strong className="text-indigo-600 font-semibold">{page}</strong>
              </span>
              <button
                disabled={!hasPagination.next || loading}
                onClick={() => setPage(prev => prev + 1)}
                className="px-4 py-2 text-xs font-bold uppercase bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg tracking-wider shadow-sm disabled:opacity-40 transition-all cursor-pointer border-none"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Right: Feature Detail Panel */}
        <div className="hidden md:flex flex-1 bg-white border border-slate-100 rounded-[2rem] overflow-hidden flex-col shadow-sm">
          {selectedJob ? (
            <div className="p-8 overflow-y-auto h-full space-y-6 text-left flex flex-col justify-between">
              <div className="space-y-6">
                <header className="space-y-3 border-b border-slate-100 pb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100/50 px-2.5 py-1 rounded uppercase tracking-wider">
                      Live Placement
                    </span>
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <FiMapPin size={13} />
                      <span>{selectedJob.location}</span>
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 leading-tight">{selectedJob.title}</h2>
                  <p className="text-sm font-semibold text-slate-500">{selectedJob.company_name || "Enterprise Block"}</p>
                </header>

                <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100/60">
                  <div>
                    <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <FiDollarSign size={10} />
                      <span>Salary Range</span>
                    </h4>
                    <p className="font-bold text-slate-700 text-sm mt-0.5">{selectedJob.salary || "Disclosed in interview"}</p>
                  </div>
                  <div>
                    <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <FiBriefcase size={10} />
                      <span>Job Arrangement</span>
                    </h4>
                    <p className="font-bold text-slate-700 text-sm mt-0.5">{getJobTypeLabel(selectedJob.job_type)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-slate-800 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1">
                    <FiAward size={12} className="text-indigo-600" />
                    <span>Required Core Stack</span>
                  </h4>
                  <div className="text-slate-600 font-medium text-xs bg-slate-50/30 border border-slate-100 p-4 rounded-xl">
                    {selectedJob.skills || "Standard toolset evaluations apply."}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <h4 className="text-slate-800 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1">
                    <FiInfo size={12} className="text-indigo-600" />
                    <span>Role context</span>
                  </h4>
                  <p className="text-slate-500 leading-relaxed text-sm whitespace-pre-line font-medium">
                    {selectedJob.description || "Description index details not cataloged."}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-slate-100 mt-auto">
                <button 
                  onClick={(e) => handleApply(e, selectedJob.id)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-98 cursor-pointer flex-1 md:flex-initial"
                >
                  Apply to this position
                </button>
                <button 
                  onClick={() => navigate(`/jobdetails/${selectedJob.id}`)}
                  className="px-6 py-3.5 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-all cursor-pointer bg-white"
                >
                  View Details
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-8">
              <FiBriefcase size={48} className="text-slate-200 mb-2 animate-bounce" />
              <p className="font-semibold text-xs tracking-wider text-slate-400">Select a job from the deck to preview details</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default JobListPage;