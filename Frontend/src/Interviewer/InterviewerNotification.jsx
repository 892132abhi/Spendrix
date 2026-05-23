import { useState, useEffect } from 'react';
import api from '../api/instance';
import { toast } from 'react-hot-toast';

const InterviewerNotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // 1. Existing function to pull initial database records
  const fetchData = async () => {
    try {
      const res = await api.get('notifications/notificationslist/'); 
      
      // Assumes your Django view returns an object with these exact keys.
      // If your view returns a direct array, adjust to res.data accordingly.
      setNotifications(res.data.notifications || res.data);
      setUnreadCount(res.data.unread_count || 0);
    } catch (err) {
      console.log("found error :", err);
      toast.error("Failed to sync alerts");
    } finally {
      setLoading(false);
    }
  };

  // 2. Modified useEffect handling both initial load AND live WebSocket events
  useEffect(() => {
    // Run initial history sync
    const initialSync = setTimeout(fetchData, 0);

    // Establish WebSocket pipe to your Django routing path
    // Replace with your exact protocol routing link configuration
    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${wsProtocol}://localhost:8000/ws/notifications/`;
    const socket = new WebSocket(wsUrl);

    // Triggered instantly when backend consumer executes self.send()
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'notification') {
        // Prepend new incoming item instantly onto the UI view array stream
        setNotifications((prev) => [
          {
            id: data.id,
            title: data.title,
            message: data.message,
            is_read: false,
            created_at: data.created_at || new Date().toISOString()
          },
          ...prev
        ]);
        
        // Increment the unread total count counter badge
        setUnreadCount((prevCount) => prevCount + 1);
        
        // Fire an on-screen visual toast chime pop-up
        toast(`📢 ${data.title}: ${data.message}`, {
          duration: 4000,
          position: 'top-right',
        });
      }
    };

    socket.onclose = (e) => {
      console.log("Notification socket stream closed down dynamically. Reasons: ", e.reason);
    };

    socket.onerror = (err) => {
      console.error("Socket pipeline threw connection error metrics: ", err);
    };

    // CLEANUP: Drop WebSocket pipe cleanly if user navigates away from the page
    return () => {
      clearTimeout(initialSync);
      socket.close();
    };
  }, []); // Empty dependency matrix ensures connection opens exactly once on mount

  const markAsRead = async (id) => {
    try {
      await api.patch(`notifications/notificationupdate/${id}/`); 
      
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.log("error found :", err);
      toast.error("Status update failed");
    }
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-300">SYNCHRONIZING...</div>;

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <header className="flex justify-between items-end border-b border-slate-100 pb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Alert Stream</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Personal Session Intelligence</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full uppercase">
            {unreadCount} Unread
          </span>
        </div>
      </header>

      {/* NOTIFICATION LIST */}
      <div className="space-y-6">
        {notifications && notifications.length > 0 ? notifications.map((n) => (
          <div 
            key={n.id} 
            className={`relative group bg-white border border-slate-100 p-8 rounded-[3rem] transition-all duration-500 hover:shadow-2xl hover:border-slate-900 ${n.is_read ? 'opacity-40 grayscale-[0.8]' : ''}`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex gap-6 items-start">
                <div className="w-14 h-14 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-xl shadow-inner group-hover:bg-indigo-50 transition-colors">
                  {n.title.toLowerCase().includes('interview') ? '🕒' : '📢'}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                       {new Date(n.created_at).toLocaleDateString()}
                    </span>
                    {!n.is_read && <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>}
                  </div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">{n.title}</h3>
                  <p className="text-sm text-slate-500 font-medium max-w-xl leading-relaxed">{n.message}</p>
                </div>
              </div>

              {!n.is_read && (
                <button 
                  onClick={() => markAsRead(n.id)}
                  className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
                >
                  Mark Read
                </button>
              )}
            </div>
            
            {/* Timestamp Footer */}
            <p className="absolute bottom-6 right-10 text-[8px] font-black text-slate-300 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
               Received at {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        )) : (
          <div className="py-32 text-center rounded-[4rem] border-4 border-dashed border-slate-50">
            <p className="text-sm font-black text-slate-200 uppercase tracking-[0.5em]">No alerts found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewerNotificationPage;
