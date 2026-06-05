import  { useState, useEffect, useRef} from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/instance';
import { toast } from 'react-hot-toast';

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

        const profileRes = await api.get('accounts/profiledata/');
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
        const wsUrl = `${wsProtocol}://localhost/ws/chat/${roomId}/`;
        
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
        console.log("error found :",err)
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
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-2xl z-20">
        <div className="p-8 border-b border-slate-100 bg-slate-900 text-white">
          <button 
            onClick={() => navigate('/interviews')}
            className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-4 hover:text-white transition-all"
          >
            ← Close Console
          </button>
          <h2 className="text-xl font-black tracking-tighter italic uppercase">
            Hiring Console
          </h2>
          <div className="mt-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Admin Privileges Active</span>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-8">
          <section>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Participant</p>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <p className="text-sm font-black text-slate-900">{chatInfo.name}</p>
              <p className="text-[10px] font-bold text-indigo-600 uppercase mt-0.5">{chatInfo.role}</p>
            </div>
          </section>

          <section className="space-y-3">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Communication Channels</p>
            
            <button 
              onClick={() => navigate(`/hr/chat/candidate/${sessionId}`)}
              className={`w-full flex flex-col p-4 rounded-2xl transition-all border ${
                target=== 'candidate'
                ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                : 'bg-white border-slate-100 hover:border-slate-300 opacity-60'
              }`}
            >
              <span className={`text-[10px] font-black uppercase ${target ==='candidate' ? 'text-indigo-600' : 'text-slate-400'}`}>{participants.candidate_name}</span>
            </button>

            <button 
              onClick={() => navigate(`/hr/chat/interviewer/${sessionId}`)}
              className={`w-full flex flex-col p-4 rounded-2xl transition-all border ${
                target === 'interviewer' 
                ? 'bg-slate-900 border-slate-800 shadow-lg text-white' 
                : 'bg-white border-slate-100 hover:border-slate-300 opacity-60'
              }`}
            >
              <span className={`text-[10px] font-black uppercase ${target ==='interviewer' ? 'text-white' : 'text-slate-400'}`}>{participants.interviewer_name}</span>
            </button>
          </section>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative bg-[#f8fafc]">
        <div className="h-16 bg-white border-b border-slate-200 flex items-center px-10 justify-between">
           <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${target ==='interviewer'? 'bg-amber-500' : 'bg-indigo-500'}`}></div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-700">
                {target ==='interviewer' ? 'Internal Staff Only' : 'Direct Candidate Messaging'}
              </h3>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 space-y-8">
          {loading ? (
            <div className="flex h-full items-center justify-center italic text-slate-400 text-xs font-black uppercase tracking-[0.3em]">Establishing Link...</div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.is_me ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-md p-5 rounded-3xl text-sm font-medium shadow-sm ${
                  msg.is_me 
                  ? 'bg-slate-900 text-white rounded-br-none' 
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
                <div className="mt-2 flex items-center gap-2 px-2">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{msg.is_me ? 'You (HR)' : msg.sender}</span>
                  <span className="text-[8px] text-slate-300">•</span>
                  <span className="text-[8px] font-medium text-slate-300">{msg.timestamp}</span>
                </div>
              </div>
            ))
          )}
          <div ref={scrollRef} />
        </div>

        <footer className="p-10 bg-white border-t border-slate-200">
          <div className="max-w-5xl mx-auto flex items-center gap-4">
            <div className="flex-1 relative">
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={target === 'interviewer' ? "Type internal observation..." : "Send candidate instructions..."}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition-all"
              />
            </div>
            <button 
              onClick={handleSend}
              className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 ${
                target === 'interviewer' ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              Send
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default ChatPageHR;
