import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/instance';
import { toast } from 'react-hot-toast';

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
        toast.error("Failed to sync structural board tracks.");
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
    const loadingToast = toast.loading("Filing profile data metrics...");
    try {
      await api.post(`applications/applyjob/${jobId}/`);
      toast.success("Application registered successfully into Spendrix tracking network!", { id: loadingToast });
    } catch (error) {
      toast.error("You have already filed an assertion loop for this asset track.", { id: loadingToast });
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto h-[calc(100vh-120px)] flex flex-col p-4 gap-6 font-sans">
      
      {/* SEARCH FRAME */}
      <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-3 flex flex-col md:flex-row items-center gap-2 max-w-4xl mx-auto w-full">
        <div className="flex-1 flex items-center px-6 gap-3 w-full">
          <span className="text-amber-500 text-sm">🔍</span>
          <input 
            type="text" 
            value={search} 
            onChange={(e) => handleFilterChange(e, 'search')}
            placeholder="Search ..."
            className="w-full border-none outline-none text-sm font-semibold py-2 bg-transparent text-stone-800 placeholder-stone-400"
          />
        </div>
        
        <div className="hidden md:block w-px h-8 bg-amber-100"></div>

        <div className="flex-1 flex items-center px-4 w-full">
          <select 
            value={type}
            onChange={(e) => handleFilterChange(e, 'type')}
            className="w-full bg-transparent border-none text-sm font-black text-amber-900 outline-none cursor-pointer uppercase tracking-widest text-[10px]"
          >
            <option value="">All Arrangements</option>
            <option value="FULL_TIME">Full-time </option>
            <option value="PART_TIME">Part-time </option>
            <option value="REMOTE">Remote </option>
            <option value="INTERN_SHIP"> Internship </option>
          </select>
        </div>

        <button 
          onClick={fetchJobs}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 px-10 py-3.5 w-full md:w-auto rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-md"
        >
          Filter
        </button>
      </div>

      {/* ECOSYSTEM PANELS */}
      <div className="flex flex-1 gap-6 overflow-hidden w-full">
        
        {/* Left Card Deck */}
        <div className="w-full md:w-[400px] lg:w-[450px] flex flex-col h-full gap-4">
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-40 bg-stone-50 border border-stone-200 rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : jobs.length > 0 ? (
              jobs.map((job) => (
                <div 
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`p-6 bg-white rounded-3xl border-2 text-left relative overflow-hidden group transition-all cursor-pointer ${
                    selectedJob?.id === job.id 
                      ? 'border-amber-500 shadow-xl shadow-amber-500/5 bg-gradient-to-br from-white to-amber-50/10' 
                      : 'border-stone-100 hover:border-amber-200/60'
                  }`}
                >
                  <h3 className="font-black text-stone-900 text-lg group-hover:text-amber-800 transition-colors uppercase italic tracking-tight">{job.title}</h3>
                  <p className="text-xs font-bold text-orange-600 mt-1 mb-1 tracking-wide">{job.company_name || "Independent Enterprise Block"}</p>
                  <p className="text-xs font-semibold text-stone-400 mb-4">{job.location}</p>
                  
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-amber-100">
                     <span className="text-[9px] font-black text-amber-900 bg-amber-100 border border-amber-200/60 px-2.5 py-1 rounded-md uppercase tracking-widest">
                       {job.job_type?.replace('_', ' ')}
                     </span>
                     <button 
                       type="button"
                       onClick={(e) => handleApply(e, job.id)}
                       className="text-xs font-black text-orange-600 hover:text-orange-700 hover:underline transition-colors tracking-wider"
                     >
                       Apply
                     </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-stone-50 rounded-3xl border border-dashed border-amber-200 p-8 text-stone-400 font-bold italic text-sm">
                No active matching architectural paths matching this profile query.
              </div>
            )}
          </div>

          {/* PAGINATION ROW */}
          {hasPagination.totalCount > 0 && (
            <div className="bg-white border border-amber-100 rounded-2xl p-3 flex justify-between items-center shadow-md">
              <button
                disabled={!hasPagination.previous || loading}
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                className="px-4 py-2 text-xs font-black uppercase border border-stone-200 rounded-xl tracking-wider text-stone-600 hover:bg-stone-50 disabled:opacity-40 transition-all"
              >
                ← Previous
              </button>
              <span className="text-xs font-bold text-stone-400">
                No : <strong className="text-amber-600">{page}</strong>
              </span>
              <button
                disabled={!hasPagination.next || loading}
                onClick={() => setPage(prev => prev + 1)}
                className="px-4 py-2 text-xs font-black uppercase bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 rounded-xl tracking-wider shadow-sm disabled:opacity-40 transition-all"
              >
                Next  →
              </button>
            </div>
          )}
        </div>

        {/* Right Feature Panel View Drawer */}
        <div className="hidden md:flex flex-1 bg-white border border-amber-100 rounded-[2.5rem] overflow-hidden flex-col shadow-2xl">
          {selectedJob ? (
            <div className="p-10 overflow-y-auto h-full space-y-8 text-left bg-gradient-to-b from-white to-amber-50/5">
              <header className="space-y-4 border-b border-amber-100 pb-8">
                <span className="text-[9px] font-black text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full uppercase tracking-widest border border-orange-100">
                  Live Placement 
                </span>
                <h2 className="text-3xl font-black text-stone-950 leading-tight mt-2 italic uppercase tracking-tight">{selectedJob.title}</h2>
                <p className="text-base font-bold text-amber-700 tracking-wide">{selectedJob.company_name || "Independent Enterprise Block"}</p>
                
                <div className="flex gap-4 pt-2">
                  <button 
                    onClick={(e) => handleApply(e, selectedJob.id)}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-md transition-all active:scale-95"
                  >
                    Apply 
                  </button>
                  <button 
                    onClick={() => navigate(`/jobdetails/${selectedJob.id}`)}
                    className="px-8 py-3.5 border-2 border-stone-900 text-stone-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-stone-50 transition-all"
                  >
                    View job details
                  </button>
                </div>
              </header>

              <div className="grid grid-cols-2 gap-8 bg-stone-50 p-6 rounded-2xl border border-amber-100 shadow-inner">
                <div>
                   <h4 className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">location</h4>
                   <p className="font-bold text-stone-700 text-sm">{selectedJob.location}</p>
                </div>
                <div>
                   <h4 className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">Assigned Salary</h4>
                   <p className="font-black text-amber-600 text-sm">{selectedJob.salary || "Disclosed Securely Upon Panel Phase"}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-stone-800 font-black uppercase text-[10px] tracking-widest">Required Structural Toolsets</h4>
                <p className="text-stone-700 font-bold text-sm bg-amber-50/40 border border-amber-200/60 p-4 rounded-xl">
                  {selectedJob.skills || "General asset profile verification rules apply."}
                </p>
              </div>

              <div className="prose prose-slate max-w-none pt-2">
                <h4 className="text-stone-800 font-black uppercase text-[10px] tracking-widest mb-2">Role Blueprint & Context</h4>
                <p className="text-stone-600 leading-relaxed text-sm whitespace-pre-line font-medium">
                  {selectedJob.description || "Detailed workflow blueprint indices not explicitly cataloged."}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-stone-300">
              <span className="text-5xl mb-3"></span>
              <p className="font-black uppercase tracking-widest text-[10px] text-amber-600">Select an job tile</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default JobListPage;