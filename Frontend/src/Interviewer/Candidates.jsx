import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/instance';
import { toast } from 'react-hot-toast';

const getMediaUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `http://127.0.0.1:8000${url}`;
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

  // --- PAGINATION STATES ---
  const [page, setPage] = useState(1);
  const [paginationData, setPaginationData] = useState({
    next: null,
    previous: null,
    totalCount: 0
  });

  const user = JSON.parse(localStorage.getItem('user'));

  // Reset page parameter to 1 whenever parent global filters mutate
  const handleFilterChange = (setter, value) => {
    setPage(1);
    setter(value);
  };

  useEffect(() => {
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
            page: page, // Injects explicit page pointer downstream
          }
        });
        
        // Handle DRF paginated structure envelope object gracefully
        const dataPayload = res.data;
        const resultsArray = dataPayload.results !== undefined ? dataPayload.results : dataPayload;
        const data = Array.isArray(resultsArray) ? resultsArray : [];
        
        const mappedData = data.map(item => ({
          ...item,
          recruiter_name: item.recruiter_name || item.created_by_name || "HR System Coordinator"
        }));
        
        setCandidates(mappedData);

        // Sync metadata states for page controls
        setPaginationData({
          next: dataPayload.next || null,
          previous: dataPayload.previous || null,
          totalCount: dataPayload.count || mappedData.length
        });

        if (mappedData.length > 0) {
          setSelectedCandidate(mappedData[0]);
          setAssessment(getCandidateAssessment(mappedData[0]));
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
    fetchDossiers();
  }, [searchTerm, activeTab, selectedRole, selectedRound, sortBy, page]); // page hook explicitly handles updates now

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
      PENDING: 'bg-amber-50 text-amber-700 border-amber-200/60',
      SCHEDULED: 'bg-blue-50 text-blue-700 border-blue-200/60',
      COMPLETED: 'bg-purple-50 text-purple-700 border-purple-200/60',
      SHORTLISTED: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      SHORT_LISTED: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      REJECTED: 'bg-rose-50 text-rose-700 border-rose-200/60',
      SELECTED: 'bg-teal-50 text-teal-700 border-teal-200/60',
      SHEDULED: 'bg-blue-50 text-blue-700 border-blue-200/60',
      CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200/60',
    };
    return styles[status?.toUpperCase()] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <div className="h-[calc(100vh-40px)] flex flex-col space-y-6 p-6 bg-slate-50/30 font-sans antialiased">
      
      <header className="bg-white/70 backdrop-blur-md border border-slate-200/80 p-6 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Candidates Directory</h1>
            <p className="text-slate-500 text-sm">Manage assigned talent pipelines, track qualifications, and log live feedback.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search name, role, skills..." 
                value={searchTerm}
                onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
                className="w-72 pl-10 pr-4 py-2.5 bg-slate-100/80 border border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
          <div className="flex bg-slate-100 p-1 rounded-xl space-x-1">
            {["ALL", "SHEDULED", "COMPLETED", "CANCELLED"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleFilterChange(setActiveTab, tab)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select 
              value={selectedRole} 
              onChange={(e) => handleFilterChange(setSelectedRole, e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Roles</option>
              <option value="Senior Frontend Engineer">Senior Frontend Engineer</option>
              <option value="Fullstack Developer">Fullstack Developer</option>
              <option value="DevOps Specialist">DevOps Specialist</option>
            </select>

            <select 
              value={selectedRound} 
              onChange={(e) => handleFilterChange(setSelectedRound, e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Rounds</option>
              <option value="Technical Round 1">Technical Round 1</option>
              <option value="System Design">System Design</option>
              <option value="Culture Fit">Culture Fit</option>
            </select>

            <select 
              value={sortBy} 
              onChange={(e) => handleFilterChange(setSortBy, e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="date-asc">Date: Earliest</option>
              <option value="date-desc">Date: Latest</option>
              <option value="exp-desc">Experience: High to Low</option>
              <option value="match-desc">Highest Skill Match</option>
            </select>
          </div>
        </div>
      </header>

      <div className="flex-1 flex gap-6 overflow-hidden">
        
        {/* Left Side: Cards Stream Container with Fixed layout flex settings to isolate pagination bar footer bottom */}
        <div className="w-full lg:w-[460px] h-full flex flex-col gap-4">
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-white border border-slate-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center bg-white border border-dashed border-slate-200 rounded-3xl p-8 text-center">
                <p className="text-sm font-semibold text-slate-400">No candidate profile matches your filters.</p>
              </div>
            ) : (
              filteredCandidates.map((c) => (
                <div 
                  key={c.id}
                  onClick={() => handleSelectCandidate(c)}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer bg-white relative group ${selectedCandidate?.id === c.id ? 'border-indigo-600 shadow-md ring-4 ring-indigo-50' : 'border-slate-100 hover:border-slate-300 shadow-sm'}`}
                >
                  {c.match_percentage && (
                    <span className="absolute top-4 right-4 bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2 py-0.5 rounded-md border border-emerald-200">
                      {c.match_percentage}% Match
                    </span>
                  )}

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex-shrink-0 overflow-hidden flex items-center justify-center font-bold text-slate-700">
                      {c.profile_pic ? <img src={getMediaUrl(c.profile_pic)} className="w-full h-full object-cover" alt={c.name || "Candidate"}/> : (c.name || "C").charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 text-sm truncate">{c.name || "Unnamed Candidate"}</h3>
                      <p className="text-slate-500 text-xs truncate mt-0.5">{c.role || "N/A"} • {c.experience_years || 0}Y Exp</p>
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(Array.isArray(c.skills) ? c.skills : c.skills?.split(',') || []).slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="bg-slate-50 border border-slate-200/60 px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-600">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50 text-[11px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                          {c.sheduled_date ? new Date(c.sheduled_date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : "N/A"}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${getStatusBadge(c.status)}`}>
                          {c.status}
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
            <div className="bg-white border border-slate-200/80 rounded-2xl p-3 flex justify-between items-center shadow-sm">
              <button
                disabled={!paginationData.previous || loading}
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                className="px-4 py-2 text-xs font-bold uppercase border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
              >
                ← Prev
              </button>
              
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                Page <strong className="text-slate-800">{page}</strong>
              </span>

              <button
                disabled={!paginationData.next || loading}
                onClick={() => setPage(prev => prev + 1)}
                className="px-4 py-2 text-xs font-bold uppercase bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 transition-all shadow-sm"
              >
                Next →
              </button>
            </div>
          )}
        </div>

        <div className="hidden lg:flex flex-1 bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          {selectedCandidate ? (
            <div className="flex flex-col h-full">
              
              <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-2xl flex-shrink-0 overflow-hidden flex items-center justify-center font-bold text-2xl">
                    {selectedCandidate.profile_pic ? <img src={getMediaUrl(selectedCandidate.profile_pic)} className="w-full h-full object-cover" alt={selectedCandidate.name || "Candidate"}/> : (selectedCandidate.name || "C").charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">{selectedCandidate.name || "Unnamed Candidate"}</h2>
                    <p className="text-slate-400 text-sm mt-0.5">{selectedCandidate.role || "N/A"} - <span className="text-indigo-400 font-semibold">{selectedCandidate.status || "Assigned"}</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleOpenHRChat}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                  >
                    <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Chat with HR
                  </button>

                  {/* <a 
                    href={selectedCandidate.meeting_link || "#"} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z"/></svg>
                    Join Interview
                  </a> */}
                </div>
              </div>

              <div className="mx-6 mt-4 p-5 bg-indigo-50/60 border border-indigo-100 rounded-2xl grid grid-cols-3 gap-4 items-center">
                <div>
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider block">Session Context</span>
                  <span className="text-xs font-black text-slate-800 mt-0.5 block">
                    {selectedCandidate.sheduled_date ? new Date(selectedCandidate.sheduled_date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) : "N/A"}
                  </span>
                </div>
                <div className="text-center border-x border-indigo-100 px-2">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider block">Assigned HR</span>
                  <span className="text-xs font-black text-slate-800 mt-0.5 block truncate">
                    {selectedCandidate.recruiter_name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider block">Scheduled Time</span>
                  <span className="text-sm font-mono font-black text-indigo-600 block mt-0.5">
                    {selectedCandidate.sheduled_date ? new Date(selectedCandidate.sheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}
                  </span>
                </div>
              </div>

              <div className="flex border-b border-slate-200 px-6 bg-white mt-2">
                {["profile", "timeline", "notes"].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveDetailTab(tab)}
                    className={`py-3.5 px-4 font-semibold text-xs capitalize border-b-2 tracking-wide transition-all ${activeDetailTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                  >
                    {tab} Details
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                
                {activeDetailTab === 'profile' && (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Email Address</span>
                        <p className="text-xs font-semibold text-slate-800 mt-1 truncate">{selectedCandidate.email || "N/A"}</p>
                      </div>
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Phone Contact</span>
                        <p className="text-xs font-semibold text-slate-800 mt-1 truncate">{selectedCandidate.phone || "N/A"}</p>
                      </div>
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Location Base</span>
                        <p className="text-xs font-semibold text-slate-800 mt-1 truncate">{selectedCandidate.location || "Remote"}</p>
                      </div>
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Experience</span>
                        <p className="text-xs font-semibold text-slate-800 mt-1 truncate">{selectedCandidate.experience_years} Years</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Core Proficiencies</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {(Array.isArray(selectedCandidate.skills) ? selectedCandidate.skills : selectedCandidate.skills?.split(',') || []).map((skill, idx) => (
                            <span key={idx} className="bg-indigo-50/60 border border-indigo-100 px-2.5 py-1 rounded-lg text-xs font-medium text-indigo-700">
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 pt-2">Candidate Biography</h4>
                        <p className="text-xs text-slate-600 leading-relaxed italic">"{selectedCandidate.bio || "No summary profile introduction submitted."}"</p>
                      </div>

                      <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-4 space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Skill Competency Benchmark</h4>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-xs text-slate-600 mb-1"><span>System Architecture</span><span className="font-bold">82%</span></div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-slate-800 rounded-full" style={{width: '82%'}}></div></div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs text-slate-600 mb-1"><span>Code Refactoring</span><span className="font-bold">90%</span></div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-slate-800 rounded-full" style={{width: '90%'}}></div></div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs text-slate-600 mb-1"><span>Team Synchronicity</span><span className="font-bold">75%</span></div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-slate-800 rounded-full" style={{width: '75%'}}></div></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0">
                          PDF
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Curriculum_Vitae_Dossier.pdf</p>
                          <p className="text-[11px] text-slate-400">Verified Professional CV Attachment</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {selectedCandidate.resume ? (
                          <a 
                            href={getMediaUrl(selectedCandidate.resume)} 
                            target="_blank" 
                            rel="noreferrer"
                            className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border border-indigo-100 shadow-sm active:scale-95"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium italic p-1.5">No file attached</span>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {activeDetailTab === 'timeline' && (
                  <div className="space-y-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Interview Stage Pipeline</h4>
                    <div className="relative border-l-2 border-slate-200 pl-6 space-y-6 ml-2">
                      <div className="relative">
                        <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-white"></div>
                        <h5 className="text-xs font-bold text-slate-800">Resume Screening Cleared</h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">Automated ATS System & HR Screening</p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-white"></div>
                        <h5 className="text-xs font-bold text-slate-800">{selectedCandidate.status || "Assigned"} <span className="text-[10px] font-bold px-1.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded ml-2">Active</span></h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">Assigned Date: {selectedCandidate.sheduled_date ? new Date(selectedCandidate.sheduled_date).toLocaleString() : "N/A"}</p>
                      </div>
                      <div className="relative opacity-40">
                        <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-slate-300 ring-4 ring-white"></div>
                        <h5 className="text-xs font-bold text-slate-800">Final Executive Alignment</h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">Pending earlier stage decisions</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeDetailTab === 'notes' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wide text-emerald-600 mb-1">Identified Strengths</label>
                        <textarea
                          placeholder="Log technological advantages..."
                          className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-emerald-500"
                          value={assessment.strength}
                          onChange={(e) => handleAssessmentChange("strength", e.target.value)}
                        ></textarea>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wide text-rose-600 mb-1">Identified Gaps</label>
                        <textarea
                          placeholder="Log optimization hurdles..."
                          className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-rose-500"
                          value={assessment.weakness}
                          onChange={(e) => handleAssessmentChange("weakness", e.target.value)}
                        ></textarea>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1">Comprehensive Decision Log Notes</label>
                      <textarea
                        placeholder="Write structured assessment reviews here..."
                        className="w-full h-28 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-indigo-500"
                        value={assessment.decision_note}
                        onChange={(e) => handleAssessmentChange("decision_note", e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                )}

              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-2">
                  <button onClick={() => handleDecision("REJECTED")} className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all">
                    Reject Candidate
                  </button>
                  <button onClick={() => handleDecision("SHORT_LISTED")} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all">
                    Shortlist
                  </button>
                </div>
                <button onClick={handleSaveAssessment} className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm">
                  Save Assessment
                </button>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 text-slate-400 italic text-sm p-6">
              <svg className="w-8 h-8 text-slate-300 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              Select a candidate profile timeline from the menu grid directory.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default InterviewerCandidates;