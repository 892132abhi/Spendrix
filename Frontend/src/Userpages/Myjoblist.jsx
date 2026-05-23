import { useState, useEffect } from 'react';
import api from '../api/instance'; 
import { toast } from 'react-hot-toast';

const MyApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const response = await api.get('applications/applicationlist/');
        setApplications(response.data);
      } catch (err) {
        toast.error("Failed to sync personal application ledgers.");
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const handleWithdraw = async (id) => {
    if (window.confirm("Purge profile tracking loop from this deployment track? This protocol is definitive.")) {
      try {
        await api.delete(`applications/withdraw/${id}/`);
        setApplications(prev => prev.filter(app => app.id !== id));
        toast.success("Profile tracking loop retracted.");
      } catch (err) {
        toast.error("Retraction sequence blocked.");
      }
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'INTERVIEW': return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'APPLIED': return 'bg-stone-100 text-stone-800 border-stone-200';
      case 'SHORT_LISTED': return 'bg-orange-100 text-orange-950 border-orange-200';
      case 'REJECTED': return 'bg-red-50 text-red-600 border-red-100';
      case 'HIRED': return 'bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-black border-orange-400';
      default: return 'bg-stone-50 text-stone-600';
    }
  };

  const getStep = (status) => {
    const steps = { 'APPLIED': 1, 'SHORT_LISTED': 2, 'INTERVIEW': 3, 'HIRED': 4 };
    return steps[status] || 0;
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-amber-600 tracking-widest">RETRIEVING RECORD CHANNELS...</div>;

  return (
    <div className="space-y-8 bg-stone-50/40 p-6 rounded-[2.5rem]">
      <header className="border-b border-amber-100 pb-6">
        <h1 className="text-2xl font-black text-stone-950 uppercase italic tracking-tight">Active Deployment Dossiers</h1>
        <p className="text-stone-500 text-sm font-medium">Monitor evaluation progress loops across tracking registers.</p>
      </header>

      <div className="grid gap-6">
        {applications.map((app) => (
          <div key={app.id} className="bg-white border border-orange-100/70 rounded-[2.5rem] p-8 shadow-sm hover:border-amber-400 transition-all">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-stone-950 rounded-2xl flex items-center justify-center font-black text-amber-400 text-xl border border-amber-500/20 shadow-md">
                  {app.job_title?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-black text-stone-900 uppercase tracking-tight italic">{app.job_title}</h3>
                  <p className="text-sm font-bold text-orange-600 tracking-wide">{app.company_name || "Enterprise Segment Parent"}</p>
                  <p className="text-[10px] text-stone-400 uppercase font-black mt-1 tracking-widest">
                    Synchronized on {app.applied_at_date}
                  </p>
                </div>
              </div>

              {/* Status Tracker */}
              <div className="flex-1 max-w-md">
                <div className="flex justify-between mb-2">
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-widest ${getStatusStyle(app.status)}`}>
                    {app.status.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Matrix Tier Progression</span>
                </div>
                <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden flex gap-1 p-[1px]">
                  {[1, 2, 3, 4].map((i) => (
                    <div 
                      key={i} 
                      className={`h-full flex-1 rounded-full transition-all duration-500 ${
                        getStep(app.status) >= i 
                          ? 'bg-gradient-to-r from-amber-400 to-orange-500' 
                          : 'bg-stone-200'
                      } ${app.status === 'REJECTED' ? 'bg-red-300' : ''}`}
                    ></div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleWithdraw(app.id)}
                  className="px-5 py-2.5 bg-stone-50 border border-stone-200 hover:bg-orange-600 hover:text-white text-stone-500 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm"
                >
                  Retract
                </button>
              </div>
            </div>
          </div>
        ))}

        {applications.length === 0 && (
          <div className="text-center py-20 bg-white border-2 border-dashed border-amber-200 rounded-[3rem]">
            <p className="text-stone-400 font-bold uppercase text-xs tracking-widest">No profiles are actively asserted into placement slots.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplicationsPage;