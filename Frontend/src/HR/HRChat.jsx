import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/instance';
import { toast } from 'react-hot-toast';
import { FiSend, FiArrowLeft, FiUser, FiPaperclip, FiSmile, FiActivity, FiMessageSquare } from 'react-icons/fi';

const ChatPageHR = () => {
  const { target, sessionId } = useParams(); 
  const navigate = useNavigate();
  const location = useLocation();
  
  // State Management
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatInfo, setChatInfo] = useState({ name: "Loading...", role: "HR Administrator" });
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState({
    candidate_name: "Candidate",
    interviewer_name: "Interviewer"
  });

  const socket = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const initChat = async () => {
      setLoading(true);
      try {
        let targetUserId = location.state?.targetUserId;
        let targetName = location.state?.targetName;

        if (!targetUserId) {
          const interviewsRes = await api.get('interviews/interviewlist/?');
          const interview = (interviewsRes.data || []).find(
            item => String(item.id) === String(sessionId)
          );

          targetUserId = target === 'candidate'
            ? interview?.candidate_id
            : interview?.interviewer_id;
          targetName = target === 'candidate'
            ? interview?.candidate_name
            : interview?.interviewer_name;
        }

        if (!targetUserId) {
          toast.error("Target user not found. Open chat from interviews page.");
          return;
        }

        const profileRes = await api.get('accounts/profile/');
        const currentUserId = profileRes.data.user_id;

        const roomRes = await api.post('chat/room/', {
          other_user_id: targetUserId,
        });
        const roomId = roomRes.data.room_id;

        const historyRes = await api.get(`chat/history/${roomId}/`);
        const history = (historyRes.data || []).map(m => ({
          text: m.text,
          sender: m.sender_username,
          timestamp: new Date(m.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          }),
          is_me: m.sender_id === currentUserId
        }));

        setMessages(history);
        setParticipants({
          candidate_name: target === 'candidate' ? targetName || 'Candidate' : 'Candidate',
          interviewer_name: target === 'interviewer' ? targetName || 'Interviewer' : 'Interviewer'
        });
        setChatInfo(
          target === "candidate"
            ? { name: targetName || "Candidate", role: "Candidate" }
            : { name: targetName || "Interviewer", role: "Interviewer" }
        );

        const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const wsUrl = `${wsProtocol}://${window.location.host}/ws/chat/${roomId}/`;
        
        socket.current = new WebSocket(wsUrl);

        socket.current.onmessage = (e) => {
          const data = JSON.parse(e.data);
          setMessages((prev) => [...prev, {
            text: data.message,
            sender: data.sender_username,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            is_me: data.sender_id === currentUserId
          }]);
        };
      } catch (err) {
        console.log("error found :", err);
        toast.error("Security handshake failed");
      } finally {
        setLoading(false);
      }
    };

    initChat();

    return () => {
      if (socket.current) socket.current.close();
    };
  }, [target, sessionId, location.state]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim() && socket.current?.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify({ 'message': newMessage }));
      setNewMessage("");
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-50 overflow-hidden font-sans border border-slate-200/50 rounded-3xl m-4 shadow-xl">
      
      {/* SIDE PANEL */}
      <aside className="w-80 bg-slate-900 flex flex-col z-20 shrink-0 border-r border-slate-800">
        <div className="p-6 border-b border-slate-800 bg-slate-950 text-white">
          <button 
            onClick={() => navigate('/interviews')}
            className="text-[10px] font-black text-indigo-400 hover:text-white uppercase tracking-widest flex items-center gap-2 mb-4 transition-all cursor-pointer"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            Close Chat Console
          </button>
          <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
            <FiMessageSquare className="text-indigo-400" />
            Hiring Console
          </h2>
          <div className="mt-2 flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-850">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Admin Privileges Active</span>
          </div>
        </div>

        <div className="flex-1 p-5 space-y-8 overflow-y-auto">
          {/* TARGET INFO CARD */}
          <section>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Active Participant</p>
            <div className="bg-slate-950 p-4.5 rounded-2xl border border-slate-850 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-black text-sm uppercase">
                {chatInfo.name?.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-black text-white">{chatInfo.name}</p>
                <p className="text-[9px] font-bold text-indigo-400 uppercase mt-0.5">{chatInfo.role}</p>
              </div>
            </div>
          </section>

          {/* CHANNELS SELECTORS */}
          <section className="space-y-3">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Communication Channels</p>
            
            <button 
              onClick={() => navigate(`/hr/chat/candidate/${sessionId}`)}
              className={`w-full text-left flex items-center gap-3 p-3.5 rounded-2xl transition-all border cursor-pointer ${
                target === 'candidate'
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                : 'bg-slate-950 border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs uppercase ${target === 'candidate' ? 'bg-indigo-550 text-white' : 'bg-slate-900 text-slate-300'}`}>
                C
              </div>
              <div>
                <span className="text-xs font-black block truncate max-w-[170px]">{participants.candidate_name}</span>
                <span className={`text-[8px] font-extrabold uppercase mt-0.5 block ${target === 'candidate' ? 'text-indigo-200' : 'text-slate-500'}`}>Candidate Channel</span>
              </div>
            </button>

            <button 
              onClick={() => navigate(`/hr/chat/interviewer/${sessionId}`)}
              className={`w-full text-left flex items-center gap-3 p-3.5 rounded-2xl transition-all border cursor-pointer ${
                target === 'interviewer' 
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                : 'bg-slate-950 border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs uppercase ${target === 'interviewer' ? 'bg-indigo-550 text-white' : 'bg-slate-900 text-slate-300'}`}>
                I
              </div>
              <div>
                <span className="text-xs font-black block truncate max-w-[170px]">{participants.interviewer_name}</span>
                <span className={`text-[8px] font-extrabold uppercase mt-0.5 block ${target === 'interviewer' ? 'text-indigo-200' : 'text-slate-500'}`}>Interviewer Channel</span>
              </div>
            </button>
          </section>
        </div>
      </aside>

      {/* CHAT MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative bg-slate-50/50">
        
        {/* UPPER BAR */}
        <div className="h-16 bg-white border-b border-slate-200/60 flex items-center px-8 justify-between shrink-0 shadow-sm shadow-slate-100/50">
           <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${target === 'interviewer' ? 'bg-amber-500 animate-pulse' : 'bg-indigo-500 animate-pulse'}`}></span>
              <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                {target === 'interviewer' ? 'Internal Evaluator Channel • Staff-Only' : 'Direct Dialogue Portal • External candidate'}
              </h3>
           </div>
        </div>

        {/* MESSAGES LIST */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {loading ? (
            <div className="flex h-full flex-col items-center justify-center">
              <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-[10px] font-black text-slate-450 uppercase tracking-widest animate-pulse">Establishing Secure Sync...</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.is_me ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}>
                <div className={`max-w-md p-4 rounded-3xl text-sm font-medium shadow-sm leading-relaxed ${
                  msg.is_me 
                  ? 'bg-gradient-to-br from-indigo-600 to-indigo-750 text-white rounded-tr-none' 
                  : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
                <div className="mt-1.5 flex items-center gap-1.5 px-2">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">{msg.is_me ? 'You (HR)' : msg.sender}</span>
                  <span className="text-[8px] text-slate-350">•</span>
                  <span className="text-[8px] font-bold text-slate-355">{msg.timestamp}</span>
                </div>
              </div>
            ))
          )}
          <div ref={scrollRef} />
        </div>

        {/* INPUT BOX FOOTER */}
        <footer className="p-6 bg-white border-t border-slate-200/60 shrink-0">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-2xl py-1 px-3 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50 focus-within:border-indigo-400 transition-all">
              <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <FiPaperclip className="w-4.5 h-4.5" />
              </button>
              
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={target === 'interviewer' ? "Type internal observations..." : "Send candidate instructions..."}
                className="flex-1 bg-transparent border-none py-3.5 px-3 text-sm font-medium focus:outline-none text-slate-800"
              />

              <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <FiSmile className="w-4.5 h-4.5" />
              </button>
            </div>

            <button 
              onClick={handleSend}
              className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-white cursor-pointer ${
                target === 'interviewer' 
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/15' 
                : 'bg-indigo-650 hover:bg-indigo-750 shadow-indigo-600/15'
              }`}
            >
              <FiSend className="w-4 h-4" />
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default ChatPageHR;
