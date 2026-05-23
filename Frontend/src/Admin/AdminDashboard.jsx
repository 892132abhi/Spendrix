import  { useState, useEffect } from 'react';
import api from '../api/instance';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSystemMetrics = async () => {
      try {
        // This hits your ProfileList (APIView)
        const response = await api.get('accounts/profiledata/');
        setStatsData(response.data);
      } catch (err) {
        console.error("Dossier Retrieval Failed:", err);
        toast.error("Failed to sync system metrics");
      } finally {
        setLoading(false);
      }
    };

    fetchSystemMetrics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">
          Decrypting System Metrics...
        </p>
      </div>
    );
  }

  // Mapping backend response to UI structure
  const metrics = [
    { 
        label: 'Total Users', 
        value: statsData?.Total_user || 0, 
        icon: '👥', 
        color: 'text-indigo-600', 
        trend: 'Live' 
    },
    { 
        label: 'Total HRs', 
        value: statsData?.Total_admin || 0, 
        icon: '💼', 
        color: 'text-blue-600', 
        trend: 'Verified' 
    },
    { 
        label: 'Total Interviewers', 
        value: statsData?.Total_Interviewer || 0, 
        icon: '🎙️', 
        color: 'text-violet-600', 
        trend: 'Active' 
    },
    { 
        label: 'Total Candidates', 
        value: statsData?.Total_candidates || 0, 
        icon: '🎓', 
        color: 'text-emerald-600', 
        trend: 'Syncing' 
    },
    { 
        label: 'Total Jobs', 
        value: statsData?.Total_jobs || 0, 
        icon: '⚡', 
        color: 'text-rose-500', 
        trend: 'Open' 
    },
    { 
        label: 'Active Interviews', 
        value: '15', // Static mock for now
        icon: '🎥', 
        color: 'text-amber-500', 
        trend: 'Live Now' 
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- WELCOME HEADER --- */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/50 backdrop-blur-md p-8 rounded-[2.5rem] border border-white shadow-sm gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">System Overview</h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Real-time platform metrics</p>
        </div>
        <div className="text-left md:text-right bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Status</p>
          <div className="flex items-center gap-2 mt-1">
             <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
             <span className="text-xs font-black text-slate-700 uppercase">Operational</span>
          </div>
        </div>
      </header>

      {/* --- METRICS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((stat, i) => (
          <div 
            key={i} 
            className="bg-white border border-slate-200 p-8 rounded-[2.5rem] hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 group relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-indigo-50 transition-all duration-500 shadow-inner">
                {stat.icon}
              </div>
              <span className="text-[9px] font-black px-3 py-1 rounded-full bg-slate-900 text-white uppercase tracking-tighter">
                {stat.trend}
              </span>
            </div>
            
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 relative z-10">{stat.label}</p>
            <h2 className={`text-5xl font-black tracking-tighter ${stat.color} relative z-10`}>
              {stat.value}
            </h2>

            {/* Subtle background decoration */}
            <div className="absolute -right-4 -bottom-4 text-slate-50 text-8xl font-black opacity-40 group-hover:scale-110 transition-transform duration-700 select-none">
                {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* --- SYSTEM LOGS --- */}
      <section className="bg-slate-900 rounded-[3.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 space-y-8">
           <div className="flex items-center justify-between border-b border-white/10 pb-6">
              <div>
                <h3 className="text-xl font-black tracking-tight uppercase italic">Recent Activity</h3>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Live system audit trail</p>
              </div>
              <button className="px-6 py-2 rounded-full border border-white/20 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all">
                Full Logs
              </button>
           </div>
           
           <div className="grid gap-4">
              {[
                { event: 'New HR Account Created', user: 'SYSTEM_ADMIN', time: '2 mins ago', type: 'USER' },
                { event: 'Job Posting #402 Closed', user: 'HR_MGR_01', time: '14 mins ago', type: 'JOB' },
                { event: 'Critical: DB Backup Success', user: 'AUTO_BOT', time: '1 hour ago', type: 'SYS' },
              ].map((log, i) => (
                <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/5 hover:border-indigo-500/50 hover:bg-white/[0.07] transition-all group">
                   <div className="flex items-center gap-6">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-xs font-black text-indigo-400">
                        {log.type}
                      </div>
                      <div>
                        <span className="text-sm font-black text-slate-100 group-hover:text-indigo-300 transition-colors">{log.event}</span>
                        <div className="flex gap-3 mt-1">
                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter italic">Triggered by: {log.user}</p>
                        </div>
                      </div>
                   </div>
                   <div className="mt-4 md:mt-0 text-left md:text-right">
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{log.time}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

    </div>
  );
};

export default AdminDashboard;