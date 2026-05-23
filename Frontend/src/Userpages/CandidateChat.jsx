import  { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/instance';
import { toast } from 'react-hot-toast';

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
        
        const res = await api.get(`chat/chatview/candidate/${sessionId}/`);
        const history = res.data.messages.map(m => ({
          text: m.message,
          sender: m.sender_username,
          is_me: m.sender_role === 'CANDIDATE' 
        }));
        setMessages(history);

        const wsUrl = `ws://localhost:8000/ws/chat/candidate/${sessionId}/`;
        socket.current = new WebSocket(wsUrl);

        socket.current.onmessage = (e) => {
          const data = JSON.parse(e.data);
          setMessages((prev) => [...prev, {
            text: data.message,
            sender: data.username,
            is_me: data.role === 'CANDIDATE' 
          }]);
        };
      } catch (err) {
        console.log("error found :",err)
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
      socket.current.send(JSON.stringify({ message: newMessage, role: 'CANDIDATE' }));
      setNewMessage("");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-stone-50/50 max-w-2xl mx-auto shadow-2xl border-x border-stone-200/60">
      <header className="p-8 border-b border-orange-100 bg-white flex items-center justify-between">
        <div>
          <h1 className="text-sm font-black text-stone-950 uppercase tracking-tighter italic">Spendrix Concierge</h1>
          <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mt-1">Direct HQ Placement Line</p>
        </div>
        <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-8 space-y-6 bg-gradient-to-b from-stone-50 to-amber-50/20">
        {loading ? (
          <div className="flex h-full items-center justify-center text-[10px] font-black uppercase tracking-widest text-stone-400">
            Establishing secure line...
          </div>
        ) : messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.is_me ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium shadow-sm border ${
              msg.is_me 
                ? 'bg-stone-900 text-amber-100 border-stone-950 rounded-br-none shadow-orange-950/5' 
                : 'bg-white text-stone-800 border-amber-100 rounded-bl-none shadow-stone-100'
            }`}>
              {msg.text}
            </div>
            <span className="mt-1 text-[8px] font-black text-stone-400 uppercase tracking-widest px-2">
              {msg.is_me ? 'You' : 'Executive Panel'}
            </span>
          </div>
        ))}
        <div ref={scrollRef} />
      </main>

      <footer className="p-8 border-t border-amber-100 bg-white">
        <div className="relative">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl py-4 px-6 text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium text-stone-800 placeholder-stone-400"
            placeholder="Formulate your response..."
          />
          <button onClick={handleSend} className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:from-amber-600 hover:to-orange-600 shadow-md transition-all active:scale-95">Send</button>
        </div>
      </footer>
    </div>
  );
};

export default CandidateChat;
