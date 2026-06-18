import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/instance';
import { toast } from 'react-hot-toast';
import { 
  FiSend, FiMessageSquare, FiLock, FiArrowLeft, FiInfo, FiActivity 
} from 'react-icons/fi';

const InterviewerChat = () => {
  const { sessionId } = useParams(); 
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [candidateName, setCandidateName] = useState("");
  
  const socket = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const initChat = async () => {
      try {
        setLoading(true);
        const interviewsRes = await api.get('interviews/assignedinterviews/');
        const interview = (interviewsRes.data || []).find(
          item => String(item.id) === String(sessionId)
        );

        if (!interview) {
          toast.error("Interview session details not found.");
          setLoading(false);
          return;
        }

        setCandidateName(interview.candidate_name || "Candidate");

        if (!interview.hr_id) {
          toast.error("HR coordinator not found for this interview.");
          setLoading(false);
          return;
        }

        const profileRes = await api.get('accounts/profile/');
        const currentUserId = profileRes.data.user_id;

        const roomRes = await api.post('chat/room/', {
          other_user_id: interview.hr_id,
        });
        const roomId = roomRes.data.room_id;

        const res = await api.get(`chat/history/${roomId}/`);

        const history = (res.data || []).map(m => ({
          text: m.text,
          sender: m.sender_username,
          is_me: m.sender_id === currentUserId,
          timestamp: m.timestamp
        }));

        setMessages(history);

        const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const wsUrl = `${wsProtocol}://${window.location.host}/ws/chat/${roomId}/`;

        socket.current = new WebSocket(wsUrl);

        socket.current.onmessage = (e) => {
          const data = JSON.parse(e.data);

          setMessages((prev) => [...prev, {
            text: data.message,
            sender: data.sender_username,
            is_me: data.sender_id === currentUserId,
            timestamp: data.timestamp
          }]);
        };
      } catch (error) {
        console.error("Failed to load chat history:", error);
        toast.error("Chat session failed to load.");
      } finally {
        setLoading(false);
      }
    };

    initChat();

    return () => socket.current?.close();
  }, [sessionId]);

  // Autoscroll message viewport
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim() && socket.current?.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify({ 'message': newMessage }));
      setNewMessage("");
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50/50">
      <div className="w-12 h-12 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin mb-4"></div>
      <div className="animate-pulse text-slate-400 font-black uppercase tracking-widest text-xs">Opening Chat Channel...</div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-40px)] bg-slate-50/30 font-sans antialiased text-slate-800 overflow-hidden">
      
      {/* SIDEBAR CONTEXT PANEL */}
      <aside className="w-80 bg-white border-r border-slate-200/60 p-8 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition-colors cursor-pointer border-0 bg-transparent"
            >
              <FiArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Internal Panel</h2>
          </div>

          <div className="space-y-4">
            <div className="p-5 bg-slate-50 border border-slate-150 rounded-2xl shadow-sm">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Evaluation Target</span>
              <p className="text-base font-extrabold text-slate-950 truncate">{candidateName}</p>
              <p className="text-[11px] font-extrabold text-indigo-600 uppercase tracking-wider mt-1.5">Room ID: #{sessionId}</p>
            </div>

            <div className="p-5 bg-indigo-50/40 border border-indigo-100 rounded-2xl flex gap-3 shadow-sm">
              <FiLock className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider block">Internal Channel</span>
                <p className="text-[10px] font-semibold text-indigo-700 leading-relaxed mt-1 uppercase tracking-wide">
                  This direct line to the recruiter is completely private and hidden from the candidate.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-2xl flex gap-2.5 shadow-sm">
          <FiInfo className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[9px] font-bold text-amber-800 leading-relaxed uppercase tracking-wider">
            Log your immediate evaluations, tech alignment observations, and follow-up round recommendations directly with the HR panel here.
          </p>
        </div>
      </aside>

      {/* CHAT VIEWPORT */}
      <main className="flex-1 flex flex-col bg-white min-w-0">
        
        {/* Active Header */}
        <header className="px-8 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm">
              <FiMessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Coordinators Board</h2>
              <p className="text-[9px] text-slate-450 uppercase tracking-widest font-semibold mt-0.5">Live syncing enabled</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full shadow-sm">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[9px] font-black text-emerald-700 uppercase tracking-wider flex items-center gap-1">
              <FiActivity className="w-3 h-3" />
              Active
            </span>
          </div>
        </header>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-slate-50/10">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
              <FiMessageSquare className="w-8 h-8 text-slate-300" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Send a message to initialize discussion.</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.is_me ? 'items-end' : 'items-start'} animate-in fade-in-50 slide-in-from-bottom-2 duration-300`}>
                
                {!msg.is_me && (
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-2.5">
                    {msg.sender}
                  </p>
                )}

                <div className={`relative max-w-lg px-5 py-3 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${
                  msg.is_me 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/60'
                }`}>
                  <p className="pr-10">{msg.text}</p>
                  
                  <span className={`absolute bottom-1 right-2.5 text-[8px] font-mono ${
                    msg.is_me ? 'text-indigo-200' : 'text-slate-400'
                  }`}>
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            ))
          )}
          <div ref={scrollRef} />
        </div>

        {/* Message Input Footer */}
        <footer className="p-6 border-t border-slate-100 bg-white shrink-0">
          <div className="flex gap-3 items-center bg-slate-100 border border-slate-200/30 rounded-2xl p-2 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50 focus-within:border-indigo-400 transition-all duration-300">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Post immediate evaluations or share feedback..."
              className="flex-1 bg-transparent border-0 px-4 text-xs font-semibold placeholder:text-slate-450 focus:ring-0 text-slate-800 outline-none"
            />
            <button 
              onClick={handleSend} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-600/15 flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <FiSend className="w-3.5 h-3.5" />
              <span>Post</span>
            </button>
          </div>
        </footer>
      </main>

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

export default InterviewerChat;
