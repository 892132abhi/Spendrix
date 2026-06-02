import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ➔ IMPORTED: For page redirection routing
import api from "../api/instance";

const CompanyDetail = () => {
  const navigate = useNavigate(); // ➔ INITIALIZED: Router hook handler
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Form Feedback Notification State
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
        setErrorMsg("Failed to read system registry profile  data.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  // Direct Staff Invite Handler (via native browser query input modal)
  const handleDirectInvite = async () => {
    setInviteMessage({ text: "", isError: false });
    
    const emailInput = window.prompt("Enter the email address  Interviewer to invite:");
    
    if (emailInput === null) return; // User clicked cancel
    const sanitizedEmail = emailInput.trim();
    if (!sanitizedEmail) return;

    try {
      setLoading(true);
      const response = await api.post("company/invite-staff/", {
        email: sanitizedEmail,
        role: "INTERVIEWER"
      });
      setInviteMessage({ text: response.data.detail || "Interviewer invitation successfully sended.", isError: false });
    } catch (error) {
      setInviteMessage({ text: error.response?.data?.detail || "Failed  interviewer invitation.", isError: true });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-500 tracking-wide">Syncing Corporate Registry Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4 space-y-8 animate-in fade-in duration-300">
      
      {/* ================= TOP PANEL CONTROLS ================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-[2rem] shadow-xl shadow-slate-900/10 border border-slate-700/30">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Workspace Command Center</h1>
        </div>

        {/* ➔ REDIRECTION BUTTON: Navigates straight to your dedicated creation page route path */}
        <button 
          onClick={() => navigate("/create-company")}
          className="px-6 py-3.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 flex items-center gap-2"
        >
          🏢 {company ? "Register New Entity" : "Create Workspace"}
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-500 flex items-center gap-2 shadow-sm">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* ================= MAIN METRICS INTERFACE PLATFORM ================= */}
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COMPONENT MATRIX: Active Registry Information */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl space-y-6">
          {company ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-2xl flex items-center justify-center font-black text-2xl uppercase shadow-md shadow-indigo-600/15">
                    {company.name?.charAt(0) || "C"}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">{company.name}</h2>
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mt-0.5 flex items-center gap-1">📍 {company.location || "No Location Specified"}</p>
                  </div>
                </div>
                <span className="self-start sm:self-center bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest px-3.5 py-2 rounded-full border border-emerald-100/80 shadow-sm shadow-emerald-100/20">
                  Active Connected Workspace ✓
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-5 text-sm">
                <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100/70">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Communication Core Email</span>
                    <p className="font-bold text-slate-700 mt-1 break-all">{company.email}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">System Phone Vector</span>
                    <p className="font-bold text-slate-700 mt-1">{company.phone || "—"}</p>
                  </div>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100/70 flex flex-col">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Operational Scope</span>
                  <p className="text-slate-500 font-semibold text-xs leading-relaxed flex-1 whitespace-pre-line">
                    {company.description || "No corporate business summary cataloged for this workspace profile entity yet."}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center text-2xl mx-auto border border-slate-100">⚠️</div>
              <div>
                <h3 className="text-md font-black text-slate-700 tracking-tight">No Connected Corporate Registry Node</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">Click the control button in the upper right corner to build out your active enterprise system metrics mapping.</p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT CORNER ACTION: Direct Invitation Corner Block */}
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl space-y-6">
          <div>
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Workspace Governance</h2>
            <h3 className="text-lg font-black text-slate-800 tracking-tight mt-0.5">Scale Evaluation Team</h3>
            <p className="text-xs font-medium text-slate-400 mt-1 leading-relaxed">Issue permissioned access invitations to authorize technical evaluators.</p>
          </div>

          <div className="space-y-3">
            <button 
              disabled={!company}
              onClick={handleDirectInvite}
              className="w-full px-5 py-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all border text-left flex items-center justify-between shadow-sm active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none bg-indigo-50/50 border-indigo-100/70 text-indigo-700 hover:bg-indigo-50"
            >
              <span className="flex items-center gap-2.5">📋 Invite Technical Interviewer</span>
              <span>➔</span>
            </button>
          </div>

          {/* Feedback UI Alerts */}
          {inviteMessage.text && (
            <div className={`text-xs font-bold p-4 rounded-xl border animate-in fade-in zoom-in-95 ${
              inviteMessage.isError ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
            }`}>
              {inviteMessage.isError ? '⚠️ ' : '✓ '} {inviteMessage.text}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default CompanyDetail;