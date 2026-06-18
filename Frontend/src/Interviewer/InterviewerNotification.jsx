import { useState, useEffect } from 'react';
import api from '../api/instance';
import { toast } from 'react-hot-toast';
import { 
  FiBell, FiCalendar, FiCheck, FiInfo, FiArrowLeft 
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const InterviewerNotificationPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // 1. Existing function to pull initial database records
  const fetchData = async () => {
    try {
      const res = await api.get('notifications/notificationslist/'); 
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
    const initialSync = setTimeout(fetchData, 0);

    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${wsProtocol}://${window.location.host}/ws/notifications/`;
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
            created_at: data.created_at || new Date().toISOString()
          },
          ...prev
        ]);
        
        setUnreadCount((prevCount) => prevCount + 1);
        
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
    } catch (err) {
      console.log("error found :", err);
      toast.error("Status update failed");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/50">
      <div className="w-12 h-12 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin mb-4"></div>
      <div className="animate-pulse text-slate-400 font-black uppercase tracking-widest text-xs">Retrieving Alerts Stream...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/30 to-slate-200/20 py-12 px-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* HEADER */}
        <header className="flex justify-between items-center bg-white/80 backdrop-blur-md border border-slate-200/60 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition-colors cursor-pointer border-0 bg-transparent"
            >
              <FiArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Alert Stream</h1>
              <p className="text-[9px] text-slate-450 font-black uppercase tracking-widest mt-0.5">Personal Session Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-indigo-650 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full uppercase tracking-wider shadow-sm">
              {unreadCount} Unread
            </span>
          </div>
        </header>

        {/* NOTIFICATION LIST */}
        <div className="space-y-4">
          {notifications && notifications.length > 0 ? (
            notifications.map((n) => (
              <div 
                key={n.id} 
                className={`relative group bg-white border border-slate-200/50 p-6 rounded-3xl transition-all duration-300 flex flex-col justify-between ${
                  n.is_read 
                    ? 'opacity-60 bg-slate-50/50 border-slate-200/30' 
                    : 'hover:shadow-md hover:border-slate-300 shadow-sm border-transparent'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex gap-4 items-start">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg shadow-sm shrink-0 border transition-colors ${
                      n.is_read 
                        ? 'bg-slate-100 border-slate-200 text-slate-400' 
                        : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                    }`}>
                      {n.title.toLowerCase().includes('interview') ? (
                        <FiCalendar className="w-5 h-5" />
                      ) : (
                        <FiBell className="w-5 h-5" />
                      )}
                    </div>
                    
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                          {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        {!n.is_read && <span className="w-1.5 h-1.5 bg-indigo-650 rounded-full"></span>}
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-sm">{n.title}</h3>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xl pr-4">{n.message}</p>
                    </div>
                  </div>

                  {!n.is_read && (
                    <button 
                      onClick={() => markAsRead(n.id)}
                      className="px-4.5 py-2.5 bg-slate-905 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-wider bg-slate-900 shadow-md hover:shadow-indigo-600/5 transition-all active:scale-95 cursor-pointer self-start md:self-center shrink-0 border-0"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
                
                {/* Timestamp Footer */}
                <p className="absolute bottom-4 right-6 text-[9px] font-bold text-slate-350 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Received at {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))
          ) : (
            <div className="py-24 text-center rounded-3xl border-2 border-dashed border-slate-200 bg-white/50 shadow-sm flex flex-col items-center justify-center gap-2">
              <FiInfo className="w-8 h-8 text-slate-300" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No alerts found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewerNotificationPage;
