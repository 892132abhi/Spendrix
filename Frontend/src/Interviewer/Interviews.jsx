import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/instance';
import { toast } from 'react-hot-toast';
import { 
  FiMessageSquare, FiVideo, FiClock, FiMail, 
  FiBriefcase, FiUser, FiAlertCircle, FiArrowLeft
} from 'react-icons/fi';

const InterviewerSessions = () => {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);

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
    <div className="flex h-[calc(100vh-40px)] gap-6 p-6 bg-gradient-to-br from-slate-50 via-slate-100/30 to-slate-200/20 font-sans antialiased overflow-hidden selection:bg-indigo-100">
      
      {/* ================= LEFT SIDEBAR: INTERVIEWS LIST ================= */}
      <aside className="w-80 flex flex-col gap-4 flex-shrink-0">
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/60 shadow-sm shrink-0">
          <h2 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-1">Interviews</h2>
          <p className="text-lg font-black text-slate-800 tracking-tight">{schedule.length} Total Assigned</p>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {schedule.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 bg-white rounded-3xl p-6 text-center text-xs font-bold text-slate-400 italic shadow-sm">
              <FiAlertCircle className="w-6 h-6 mb-2 text-slate-300" />
              No assigned interviews found.
            </div>
          ) : (
            schedule.map((session) => (
              <button 
                key={session.id}
                onClick={() => setSelectedSession(session)}
                className={`w-full text-left p-5 rounded-3xl border-2 transition-all duration-300 flex flex-col gap-3.5 bg-white relative group ${
                  selectedSession?.id === session.id 
                    ? 'border-indigo-650 shadow-[0_8px_30px_rgb(99,102,241,0.06)] bg-indigo-50/10' 
                    : 'border-transparent hover:border-slate-350 hover:shadow-md hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wide flex items-center gap-1 shadow-sm ${
                    selectedSession?.id === session.id 
                      ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' 
                      : 'bg-slate-50 text-slate-500 border border-slate-200/50'
                  }`}>
                    <FiClock className="w-3 h-3" />
                    {session.scheduled_date ? new Date(session.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                  </span>
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide">#{session.id}</span>
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 truncate w-full group-hover:text-indigo-650 transition-colors">
                    {session.candidate}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-450 truncate uppercase mt-0.5 tracking-wider">
                    {session.role}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ================= RIGHT WORKSPACE: CANDIDATE INFO & ROUTING ================= */}
      <main className="flex-1 bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col min-w-0">
        {selectedSession ? (
          <div className="flex-1 p-10 flex flex-col justify-between max-w-xl">
            
            {/* Candidate Identity Information Block */}
            <div className="space-y-6">
              <div>
                <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3.5 py-1.5 rounded-lg uppercase tracking-wider">
                  Candidate Credentials
                </span>
                
                <div className="flex items-center gap-5 mt-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-700 flex items-center justify-center font-black text-2xl border border-indigo-200 shadow-sm">
                    {sessionInitial(selectedSession.candidate)}
                  </div>
                  <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
                      {selectedSession.candidate}
                    </h1>
                    {selectedSession.email && (
                      <p className="text-slate-500 text-xs font-semibold tracking-tight mt-1.5 flex items-center gap-1.5">
                        <FiMail className="w-3.5 h-3.5" />
                        {selectedSession.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex items-center gap-2.5 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center shrink-0">
                  <FiBriefcase className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block">Target Role Pipeline</span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{selectedSession.role}</p>
                </div>
              </div>

              {selectedSession.scheduled_date && (
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex items-center gap-2.5 shadow-sm">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center shrink-0">
                    <FiClock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block">Scheduled Time</span>
                    <p className="text-xs font-bold text-slate-850 mt-0.5">
                      {new Date(selectedSession.scheduled_date).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })} at{' '}
                      <span className="text-indigo-650 font-extrabold font-mono">{new Date(selectedSession.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Twin Communication Call-To-Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-slate-100 shrink-0">
              <button 
                onClick={handleOpenHRChat}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-905 hover:bg-slate-800 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-wider bg-slate-900 text-white shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <FiMessageSquare className="w-4 h-4" />
                Chat with HR
              </button>

              {selectedSession.url ? (
                <a 
                  href={selectedSession.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700 shadow-lg shadow-indigo-600/15 transition-all text-center active:scale-95 cursor-pointer"
                >
                  <FiVideo className="w-4 h-4" />
                  Join Meeting Call
                </a>
              ) : (
                <button 
                  disabled
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-100 text-slate-400 border border-slate-200/60 rounded-2xl text-xs font-black uppercase tracking-wider cursor-not-allowed"
                >
                  Meeting Link Pending
                </button>
              )}
            </div>

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2.5 p-8 bg-slate-50/15">
            <FiBriefcase className="w-10 h-10 text-slate-300" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select an interview session entry</p>
          </div>
        )}
      </main>

      {/* Scrollbar CSS */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.15);
          border-radius: 99px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.3);
        }
      `}</style>
    </div>
  );
};

const sessionInitial = (name) => {
  if (!name) return "?";
  return name.charAt(0).toUpperCase();
};

const LoadingSkeleton = () => (
  <div className="h-[calc(100vh-40px)] p-6 bg-gradient-to-br from-slate-50 to-slate-100/50 animate-pulse flex gap-6">
    <div className="w-80 h-full bg-white border border-slate-200/60 rounded-3xl shadow-sm"></div>
    <div className="flex-1 h-full bg-white border border-slate-200/60 rounded-3xl shadow-sm"></div>
  </div>
);

export default InterviewerSessions;