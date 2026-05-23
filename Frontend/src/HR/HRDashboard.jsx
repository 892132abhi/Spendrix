import { useState, useEffect } from 'react';
import api from '../api/instance';
import { toast } from 'react-hot-toast';

const HRDashboard = () => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('accounts/profiledata/');
        setStatsData(response.data);
      } catch (err) {
        console.error("HR Dashboard Sync Failed:", err);
        toast.error("Failed to sync HR metrics");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">
          Syncing HR Intelligence...
        </p>
      </div>
    );
  }

  const metrics = [
    { 
        label: 'Total Users', 
        value: statsData?.Total_user || 0, 
        icon: '👥', 
        color: 'text-indigo-600', 
        trend: 'Platform' 
    },
    { 
        label: 'Total HRs', 
        value: statsData?.Total_admin || 0, 
        icon: '💼', 
        color: 'text-blue-600', 
        trend: 'Team' 
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
        trend: 'Talent' 
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
        value: statsData?.Total_Interviewer || 0, 
        icon: '🎥', 
        color: 'text-amber-500', 
        trend: 'Live' 
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/50 backdrop-blur-md p-8 rounded-[2.5rem] border border-white shadow-sm gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">HR Intelligence</h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Recruitment & Talent Overview</p>
        </div>
        <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100">
          <div className="flex items-center gap-2">
             <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
             <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">HR Portal Active</span>
          </div>
        </div>
      </header>

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

            <div className="absolute -right-4 -bottom-4 text-slate-50 text-8xl font-black opacity-40 group-hover:scale-110 transition-transform duration-700 select-none">
                {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <section className="bg-white border border-slate-200 rounded-[3.5rem] p-10 shadow-sm">
        <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black tracking-tight uppercase italic text-slate-800">Recruitment Activity</h3>
            <button className="text-[10px] font-black text-indigo-600 border-b-2 border-indigo-600 pb-1 uppercase tracking-widest">
                Full Talent Audit
            </button>
        </div>

        <div className="grid gap-4">
            {[
                "New applicant applied for Django Developer",
                "Interview scheduled for React Developer role",
                "Offer sent to Arjun Nair",
                "Backend Developer position closed",
            ].map((activity, index) => (
                <div key={index} className="flex items-center gap-6 p-6 bg-slate-50 rounded-3xl border border-transparent hover:border-slate-200 hover:bg-white transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-xs">
                        ⚡
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-700">{activity}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase mt-1 tracking-widest">Processed Just Now</p>
                    </div>
                </div>
            ))}
        </div>
      </section>
    </div>
  );
};

export default HRDashboard;