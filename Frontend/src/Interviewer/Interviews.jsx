import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/instance';
import { toast } from 'react-hot-toast';

const InterviewerSessions = () => {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get current user info to find the correct chat room
  const user = JSON.parse(localStorage.getItem('user'));

  // --- FETCH ASSIGNED INTERVIEWS ---
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const res = await api.get('interviews/assignedinterviews/');
        const mappedData = (res.data || []).map(item => ({
          id: item.id,
          candidate: item.candidate_name,
          email: item.candidate_email,
          role: item.job_title,
          url: item.meeting_link,
          scheduled_date: item.scheduled_date || item.sheduled_date
        }));
        setSchedule(mappedData);
        if (mappedData.length > 0) setSelectedSession(mappedData[0]);
      } catch (err) {
        console.error("Fetch schedule context error:", err);
        toast.error("Failed to sync interview parameters");
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  // --- NAVIGATE TO RECRUITER DESK CHAT ---
  const handleOpenHRChat = () => {
    if (!selectedSession) return;
    
    if (user?.id) {
      navigate(`/interviewer/chat/${selectedSession.id}`);
    } else {
      toast.error("Interviewer credentials token not found");
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="flex h-[calc(100vh-40px)] gap-6 p-6 bg-[#f8fafc] font-sans antialiased overflow-hidden selection:bg-indigo-100">
      
      {/* ================= LEFT SIDEBAR: INTERVIEWS LIST ================= */}
      <aside className="w-80 flex flex-col gap-4 flex-shrink-0">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <h2 className="text-sm font-black text-slate-900 tracking-wider uppercase mb-1">Interviews</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{schedule.length} Total Assigned</p>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
          {schedule.length === 0 ? (
            <div className="h-48 flex items-center justify-center border-2 border-dashed border-slate-200 bg-white rounded-3xl p-6 text-center text-xs font-bold text-slate-400 italic">
              No assigned interviews found.
            </div>
          ) : (
            schedule.map((session) => (
              <button 
                key={session.id}
                onClick={() => setSelectedSession(session)}
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex flex-col gap-2 bg-white ${
                  selectedSession?.id === session.id 
                  ? 'border-indigo-600 shadow-md ring-4 ring-indigo-50' 
                  : 'border-slate-100 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${selectedSession?.id === session.id ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                     {session.scheduled_date ? new Date(session.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">#{session.id}</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 truncate w-full group-hover:text-indigo-600 transition-colors">
                    {session.candidate}
                  </h4>
                  <p className="text-[11px] font-medium text-slate-400 truncate uppercase mt-0.5 tracking-tight">
                    {session.role}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ================= RIGHT WORKSPACE: CANDIDATE INFO & ROUTING ONLY ================= */}
      <main className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-w-0">
        {selectedSession ? (
          <div className="flex-1 p-10 flex flex-col justify-between max-w-xl">
            
            {/* Candidate Identity Information Block */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md uppercase tracking-wider">
                  Candidate Credentials
                </span>
                <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tight mt-4">
                  {selectedSession.candidate}
                </h1>
                {selectedSession.email && (
                  <p className="text-slate-500 text-sm font-semibold tracking-tight mt-1">
                    {selectedSession.email}
                  </p>
                )}
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pt-2">
                Target Role Pipeline: <span className="text-slate-700 font-black normal-case tracking-normal">{selectedSession.role}</span>
              </p>
            </div>

            {/* Twin Communication Call-To-Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-slate-100">
              <button 
                onClick={handleOpenHRChat}
                className="flex-1 flex items-center justify-center gap-2.5 px-6 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Chat with HR
              </button>

              {selectedSession.url ? (
                <a 
                  href={selectedSession.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2.5 px-6 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black shadow-lg transition-all text-center active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Join Meeting Call
                </a>
              ) : (
                <button 
                  disabled
                  className="flex-1 flex items-center justify-center gap-2.5 px-6 py-4 bg-slate-100 text-slate-400 rounded-2xl text-xs font-black uppercase tracking-widest cursor-not-allowed border border-slate-200"
                >
                  Meeting Link Pending
                </button>
              )}
            </div>

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 font-black text-2xl uppercase opacity-20 gap-2">
            <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            Select Interview Entry
          </div>
        )}
      </main>

    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="h-screen p-6 bg-slate-50 animate-pulse flex gap-6">
    <div className="w-80 h-full bg-white rounded-3xl"></div>
    <div className="flex-1 h-full bg-white rounded-3xl"></div>
  </div>
);

export default InterviewerSessions;