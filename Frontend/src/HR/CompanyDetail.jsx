import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/instance";
import { FiBriefcase, FiMapPin, FiMail, FiPhone, FiUserPlus, FiActivity, FiX, FiCheck, FiInfo } from "react-icons/fi";

const CompanyDetail = () => {
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Invite Modal & Message State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState({ text: "", isError: false });

  // Fetch the active profile directly
  const fetchCompanyProfile = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const response = await api.get("company/my-company/");
      if (response.status === 200 && response.data) {
        setCompany(response.data);
      }
    } catch (error) {
      console.error("Failed fetching company metrics", error);
      if (error.response?.status !== 404) {
        setErrorMsg("Failed to read system registry profile data.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  // Custom Invite Submit Handler
  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setInviteMessage({ text: "", isError: false });
    
    const sanitizedEmail = inviteEmail.trim();
    if (!sanitizedEmail) return;

    try {
      setInviteLoading(true);
      const response = await api.post("company/invite-staff/", {
        email: sanitizedEmail,
        role: "INTERVIEWER"
      });
      setInviteMessage({ text: response.data.detail || "Interviewer invitation successfully sent.", isError: false });
      setInviteEmail("");
      setIsInviteModalOpen(false);
    } catch (error) {
      setInviteMessage({ text: error.response?.data?.detail || "Failed interviewer invitation.", isError: true });
    } finally {
      setInviteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing Corporate Registry Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 px-6 space-y-8 animate-in fade-in duration-500 font-sans pb-16">
      
      {/* ================= TOP PANEL CONTROLS ================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-8 rounded-3xl shadow-xl border border-slate-800/80 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="z-10">
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <FiActivity className="text-indigo-400" />
            Workspace Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">Configure corporate properties, access control, and recruitment environments.</p>
        </div>

        <button 
          onClick={() => navigate("/create-company")}
          className="z-10 px-6 py-3.5 text-xs font-black uppercase tracking-wider rounded-2xl transition-all active:scale-95 shadow-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25 flex items-center gap-2 cursor-pointer"
        >
          <FiBriefcase className="w-4 h-4" />
          <span>{company ? "Register New Entity" : "Create Workspace"}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-600 flex items-center gap-2 shadow-sm animate-in slide-in-from-top-2">
          <FiX className="w-4 h-4 text-rose-500 animate-bounce" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ================= MAIN METRICS INTERFACE PLATFORM ================= */}
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COMPONENT MATRIX: Active Registry Information */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm space-y-8">
          {company ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl uppercase shadow-md shadow-indigo-500/10">
                    {company.name?.charAt(0) || "C"}
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{company.name}</h2>
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mt-1 flex items-center gap-1.5">
                      <FiMapPin className="w-3.5 h-3.5" />
                      {company.location || "No Location Specified"}
                    </p>
                  </div>
                </div>
                <span className="self-start sm:self-center bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-4 py-2 border border-emerald-150 rounded-full shadow-sm">
                  Connected Workspace ✓
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-4 bg-slate-50/75 p-6 rounded-2xl border border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <FiMail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Communication Core</span>
                      <p className="font-bold text-slate-700 mt-1 break-all">{company.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 pt-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <FiPhone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">System Contact</span>
                      <p className="font-bold text-slate-700 mt-1">{company.phone || "—"}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50/75 p-6 rounded-2xl border border-slate-100 flex flex-col">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <FiInfo className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider pt-1.5 block">Operational Scope</span>
                  </div>
                  <p className="text-slate-500 font-semibold text-xs leading-relaxed flex-1 whitespace-pre-line">
                    {company.description || "No corporate business summary cataloged for this workspace profile entity yet."}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center text-2xl mx-auto border border-slate-150">
                <FiBriefcase className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <h3 className="text-md font-black text-slate-800 tracking-tight">No Connected Corporate Registry</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1.5 leading-relaxed">Click the control button in the upper right corner to build out your active enterprise system metrics mapping.</p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT CORNER ACTION: Direct Invitation Corner Block */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm space-y-6">
          <div>
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Workspace Governance</h2>
            <h3 className="text-lg font-black text-slate-800 tracking-tight mt-0.5">Scale Evaluation Team</h3>
            <p className="text-xs font-medium text-slate-400 mt-1 leading-relaxed">Issue permissioned access invitations to authorize technical evaluators and interviewers.</p>
          </div>

          <div className="space-y-3">
            <button 
              disabled={!company}
              onClick={() => {
                setInviteMessage({ text: "", isError: false });
                setIsInviteModalOpen(true);
              }}
              className="w-full px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border text-left flex items-center justify-between shadow-sm active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none bg-indigo-50/50 border-indigo-100 text-indigo-700 hover:bg-indigo-50 cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <FiUserPlus className="w-4 h-4" />
                Invite Technical Interviewer
              </span>
              <span>➔</span>
            </button>
          </div>

          {/* Feedback UI Alerts */}
          {inviteMessage.text && (
            <div className={`text-xs font-bold p-4 rounded-xl border flex items-start gap-2.5 animate-in fade-in zoom-in-95 ${
              inviteMessage.isError ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
            }`}>
              {inviteMessage.isError ? <FiX className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" /> : <FiCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
              <span>{inviteMessage.text}</span>
            </div>
          )}
        </div>
      </div>

      {/* ================= STAFF INVITATION DIALOG MODAL ================= */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsInviteModalOpen(false)}></div>
          
          {/* Modal Content */}
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 relative z-10 animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition-colors p-1.5 hover:bg-slate-100 rounded-xl"
            >
              <FiX className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <FiUserPlus className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Invite Staff Member</h3>
              <p className="text-xs text-slate-400 mt-1">Send an invitation email to add an interviewer to your active company portal.</p>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="interviewer@company.com" 
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none font-medium"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsInviteModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={inviteLoading}
                  className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 shadow-md shadow-indigo-100"
                >
                  {inviteLoading ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CompanyDetail;