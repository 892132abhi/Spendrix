import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/instance';
import { toast } from 'react-hot-toast';

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
        
        // Fetch matching jobs, candidate applications, and scheduled interviews concurrently
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
        toast.error("Failed to sync candidate directory");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const handleApplyJob = async (jobId) => {
    try {
      const res = await api.post(`applications/applyjob/${jobId}/`);
      toast.success(res.data?.detail || "Application transmitted cleanly to the corporate portal!");
      
      // Update state by refetching applications
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
      const errMsg = err.response?.data?.detail || "Application failed to transmit.";
      toast.error(errMsg);
    }
  };

  // Status mapping helper for premium badges
  const getStatusBadge = (status) => {
    const styles = {
      APPLIED: 'bg-indigo-50 border-indigo-100 text-indigo-650',
      SHORT_LISTED: 'bg-emerald-50 border-emerald-100 text-emerald-600',
      SHORTLISTED: 'bg-emerald-50 border-emerald-100 text-emerald-600',
      INTERVIEW: 'bg-violet-50 border-violet-100 text-violet-650',
      HIRED: 'bg-teal-50 border-teal-100 text-teal-600',
      REJECTED: 'bg-rose-50 border-rose-100 text-rose-600',
      EXPLORING: 'bg-slate-50 border-slate-200 text-slate-400'
    };
    return styles[status] || 'bg-slate-50 border-slate-200 text-slate-500';
  };

  const getStatusLabel = (status) => {
    const labels = {
      APPLIED: 'Applied',
      SHORT_LISTED: 'Shortlisted',
      SHORTLISTED: 'Shortlisted',
      INTERVIEW: 'Interviewing',
      HIRED: 'Hired',
      REJECTED: 'Rejected',
      EXPLORING: 'Exploring'
    };
    return labels[status] || status;
  };

  // --- STATISTICAL CALCULATORS ---
  const appliedCount = applications.length;
  const upcomingInterviewsCount = interviews.filter(i => i.status === 'SHEDULED' || i.status === 'scheduled').length;
  const shortlistedCount = applications.filter(app => app.status === 'SHORT_LISTED' || app.status === 'SHORTLISTED' || app.status === 'HIRED').length;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12 font-sans antialiased text-slate-800">
      
      {/* Top Profile Header Block */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 py-5 mb-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Welcome Back, {profile?.full_name || 'Executive'}
            </h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Candidate Professional Terminal</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200/60">Live Profile Safe</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 space-y-8">
        
        {/* Missing Resume Alert Banner */}
        {profile && !profile.resume && (
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 p-6 rounded-[2rem] text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300 hover:scale-[1.005] hover:shadow-lg animate-[pulse_3s_infinite]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-xl backdrop-blur-md">
                ⚠️
              </div>
              <div className="text-left">
                <h3 className="font-extrabold text-sm uppercase tracking-wider">Curriculum Vitae Missing</h3>
                <p className="text-xs text-orange-50 font-medium mt-0.5">Please upload your resume in the profile section to apply for vacancies.</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/profile')} 
              className="px-6 py-3 bg-white text-orange-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-50 hover:scale-105 active:scale-95 transition-all shadow-sm shrink-0 cursor-pointer"
            >
              Configure Profile
            </button>
          </div>
        )}

        {/* Metric Overview Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-md transition-all text-left relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl mb-4 text-indigo-650">
              💼
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tracked Applications</p>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none mt-2">{appliedCount}</h2>
            <div className="absolute right-0 bottom-0 text-slate-100/40 text-8xl font-black translate-x-4 translate-y-4 select-none pointer-events-none group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
              💼
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-md transition-all text-left relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center text-xl mb-4 text-violet-600">
              🗓️
            </div>
            <p className="text-[10px] font-black text-violet-500 uppercase tracking-widest mb-1">Upcoming Interviews</p>
            <h2 className="text-3xl font-black text-violet-600 tracking-tight leading-none mt-2">{upcomingInterviewsCount}</h2>
            <div className="absolute right-0 bottom-0 text-slate-100/40 text-8xl font-black translate-x-4 translate-y-4 select-none pointer-events-none group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
              🗓️
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-md transition-all text-left relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xl mb-4 text-emerald-600">
              ✨
            </div>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Shortlisted status</p>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none mt-2">
              {shortlistedCount}
            </h2>
            <div className="absolute right-0 bottom-0 text-slate-100/40 text-8xl font-black translate-x-4 translate-y-4 select-none pointer-events-none group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
              ✨
            </div>
          </div>
        </div>

        {/* Workspace Matrix Tabs */}
        <div className="flex bg-slate-100/80 p-1.5 border border-slate-200/40 rounded-2xl w-fit space-x-1 shadow-sm">
          <button
            onClick={() => setActiveTab("JOBS")}
            className={`px-6 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 cursor-pointer ${activeTab === "JOBS" ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}
          >
            Position Matching Matrix ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab("INTERVIEWS")}
            className={`px-6 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 cursor-pointer ${activeTab === "INTERVIEWS" ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}
          >
            Interview Schemas ({interviews.length})
          </button>
        </div>

        {/* Content Render Blocks */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200/50 shadow-sm animate-pulse h-28 flex items-center justify-between">
                <div className="space-y-2.5 w-1/3">
                  <div className="h-4 bg-slate-200 rounded-md w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded-md w-1/2"></div>
                </div>
                <div className="h-10 bg-slate-200 rounded-xl w-28"></div>
              </div>
            ))}
          </div>
        ) : activeTab === "JOBS" ? (
          
          /* --- JOB POSTING CARD GRID --- */
          <div className="grid grid-cols-1 gap-4 text-left">
            {jobs.length === 0 ? (
              <div className="bg-white py-20 text-center rounded-[2.5rem] border border-slate-200 italic font-bold text-slate-400 shadow-sm flex flex-col items-center justify-center p-8">
                <span className="text-3xl mb-2">🔍</span>
                <p className="text-xs uppercase tracking-widest">No active job vacancies detected in repository</p>
              </div>
            ) : (
              jobs.map(job => (
                <div key={job.id} className="bg-white p-6 rounded-[2rem] border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300 hover:border-slate-300 hover:shadow-md">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-slate-800 text-base tracking-tight">{job.title}</h3>
                      <span className={`text-[8px] font-black uppercase tracking-wider border px-2.5 py-0.5 rounded-lg ${getStatusBadge(job.status)}`}>
                        {getStatusLabel(job.status)}
                      </span>
                    </div>
                    <p className="text-indigo-655 text-xs font-black uppercase tracking-widest">{job.company}</p>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span className="flex items-center"><span className="mr-1">📍</span> {job.location}</span>
                      <span className="flex items-center"><span className="mr-1">💰</span> {job.salary}</span>
                      {job.applied_date && (
                        <span className="text-slate-400 font-medium">Applied On: {new Date(job.applied_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                    {job.status === 'EXPLORING' ? (
                      <button
                        onClick={() => handleApplyJob(job.id)}
                        className="px-5 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-850 hover:scale-102 active:scale-98 shadow-md shadow-slate-900/10 cursor-pointer"
                      >
                        Transmit Application
                      </button>
                    ) : (
                      <button disabled className="px-5 py-3 bg-slate-50 border border-slate-200/60 text-slate-455 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-not-allowed">
                        In Review Cycle
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

        ) : (
          
          /* --- INTERVIEWS DIRECTORY TABLE --- */
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden text-left">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 text-[10px] font-black uppercase tracking-[0.18em] border-b border-slate-800">
                    <th className="py-5 px-6">Scheduled Assessment</th>
                    <th className="py-5 px-6">Assigned Interviewer</th>
                    <th className="py-5 px-6">Timeline Matrix</th>
                    <th className="py-5 px-6">Method Medium</th>
                    <th className="py-5 px-6 text-right">Confirmation Status</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-100">
                  {interviews.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-20 text-center bg-white italic font-bold text-slate-400 p-8">
                        <span className="text-3xl mb-2 block">🗓️</span>
                        <p className="text-[10px] uppercase tracking-widest">No active interview loops detected for candidate</p>
                      </td>
                    </tr>
                  ) : (
                    interviews.map(interview => (
                      <tr key={interview.id} className="bg-white transition-colors hover:bg-slate-50/50">
                        <td className="py-5 px-6">
                          <div className="font-black text-slate-800 text-sm tracking-tight mb-1">{interview.job_title}</div>
                          <div className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Assessment Session</div>
                        </td>
                        <td className="py-5 px-6 uppercase tracking-widest text-indigo-650 font-black text-[10px]">
                          {interview.interviewer_name || "Pending Assignment"}
                        </td>
                        <td className="py-5 px-6 font-bold text-slate-600 whitespace-nowrap">
                          <div>{new Date(interview.sheduled_date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
                          <div className="text-[10px] font-medium text-slate-400 mt-0.5">{new Date(interview.sheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td className="py-5 px-6 whitespace-nowrap">
                          {interview.meeting_link ? (
                            <a 
                              href={interview.meeting_link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-block px-3.5 py-1.5 bg-indigo-50 border border-indigo-150 text-indigo-650 font-bold rounded-lg uppercase text-[9px] tracking-wider hover:bg-indigo-100/70 transition-colors shadow-sm cursor-pointer"
                            >
                              🔗 Join Session
                            </a>
                          ) : (
                            <span className="inline-block px-3.5 py-1.5 bg-slate-100 border border-slate-200 text-slate-450 font-bold rounded-lg uppercase text-[9px] tracking-wider select-none">
                              🖥️ Link Pending
                            </span>
                          )}
                        </td>
                        <td className="py-5 px-6 text-right whitespace-nowrap">
                          {interview.status === 'SHEDULED' || interview.status === 'scheduled' ? (
                            <span className="text-[8px] font-black uppercase tracking-wider bg-emerald-50 border border-emerald-100 text-emerald-600 px-2.5 py-1 rounded-md">
                              ✓ Scheduled Secure
                            </span>
                          ) : (
                            <span className="text-[8px] font-black uppercase tracking-wider bg-amber-50 border border-amber-100 text-amber-600 px-2.5 py-1 rounded-md">
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