import  { useState, useEffect } from 'react';
import api from '../api/instance';
import { toast } from 'react-hot-toast';

const AllApplicationsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

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

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Global Database</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Backend-Powered Search</p>
        </div>

        <div className="flex gap-4">
           <input 
             type="text" 
             placeholder="Search name, job..." 
             className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
             value={search}
             onChange={(e) => setSearch(e.target.value)}
           />

           <select 
             className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
             value={statusFilter}
             onChange={(e) => setStatusFilter(e.target.value)}
           >
             <option value="ALL">All Status</option>
             <option value="APPLIED">Applied</option>
             <option value="SHORT_LISTED">Shortlisted</option>
             <option value="REJECTED">Rejected</option>
           </select>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-20 text-center font-black animate-pulse text-indigo-600">Syncing with Server...</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Candidate</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Applied For</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Resume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-6">
                    <p className="font-bold text-slate-800 text-sm">{app.candidate_name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{app.candidate_email}</p>
                  </td>
                  <td className="p-6">
                    <p className="font-bold text-indigo-600 text-sm">{app.job_title}</p>
                  </td>
                  <td className="p-6">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[9px] font-black uppercase">
                      {app.status}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <a href={`http://localhost:8000${app.resume}`} target="_blank" className="text-indigo-600 font-black text-[10px] border-b border-indigo-100">VIEW PDF</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && data.length === 0 && (
          <div className="p-20 text-center text-slate-400 font-bold">No results found on the server.</div>
        )}
      </div>
    </div>
  );
};

export default AllApplicationsPage;