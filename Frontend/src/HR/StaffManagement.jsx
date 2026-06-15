import { useState, useEffect } from 'react';
import api from '../api/instance';
import { toast } from 'react-hot-toast';
import { FiSearch, FiFilter, FiMail, FiFileText, FiShield, FiUserCheck, FiUserX, FiLock } from 'react-icons/fi';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL'); 

  // Fetch logic
  const fetchStaffData = async () => {
    setLoading(true);
    try {
      const response = await api.get('accounts/profilelist/', {
        params: { 
          search: searchTerm, 
          role_type: filterRole === 'ALL' ? '' : filterRole 
        }
      });
      
      const data = Array.isArray(response.data) ? response.data : [];
      // Only show HR and Interviewers
      const staffOnly = data.filter(u => u.role !== 'CANDIDATE');
      setStaff(staffOnly);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to sync personnel records");
    } finally {
      setLoading(false);
    }
  };

  // Re-run whenever filterRole changes
  useEffect(() => {
    fetchStaffData();
  }, [filterRole]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStaffData();
  };

  const handleBlockToggle = async (userId, currentStatus) => {
    const actionText = currentStatus ? 'BLOCK' : 'UNBLOCK';

    if (window.confirm(`Confirm: ${actionText} system access?`)) {
      try {
        const newStatus = !currentStatus;

        await api.patch(
          `accounts/staffstatus/${userId}/`,
          {
            is_active: newStatus
          }
        );

        toast.success(
          newStatus
            ? "User Activated Successfully"
            : "User Blocked Successfully"
        );

        fetchStaffData();
      } catch (err) {
        console.log("found error :", err);
        toast.error("Status update failed.");
      }
    }
  };

  const handleViewResume = (resumeUrl) => {
    if (resumeUrl) {
      window.open(resumeUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast.error("No resume file available.");
    }
  };

  const formatRole = (role) => {
    return role === 'HR' ? 'HR Administrator' : 'Technical Interviewer';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-6 pb-16 font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-200/60 shadow-sm mt-6">
        <div className="text-left">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FiShield className="text-indigo-600" />
            Personnel Access Control
          </h1>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-ping"></span>
            Workspace governance and authentication settings
          </p>
        </div>
        
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50 focus-within:border-indigo-400 transition-all shrink-0">
          <input 
            type="text" 
            placeholder="Search by name..."
            className="bg-transparent border-none text-xs font-semibold px-4 py-2 outline-none w-48 lg:w-64 text-slate-700 placeholder-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="bg-slate-900 hover:bg-indigo-700 text-white p-3 rounded-xl transition-all cursor-pointer">
            <FiSearch className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* FILTER BAR */}
      <div className="flex justify-between items-center px-1 mb-4">
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
          Active Team Members ({staff.length})
        </span>
        <div className="relative">
          <FiFilter className="absolute left-4 top-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
          <select 
            value={filterRole}
            className="pl-11 pr-10 py-3 bg-white border border-slate-200 text-xs font-bold text-slate-600 outline-none rounded-2xl appearance-none cursor-pointer shadow-sm hover:border-slate-300 transition-colors"
            onChange={(e) => setFilterRole(e.target.value)} 
          >
            <option value="ALL">All Staff</option>
            <option value="HR">HR Dept</option>
            <option value="INTERVIEWER">Interviewers</option>
          </select>
          <div className="absolute right-4.5 top-4.5 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-500 w-0 h-0"></div>
        </div>
      </div>

      {/* STAFF LIST */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-24 text-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing directory...</p>
          </div>
        ) : staff.map((member) => {
          const initials = member.username 
            ? member.username.charAt(0).toUpperCase()
            : 'S';

          return (
            <div 
              key={member.id}
              className={`group border p-5 rounded-3xl grid grid-cols-1 lg:grid-cols-12 items-center gap-4 transition-all duration-300 ${
                !member.is_active 
                ? 'bg-slate-50 border-slate-200/80 opacity-75' 
                : 'bg-white hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/5 border-slate-200/60'
              }`}
            >
              <div className="col-span-12 lg:col-span-5 flex items-center gap-4 text-left">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner shrink-0 ${member.is_active ? 'bg-indigo-50 text-indigo-700' : 'bg-rose-50 text-rose-700'}`}>
                  {initials}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    {member.username} 
                    {!member.is_active && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-rose-50 border border-rose-100 text-rose-600">
                        <FiLock className="w-2.5 h-2.5" />
                        Blocked
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium truncate flex items-center gap-1 mt-0.5">
                    <FiMail className="w-3 h-3 text-slate-400" />
                    {member.email}
                  </p>
                </div>
              </div>

              <div className="col-span-6 lg:col-span-3 text-left lg:text-center">
                <span className={`inline-flex px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  member.role === 'HR' 
                  ? 'bg-indigo-50/70 border-indigo-100/60 text-indigo-700' 
                  : 'bg-violet-50/70 border-violet-100/60 text-violet-700'
                }`}>
                  {formatRole(member.role)}
                </span>
              </div>

              <div className="col-span-6 lg:col-span-2 text-left lg:text-center">
                {member.resume ? (
                  <button 
                    onClick={() => handleViewResume(member.resume)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <FiFileText className="w-3.5 h-3.5" />
                    <span>View Resume</span>
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">No Resume</span>
                )}
              </div>

              <div className="col-span-12 lg:col-span-2 flex items-center justify-end">
                <button 
                  onClick={() => handleBlockToggle(member.user_id, member.is_active)}
                  className={`w-full lg:w-auto px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer ${
                    member.is_active 
                    ? 'bg-rose-50 border-rose-100/60 text-rose-600 hover:bg-rose-600 hover:text-white' 
                    : 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/10'
                  }`}
                >
                  {member.is_active ? (
                    <>
                      <FiUserX className="w-3.5 h-3.5" />
                      <span>Block</span>
                    </>
                  ) : (
                    <>
                      <FiUserCheck className="w-3.5 h-3.5" />
                      <span>Activate</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StaffManagement;