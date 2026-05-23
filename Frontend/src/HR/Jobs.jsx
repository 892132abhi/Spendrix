import { useState, useEffect } from 'react';
import api from '../api/instance';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

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
    <div className="space-y-8 pb-12">
      {/* --- HEADER --- */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Active Opportunities</h1>
          <p className="text-slate-500 text-sm font-medium">Manage your pipeline and job visibility.</p>
        </div>
        <button 
          className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95" 
          onClick={() => navigate("/createjob")}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M12 4v16m8-8H4" /></svg>
          Create New Job
        </button>
      </header>

      {/* --- SEARCH & FILTER BAR --- */}
      <div className="flex flex-col md:flex-row gap-4 bg-white/50 backdrop-blur-md p-4 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex-1 relative">
          <input 
            type="text"
            placeholder="Search jobs by title or location..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            value={searchTerm}
            onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
          />
          <svg className="w-5 h-5 absolute left-4 top-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2" strokeLinecap="round" /></svg>
        </div>
        
        <select 
          className="px-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none min-w-[180px]"
          value={filterType}
          onChange={(e) => handleFilterChange(setFilterType, e.target.value)}
        >
          <option value="">All Job Types</option>
          <option value="FULL_TIME">Full Time</option>
          <option value="PART_TIME">Part Time</option>
          <option value="REMOTE">Remote</option>
          <option value="INTERN_SHIP">Internship</option>
        </select>
      </div>

      {/* --- JOB LIST GRID --- */}
      <div className="grid grid-cols-1 gap-5">
        {loading ? (
            <div className="p-20 text-center text-slate-400 font-bold animate-pulse">Syncing Database...</div>
        ) : jobs.length > 0 ? (
          <>
            {jobs.map((job) => (
               <div 
                 key={job.id}
                 className={`group bg-white border rounded-[2.5rem] p-8 transition-all duration-300 ${job.job_status === 'CLOSED' ? 'border-slate-100 opacity-60' : 'border-slate-200 hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-100/50'}`}
               >
                 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                   <div className="flex items-start gap-5">
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${job.job_status === 'OPEN' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                       {job.title ? job.title.charAt(0) : 'J'}
                     </div>
                     <div>
                       <div className="flex items-center gap-3 mb-2">
                         <h3 className="font-black text-slate-800 text-lg tracking-tight">{job.title}</h3>
                         <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border ${job.job_status === 'OPEN' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                           {job.job_status}
                         </span>
                       </div>
                       <div className="flex flex-wrap items-center gap-y-1 gap-x-4">
                         <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{job.job_type ? job.job_type.replace('_', ' ') : 'N/A'}</p>
                         <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">EXP: {job.experience}+ YRS</p>
                         <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{job.location}</p>
                       </div>
                     </div>
                   </div>
                   <div className="flex items-center justify-between lg:justify-end gap-10 border-t lg:border-t-0 pt-6 lg:pt-0 border-slate-50">
                     <div className="text-right">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Offered Salary</p>
                       <p className="text-sm font-black text-slate-800">{job.salary || 'Competitive'}</p>
                     </div>
                     <div className="flex items-center gap-2">
                       <button className="p-3 bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all" onClick={()=>navigate(`/editjob/${job.id}`)}>
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                       </button>
                       <button 
                         onClick={() => toggleStatus(job.id, job.job_status)}
                         className={`px-4 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border ${job.job_status === 'OPEN' ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50' : 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700'}`}
                       >
                         {job.job_status === 'OPEN' ? 'Close' : 'Reopen'}
                       </button>
                       <button onClick={() => deleteJob(job.id)} className="p-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-2xl transition-all">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" /></svg>
                       </button>
                     </div>
                   </div>
                 </div>
               </div>
            ))}

            {/* --- INTERACTIVE PAGINATION COMPONENT FOOTER --- */}
            {paginationData.totalCount > 0 && (
              <div className="bg-white border border-slate-200/60 rounded-[1.8rem] p-4 flex justify-between items-center shadow-xl shadow-slate-100/40 max-w-xl mx-auto w-full mt-4">
                <button
                  disabled={!paginationData.previous || loading}
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  className="px-5 py-2.5 text-xs font-black uppercase border border-slate-200 rounded-xl tracking-wider text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                >
                  ← Previous
                </button>
                <span className="text-xs font-bold text-slate-400">
                  Page <strong className="text-slate-800">{page}</strong>
                </span>
                <button
                  disabled={!paginationData.next || loading}
                  onClick={() => setPage(prev => prev + 1)}
                  className="px-5 py-2.5 text-xs font-black uppercase bg-indigo-600 text-white rounded-xl tracking-wider hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 transition-all shadow-md shadow-indigo-100"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="p-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No jobs found matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HRJobsPage;