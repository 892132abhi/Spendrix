import { useState, useEffect } from 'react';
import api from '../api/instance';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FiSearch, FiFilter, FiPlus, FiBriefcase, FiMapPin, FiDollarSign, FiAward, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const HRJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- SEARCH & FILTER STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  // --- PAGINATION STATES ---
  const [page, setPage] = useState(1);
  const [paginationData, setPaginationData] = useState({
    next: null,
    previous: null,
    totalCount: 0
  });

  const navigate = useNavigate();

  // Reset page parameter back to 1 whenever parent filters change
  const handleFilterChange = (setter, value) => {
    setPage(1);
    setter(value);
  };

  // Updated Fetch Function to handle Search, Filter, and Page Offsets
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await api.get('jobs/joblist/', {
        params: {
          search: searchTerm,
          type: filterType,
          page: page // Injects sequential page counter state parameters downstream
        }
      });

      // Handle Django REST Framework paginated layout envelope object gracefully
      const dataPayload = response.data;
      const resultsArray = dataPayload.results !== undefined ? dataPayload.results : dataPayload;

      setJobs(resultsArray);

      // Sync metadata pagination state values
      setPaginationData({
        next: dataPayload.next || null,
        previous: dataPayload.previous || null,
        totalCount: dataPayload.count || resultsArray.length
      });
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to sync database job opportunities.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when searchTerm, filterType, or page changes (with Debounce protection)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchJobs();
    }, 400); // Wait 400ms after user stops typing to call API

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, filterType, page]); // Explicitly listens to page state mutations now

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      await api.patch(`jobs/statusupdate/${id}/`, { job_status: newStatus });
      setJobs(jobs.map(job => job.id === id ? { ...job, job_status: newStatus } : job));
      toast.success(`Job marked as ${newStatus.toLowerCase()}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to alter opportunity status parameters");
    }
  };

  const deleteJob = async (id) => {
    if (window.confirm("Are you sure you want to delete this job posting?")) {
      try {
        await api.delete(`/jobs/deletejob/${id}/`);
        setJobs(jobs.filter(job => job.id !== id));
        toast.success("Job posting deleted successfully");

        // Dynamic cleanup check: if the last item on a page was deleted, move back a page
        if (jobs.length === 1 && page > 1) {
          setPage(prev => prev - 1);
        } else {
          fetchJobs();
        }
      } catch (error) {
        console.error("Error deleting job:", error);
        toast.error("Failed to delete job");
      }
    }
  };

  return (
    <div className="space-y-8 pb-16 font-sans px-4">
      {/* --- HEADER --- */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mt-6">
        <div className="text-left">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-650 bg-clip-text text-transparent">
            Active Opportunities
          </h1>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-ping"></span>
            Manage pipeline vacancies and visibilities
          </p>
        </div>
        <button
          className="flex items-center justify-center gap-2 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
          onClick={() => navigate("/createjob")}
        >
          <FiPlus className="w-4 h-4" />
          <span>Create New Job</span>
        </button>
      </header>

      {/* --- SEARCH & FILTER BAR --- */}
      <div className="flex flex-col md:flex-row gap-4 bg-white/80 backdrop-blur-xl p-4 rounded-3xl border border-slate-200/60 shadow-sm">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-4.5 top-4.5 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search jobs by title or location..."
            className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-slate-250/50 rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
            value={searchTerm}
            onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
          />
        </div>

        <div className="relative shrink-0">
          <FiFilter className="absolute left-4.5 top-4.5 text-slate-400 w-4 h-4 pointer-events-none" />
          <select
            className="pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-250/50 rounded-2xl text-sm font-bold text-slate-605 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all appearance-none cursor-pointer min-w-[200px]"
            value={filterType}
            onChange={(e) => handleFilterChange(setFilterType, e.target.value)}
          >
            <option value="">All Job Types</option>
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="REMOTE">Remote</option>
            <option value="INTERN_SHIP">Internship</option>
          </select>
          <div className="absolute right-4.5 top-5 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-500 w-0 h-0"></div>
        </div>
      </div>

      {/* --- JOB LIST GRID --- */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="p-24 text-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Syncing opportunity logs...</p>
          </div>
        ) : jobs.length > 0 ? (
          <>
            {jobs.map((job) => (
              <div
                key={job.id}
                className={`group bg-white border rounded-3xl p-6 md:p-8 transition-all duration-300 ${job.job_status === 'CLOSED' ? 'border-slate-200/50 opacity-60' : 'border-slate-200/60 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/5'}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex flex-col sm:flex-row items-start gap-4 text-left">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 ${job.job_status === 'OPEN' ? 'bg-indigo-50/70 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                      {job.title ? job.title.charAt(0).toUpperCase() : 'J'}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5 mb-2">
                        <h3 className="font-extrabold text-slate-900 text-lg tracking-tight leading-none">{job.title}</h3>
                        <span className={`text-[9px] font-black uppercase px-2.5 py-1.5 rounded-full border leading-none ${job.job_status === 'OPEN' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                          {job.job_status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4">
                        <p className="text-[10px] font-extrabold text-indigo-550 uppercase tracking-wider flex items-center gap-1">
                          <FiBriefcase className="w-3.5 h-3.5" />
                          {job.job_type ? job.job_type.replace('_', ' ') : 'N/A'}
                        </p>
                        <span className="w-1 h-1 bg-slate-300 rounded-full hidden sm:inline-block"></span>
                        <p className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider flex items-center gap-1">
                          <FiAward className="w-3.5 h-3.5" />
                          EXP: {job.experience}+ YRS
                        </p>
                        <span className="w-1 h-1 bg-slate-300 rounded-full hidden sm:inline-block"></span>
                        <p className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider flex items-center gap-1">
                          <FiMapPin className="w-3.5 h-3.5" />
                          {job.location}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
                    <div className="text-left lg:text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Compensation Bracket</p>
                      <p className="text-sm font-extrabold text-slate-850 flex items-center lg:justify-end gap-1">
                        <FiDollarSign className="text-slate-550 w-4 h-4 shrink-0" />
                        <span>{job.salary || 'Competitive'}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* EDIT BUTTON */}
                      <button
                        className="p-3.5 bg-slate-50 hover:bg-indigo-50 text-slate-550 hover:text-indigo-650 rounded-2xl transition-all shadow-sm cursor-pointer border border-slate-100"
                        onClick={() => navigate(`/editjob/${job.id}`)}
                        title="Modify vacancy specifications"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>

                      {/* STATUS TOGGLE */}
                      <button
                        onClick={() => toggleStatus(job.id, job.job_status)}
                        className={`px-4.5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-wider transition-all border flex items-center gap-1.5 cursor-pointer shadow-sm ${job.job_status === 'OPEN' ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50' : 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-750'}`}
                      >
                        {job.job_status === 'OPEN' ? (
                          <>
                            <FiToggleLeft className="w-4.5 h-4.5" />
                            <span>Close</span>
                          </>
                        ) : (
                          <>
                            <FiToggleRight className="w-4.5 h-4.5" />
                            <span>Reopen</span>
                          </>
                        )}
                      </button>

                      {/* DELETE BUTTON */}
                      <button
                        onClick={() => deleteJob(job.id)}
                        className="p-3.5 bg-rose-50 hover:bg-rose-100 text-rose-550 hover:text-rose-700 rounded-2xl transition-all shadow-sm cursor-pointer border border-rose-100/50"
                        title="Revoke job posting"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* --- INTERACTIVE PAGINATION COMPONENT FOOTER --- */}
            {paginationData.totalCount > 0 && (
              <div className="bg-white border border-slate-200/60 rounded-2xl p-3 flex justify-between items-center shadow-lg shadow-slate-100/40 max-w-md mx-auto w-full mt-4">
                <button
                  disabled={!paginationData.previous || loading}
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  className="px-4.5 py-2.5 text-xs font-black uppercase border border-slate-200 rounded-xl tracking-wider text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FiChevronLeft className="w-4 h-4" />
                  <span>Prev</span>
                </button>
                <span className="text-xs font-bold text-slate-400">
                  Page <strong className="text-slate-800">{page}</strong>
                </span>
                <button
                  disabled={!paginationData.next || loading}
                  onClick={() => setPage(prev => prev + 1)}
                  className="px-4.5 py-2.5 text-xs font-black uppercase bg-indigo-650 text-black rounded-xl tracking-wider hover:bg-indigo-750 disabled:opacity-40 disabled:hover:bg-indigo-650 transition-all shadow-md shadow-indigo-600/10 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Next</span>
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="p-20 text-center bg-slate-50/70 rounded-3xl border-2 border-dashed border-slate-200/80">
            <FiBriefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-450 font-bold uppercase tracking-widest text-xs">No active opportunities matching filter rules</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HRJobsPage;