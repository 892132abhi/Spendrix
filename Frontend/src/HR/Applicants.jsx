import { useState, useEffect } from 'react';
import api from '../api/instance';
import { toast } from 'react-hot-toast';
import { FiSearch, FiFilter, FiUser, FiMail, FiExternalLink, FiFileText, FiChevronRight } from 'react-icons/fi';

const AllApplicationsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const getMediaUrl = (path) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `${import.meta.env.VITE_API_URL}${path}`;
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await api.get('applications/jobapplicationslist/', {
        params: {
          search: search,
          status: statusFilter
        }
      });
      setData(response.data);
    } catch (err) {
      toast.error("Error fetching data from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchApplications();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  // Color helper for applicant statuses
  const getStatusStyles = (status) => {
    switch (status) {
      case 'SHORT_LISTED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
      default: // APPLIED or others
        return 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
    }
  };

  const formatStatus = (status) => {
    return status?.replace('_', ' ');
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen font-sans">
      {/* HEADER COMMAND CARD */}
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-200/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-650 bg-clip-text text-transparent">
            Applicant Database
          </h1>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-ping"></span>
            Syncing Active Candidates Registry
          </p>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* SEARCH INPUT */}
          <div className="relative flex-1 sm:w-64">
            <FiSearch className="absolute left-4 top-3.5 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search name, job title..." 
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all font-medium text-slate-700"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* STATUS FILTER */}
          <div className="relative">
            <FiFilter className="absolute left-4 top-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
            <select 
              className="pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-600 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all appearance-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="APPLIED">Applied</option>
              <option value="SHORT_LISTED">Shortlisted</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <div className="absolute right-4 top-4.5 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-500 w-0 h-0"></div>
          </div>
        </div>
      </div>

      {/* TABLE/LIST PANEL */}
      <div className="bg-white rounded-3xl border border-slate-200/60 overflow-hidden shadow-sm shadow-slate-100/50">
        {loading ? (
          <div className="p-24 text-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Syncing pipeline records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/50">
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-wider">Candidate Details</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-wider">Applied Position</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-wider">Application Status</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-wider text-right">Resume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((app) => {
                  const initials = app.candidate_name
                    ? app.candidate_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                    : 'C';
                  
                  return (
                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors duration-200 group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-indigo-500/10">
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{app.candidate_name}</p>
                            <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                              <FiMail className="w-3 h-3" />
                              {app.candidate_email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div>
                          <p className="font-bold text-slate-700 text-sm">{app.job_title}</p>
                          <p className="text-[10px] text-indigo-500 font-extrabold tracking-widest uppercase mt-0.5">Corporate Pipeline</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 border rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusStyles(app.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${app.status === 'SHORT_LISTED' ? 'bg-emerald-500' : app.status === 'REJECTED' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
                          {formatStatus(app.status)}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <a 
                          href={getMediaUrl(app.resume)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-2 px-4.5 py-2.5 bg-slate-50 hover:bg-indigo-600 text-slate-600 hover:text-white border border-slate-200 hover:border-indigo-600 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
                        >
                          <FiFileText className="w-3.5 h-3.5" />
                          <span>View Resume</span>
                          <FiExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!loading && data.length === 0 && (
          <div className="p-24 text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center text-2xl mx-auto border border-slate-100 mb-4">
              <FiUser className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-slate-700 font-bold tracking-tight">No Candidates Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">We couldn't find any candidate applications matching your current filters and search queries.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllApplicationsPage;
