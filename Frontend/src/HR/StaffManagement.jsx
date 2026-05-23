import { useState, useEffect } from 'react';
import api from '../api/instance';
import { toast } from 'react-hot-toast';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL'); // <--- CHECK THIS NAME

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

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 animate-in fade-in duration-700">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 bg-white/30 backdrop-blur-md p-8 rounded-[3rem] border border-white/50 shadow-sm">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Team </h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Personnel & Security Control</p>
        </div>
        
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 bg-white p-2 rounded-3xl border border-slate-100 shadow-inner">
          <input 
            type="text" 
            placeholder="Search by name..."
            className="bg-transparent border-none text-xs font-bold px-4 py-2 outline-none w-48 lg:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="bg-slate-900 text-white p-3 rounded-2xl hover:bg-indigo-600 transition-colors">
            🔍
          </button>
        </form>
      </div>

      {/* FILTER BAR */}
      <div className="flex justify-end px-4 mb-4">
        <select 
          value={filterRole}
          className="bg-white border border-slate-200 text-[10px] font-black px-6 py-3 rounded-2xl outline-none uppercase cursor-pointer shadow-sm"
          onChange={(e) => setFilterRole(e.target.value)} // <--- VERIFIED SETTER
        >
          <option value="ALL">All Staff</option>
          <option value="HR">HR Dept</option>
          <option value="INTERVIEWER">Interviewers</option>
        </select>
      </div>

      {/* STAFF LIST */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-10 font-black text-slate-400 animate-pulse uppercase tracking-widest text-xs">Synchronizing...</div>
        ) : staff.map((member) => (
          <div 
            key={member.id}
            className={`group border p-5 rounded-[2.5rem] grid grid-cols-1 lg:grid-cols-12 items-center gap-4 transition-all duration-500 ${
              !member.is_active 
              ? 'bg-slate-50 border-slate-200' 
              : 'bg-white hover:bg-slate-900 border-slate-100 hover:shadow-2xl'
            }`}
          >
            <div className="col-span-4 flex items-center gap-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl ${member.is_active ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-100 text-rose-600'}`}>
                {member.username?.[0].toUpperCase()}
              </div>
              <div className="truncate">
                <h3 className="text-sm font-black text-slate-800 group-hover:text-black uppercase tracking-tight">
                  {member.username} {!member.is_active && <span className="text-[8px] bg-rose-500 text-white px-2 py-0.5 rounded ml-2">BLOCKED</span>}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 group-hover:text-slate-500 uppercase truncate">{member.email}</p>
              </div>
            </div>

            <div className="col-span-2 text-center">
              <span className="text-[15px] font-black px-4 py-1.5 rounded-full border border-slate-100 text-slate-500 group-hover:text-slate-600 uppercase">
                {member.role}
              </span>
            </div>

            <div className="col-span-3 text-center text-[15px]">
              <button 
                onClick={() => handleViewResume(member.resume)}
                className="text-[10px] font-black uppercase tracking-widest text-indigo-600 group-hover:text-indigo-700 hover:underline"
              >
                📄 Resume
              </button>
            </div>

            <div className="col-span-3 flex items-center justify-end gap-3">
        <button 
        onClick={() => handleBlockToggle(member.user_id, member.is_active)}
        className={`px-6 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${
            member.is_active 
            ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white' 
            : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}>
            {member.is_active ? 'Block' : 'Activate'}
            </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffManagement;