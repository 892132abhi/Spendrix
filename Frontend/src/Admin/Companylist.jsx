import { useState, useEffect } from 'react';
import api from '../api/instance';
import { toast } from 'react-hot-toast';
import { 
  FiTrash2, 
  FiSlash, 
  FiCheck, 
  FiMapPin, 
  FiMail, 
  FiPhone, 
  FiSearch, 
  FiBriefcase, 
  FiAlertCircle 
} from 'react-icons/fi';

const CompanyDirectory = () => {
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // ── FETCH DATA FROM COMPANY LIST APIVIEW ──
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await api.get('companies/');
      // Adapt safely to arrays or paginated schemas if present
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setCompanies(data);
    } catch (err) {
      console.error("Company Fetch Error:", err);
      toast.error("Failed to sync company directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // ── TOGGLE ACCESS Privileges (PATCH) ──
  const handleToggleApproval = async (id) => {
    try {
      const res = await api.patch(`companies/${id}/`);
      toast.success(res.data.message);
      
      // Update local client array instantly
      setCompanies(prev => prev.map(c => 
        c.id === id ? { ...c, is_approved: res.data.is_approved } : c
      ));
    } catch (err) {
      console.error("Toggle Status Error:", err);
      toast.error("Could not modify company activation state.");
    }
  };

  // ── PERMANENTLY REMOVE COMPANY (DELETE) ──
  const handleDeleteCompany = async (id, name) => {
    if (!window.confirm(`Are you absolutely sure you want to delete ${name}? This action cannot be undone.`)) return;

    try {
      const res = await api.delete(`companies/${id}/`);
      toast.success(res.data.message || `${name} removed cleanly.`);
      
      // Filter out deleted row item
      setCompanies(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error("Failed to purge company record profile.");
    }
  };

  // Filter list matching active input searches
  const filteredCompanies = companies.filter(c => 
    (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.location || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-40px)] flex flex-col space-y-6 p-6 bg-gradient-to-br from-slate-50 via-slate-100/30 to-slate-200/20 font-sans antialiased overflow-hidden">
      
      {/* Search Header Banner */}
      <header className="bg-white/80 backdrop-blur-md border border-slate-200/60 p-6 rounded-3xl shadow-sm space-y-4 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Enterprise Clients Dashboard
            </h1>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-0.5">
              Revoke corporate infrastructure privileges or clear obsolete organizational layers.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search company name, place, email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80 pl-11 pr-4 py-2.5 bg-slate-100 border border-slate-200/50 rounded-2xl text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
              />
              <FiSearch className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Table Stream Block */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-12 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-slate-50 border border-slate-100 rounded-2xl anonymity-pulse animate-pulse" />
              ))}
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <FiAlertCircle className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No matching enterprise entities found.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/60 text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/70 sticky top-0 z-10 backdrop-blur-sm">
                  <th className="p-4.5 pl-6">Company Profile Identity</th>
                  <th className="p-4.5">Communication Handles</th>
                  <th className="p-4.5">Geographical Base</th>
                  <th className="p-4.5">System Authorization</th>
                  <th className="p-4.5 pr-6 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-slate-50/50 transition-colors group">
                    
                    {/* Identity Info */}
                    <td className="p-4.5 pl-6 font-extrabold text-slate-900 max-w-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex-shrink-0 flex items-center justify-center font-extrabold text-slate-600 shadow-inner uppercase">
                          {company.name.charAt(0)}
                        </div>
                        <div className="truncate">
                          <span className="block truncate">{company.name}</span>
                          {company.description && (
                            <span className="block text-[10px] text-slate-400 font-semibold truncate mt-0.5">
                              {company.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contact Elements */}
                    <td className="p-4.5 space-y-1 font-semibold text-slate-500">
                      {company.email && (
                        <span className="flex items-center gap-1.5 truncate max-w-xs">
                          <FiMail className="text-slate-400 shrink-0" /> {company.email}
                        </span>
                      )}
                      {company.phone && (
                        <span className="flex items-center gap-1.5 text-slate-450">
                          <FiPhone className="text-slate-400 shrink-0" /> {company.phone}
                        </span>
                      )}
                    </td>

                    {/* Location Base */}
                    <td className="p-4.5 font-bold text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <FiMapPin className="text-slate-400 shrink-0" /> {company.location || "Remote Base"}
                      </span>
                    </td>

                    {/* Badge Authorization Flag */}
                    <td className="p-4.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        company.is_approved 
                          ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200/60' 
                          : 'bg-rose-50/80 text-rose-700 border-rose-200/60'
                      }`}>
                        {company.is_approved ? 'Active Access' : 'Access Restricted'}
                      </span>
                    </td>

                    {/* Control Buttons Group */}
                    <td className="p-4.5 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        
                        {/* Toggle Approval State Button */}
                        <button
                          onClick={() => handleToggleApproval(company.id)}
                          className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1.5 shadow-sm ${
                            company.is_approved
                              ? 'bg-amber-50/80 border-amber-200/50 text-amber-700 hover:bg-amber-100'
                              : 'bg-emerald-50/80 border-emerald-200/50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {company.is_approved ? (
                            <>
                              <FiSlash className="w-3 h-3 text-amber-600" />
                              Disable
                            </>
                          ) : (
                            <>
                              <FiCheck className="w-3 h-3 text-emerald-600" />
                              Approve
                            </>
                          )}
                        </button>

                        {/* Permanent Account Purge Button */}
                        <button
                          onClick={() => handleDeleteCompany(company.id, company.name)}
                          className="px-3 py-1.5 bg-rose-50/80 border border-rose-200/50 text-rose-700 rounded-xl hover:bg-rose-100 transition-all active:scale-95 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider shadow-sm"
                        >
                          <FiTrash2 className="w-3 h-3 text-rose-600" />
                          Purge
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Styled Scroller Engine Injector Context */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.15);
          border-radius: 99px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.3);
        }
      `}</style>
    </div>
  );
};

export default CompanyDirectory;