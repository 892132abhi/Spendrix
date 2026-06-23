import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/instance';
import { toast } from 'react-hot-toast';
import { FiUsers, FiShield, FiUserCheck, FiUser, FiBriefcase, FiCalendar, FiActivity, FiArrowRight, FiClock, FiPlusCircle } from 'react-icons/fi';

const HRDashboard = () => {
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, interviewsRes] = await Promise.all([
          api.get('accounts/profiledata/'),
          api.get('interviews/interviewlist/').catch(err => { console.error(err); return { data: [] }; })
        ]);
        setStatsData(statsRes.data);
        setInterviews(Array.isArray(interviewsRes.data) ? interviewsRes.data : []);
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 bg-slate-50/50">
        <div className="w-12 h-12 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-slate-450 uppercase tracking-[0.25em] animate-pulse">
          Syncing HR Intelligence...
        </p>
      </div>
    );
  }

  const metrics = [
    { 
      label: 'Total Users', 
      value: statsData?.Total_user || 0, 
      icon: <FiUsers className="w-6 h-6" />, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50/70 border-indigo-100/60',
      trend: 'Platform' 
    },
    { 
      label: 'Total HRs', 
      value: statsData?.Total_admin || 0, 
      icon: <FiShield className="w-6 h-6" />, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50/70 border-blue-100/60',
      trend: 'Team' 
    },
    { 
      label: 'Total Interviewers', 
      value: statsData?.Total_Interviewer || 0, 
      icon: <FiUserCheck className="w-6 h-6" />, 
      color: 'text-violet-600', 
      bg: 'bg-violet-50/70 border-violet-100/60',
      trend: 'Active' 
    },
    { 
      label: 'Total Candidates', 
      value: statsData?.Total_candidates || 0, 
      icon: <FiUser className="w-6 h-6" />, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50/70 border-emerald-100/60',
      trend: 'Talent' 
    },
    { 
      label: 'Total Jobs', 
     color: 'text-amber-500', 
      bg: 'bg-amber-50/70 border-amber-100/60',
       value: statsData?.Total_jobs || 0, 
      icon: <FiBriefcase className="w-6 h-6" />, 
      color: 'text-rose-500', 
      bg: 'bg-rose-50/70 border-rose-100/60',
      trend: 'Open' 
    },
    { 
      label: 'Active Interviews', 
      value: statsData?.Total_Interviewer || 0, 
      icon: <FiCalendar className="w-6 h-6" />, 
      trend: 'Live' 
    },
  ];

  const latestInterviews = interviews.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 px-6 pb-16 font-sans">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-200/60 shadow-sm gap-6 mt-6">
        <div className="text-left">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FiActivity className="text-indigo-500" />
            HR Intelligence
          </h1>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
            Recruitment & Talent Overview
          </p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 border border-emerald-150 px-5 py-2.5 rounded-full flex items-center gap-2 shadow-sm shrink-0 self-start md:self-auto">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="text-[10px] font-black uppercase tracking-wider">HR Portal Active</span>
        </div>
      </header>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((stat, i) => (
          <div 
            key={i} 
            className="bg-white border border-slate-200/60 p-8 rounded-3xl hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all duration-300 group relative overflow-hidden text-left"
          >
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner transition-transform group-hover:scale-105 duration-300 ${stat.bg}`}>
                {stat.icon}
              </div>
              <span className="text-[9px] font-black px-3.5 py-1.5 rounded-full bg-slate-900 text-white uppercase tracking-wider shadow-sm">
                {stat.trend}
              </span>
            </div>
            
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 relative z-10">{stat.label}</p>
            <h2 className={`text-5xl font-black tracking-tight ${stat.color} relative z-10 leading-none`}>
              {stat.value}
            </h2>

            <div className="absolute -right-4 -bottom-4 text-slate-100 text-8xl font-black opacity-15 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 select-none pointer-events-none">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* RECRUITMENT ACTIVITIES */}
      <section className="bg-white border border-slate-200/60 rounded-3xl p-8 md:p-10 shadow-sm text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-8">
            <h3 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <FiClock className="text-indigo-500 w-5 h-5" />
              Recruitment Activity Feed
            </h3>
            <button 
              onClick={() => navigate('/interviews')}
              className="text-[10px] font-black text-indigo-650 hover:text-indigo-850 transition-colors uppercase tracking-wider flex items-center gap-1 cursor-pointer bg-transparent border-0"
            >
              <span>Full Talent Audit</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </button>
        </div>

        <div className="grid gap-4">
            {latestInterviews.length > 0 ? (
              latestInterviews.map((interview) => (
                <div 
                  key={interview.id} 
                  onClick={() => navigate('/interviews')}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-slate-50/70 hover:bg-slate-50 border border-slate-100 rounded-2xl hover:border-slate-200 transition-all cursor-pointer group gap-4 text-left"
                >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-550/10 border border-indigo-100 flex items-center justify-center text-indigo-650 shrink-0">
                        🗓️
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-705 group-hover:text-indigo-650 transition-colors">
                          Interview with <span className="font-extrabold text-slate-900">{interview.candidate_name || 'Candidate'}</span>
                        </p>
                        <p className="text-[10px] font-bold text-slate-450 mt-0.5">
                          Assigned to: {interview.interviewer_name || 'Pending'} • Session Details: {interview.note || 'Assessment Round'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 self-start sm:self-center shrink-0">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg">
                        {interview.sheduled_date ? new Date(interview.sheduled_date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </span>
                      <span className={`text-[8px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                        interview.status === 'SHEDULED' || interview.status === 'scheduled' 
                          ? 'bg-blue-50 border-blue-100 text-blue-650' 
                          : interview.status === 'COMPLETED' 
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                            : 'bg-rose-50 border-rose-100 text-rose-600'
                      }`}>
                        {interview.status === 'SHEDULED' ? 'scheduled' : interview.status?.toLowerCase()}
                      </span>
                    </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-slate-50/30 rounded-[1.5rem] border-2 border-dashed border-slate-200 italic font-bold text-slate-400">
                No active interview schedules detected.
              </div>
            )}
        </div>
      </section>
    </div>
  );
};

export default HRDashboard;