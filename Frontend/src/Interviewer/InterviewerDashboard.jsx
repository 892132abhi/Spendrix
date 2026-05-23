import { useState, useEffect } from 'react';
import api from '../api/instance';
import { toast } from 'react-hot-toast';

const InterviewerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Hits the InterviewStatusCount APIView
        const res = await api.get('interviews/interviewer-status/'); 
        setData(res.data);
      } catch (err) {
        console.error("Dashboard Sync Error:", err);
        toast.error("Failed to sync with Spendrix Intelligence");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <SkeletonLoader />;

  // Stats mapped for the Bento Grid
  const stats = [
    { label: 'Total Assigned', value: data?.total_assigned, icon: '👥', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Sessions Today', value: data?.today_session, icon: '📅', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Feedback Due', value: data?.pending_feedback, icon: '✍️', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Completed', value: data?.completed_interviews, icon: '✅', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 p-4 lg:p-8">
      
      {/* --- DASHBOARD HEADER --- */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Control Center</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Interviewer Execution & Talent Sync</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[9px] font-black text-slate-400 uppercase">System Status</p>
            <p className="text-xs font-bold text-emerald-500 flex items-center gap-2 justify-end">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Fully Synchronized
            </p>
          </div>
        </div>
      </header>

      {/* --- BENTO GRID STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white border border-slate-100 p-8 rounded-[3rem] shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all">
            <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-inner`}>
              {stat.icon}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-4xl font-black ${stat.color}`}>{stat.value ?? 0}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* --- LEFT: UPCOMING QUEUE --- */}
        <section className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Live Session Queue</h3>
            <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">Priority Next</span>
          </div>
          
          <div className="space-y-4">
            {data?.upcoming_interviews?.length > 0 ? (
              data.upcoming_interviews.map((interview) => (
                <div key={interview.id} className="bg-white border border-slate-100 p-8 rounded-[3rem] hover:border-slate-900 transition-all group relative overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex gap-6 items-center">
                      <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] flex flex-col items-center justify-center shadow-2xl">
                        <span className="text-[8px] font-bold uppercase opacity-60">Start</span>
                        <span className="text-lg font-black tracking-tighter italic">
                          {new Date(interview.scheduled_at).getHours()}:00
                        </span>
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter italic">{interview.candidate_username}</h4>
                        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{interview.role_name}</p>
                      </div>
                    </div>
                    <a 
                      href={interview.meeting_link} 
                      target="_blank" 
                      rel="noreferrer"
                      className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-600 hover:scale-105 active:scale-95 transition-all text-center"
                    >
                      Join Meeting
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-20 text-center border-4 border-dashed border-slate-50 rounded-[4rem]">
                <p className="text-xs font-black text-slate-300 uppercase tracking-widest italic">No upcoming sessions detected</p>
              </div>
            )}
          </div>
        </section>

        {/* --- RIGHT: EVALUATION PIPELINE --- */}
        <section className="lg:col-span-5 space-y-8">
          <div className="bg-slate-900 rounded-[4rem] p-10 shadow-2xl text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-8">Pending Evaluation</h3>
              <div className="space-y-6">
                {data?.pending_list?.length > 0 ? data.pending_list.map((pf) => (
                  <div key={pf.id} className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] backdrop-blur-md group hover:bg-white/10 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-sm font-black uppercase italic tracking-tight">{pf.candidate_name}</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{pf.role_name}</p>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    </div>
                    <button className="w-full py-3 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-400 hover:text-white transition-all shadow-lg shadow-black/20">
                      Submit Scorecard
                    </button>
                  </div>
                )) : (
                  <p className="text-xs font-bold text-slate-500 italic text-center py-10">All evaluations complete</p>
                )}
              </div>
            </div>
            {/* Background Decoration */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-600 rounded-full blur-[80px] opacity-20"></div>
          </div>
          
          <div className="bg-indigo-50 rounded-[3rem] p-8 border border-indigo-100">
             <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">Pro Tip</h4>
             <p className="text-[11px] font-medium text-indigo-900/70 leading-relaxed">
               Ensure your meeting environment is stable. Technical dossiers are automatically generated 5 minutes prior to the session start.
             </p>
          </div>
        </section>
      </div>
    </div>
  );
};

// --- SKELETON LOADER FOR INITIAL SYNC ---
const SkeletonLoader = () => (
  <div className="p-8 space-y-12 animate-pulse">
    <div className="h-12 w-1/3 bg-slate-100 rounded-2xl"></div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => <div key={i} className="h-40 bg-slate-50 rounded-[3rem]"></div>)}
    </div>
    <div className="grid grid-cols-12 gap-10">
      <div className="col-span-7 h-[500px] bg-slate-50 rounded-[4rem]"></div>
      <div className="col-span-5 h-[500px] bg-slate-900/5 rounded-[4rem]"></div>
    </div>
  </div>
);

export default InterviewerDashboard;