import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/instance';
import { toast } from 'react-hot-toast';
import { FiCalendar, FiClock, FiUser, FiMessageSquare, FiInfo } from 'react-icons/fi';

const CandidateInterviews = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await api.get('interviews/candidateinterviews/');
        setInterviews(res.data);
      } catch (err) {
        console.log("found error :", err);
        toast.error("Failed to load interview calendar.");
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case 'SCHEDULED': 
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'COMPLETED': 
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CANCELLED': 
        return 'bg-rose-50 text-rose-600 border-rose-100';
      default: 
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="min-h-[80vh] p-2 lg:p-4 bg-transparent font-sans">
      
      {/* Header Block */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Scheduled Interviews
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Review and attend your upcoming evaluation loops, @{user?.username}
          </p>
        </div>
        
        <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2.5 self-start sm:self-auto">
          <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-ping shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span>
          <span className="text-xs font-bold text-slate-600 tracking-wide">
            {interviews.length} Scheduled Node{interviews.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-slate-400 font-semibold text-sm animate-pulse">
          Retrieving secure calendar slots...
        </div>
      ) : interviews.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-[2rem] p-16 text-center shadow-sm">
          <p className="text-slate-400 font-semibold text-sm">No interviews scheduled in your active track.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {interviews.map((interview) => {
            const dateObj = new Date(interview.sheduled_date);
            const formattedMonth = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
            const formattedDay = dateObj.getDate();
            const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            return (
              <div 
                key={interview.id}
                className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200/50 transition-all duration-300 relative overflow-hidden group"
              >
                <div className={`absolute top-6 right-6 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(interview.status)}`}>
                  {interview.status}
                </div>

                <div className="flex items-start gap-5">
                  {/* Calendar Widget Graphic */}
                  <div className="flex-shrink-0 w-16 h-18 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center justify-center group-hover:border-indigo-200 transition-colors shadow-inner">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                      {formattedMonth}
                    </span>
                    <span className="text-2xl font-extrabold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors mt-0.5">
                      {formattedDay}
                    </span>
                  </div>

                  {/* Info Column */}
                  <div className="flex-1 min-w-0 pr-16">
                    <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                      {interview.job_title || "Technical System Architecture Matrix Assessment"}
                    </h3>
                    
                    <div className="flex flex-col gap-2 mt-4 text-xs text-slate-500 font-semibold">
                      <div className="flex items-center gap-2">
                        <FiClock className="text-indigo-500" size={14} />
                        <span>{formattedTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiUser className="text-indigo-500" size={14} />
                        <span>Panelist: {interview.interviewer_name}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Area */}
                <div className="mt-6 pt-5 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                    <FiInfo size={13} className="text-slate-300" />
                    <span>Evaluation session link</span>
                  </div>

                  <button 
                    onClick={() => navigate(`/chat/${interview.id}`)}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white hover:text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-98 cursor-pointer flex items-center gap-2 border-none"
                  >
                    <FiMessageSquare size={13} />
                    <span>Enter Chat Room</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CandidateInterviews;