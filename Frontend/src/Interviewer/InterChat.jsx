import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/instance';
import { toast } from 'react-hot-toast';

const InterviewerChat = () => {
  const { sessionId } = useParams(); 
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const socket = useRef(null);
  const scrollRef = useRef(null);

useEffect(() => {
  const initChat = async () => {
    try {
      const interviewsRes = await api.get('interviews/assignedinterviews/');
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

      const res = await api.get(`chat/history/${roomId}/`);

      const history = (res.data || []).map(m => ({
        text: m.text,
        sender: m.sender_username,
        is_me: m.sender_id === currentUserId,
        timestamp: m.timestamp
      }));

      setMessages(history);

      const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const wsUrl = `${wsProtocol}://localhost:8000/ws/chat/${roomId}/`;

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
      toast.error("Chat failed to load.");
    }
  };

  initChat();

  return () => socket.current?.close();
}, [sessionId]);

  const handleSend = () => {
    if (newMessage.trim() && socket.current?.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify({ 'message': newMessage }));
      setNewMessage("");
    }
  };

  // Helper function to format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans antialiased text-slate-800">
      
      {/* SIDEBAR (Enhanced) */}
      <aside className="w-80 bg-white border-r border-slate-200 p-10 flex flex-col">
        <div className="flex items-center gap-3 mb-12">
          {/* Subtle Logo integration */}
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white">
            H
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">HireHub</h2>
        </div>

        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">PANEL ROOM</h3>
        
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner mb-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Evaluation For</p>
          <p className="text-lg font-black text-slate-950 tracking-tight">Candidate Session</p>
          <p className="text-xl font-bold text-indigo-600">#{sessionId}</p>
        </div>

        <div className="mt-auto space-y-4 text-xs font-medium text-slate-500 leading-relaxed p-5 bg-amber-50/50 rounded-2xl border border-amber-100/50">
          <p>
            This is a <strong className="text-slate-700">direct support</strong> internal channel.
          </p>
          <p>
            Messages sent here are <strong className="text-slate-700">not visible</strong> to the candidate.
          </p>
        </div>
      </aside>

      {/* CHAT AREA (Enhanced Layout) */}
      <main className="flex-1 flex flex-col bg-white">
        
        {/* Header/Info bar */}
        <header className="px-10 py-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase italic">Live Discussion</h2>
            <div className="flex items-center gap-3 text-slate-500">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-emerald-200 shadow-lg"></span>
                <span className="text-xs font-bold uppercase tracking-widest">Active Session</span>
            </div>
        </header>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.is_me ? 'items-end' : 'items-start'}`}>
              
              {/* Sender name label */}
              {!msg.is_me && (
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">
                  {msg.sender}
                </p>
              )}

              <div className={`relative max-w-lg px-6 py-4 rounded-[2rem] text-sm leading-relaxed shadow-sm ${
                msg.is_me 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-amber-50 text-slate-900 rounded-tl-none border border-amber-100'
              }`}>
                {msg.text}

                {/* Timestamp */}
                <span className={`absolute bottom-1 right-3 text-[9px] ${
                  msg.is_me ? 'text-indigo-200' : 'text-slate-400'
                }`}>
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        {/* Improved Footer/Input */}
        <footer className="p-8 border-t border-slate-100 bg-white">
          <div className="flex gap-4 p-2 bg-slate-950 rounded-full shadow-2xl shadow-slate-300">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Share your internal feedback with the panel..."
              className="flex-1 bg-transparent border-none text-white px-6 text-sm placeholder:text-slate-600 focus:ring-0"
            />
            <button 
                onClick={handleSend} 
                className="bg-indigo-600 text-white px-10 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-400/20 active:scale-95"
            >
              Post Feedback
            </button>
          </div>
        </footer>
      </main>

      {/* Basic custom scrollbar styling */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.2);
        }
      `}</style>
    </div>
  );
};

export default InterviewerChat;
