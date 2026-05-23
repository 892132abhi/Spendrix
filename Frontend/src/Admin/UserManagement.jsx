import { useState, useEffect } from 'react';
import api from '../api/instance';
import { toast } from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleType, setRoleType] = useState('ALL');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get(`accounts/profilelist/`, {
        params: { search, role_type: roleType }
      });
      setUsers(response.data);
    } catch (err) {
      console.log("found error :",err)
      toast.error("Failed to retrieve user dossier.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  // Status update sending is_active as a URL param
  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
     await api.patch(`accounts/manage-users/${userId}/?is_active=${newStatus}`);
      
      toast.success(`Account ${newStatus ? 'Activated' : 'Deactivate'}`);
      fetchUsers();
    } catch (err) {
      console.log("found error :",err)
      toast.error("Status sync failed.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("CAUTION: Purge this identity?")) {
      try {
        await api.delete(`accounts/account-delete/${id}/`);
        toast.success("Identity purged.");
        fetchUsers();
      } catch (err) {
        console.log("found error :",err)
        toast.error("Purge failed.");
      }
    }
  };

  const SkeletonRow = () => (
    <tr className="animate-pulse border-b border-slate-50">
      <td className="p-8"><div className="flex items-center gap-5"><div className="w-12 h-12 rounded-2xl bg-slate-200"></div><div className="h-4 w-24 bg-slate-200 rounded"></div></div></td>
      <td className="p-8"><div className="h-4 w-40 bg-slate-100 rounded"></div></td>
      <td className="p-8"><div className="h-8 w-24 bg-slate-100 rounded-xl"></div></td>
      <td className="p-8 text-right"><div className="h-8 w-8 bg-slate-100 rounded-xl ml-auto"></div></td>
    </tr>
  );

  return (
    <div className="space-y-8 p-6 bg-slate-50 min-h-screen">
      <header className="flex flex-col lg:flex-row justify-between items-end lg:items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">User Management</h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Access Control Directory</p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-4 w-full lg:w-auto">
          <input 
            type="text" 
            placeholder="Search..." 
            className="px-6 py-4 rounded-2xl border-none shadow-inner bg-slate-50 text-sm font-bold focus:ring-2 focus:ring-indigo-500 w-full lg:w-64"
            onChange={(e) => setSearch(e.target.value)}
          />
          <select 
            value={roleType}
            className="px-6 py-4 rounded-2xl border-none shadow-inner bg-slate-50 text-xs font-black uppercase tracking-widest cursor-pointer"
            onChange={(e) => setRoleType(e.target.value)}
          >
            <option value="ALL">All Units</option>
            <option value="HR">HR Dept</option>
            <option value="INTERVIEWER">Interviewers</option>
            <option value="CANDIDATE">Candidates</option>
          </select>
          <button type="submit" className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg">
            Filter
          </button>
        </form>
      </header>

      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em]">
              <th className="p-8">Identity</th>
              <th className="p-8">Endpoint Email</th>
              <th className="p-8">System Access</th>
              <th className="p-8">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
            ) : users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/80 transition-all">
                <td className="p-8">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg">
                      {user.username?.[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 tracking-tight">{user.username}</p>
                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{user.role}</p>
                    </div>
                  </div>
                </td>
                <td className="p-8">
                  <p className="text-xs font-bold text-slate-500">{user.email}</p>
                </td>
                <td className="p-8">
                  <button 
                    onClick={() => handleStatusToggle(user.id, user.is_active)}
                    className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                      user.is_active 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : 'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}
                  >
                    {user.is_active ? 'Active' : 'Deactivate'}
                  </button>
                </td>
                <td className="p-8 text-right">
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-rose-600 transition-all"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;