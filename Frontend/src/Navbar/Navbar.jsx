import { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import api from "../api/instance";
import { toast } from 'react-hot-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role?.toUpperCase();

  // --- NOTIFICATION LOGIC ---
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('notifications/notificationslist/');
      setUnreadCount(res.data.unread_count);
    } catch (err) {
      console.error("Notification sync failed", err);
    }
  };

  useEffect(() => {
    const initialSync = setTimeout(fetchUnreadCount, 0);
    const interval = setInterval(fetchUnreadCount, 30000);

    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const socket = new WebSocket(`${import.meta.env.VITE_WS_URL}/ws/notifications/`);
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'notification') {
        setUnreadCount((prev) => prev + 1);
      }
    };

    return () => {
      clearTimeout(initialSync);
      clearInterval(interval);
      socket.close();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('accounts/logout/');
    } finally {
      localStorage.clear();
      toast.success("Successfully logged out");
      navigate('/loginpage');
    }
  };

  const isActive = (path) =>
    location.pathname === path
      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-[1.02]"
      : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600";

  const getNotificationPath = () => {
    const paths = {
      HR: "/hr-notification",
      INTERVIEWER: "/interviewer-notification",
      ADMIN: "/notifications",
      CANDIDATE: "/notifications"
    };
    return paths[role] || "/notifications";
  };

  const menuConfig = {
    ADMIN: [
      { path: "/admin-dashboard", label: "Dashboard", icon: <DashboardIcon /> },
      { path: "/admin-usermanagement", label: "Management", icon: <ProfileIcon /> },
      { path: "/company-list", label: "Departments", icon: <FlowIcon /> },
      { path: "/hrjob-management", label: "Job management", icon: <JobsIcon /> },
    ],
    HR: [
      { path: "/hr-dashboard", label: "Dashboard", icon: <DashboardIcon /> },
      // --- UPDATED: Injected Corporate Workspace Profile Route Link ---
      { path: "/my-company", label: "Company Profile", icon: <FlowIcon /> },
      { path: "/hr-staff", label: "Staff", icon: <PeopleIcon /> },
      { path: "/hr-jobs", label: "Jobs", icon: <JobsIcon /> },
      { path: "/applicants", label: "Applicants", icon: <ApplicationsIcon /> },
      { path: "/interviews", label: "Interviews", icon: <CalendarIcon /> },
      { path: "/hr-profile", label: "My Profile", icon: <ProfileIcon /> },
      { path: "/hr-notification", label: "Notifications", icon: <NotifyIcon /> },
    ],
    INTERVIEWER: [
      { path: "/interviewer-dashboard", label: "Dashboard", icon: <DashboardIcon /> },
      { path: "/candidate-list", label: "Candidates", icon: <ProfileIcon /> },
      { path: "/interviewer-profile", label: "My Profile", icon: <ProfileIcon /> },
      { path: "/interviewer-notification", label: "Notifications", icon: <NotifyIcon /> },
    ],
    CANDIDATE: [
      { path: "/", label: "Dashboard", icon: <DashboardIcon /> },
      { path: "/profile", label: "My Profile", icon: <ProfileIcon /> },
      { path: "/resume", label: "My Resume", icon: <ResumeIcon /> },
      { path: "/ai-rag", label: "Chatbot", icon: <ResumeIcon /> },
      { path: "/joblist", label: "Job Listings", icon: <JobsIcon /> },
      { path: "/interviewslsit", label: "Interviews", icon: <CalendarIcon /> },
      { path: "/myjoblist", label: "My Applications", icon: <ApplicationsIcon /> },
    ]
  };

  const currentMenu = menuConfig[role] || [];

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex font-sans text-slate-900 selection:bg-indigo-100">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-72 hidden md:flex flex-col h-screen sticky top-0 p-4">
        <div className="bg-white/70 backdrop-blur-xl border border-white rounded-[2.5rem] flex flex-col h-full shadow-2xl shadow-slate-200/50 overflow-hidden">
          <div className="p-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-indigo-200 shadow-lg">
              <span className="text-white font-black text-xl italic">H</span>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-800 leading-tight">Spendrix Hiring platform</h1>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest leading-none">{role} Portal</p>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar pb-8">
            <p className="text-[10px] font-black text-slate-400 uppercase px-4 mb-4 mt-2 tracking-[0.2em]">Navigation</p>
            {currentMenu.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 group ${isActive(item.path)}`}
              >
                <span className="transition-transform group-hover:scale-110">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* --- MAIN SECTION --- */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 flex items-center justify-between px-8 bg-transparent">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Workspace</span>
            <span className="opacity-30">/</span>
            <span className="text-[10px] font-bold text-slate-800 uppercase tracking-[0.2em]">
              {location.pathname === '/' ? 'Dashboard' : location.pathname.substring(1).replaceAll('-', ' ')}
            </span>
          </div>

          
          <div className="flex items-center gap-3">
            
            
            <Link 
              to={getNotificationPath()} 
              className="relative p-2.5 bg-white/50 backdrop-blur-md rounded-2xl border border-white shadow-sm ring-1 ring-slate-200/50 hover:bg-white hover:ring-indigo-200 transition-all group"
            >
              <NotifyIcon />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white shadow-lg ring-2 ring-white animate-in zoom-in">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* User Profile & Logout Pill */}
            <div className="flex items-center gap-2 bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-white shadow-sm ring-1 ring-slate-200/50">
              <div className="flex items-center gap-3 px-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200/50">
                  {user?.username?.charAt(0) || 'U'}
                </div>
                <div className="hidden lg:block text-left mr-4">
                  <p className="text-xs font-black text-slate-800 leading-none mb-1">{user?.username || 'User'}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase leading-none tracking-wider">{role}</p>
                </div>
              </div>
              
              <div className="w-px h-6 bg-slate-200 mx-1"></div>
              
              <button
                onClick={handleLogout}
                className="group flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-95"
                title="Logout"
              >
                <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest">Logout</span>
                <LogoutIcon />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 pt-2 overflow-y-auto">
          <div className="max-w-6xl mx-auto text-left">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

// --- ICON COMPONENTS ---
const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);
const DashboardIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const ProfileIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const ResumeIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const JobsIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const ApplicationsIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002 2h2a2 2 0 002-2" /></svg>;
const NotifyIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" /></svg>;
const CalendarIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const SettingsIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35" /></svg>;
const FlowIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
const PeopleIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>

export default Navbar;
