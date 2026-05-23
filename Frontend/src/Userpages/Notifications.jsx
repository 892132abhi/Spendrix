import { useState, useEffect } from 'react';
import api from '../api/instance';
import { toast } from 'react-hot-toast';

const CandidateNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('notifications/notificationslist/');
      setNotifications(res.data.notifications || res.data);
      setUnreadCount(res.data.unread_count || 0);
    } catch {
      toast.error("Unable to query active structural signals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialSync = setTimeout(fetchNotifications, 0);

    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${wsProtocol}://localhost:8000/ws/notifications/`;
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'notification') {
        setNotifications((prev) => [
          {
            id: data.id,
            title: data.title,
            message: data.message,
            is_read: false,
            time_ago: "Just arrived", 
            created_at: data.created_at || new Date().toISOString()
          },
          ...prev
        ]);
        setUnreadCount((prevCount) => prevCount + 1);
        toast.success(`✨ Broadcast Signal: ${data.title}`);
      }
    };

    return () => {
      clearTimeout(initialSync);
      socket.close();
    };
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`notifications/notificationupdate/${id}/`);
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      toast.error("Status update sequence failed.");
    }
  };

  if (loading) return (
    <div className="py-20 text-center">
      <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Syncing live vector notifications...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-amber-100 pb-6">
        <div>
          <h1 className="text-4xl font-black text-stone-950 tracking-tighter uppercase italic">Ecosystem Broadcast Signals</h1>
          <p className="text-stone-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Real-time status loops from pipeline proxies</p>
        </div>
        {unreadCount > 0 && (
          <div className="px-6 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-2xl shadow-sm">
            <p className="text-[10px] font-black text-orange-700 uppercase tracking-widest">
              {unreadCount} Unread Transactional Node{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-4">
        {notifications && notifications.length > 0 ? notifications.map((n) => (
          <div 
            key={n.id} 
            className={`group relative bg-white border-2 rounded-[2.5rem] p-8 transition-all duration-500 
              ${n.is_read ? 'border-stone-100 opacity-50' : 'border-amber-100 shadow-xl hover:border-orange-400'}`}
          >
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="flex gap-6 items-start">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-inner border
                  ${n.title.toLowerCase().includes('interview') ? 'bg-amber-100 text-amber-9ab border-amber-300' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                  {n.title.toLowerCase().includes('interview') ? '👑' : '✨'}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">
                      {n.time_ago}
                    </span>
                    {!n.is_read && (
                      <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 text-[7px] font-black rounded-full uppercase tracking-widest">New Array Data</span>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-stone-900 uppercase tracking-tighter italic">{n.title}</h3>
                  <p className="text-sm text-stone-600 font-medium leading-relaxed max-w-xl">{n.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {!n.is_read && (
                  <button 
                    onClick={() => markAsRead(n.id)}
                    className="whitespace-nowrap px-6 py-3 bg-stone-950 border border-amber-500/20 text-amber-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-stone-950 transition-all shadow-md"
                  >
                    Clear Signal Node
                  </button>
                )}
              </div>
            </div>
          </div>
        )) : (
          <div className="py-32 text-center bg-white border-2 border-dashed border-amber-200 rounded-[3rem]">
            <div className="text-4xl mb-4 opacity-40">📭</div>
            <p className="text-xs font-black text-stone-300 uppercase tracking-[0.4em]">Signal vector register clear.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateNotifications;
