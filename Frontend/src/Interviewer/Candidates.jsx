import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/instance';
import { toast } from 'react-hot-toast';
import { 
  FiSearch, FiSliders, FiCalendar, FiClock, FiCheckCircle, 
  FiXCircle, FiMessageSquare, FiDownload, FiUser, FiPhone, 
  FiMapPin, FiBriefcase, FiCheck, FiChevronRight, FiAlertCircle,
  FiEdit3
} from 'react-icons/fi';

const getMediaUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${window.location.origin}${url}`;
};

const getCandidateAssessment = (candidate) => ({
  strength: candidate?.strength || "",
  weakness: candidate?.weakness || "",
  decision_note: candidate?.decision_note || ""
});

const InterviewerCandidates = () => {
  const navigate = useNavigate();
  
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [selectedRound, setSelectedRound] = useState("ALL");
  const [sortBy, setSortBy] = useState("date-asc");
  const [activeDetailTab, setActiveDetailTab] = useState("profile"); 
  const [assessment, setAssessment] = useState({
    strength: "",
    weakness: "",
    decision_note: ""
  });

  // --- RESCHEDULE INTERVIEW MODAL STATES ---
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  // --- PAGINATION STATES ---
  const [page, setPage] = useState(1);
  const [paginationData, setPaginationData] = useState({
    next: null,
    previous: null,
    totalCount: 0
  });

  const user = JSON.parse(localStorage.getItem('user'));

  const handleFilterChange = (setter, value) => {
    setPage(1);
    setter(value);
  };

  const fetchDossiers = async () => {
    try {
      setLoading(true);
      const res = await api.get('interviews/assignedcandidatelist/', {
        params: {
          search: searchTerm,
          status: activeTab,
          role: selectedRole,
          round: selectedRound,
          sort: sortBy,
          page: page,
        }
      });
      
      const dataPayload = res.data;
      const resultsArray = dataPayload.results !== undefined ? dataPayload.results : dataPayload;
      const data = Array.isArray(resultsArray) ? resultsArray : [];
      
      const mappedData = data.map(item => ({
        ...item,
        recruiter_name: item.recruiter_name || item.created_by_name || "HR System Coordinator"
      }));
      
      setCandidates(mappedData);

      setPaginationData({
        next: dataPayload.next || null,
        previous: dataPayload.previous || null,
        totalCount: dataPayload.count || mappedData.length
      });

      if (mappedData.length > 0) {
        const stillExists = mappedData.find(c => c.id === selectedCandidate?.id);
        const nextSelection = stillExists || mappedData[0];
        setSelectedCandidate(nextSelection);
        setAssessment(getCandidateAssessment(nextSelection));
      } else {
        setSelectedCandidate(null);
        setAssessment(getCandidateAssessment(null));
      }
    } catch (err) {
      console.error("Dossier Fetch Error:", err);
      toast.error("Failed to sync candidate directory");
      setCandidates([]);
      setSelectedCandidate(null);
      setAssessment(getCandidateAssessment(null));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDossiers();
  }, [searchTerm, activeTab, selectedRole, selectedRound, sortBy, page]);

  const filteredCandidates = candidates.filter(c => {
    const skillsText = Array.isArray(c.skills) ? c.skills.join(',') : c.skills || "";
    const matchesSearch = (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.role || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                          skillsText.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === "ALL" || activeTab === "ASSIGNED" ? true : c.status?.toUpperCase() === activeTab;
    const matchesRole = selectedRole === "ALL" ? true : c.role === selectedRole;
    const matchesRound = true;

    return matchesSearch && matchesTab && matchesRole && matchesRound;
  }).sort((a, b) => {
    if (sortBy === "date-asc") return new Date(a.sheduled_date) - new Date(b.sheduled_date);
    if (sortBy === "date-desc") return new Date(b.sheduled_date) - new Date(a.sheduled_date);
    if (sortBy === "exp-desc") return b.experience_years - a.experience_years;
    if (sortBy === "match-desc") return (b.match_percentage || 0) - (a.match_percentage || 0);
    return 0;
  });

  const handleAssessmentChange = (field, value) => {
    setAssessment(prev => ({ ...prev, [field]: value }));
  };

const handleSelectCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setAssessment(getCandidateAssessment(candidate));
    setIsRescheduling(false);
    setShowMobileDetail(true);
};


  const initRescheduleFields = () => {
    if (!selectedCandidate?.sheduled_date) return;
    try {
      const dt = new Date(selectedCandidate.sheduled_date);
      const tzOffset = dt.getTimezoneOffset() * 60000;
      const localISO = new Date(dt.getTime() - tzOffset).toISOString();
      
      setEditDate(localISO.split('T')[0]);
      setEditTime(localISO.split('T')[1].slice(0, 5));
      setIsRescheduling(true);
    } catch (e) {
      setEditDate("");
      setEditTime("");
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!editDate || !editTime) return;

    setRescheduleLoading(true);
    try {
      const combinedISOString = `${editDate}T${editTime}:00`;
      
      const response = await api.patch(`interviews/candidate/${selectedCandidate.id}/reschedule/`, {
        sheduled_date: combinedISOString
      });

      if (response.status === 200) {
        toast.success("Interview Schedule Updated");
        setIsRescheduling(false);
        
        setCandidates(prev => prev.map(c => 
          c.id === selectedCandidate.id ? { ...c, sheduled_date: combinedISOString, status: 'SHEDULED' } : c
        ));
        setSelectedCandidate(prev => ({ ...prev, sheduled_date: combinedISOString, status: 'SHEDULED' }));
      }
    } catch (err) {
      console.error("Reschedule Request Crash:", err);
      const serverErr = err.response?.data?.error || "Failed to update interview date.";
      toast.error(serverErr);
    } finally {
      setRescheduleLoading(false);
    }
  };

  const handleSaveAssessment = async () => {
    if (!selectedCandidate) return;

    try {
      await api.patch(`interviews/candidate/${selectedCandidate.id}/assessment/`, assessment);
      setCandidates(prev => prev.map(candidate => (
        candidate.id === selectedCandidate.id ? { ...candidate, ...assessment } : candidate
      )));
      setSelectedCandidate(prev => ({ ...prev, ...assessment }));
      toast.success("Evaluation Dossier Saved");
    } catch (err) {
      console.error("Assessment Save Error:", err);
      toast.error("Failed to save assessment");
    }
  };

  const handleDecision = async (decision) => {
    if (!selectedCandidate) return;

    try {
      const nextStatus = decision === "SHORT_LISTED" ? "SHORT_LISTED" : "CANCELLED";
      await api.patch(`interviews/candidate/${selectedCandidate.id}/decision/`, { decision });
      setCandidates(prev => prev.map(candidate => (
        candidate.id === selectedCandidate.id ? { ...candidate, status: nextStatus } : candidate
      )));
      setSelectedCandidate(prev => ({ ...prev, status: nextStatus }));
      toast.success(decision === "SHORT_LISTED" ? "Shortlisted for next round" : "Candidate set to rejected status");
    } catch (err) {
      console.error("Decision Update Error:", err);
      toast.error("Failed to update candidate decision");
    }
  };

  const handleOpenHRChat = () => {
    if (!selectedCandidate) return;
    if (user?.id) {
      navigate(`/interviewer/chat/${selectedCandidate.id}`);
    } else {
      toast.error("Interviewer credentials token not found");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-amber-50/75 text-amber-700 border-amber-200/50',
      SCHEDULED: 'bg-blue-50/75 text-blue-700 border-blue-200/50',
      COMPLETED: 'bg-purple-50/75 text-purple-700 border-purple-200/50',
      SHORTLISTED: 'bg-emerald-50/75 text-emerald-700 border-emerald-200/50',
      SHORT_LISTED: 'bg-emerald-50/75 text-emerald-700 border-emerald-200/50',
      REJECTED: 'bg-rose-50/75 text-rose-700 border-rose-200/50',
      SELECTED: 'bg-teal-50/75 text-teal-700 border-teal-200/50',
      SHEDULED: 'bg-blue-50/75 text-blue-700 border-blue-200/50',
      CANCELLED: 'bg-rose-50/75 text-rose-700 border-rose-200/50',
    };
    return styles[status?.toUpperCase()] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <div className="h-[calc(100vh-40px)] flex flex-col space-y-6 p-6 bg-gradient-to-br from-slate-50 via-slate-100/30 to-slate-200/20 font-sans antialiased overflow-hidden">
      
      {/* Header Container */}
      <header className="bg-white/80 backdrop-blur-md border border-slate-200/60 p-6 rounded-3xl shadow-sm space-y-4 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Candidates Directory
            </h1>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-0.5">Manage assigned talent pipelines and submit structured reviews.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search name, role, skills..." 
                value={searchTerm}
                onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
                className="w-80 pl-11 pr-4 py-2.5 bg-slate-100 border border-slate-200/50 rounded-2xl text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
              />
              <FiSearch className="w-4 h-4 text-slate-450 absolute left-4 top-3.5" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="flex bg-slate-100/80 p-1 rounded-2xl border border-slate-200/30">
            {["ALL", "SHEDULED", "COMPLETED", "CANCELLED"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleFilterChange(setActiveTab, tab)}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 ${
                  activeTab === tab 
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab === 'SHEDULED' ? 'SCHEDULED' : tab}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200/80 rounded-xl shadow-sm">
              <FiSliders className="w-3.5 h-3.5 text-slate-450" />
              <select 
                value={selectedRole} 
                onChange={(e) => handleFilterChange(setSelectedRole, e.target.value)}
                className="bg-transparent border-0 text-xs font-bold text-slate-700 outline-none cursor-pointer pr-4"
              >
                <option value="ALL">All Roles</option>
                <option value="Senior Frontend Engineer">Senior Frontend Engineer</option>
                <option value="Fullstack Developer">Fullstack Developer</option>
                <option value="DevOps Specialist">DevOps Specialist</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200/80 rounded-xl shadow-sm">
              <FiClock className="w-3.5 h-3.5 text-slate-450" />
              <select 
                value={selectedRound} 
                onChange={(e) => handleFilterChange(setSelectedRound, e.target.value)}
                className="bg-transparent border-0 text-xs font-bold text-slate-700 outline-none cursor-pointer pr-4"
              >
                <option value="ALL">All Rounds</option>
                <option value="Technical Round 1">Technical Round 1</option>
                <option value="System Design">System Design</option>
                <option value="Culture Fit">Culture Fit</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200/80 rounded-xl shadow-sm">
              <select 
                value={sortBy} 
                onChange={(e) => handleFilterChange(setSortBy, e.target.value)}
                className="bg-transparent border-0 text-xs font-bold text-slate-700 outline-none cursor-pointer pr-4"
              >
                <option value="date-asc">Date: Earliest</option>
                <option value="date-desc">Date: Latest</option>
                <option value="exp-desc">Experience: High to Low</option>
                <option value="match-desc">Highest Skill Match</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        
        {/* Left Side: Cards Stream Container */}
        <div className="w-full lg:w-[420px] h-full flex flex-col gap-4">
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 custom-scrollbar">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-white border border-slate-100 rounded-3xl animate-pulse shadow-sm" />
                ))}
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center bg-white border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center shadow-sm">
                <FiAlertCircle className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No candidate matching query.</p>
              </div>
            ) : (
              filteredCandidates.map((c) => (
                <div 
                  key={c.id}
                  onClick={() => handleSelectCandidate(c)}
                  className={`p-5 rounded-3xl border-2 transition-all duration-300 cursor-pointer bg-white relative group flex flex-col justify-between ${
                    selectedCandidate?.id === c.id 
                      ? 'border-indigo-650 shadow-[0_8px_30px_rgb(99,102,241,0.08)] bg-indigo-50/10' 
                      : 'border-transparent hover:border-slate-300 hover:shadow-md shadow-sm'
                  }`}
                >
                  {c.match_percentage && (
                    <span className="absolute top-4 right-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-[9px] px-2.5 py-1 rounded-lg shadow-sm tracking-wide">
                      {c.match_percentage}% MATCH
                    </span>
                  )}

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex-shrink-0 overflow-hidden flex items-center justify-center font-extrabold text-slate-700 shadow-inner">
                      {c.profile_pic ? <img src={getMediaUrl(c.profile_pic)} className="w-full h-full object-cover animate-in fade-in-50" alt={c.name || "Candidate"}/> : (c.name || "C").charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-slate-900 text-sm truncate group-hover:text-indigo-600 transition-colors">{c.name || "Unnamed Candidate"}</h3>
                      <p className="text-slate-500 text-xs font-semibold truncate mt-0.5">{c.role || "N/A"} • {c.experience_years || 0}Y Exp</p>
                      
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {(Array.isArray(c.skills) ? c.skills : c.skills?.split(',') || []).slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-lg text-[9px] font-bold text-slate-655 uppercase tracking-wide">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100/60 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <FiCalendar className="w-3.5 h-3.5 text-slate-400" />
                          {c.sheduled_date ? new Date(c.sheduled_date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : "N/A"}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${getStatusBadge(c.status)}`}>
                          {c.status === 'SHEDULED' ? 'SCHEDULED' : c.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* --- INTERACTIVE PAGINATION CONTROLLER --- */}
          {paginationData.totalCount > 0 && (
            <div className="bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded-3xl p-3 flex justify-between items-center shadow-sm shrink-0">
              <button
                disabled={!paginationData.previous || loading}
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                className="px-4 py-2 text-[10px] font-black uppercase tracking-wider border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
              >
                ← Prev
              </button>
              
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest">
                Page <strong className="text-slate-800 font-extrabold">{page}</strong>
              </span>

              <button
                disabled={!paginationData.next || loading}
                onClick={() => setPage(prev => prev + 1)}
                className="px-4 py-2 text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white rounded-2xl hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 transition-all shadow-sm active:scale-95"
              >
                Next →
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Detail View Container */}
        <div className="hidden lg:flex flex-1 bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col min-w-0">
          {selectedCandidate ? (
            <div className="flex flex-col h-full min-h-0">
              
              {/* Header profile info */}
              <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
<button 
    onClick={() => setShowMobileDetail(false)}
    className="lg:hidden mb-2 text-xs text-slate-400 hover:text-white font-bold uppercase tracking-wider"
>
    ← Back to list
</button>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-2xl flex-shrink-0 overflow-hidden flex items-center justify-center font-extrabold text-2xl shadow-inner">
                    {selectedCandidate.profile_pic ? <img src={getMediaUrl(selectedCandidate.profile_pic)} className="w-full h-full object-cover animate-in fade-in-50" alt={selectedCandidate.name || "Candidate"}/> : (selectedCandidate.name || "C").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold tracking-tight">{selectedCandidate.name || "Unnamed Candidate"}</h2>
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-0.5">
                      {selectedCandidate.role || "N/A"} • <span className="text-indigo-400 font-extrabold">{selectedCandidate.status === 'SHEDULED' ? 'SCHEDULED' : selectedCandidate.status}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleOpenHRChat}
                    className="flex items-center gap-2 px-4.5 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm active:scale-95"
                  >
                    <FiMessageSquare className="w-4 h-4 text-indigo-400" />
                    Chat with HR
                  </button>
                </div>
              </div>

              {/* ── INTERACTIVE BANNER: CONTROL SWITCH LAYER ── */}
              <div className="mx-6 mt-4 p-4.5 bg-slate-50 border border-slate-200/50 rounded-2xl shadow-sm shrink-0">
                {!isRescheduling ? (
                  /* Read-Only Mode view structure */
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-[fadeIn_0.15s_ease]">
                    <div className="grid grid-cols-3 gap-6 flex-1 items-center text-left">
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Session Context</span>
                        <span className="text-xs font-black text-slate-700 mt-0.5 block">
                          {selectedCandidate.sheduled_date ? new Date(selectedCandidate.sheduled_date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) : "N/A"}
                        </span>
                      </div>
                      <div className="text-center border-x border-slate-200 px-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Assigned HR</span>
                        <span className="text-xs font-black text-slate-700 mt-0.5 block truncate">
                          {selectedCandidate.recruiter_name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Scheduled Time</span>
                        <span className="text-xs font-mono font-black text-indigo-600 block mt-0.5">
                          {selectedCandidate.sheduled_date ? new Date(selectedCandidate.sheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}
                        </span>
                      </div>
                    </div>
                    
                    {/* Clear, explicit modification click handler toggle */}
                    {selectedCandidate.status === 'SHEDULED' && (
                      <button
                        onClick={initRescheduleFields}
                        className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-[10px] font-black uppercase tracking-wider text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-indigo-600 active:scale-95 shrink-0"
                      >
                        <FiEdit3 className="w-3.5 h-3.5" />
                        Reschedule
                      </button>
                    )}
                  </div>
                ) : (
                  /* Active Editing Layout Interface Form Wrapper */
                  <form onSubmit={handleRescheduleSubmit} className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-[fadeIn_0.15s_ease]">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">New Session Date</label>
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="w-full bg-white border border-slate-250 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">New Start Time</label>
                        <input
                          type="time"
                          value={editTime}
                          onChange={(e) => setEditTime(e.target.value)}
                          className="w-full bg-white border border-slate-250 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-700 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        disabled={rescheduleLoading}
                        onClick={() => setIsRescheduling(false)}
                        className="px-3 py-2 border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-40"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={rescheduleLoading || !editDate || !editTime}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md active:scale-95 disabled:bg-slate-200 disabled:text-slate-400"
                      >
                        {rescheduleLoading ? 'Saving...' : 'Confirm'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Tabs list */}
              <div className="flex border-b border-slate-200 px-6 bg-white mt-2 shrink-0">
                {["profile", "timeline", "notes"].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveDetailTab(tab)}
                    className={`py-3 px-4 font-black text-[10px] uppercase tracking-wider border-b-2 transition-all relative ${
                      activeDetailTab === tab 
                        ? 'border-indigo-600 text-indigo-600' 
                        : 'border-transparent text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {tab} Details
                  </button>
                ))}
              </div>

              {/* Details Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar min-h-0">
                
                {activeDetailTab === 'profile' && (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <ProfileInfoBlock label="Email Address" val={selectedCandidate.email} icon={<FiUser />} />
                      <ProfileInfoBlock label="Phone Contact" val={selectedCandidate.phone} icon={<FiPhone />} />
                      <ProfileInfoBlock label="Location Base" val={selectedCandidate.location || "Remote"} icon={<FiMapPin />} />
                      <ProfileInfoBlock label="Experience" val={`${selectedCandidate.experience_years || 0} Years`} icon={<FiBriefcase />} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-4.5">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Core Proficiencies</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {(Array.isArray(selectedCandidate.skills) ? selectedCandidate.skills : selectedCandidate.skills?.split(',') || []).map((skill, idx) => (
                            <span key={idx} className="bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-xl text-[10px] font-bold text-indigo-700 uppercase tracking-wide">
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                        
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 pt-2">Candidate Biography</h4>
                        <p className="text-xs text-slate-500 leading-relaxed italic border-l-4 border-slate-200 pl-4 bg-slate-50/50 py-3.5 rounded-r-2xl">
                          "{selectedCandidate.bio || "No summary profile introduction submitted."}"
                        </p>
                      </div>

                      <div className="bg-slate-50/50 border border-slate-250/50 rounded-2xl p-5 space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-800">Skill Competency Benchmark</h4>
                        <div className="space-y-3.5">
                          <SkillProgress label="System Architecture" percent={82} color="bg-indigo-600" />
                          <SkillProgress label="Code Refactoring" percent={90} color="bg-indigo-600" />
                          <SkillProgress label="Team Synchronicity" percent={75} color="bg-indigo-600" />
                        </div>
                      </div>
                    </div>

                    <div className="border border-slate-200 p-4.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-50 text-rose-600 border border-rose-200/65 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0">
                          PDF
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Curriculum_Vitae_Dossier.pdf</p>
                          <p className="text-[10px] font-semibold text-slate-450 uppercase tracking-wide">Verified Professional CV Attachment</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {selectedCandidate.resume ? (
                          <a 
                            href={getMediaUrl(selectedCandidate.resume)} 
                            target="_blank" 
                            rel="noreferrer"
                            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 border border-indigo-100 shadow-sm active:scale-95"
                          >
                            <FiDownload className="w-3.5 h-3.5" />
                            View CV
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider italic p-2">No file attached</span>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {activeDetailTab === 'timeline' && (
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Interview Stage Pipeline</h4>
                    <div className="relative border-l-2 border-slate-200 pl-6 space-y-6 ml-3">
                      <div className="relative">
                        <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white shadow-sm"></div>
                        <h5 className="text-xs font-extrabold text-slate-800">Resume Screening Cleared</h5>
                        <p className="text-[11px] font-semibold text-slate-450 uppercase tracking-wide mt-0.5">Automated ATS System & HR Screening</p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-indigo-650 border-4 border-white shadow-sm"></div>
                        <h5 className="text-xs font-extrabold text-slate-800">
                          {selectedCandidate.status === 'SHEDULED' ? 'SCHEDULED' : selectedCandidate.status} 
                          <span className="text-[9px] font-black tracking-wider uppercase px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg ml-2">Active</span>
                        </h5>
                        <p className="text-[11px] font-semibold text-slate-450 uppercase tracking-wide mt-0.5">Assigned Date: {selectedCandidate.sheduled_date ? new Date(selectedCandidate.sheduled_date).toLocaleString() : "N/A"}</p>
                      </div>
                      <div className="relative opacity-40">
                        <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-slate-300 border-4 border-white"></div>
                        <h5 className="text-xs font-extrabold text-slate-800">Final Executive Alignment</h5>
                        <p className="text-[11px] font-semibold text-slate-450 uppercase tracking-wide mt-0.5">Pending earlier stage decisions</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeDetailTab === 'notes' && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-emerald-600 ml-1">Identified Strengths</label>
                        <textarea
                          placeholder="Log technological advantages..."
                          className="w-full h-28 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-700 outline-none transition-all focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                          value={assessment.strength}
                          onChange={(e) => handleAssessmentChange("strength", e.target.value)}
                        ></textarea>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-rose-600 ml-1">Identified Gaps</label>
                        <textarea
                          placeholder="Log optimization hurdles..."
                          className="w-full h-28 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-700 outline-none transition-all focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-50"
                          value={assessment.weakness}
                          onChange={(e) => handleAssessmentChange("weakness", e.target.value)}
                        ></textarea>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Comprehensive Decision Log Notes</label>
                      <textarea
                        placeholder="Write structured assessment reviews here..."
                        className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-700 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                        value={assessment.decision_note}
                        onChange={(e) => handleAssessmentChange("decision_note", e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                )}

              </div>

              {/* Bottom Actions Panel */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleDecision("REJECTED")} 
                    className="px-4.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm active:scale-95"
                  >
                    Reject Candidate
                  </button>
                </div>
                <button 
                  onClick={handleSaveAssessment} 
                  className="px-5.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm active:scale-95"
                >
                  Save Assessment
                </button>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/20 text-slate-400 text-center p-6">
              <FiBriefcase className="w-10 h-10 text-slate-300 mb-2.5" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select a candidate from the directory</p>
            </div>
          )}
        </div>

      </div>
      
      {/* Scrollbar styling */}
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
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

const ProfileInfoBlock = ({ label, val, icon }) => (
  <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex items-start gap-2.5 shadow-sm">
    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-550 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block">{label}</span>
      <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">{val || "N/A"}</p>
    </div>
  </div>
);

const SkillProgress = ({ label, percent, color }) => (
  <div>
    <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
      <span>{label}</span>
      <span>{percent}%</span>
    </div>
    <div className="h-2 bg-slate-200/70 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{width: `${percent}%`}}></div>
    </div>
  </div>
);

export default InterviewerCandidates;