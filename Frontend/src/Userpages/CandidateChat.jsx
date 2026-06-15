import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/instance';
import { toast } from 'react-hot-toast';
import { FiSend, FiMessageSquare } from 'react-icons/fi';

const CandidateChat = () => {
  const { sessionId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  
  const socket = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const initChat = async () => {
      setLoading(true);
      try {
        const interviewsRes = await api.get('interviews/candidateinterviews/');
        const interview = (interviewsRes.data || []).find(
          item => String(item.id) === String(sessionId)
        );

        if (!interview?.hr_id) {
          toast.error("HR not found for this interview.");
          return;
        }

        const profileRes = await api.get('accounts/profiledata/');
        const currentUserId = profileRes.data.user_id;

        const roomRes = await api.post('chat/room/', {
          other_user_id: interview.hr_id,
        });
        const roomId = roomRes.data.room_id;

        const historyRes = await api.get(`chat/history/${roomId}/`);
        const history = (historyRes.data || []).map(m => ({
          text: m.text,
          sender: m.sender_username,
          is_me: m.sender_id === currentUserId
        }));
        setMessages(history);

        const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const wsUrl = `${wsProtocol}://localhost/ws/chat/${roomId}/`;
        socket.current = new WebSocket(wsUrl);

        socket.current.onmessage = (e) => {
          const data = JSON.parse(e.data);
          setMessages((prev) => [...prev, {
            text: data.message,
            sender: data.sender_username,
            is_me: data.sender_id === currentUserId
          }]);
        };
      } catch (err) {
        console.log("error found :", err);
        toast.error("Handshake failed.");
      } finally {
        setLoading(false);
      }
    };
    initChat();
    return () => socket.current?.close();
  }, [sessionId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim() && socket.current?.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify({ message: newMessage }));
      setNewMessage("");
    }
  };

  return (
    <div className="flex flex-col h-[85vh] bg-white max-w-2xl mx-auto shadow-sm border border-slate-100 rounded-3xl overflow-hidden font-sans">
      
      {/* Header Info */}
      <header className="p-6 border-b border-slate-100 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
            <FiMessageSquare size={20} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900">HireHub Concierge</h1>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mt-0.5">Direct HR Placement Channel</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">Live</span>
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
        </div>
      </header>

      {/* Messages Feed */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
        {loading ? (
          <div className="flex h-full items-center justify-center text-xs font-semibold text-slate-400">
            Establishing secure line...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-slate-400 space-y-2">
            <FiMessageSquare size={32} className="text-slate-300 animate-bounce" />
            <p className="text-xs font-semibold">No messages yet. Send a message to start conversation.</p>
          </div>
        ) : messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.is_me ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm font-medium shadow-sm border ${
              msg.is_me 
                ? 'bg-indigo-600 text-white border-indigo-700 rounded-tr-none font-medium' 
                : 'bg-white text-slate-800 border-slate-100 rounded-tl-none font-medium'
            }`}>
              {msg.text}
            </div>
            <span className="mt-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider px-2">
              {msg.is_me ? 'You' : msg.sender || 'HR Panel'}
            </span>
          </div>
        ))}
        <div ref={scrollRef} />
      </main>

      {/* Chat Footer Input */}
      <footer className="p-6 border-t border-slate-100 bg-white">
        <div className="relative flex items-center">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-5 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800 placeholder-slate-400"
            placeholder="Write your response here..."
          />
          <button 
            onClick={handleSend} 
            className="absolute right-3.5 p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md hover:shadow-indigo-600/10 transition-all active:scale-95 cursor-pointer border-none flex items-center justify-center"
          >
            <FiSend size={14} />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default CandidateChat;
