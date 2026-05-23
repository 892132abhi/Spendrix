import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/instance';
import { toast } from 'react-hot-toast';

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
        console.log("found error :",err)
        toast.error("Failed to sync structural console schedule");
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case 'SCHEDULED': return 'bg-amber-100 text-amber-900 border-amber-400/40';
      case 'COMPLETED': return 'bg-stone-100 text-stone-500 border-stone-200';
      case 'CANCELLED': return 'bg-orange-100 text-orange-950 border-orange-300/40';
      default: return 'bg-yellow-100 text-yellow-900 border-yellow-300';
    }
  };

  return (
    <div className="min-h-[80vh] p-4 lg:p-8 bg-stone-50/30">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-stone-950 tracking-tighter italic uppercase">
           Assigned Interviews
          </h1>
          <p className="text-xs font-bold text-stone-400 uppercase tracking-[0.3em] mt-1">
            check the interviews -- @{user?.username}
          </p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-amber-100 shadow-sm flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.4)]"></span>
            <span className="text-[10px] font-black text-stone-700 uppercase tracking-widest">
                {interviews.length} interview Scheduled
            </span>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center italic text-amber-700 font-black uppercase tracking-widest animate-pulse">
          Retrieving securely encrypted enterprise calendar assets...
        </div>
      ) : interviews.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-amber-200 rounded-[2.5rem] p-20 text-center">
          <p className="text-stone-400 font-bold uppercase text-xs tracking-widest">No evaluation nodes found in current pipeline tracks.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {interviews.map((interview) => (
            <div 
              key={interview.id}
              className="bg-white group rounded-[2.5rem] p-8 border border-orange-100/60 shadow-sm hover:shadow-xl hover:border-amber-400 transition-all duration-500 relative overflow-hidden"
            >
              <div className={`absolute top-8 right-8 px-4 py-1.5 rounded-full border-2 text-[9px] font-black uppercase tracking-widest shadow-sm ${getStatusStyle(interview.status)}`}>
                {interview.status}
              </div>

              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-16 h-20 bg-stone-50 rounded-2xl flex flex-col items-center justify-center border border-stone-200 group-hover:border-amber-400 group-hover:bg-amber-50/50 transition-colors shadow-inner">
                  <span className="text-[10px] font-black text-stone-400 uppercase group-hover:text-amber-700">
                    {new Date(interview.sheduled_date).toLocaleString('default', { month: 'short' })}
                  </span>
                  <span className="text-2xl font-black text-stone-900 group-hover:text-orange-600 transition-colors">
                    {new Date(interview.sheduled_date).getDate()}
                  </span>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-black text-stone-900 tracking-tight mb-1 group-hover:text-amber-800 transition-colors">
                    {interview.job_title || "Technical System Architecture Matrix Assessment"}
                  </h3>
                  <div className="flex flex-wrap gap-y-2 gap-x-4 mt-2">
                    <div className="flex items-center gap-2">
                      <ClockIcon />
                      <span className="text-[11px] font-bold text-stone-500">{new Date(interview.sheduled_date).toLocaleTimeString([], {hour: '2-digit',minute: '2-digit'})}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PeopleIcon />
                      <span className="text-[11px] font-bold text-stone-500 text-amber-900/80">Panel: {interview.interviewer_name}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-between">
                
                <div className="flex gap-3">
                    <button 
                        onClick={() => navigate(`/chat/${interview.id}`)}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-stone-950 to-stone-800 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest hover:from-amber-500 hover:to-orange-500 hover:text-stone-950 transition-all shadow-md active:scale-95 flex items-center gap-2"
                    >
                        <ChatIcon />
                        Open  Chat Room
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ClockIcon = () => <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const PeopleIcon = () => <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const ChatIcon = () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;

export default CandidateInterviews;