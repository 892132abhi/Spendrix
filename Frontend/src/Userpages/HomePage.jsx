import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/instance';
import { toast } from 'react-hot-toast';
import { 
  FiBriefcase, FiCalendar, FiCheckCircle, FiSearch, 
  FiLink, FiAlertTriangle, FiArrowUpRight, FiTrendingUp, 
  FiZap, FiCompass, FiShield, FiCpu 
} from 'react-icons/fi';

const DashboardPage = () => {
  const navigate = useNavigate();
  
  // --- CORE DATA STATES ---
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("JOBS"); // JOBS, INTERVIEWS

  // --- API HANDSHAKE SYNC ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const [profileRes, jobsRes, applicationsRes, interviewsRes] = await Promise.all([
          api.get('accounts/profile/').catch(err => { console.error("Profile Error:", err); return { data: null }; }),
          api.get('jobs/availablejob/').catch(err => { console.error("Jobs Error:", err); return { data: [] }; }),
          api.get('applications/applicationlist/').catch(err => { console.error("Applications Error:", err); return { data: [] }; }),
          api.get('interviews/candidateinterviews/').catch(err => { console.error("Interviews Error:", err); return { data: [] }; })
        ]);
        
        if (profileRes.data) {
          setProfile(profileRes.data);
        }
        
        const availableJobs = Array.isArray(jobsRes.data) ? jobsRes.data : jobsRes.data?.results || [];
        const apps = Array.isArray(applicationsRes.data) ? applicationsRes.data : [];
        
        const mappedJobs = availableJobs.map(job => {
          const matchedApp = apps.find(app => app.job === job.id);
          return {
            id: job.id,
            title: job.title,
            company: job.company_name || 'Spendrix Partner',
            location: job.location,
            salary: job.salary || 'Not Specified',
            status: matchedApp ? matchedApp.status : 'EXPLORING',
            applied_date: matchedApp ? matchedApp.applied_at_date : null
          };
        });
        
        setJobs(mappedJobs);
        setApplications(apps);
        setInterviews(Array.isArray(interviewsRes.data) ? interviewsRes.data : interviewsRes.data?.results || []);
      } catch (err) {
        console.error("Candidate Dashboard Sync Error:", err);
        toast.error("Telemetry link lost. Terminal update failed.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const handleApplyJob = async (jobId) => {
    try {
      const res = await api.post(`applications/applyjob/${jobId}/`);
      toast.success(res.data?.detail || "Application transmitted securely to enterprise node!");
      
      const appsRes = await api.get('applications/applicationlist/');
      const apps = Array.isArray(appsRes.data) ? appsRes.data : [];
      setApplications(apps);
      setJobs(prev => prev.map(job => {
        const matchedApp = apps.find(app => app.job === job.id) || (job.id === jobId ? { status: 'APPLIED', applied_at_date: new Date().toLocaleDateString() } : null);
        return {
          ...job,
          status: matchedApp ? matchedApp.status : 'EXPLORING',
          applied_date: matchedApp ? matchedApp.applied_at_date : null
        };
      }));
    } catch (err) {
      console.error("Application error:", err);
      let errMsg = "Application delivery protocol failed.";
      if (err.response?.data) {
        const data = err.response.data;
        if (data.detail) {
          errMsg = data.detail;
        } else {
          const values = Object.values(data);
          if (values.length > 0) {
            const firstError = values[0];
            errMsg = Array.isArray(firstError) ? firstError[0] : String(firstError);
          }
        }
      }
      toast.error(errMsg);
    }
  };

  // Modernized theme-specific badge colors (Emerald & Deep Indigo)
  const getStatusBadge = (status) => {
    const styles = {
      APPLIED: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',
      SHORT_LISTED: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.05)]',
      SHORTLISTED: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.05)]',
      INTERVIEW: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
      HIRED: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
      REJECTED: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
      EXPLORING: 'bg-slate-800/40 border-slate-700/60 text-slate-400'
    };
    return styles[status] || 'bg-slate-800/40 border-slate-700/60 text-slate-450';
  };

  const getStatusLabel = (status) => {
    const labels = {
      APPLIED: 'Dispatched',
      SHORT_LISTED: 'Shortlisted',
      SHORTLISTED: 'Shortlisted',
      INTERVIEW: 'Assigned Loop',
      HIRED: 'Secured',
      REJECTED: 'Archived',
      EXPLORING: 'Open Vector'
    };
    return labels[status] || status;
  };

  // --- STATISTICAL CALCULATORS ---
  const appliedCount = applications.length;
  const upcomingInterviewsCount = interviews.filter(i => i.status === 'SHEDULED' || i.status === 'scheduled').length;
  const shortlistedCount = applications.filter(app => app.status === 'SHORT_LISTED' || app.status === 'SHORTLISTED' || app.status === 'HIRED').length;

  return (
    <div className="min-h-screen bg-[#06070a] text-slate-100 font-sans antialiased pb-16 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/20 via-[#06070a] to-[#06070a]">
      
      {/* PREMIUM STICKY NAVIGATION BAR */}
      <nav className="sticky top-0 z-50 bg-[#0c0d14]/70 backdrop-blur-xl border-b border-indigo-500/10 py-4 mb-8 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="text-left">
            <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
              Welcome, <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-400">{profile?.full_name || 'Operator'}</span>
            </h1>
            <p className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-[0.15em] mt-0.5">Quantum Personnel Node</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]"></span>
            <span className="text-[10px] font-mono font-bold uppercase text-indigo-400 bg-indigo-500/5 px-3 py-1.5 rounded-xl border border-indigo-500/20">
              Terminal Secure
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 space-y-6">
        
        {/* CRITICAL ATTENTION RESUME BANNER */}
        {profile && !profile.resume && (
          <div className="relative bg-gradient-to-r from-amber-600/20 via-orange-600/10 to-rose-600/5 p-6 rounded-2xl border border-orange-500/30 overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.05)] flex flex-col md:flex-row items-center justify-between gap-6 transition-transform duration-300 hover:scale-[1.002]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/[0.02] blur-3xl rounded-full pointer-events-none" />
            <div className="flex items-center gap-4 relative z-10 text-left">
              <div className="w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shadow-inner shrink-0">
                <FiAlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-orange-400">Ledger Incomplete: Profile Missing Verification Matrix</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Deploy your standardized resume file to active matching arrays to establish transmission routes.</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/profile')} 
              className="relative px-5 py-2.5 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/40 text-orange-300 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest transition-all shadow-md active:scale-95 shrink-0 cursor-pointer"
            >
              Configure Vector
            </button>
          </div>
        )}

        {/* HIGH RESOLUTION ANALYTICS BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* TRACKED CHANNELS BOX */}
          <div className="bg-[#0c0d14] p-6 rounded-2xl border border-slate-800/80 relative overflow-hidden group shadow-xl text-left">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent shadow-[0_0_15px_#6366f1]" />
            <div className="w-10 h-10 rounded-xl bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-inner">
              <FiBriefcase className="w-4 h-4" />
            </div>
            <p className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">Active System Requests</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-3xl font-extrabold text-white tracking-tight leading-none">{appliedCount}</h2>
              <span className="text-[10px] font-mono text-indigo-400 font-bold">Transmitted</span>
            </div>
            <div className="absolute right-3 bottom-1 text-slate-800/10 text-7xl font-black select-none pointer-events-none group-hover:scale-105 group-hover:text-indigo-500/[0.03] transition-all duration-500">
              01
            </div>
          </div>
          
          {/* ASSIGNED LOOP CARD */}
          <div className="bg-[#0c0d14] p-6 rounded-2xl border border-slate-800/80 relative overflow-hidden group shadow-xl text-left">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
            <div className="w-10 h-10 rounded-xl bg-purple-500/5 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 shadow-inner">
              <FiCalendar className="w-4 h-4" />
            </div>
            <p className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">Pipeline Interfaces</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-3xl font-extrabold text-purple-400 tracking-tight leading-none">{upcomingInterviewsCount}</h2>
              <span className="text-[10px] font-mono text-slate-400 font-medium">Scheduled</span>
            </div>
            <div className="absolute right-3 bottom-1 text-slate-800/10 text-7xl font-black select-none pointer-events-none group-hover:scale-105 group-hover:text-purple-500/[0.03] transition-all duration-500">
              02
            </div>
          </div>

          {/* PERFORMANCE YIELD CARD */}
          <div className="bg-[#0c0d14] p-6 rounded-2xl border border-slate-800/80 relative overflow-hidden group shadow-xl text-left">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent shadow-[0_0_15px_rgba(52,211,153,0.2)]" />
            <div className="w-10 h-10 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-inner">
              <FiCheckCircle className="w-4 h-4 shadow-[0_0_10px_rgba(52,211,153,0.2)]" />
            </div>
            <p className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">Shortlist Convergence</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-3xl font-extrabold text-emerald-400 tracking-tight leading-none">{shortlistedCount}</h2>
              <span className="text-[10px] font-mono text-slate-400 font-medium">Verified Arrays</span>
            </div>
            <div className="absolute right-3 bottom-1 text-slate-800/10 text-7xl font-black select-none pointer-events-none group-hover:scale-105 group-hover:text-emerald-500/[0.03] transition-all duration-500">
              03
            </div>
          </div>
        </div>

        {/* WORKSPACE SECTOR MATRIX CONTROL TABS */}
        <div className="flex bg-[#0c0d14] p-1.5 border border-slate-800 rounded-xl w-fit space-x-1 shadow-inner font-mono">
          <button
            onClick={() => setActiveTab("JOBS")}
            className={`px-5 py-2 rounded-lg text-[11px] font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer flex items-center gap-2 ${activeTab === "JOBS" ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <FiCompass className="w-3.5 h-3.5" />
            Position Match Grid ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab("INTERVIEWS")}
            className={`px-5 py-2 rounded-lg text-[11px] font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer flex items-center gap-2 ${activeTab === "INTERVIEWS" ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <FiCpu className="w-3.5 h-3.5" />
            Interview Schemas ({interviews.length})
          </button>
        </div>

        {/* ACTIVE MATRIX VIEWPORT */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[#0c0d14] p-6 rounded-2xl border border-slate-900 shadow-md h-24 flex items-center justify-between animate-pulse">
                <div className="space-y-2 w-1/3 text-left">
                  <div className="h-3.5 bg-slate-800/80 rounded w-5/6"></div>
                  <div className="h-2.5 bg-slate-800/40 rounded w-1/2"></div>
                </div>
                <div className="h-9 bg-slate-800/80 rounded-xl w-28"></div>
              </div>
            ))}
          </div>
        ) : activeTab === "JOBS" ? (
          
          /* --- DESIGN GRADIENT INTERFACE FOR JOB CARDS --- */
          <div className="grid grid-cols-1 gap-4 text-left">
            {jobs.length === 0 ? (
              <div className="bg-[#0c0d14] py-20 text-center rounded-2xl border border-slate-800/80 shadow-inner flex flex-col items-center justify-center p-8">
                <FiSearch className="text-2xl text-slate-600 mb-2 animate-bounce" />
                <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">No active operational vacancies mapped in index</p>
              </div>
            ) : (
              jobs.map(job => (
                <div key={job.id} className="bg-[#0c0d14] p-6 rounded-2xl border border-slate-800/60 hover:border-indigo-500/30 transition-all duration-300 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 group relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-indigo-500/0 via-indigo-500/20 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="space-y-1.5 relative z-10">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-bold text-white text-base tracking-tight group-hover:text-indigo-300 transition-colors">{job.title}</h3>
                      <span className={`text-[8px] font-mono font-bold uppercase tracking-wider border px-2 py-0.5 rounded ${getStatusBadge(job.status)}`}>
                        {getStatusLabel(job.status)}
                      </span>
                    </div>
                    <p className="text-indigo-400 text-xs font-semibold tracking-wide font-mono">{job.company}</p>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                      <span className="flex items-center gap-1"><span className="text-indigo-500">📍</span> {job.location}</span>
                      <span className="flex items-center gap-1"><span className="text-emerald-400">💰</span> {job.salary}</span>
                      {job.applied_date && (
                        <span className="text-slate-600 font-medium lowercase">
                          Dispatched: <span className="font-mono text-slate-400">{new Date(job.applied_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center shrink-0 relative z-10">
                    {job.status === 'EXPLORING' ? (
                      <button
                        onClick={() => handleApplyJob(job.id)}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] active:scale-98 cursor-pointer flex items-center gap-1.5"
                      >
                        Transmit Route
                        <FiArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button disabled className="px-5 py-2.5 bg-slate-900/50 border border-slate-800/80 text-slate-600 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest cursor-not-allowed">
                        In Assessment Ring
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

        ) : (
          
          /* --- ADVANCED DATA GLOW TERMINAL TABLE FOR INTERVIEWS --- */
          <div className="bg-[#0c0d14] rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden text-left relative">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-950 text-slate-500 text-[10px] font-mono font-bold uppercase tracking-[0.15em] border-b border-slate-900">
                    <th className="py-4.5 px-6">System Assessment Node</th>
                    <th className="py-4.5 px-6">Assigned Evaluator</th>
                    <th className="py-4.5 px-6">Timeline Coordinate</th>
                    <th className="py-4.5 px-6">Session Vector</th>
                    <th className="py-4.5 px-6 text-right">Verification Sync</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-900">
                  {interviews.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-20 text-center bg-[#0c0d14] p-8">
                        <FiCalendar className="text-2xl text-slate-700 mx-auto mb-2" />
                        <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">No active matrix assessment paths found</p>
                      </td>
                    </tr>
                  ) : (
                    interviews.map(interview => (
                      <tr key={interview.id} className="bg-transparent transition-colors hover:bg-slate-900/30 group">
                        <td className="py-5 px-6 relative">
                          <div className="absolute top-0 left-0 w-[1px] h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="font-bold text-white text-sm tracking-tight mb-0.5">{interview.job_title}</div>
                          <div className="text-slate-500 text-[9px] font-mono font-bold uppercase tracking-wider">Assessment Core</div>
                        </td>
                        <td className="py-5 px-6 font-mono font-bold text-[10px] tracking-wider text-indigo-400">
                          {interview.interviewer_name || "Unassigned Module"}
                        </td>
                        <td className="py-5 px-6 font-semibold text-slate-300 font-mono">
                          <div className="text-slate-200">{new Date(interview.sheduled_date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
                          <div className="text-[10px] font-medium text-slate-500 mt-0.5">{new Date(interview.sheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td className="py-5 px-6">
                          {interview.meeting_link ? (
                            <a 
                              href={interview.meeting_link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono font-bold rounded-lg uppercase text-[9px] tracking-wider hover:bg-indigo-500/20 transition-all shadow-md cursor-pointer"
                            >
                              <FiLink className="w-3 h-3" /> Connect Loop
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-600 font-mono font-bold rounded-lg uppercase text-[9px] tracking-wider select-none">
                              Sync Imminent
                            </span>
                          )}
                        </td>
                        <td className="py-5 px-6 text-right">
                          {interview.status === 'SHEDULED' || interview.status === 'scheduled' ? (
                            <span className="text-[8px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded shadow-[0_0_15px_rgba(52,211,153,0.05)]">
                              ● Synchronized Secure
                            </span>
                          ) : (
                            <span className="text-[8px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded">
                              {interview.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;