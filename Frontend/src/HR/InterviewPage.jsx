import  { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/instance';
import { toast } from 'react-hot-toast';

// --- HELPER COMPONENT FOR STAT BOXES ---
const StatBox = ({ label, value, color }) => (
  <div className="bg-white p-5 rounded-[1.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-2xl font-black ${color}`}>{value}</p>
  </div>
);

const InterviewsPage = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 1. TEMPORARY FILTER STORAGE (Memory only)
  const [tempStatus, setTempStatus] = useState('ALL');
  const [tempDate, setTempDate] = useState('');

  // 2. FETCH FUNCTION
  const fetchInterviews = useCallback(async (statusVal, dateVal) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusVal !== 'ALL') params.append('status', statusVal);
      if (dateVal) params.append('date', dateVal);

      const response = await api.get(`interviews/interviewlist/?${params.toString()}`);
      setInterviews(response.data);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Database synchronization failed");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchInterviews('ALL', '');
  }, [fetchInterviews]);

  // 3. ACTION HANDLERS
  const handleApplyFilters = () => {
    fetchInterviews(tempStatus, tempDate);
    toast.success("View Updated", {
        style: { borderRadius: '10px', background: '#0f172a', color: '#fff', fontSize: '10px', fontWeight: '900' }
    });
  };

  const handleReset = () => {
    setTempStatus('ALL');
    setTempDate('');
    fetchInterviews('ALL', '');
  };

  // --- UI HELPERS ---
  const getStatusStyle = (status) => {
    switch (status) {
      case 'SHEDULED': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'COMPLETED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'CANCELLED': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 p-8">
      
      {/* SINGLE ROW HEADER */}
      <header className="flex items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="shrink-0">
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter italic">SESSIONS</h1>
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.2em]">Live Coordination</p>
        </div>

        <div className="flex items-center gap-3">
          {/* DATE PICKER */}
          <input 
            type="date" 
            value={tempDate}
            onChange={(e) => setTempDate(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-[9px] font-black uppercase tracking-widest px-4 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
          />

          {/* STATUS TABS */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
            {['ALL', 'SHEDULED', 'COMPLETED', 'CANCELLED'].map((status) => (
              <button
                key={status}
                onClick={() => setTempStatus(status)}
                className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  tempStatus === status ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <button 
            onClick={handleApplyFilters}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black shadow-lg transition-all active:scale-95"
          >
            Apply
          </button>

          <div className="h-8 w-[1px] bg-slate-200 mx-1"></div>

          <button 
            onClick={() => navigate("/createinterview")}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatBox label="Count" value={loading ? "..." : interviews.length} color="text-indigo-600" />
        <StatBox label="Status View" value={tempStatus} color="text-slate-800" />
        <StatBox label="Date Context" value={tempDate || "All Time"} color="text-emerald-500" />
        <StatBox label="Database" value="Connected" color="text-slate-400" />
      </div>

      {/* Main Table Content */}
      <div className="bg-white/80 backdrop-blur-2xl border border-white rounded-[2.5rem] shadow-2xl shadow-slate-200/40 overflow-hidden flex flex-col min-h-[400px]">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center">
             <div className="w-8 h-8 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : interviews.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
            <p className="text-slate-400 font-bold italic text-sm">No records found matching these parameters.</p>
            <button onClick={handleReset} className="mt-4 text-[9px] font-black text-indigo-600 uppercase underline underline-offset-4">Reset Dashboard</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Candidate</th>
                  <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Schedule</th>
                  <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Interviewer</th>
                  <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Messaging</th>
                  <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {interviews.map((session) => (
                  <tr key={session.id} className="hover:bg-slate-50/40 transition-all group">
                    <td className="px-8 py-5">
                      <p className="text-sm font-black text-slate-800">{session.candidate_name || 'Anonymous'}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">REF: {session.id}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-600">{formatDate(session.sheduled_date)}</span>
                        <span className="text-[9px] font-black text-indigo-500 uppercase">{formatTime(session.sheduled_date)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-xl bg-indigo-50 flex items-center justify-center text-[9px] font-black text-indigo-400 border border-indigo-100">
                          {session.interviewer_name?.charAt(0)}
                        </div>
                        <span className="text-xs font-bold text-slate-700">{session.interviewer_name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-center gap-3">
                        {/* CANDIDATE CHAT */}
                        <div className="relative group/tooltip">
                          <button onClick={() => navigate(`/hr/chat/candidate/${session.id}`)} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          </button>
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 group-hover/tooltip:scale-100 transition-all bg-slate-900 text-white text-[7px] font-black px-2 py-1 rounded uppercase tracking-widest shadow-xl">Candidate</span>
                        </div>
                        {/* INTERVIEWER CHAT */}
                        <div className="relative group/tooltip">
                          <button onClick={() => navigate(`/hr/chat/interviewer/${session.id}`)} className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-500 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857" /></svg>
                          </button>
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 group-hover/tooltip:scale-100 transition-all bg-indigo-600 text-white text-[7px] font-black px-2 py-1 rounded uppercase tracking-widest shadow-xl">Interviewer</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className={`text-[8px] font-black uppercase px-3 py-1.5 rounded-full border shadow-sm ${getStatusStyle(session.status)}`}>
                        {session.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewsPage;