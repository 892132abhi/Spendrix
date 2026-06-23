import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowRight, FiCpu, FiTrendingUp, FiShield, 
  FiLayers, FiZap, FiCompass, FiCheckCircle, FiSearch, FiBriefcase,
  FiUploadCloud, FiTerminal, FiActivity, FiUserCheck, FiChevronRight
} from 'react-icons/fi';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("JOBS"); // JOBS, INTERVIEWS
  const [activeMetric, setActiveMetric] = useState('ACCURACY');
  const user = JSON.parse(localStorage.getItem('user'));

  // Resume Simulator States
  const [parseState, setParseState] = useState('IDLE'); // IDLE, PARSING, COMPLETED
  const [parseProgress, setParseProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  // Auto-typing text simulation for terminal console log
  const [terminalLogs, setTerminalLogs] = useState([]);
  const sampleLogs = [
    "Initializing autonomous matching thread...",
    "Scanning index nodes for verified repositories...",
    "Telemetry handshake synchronized with HR backend...",
    "Candidate matching matrix generated: 99.8% precision.",
  ];

  useEffect(() => {
    let logIndex = 0;
    const interval = setInterval(() => {
      if (logIndex < sampleLogs.length) {
        setTerminalLogs(prev => [...prev, sampleLogs[logIndex]]);
        logIndex++;
      } else {
        clearInterval(interval);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateParse = (e) => {
    e.preventDefault();
    setParseState('PARSING');
    setParseProgress(0);
    const interval = setInterval(() => {
      setParseProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setParseState('COMPLETED');
          return 100;
        }
        return prev + 8;
      });
    }, 120);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSimulateParse(e);
    }
  };

  const sampleJobs = [
    { id: 1, title: 'Lead Quantitative Systems Engineer', company: 'Spendrix Engine Core', location: 'Remote / NY', salary: '$190K - $240K', status: 'SHORTLISTED' },
    { id: 2, title: 'Senior Blockchain Infrastructure Architect', company: 'Decentralized Capital Corp', location: 'Hybrid / SF', salary: '$210K - $260K', status: 'EXPLORING' },
    { id: 3, title: 'Fintech Full-Stack Protocol Developer', company: 'Nexus Yield Labs', location: 'Remote', salary: '$160K - $195K', status: 'APPLIED' }
  ];

  const sampleInterviews = [
    { id: 1, job_title: 'Lead Quantitative Systems Engineer', interviewer_name: 'Dr. Evelyn Vance (Core Architect)', dateString: 'Fri, Jul 10', timeString: '14:00 UTC', status: 'SHEDULED' },
    { id: 2, job_title: 'Fintech Full-Stack Protocol Developer', interviewer_name: 'Marcus Brody (VP Engineering)', dateString: 'Mon, Jul 13', timeString: '17:30 UTC', status: 'SHEDULED' }
  ];

  const getStatusBadge = (status) => {
    const styles = {
      APPLIED: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.05)]',
      SHORTLISTED: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.05)]',
      EXPLORING: 'bg-slate-800/40 border-slate-700/60 text-slate-400'
    };
    return styles[status] || 'bg-slate-800/40 border-slate-700/60 text-slate-400';
  };

  return (
    <div className="min-h-screen bg-[#030303] text-slate-100 font-sans antialiased pb-24 overflow-hidden relative selection:bg-indigo-500/30 selection:text-white">
      
      {/* GLOWING AMBIENT SPACE ATMOSPHERE */}
      <div className="absolute top-[-10%] left-1/4 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-[700px] h-[700px] bg-emerald-600/5 rounded-full blur-[160px] pointer-events-none animate-pulse" style={{ animationDuration: '12s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[180px] pointer-events-none" />
      
      {/* FINE TECH MESH OVERLAY */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* LANDING NAVIGATION BAR */}
      {!user && (
        <nav className="w-full bg-[#030303]/40 backdrop-blur-xl border-b border-white/5 py-4 sticky top-0 z-50 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <div className="text-left flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center font-mono text-sm font-black text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                Ω
              </div>
              <div>
                <h1 className="text-sm font-black tracking-widest text-white leading-none font-display">SPENDRIX</h1>
                <p className="text-[7.5px] font-mono font-black text-emerald-400 uppercase tracking-[0.22em] mt-1">Autonomous Sourcing Engine</p>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <button 
                onClick={() => navigate('/loginpage')} 
                className="text-[11px] font-mono font-black uppercase text-slate-400 hover:text-white tracking-widest bg-transparent border-0 cursor-pointer outline-none transition-colors duration-300"
              >
                Login
              </button>
              <button 
                onClick={() => navigate('/registerpage')} 
                className="px-4.5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-mono font-black uppercase text-[10px] tracking-widest rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(99,102,241,0.25)] border-0 cursor-pointer active:scale-95"
              >
                Register
              </button>
            </div>
          </div>
        </nav>
      )}

      <main className="max-w-7xl mx-auto px-6 mt-16 lg:mt-24 space-y-24 relative z-10">
        
        {/* HERO SECTION */}
        <section className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-indigo-500/5 border border-indigo-500/25 rounded-full shadow-inner animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shadow-[0_0_10px_#34d399]" />
            <span className="text-[9px] font-mono font-black uppercase tracking-[0.25em] text-indigo-300">SYSTEM ENGAGEMENT NODE v2.0</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] font-display">
            Evaluate coding metrics built for <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-300 to-emerald-400 drop-shadow-[0_0_20px_rgba(99,102,241,0.15)]">
              high-velocity squads.
            </span>
          </h2>
          
          <p className="text-slate-400 text-sm sm:text-base font-medium leading-relaxed max-w-2xl mx-auto">
            Spendrix maps advanced algorithmic skill telemetry, candidate code performance validation, and secure pipeline scheduling straight into a unified, bento-grid command center.
          </p>
        </section>

        {/* INTERACTIVE RESUME TELEMETRY SIMULATOR */}
        <section className="max-w-3xl mx-auto">
          <div className="bg-[#0b0c13] rounded-3xl border border-white/5 p-8 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            {/* Glowing corner borders */}
            <div className="absolute top-0 left-0 w-20 h-[1px] bg-gradient-to-r from-indigo-500/50 to-transparent" />
            <div className="absolute top-0 left-0 w-[1px] h-20 bg-gradient-to-b from-indigo-500/50 to-transparent" />
            
            <div className="text-left mb-6 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest block">Interactive Sandbox Preview</span>
                <h3 className="text-lg font-bold text-white tracking-tight">Verifiable Resume Telemetry</h3>
              </div>
              <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-1 rounded-full border border-white/5 font-mono text-[9px] text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Telemetry Parser
              </div>
            </div>

            {parseState === 'IDLE' && (
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={handleSimulateParse}
                className={`border border-dashed rounded-2xl py-12 px-6 text-center cursor-pointer transition-all duration-300 group ${dragActive ? 'border-indigo-500 bg-indigo-500/5 shadow-inner' : 'border-slate-800 hover:border-indigo-500/50 hover:bg-white/[0.01]'}`}
              >
                <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-slate-400 mb-4 mx-auto group-hover:text-indigo-400 group-hover:scale-110 transition-all border border-slate-800">
                  <FiUploadCloud className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-300">Click to drop or test parsing telemetry</p>
                <p className="text-[10px] font-mono text-slate-500 mt-1 uppercase tracking-wider">Simulates target candidate verification cycle</p>
              </div>
            )}

            {parseState === 'PARSING' && (
              <div className="border border-slate-900 bg-slate-950/40 rounded-2xl p-10 text-center space-y-6">
                <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
                <div className="space-y-2">
                  <p className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">Parsing credentials vector matrix... {parseProgress}%</p>
                  <div className="w-full max-w-xs h-1.5 bg-slate-900 rounded-full mx-auto overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-150" style={{ width: `${parseProgress}%` }} />
                  </div>
                </div>
              </div>
            )}

            {parseState === 'COMPLETED' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/50 border border-slate-900 rounded-2xl p-6 text-left animate-in fade-in duration-300">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                      <FiCheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[9px] font-mono font-bold uppercase text-slate-500 tracking-wider">Parsing Success</p>
                      <h4 className="text-sm font-bold text-white">Verification Engine Log</h4>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-900/60 rounded-xl space-y-2 border border-white/5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">Match Rating</span>
                      <span className="text-xs font-mono font-black text-emerald-400">97.8% Sync</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">Target Index</span>
                      <span className="text-xs font-mono font-bold text-white">Systems Engineer</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">Expected Salary</span>
                      <span className="text-xs font-mono font-bold text-indigo-400">$190K - $240K</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setParseState('IDLE')}
                    className="text-[9px] font-mono font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest underline decoration-indigo-500/50 hover:decoration-indigo-400 cursor-pointer bg-transparent border-0 outline-none"
                  >
                    Reset Telemetry Parser
                  </button>
                </div>

                <div className="bg-black/60 p-4 rounded-xl border border-slate-900 font-mono text-[10px] text-slate-400 flex flex-col justify-between h-44">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                    <span className="flex items-center gap-1.5 text-indigo-400 font-black"><FiTerminal className="w-3.5 h-3.5" /> console.log</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-1.5 py-3 custom-scrollbar text-slate-400">
                    <p className="text-slate-500 font-bold">&gt; Initializing matching sequence...</p>
                    <p className="text-slate-300 font-bold">&gt; Matches found in database index.</p>
                    <p className="text-slate-300 font-bold">&gt; Telemetry verified dynamically.</p>
                    <p className="text-emerald-400 font-black">&gt; Telemetry score compiled: 97.8%</p>
                  </div>
                  <div className="text-[8px] text-slate-600 border-t border-slate-900 pt-2 flex justify-between">
                    <span>HOST: SPENDRIX_CORE</span>
                    <span>READY</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* HIGH-RESOLUTION BENTO MATRIX HIGHLIGHTS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-[#0b0c13] p-8 rounded-3xl border border-white/5 relative overflow-hidden text-left shadow-xl group hover:border-indigo-500/20 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 shadow-inner">
              <FiBriefcase className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white">01 / Vector Matching</h3>
            <p className="text-slate-400 text-xs mt-3 leading-relaxed">
              Bypass broken keyword matching filters. Spendrix directly assesses coding frameworks and quantitative engineering capabilities via secure pipeline tests.
            </p>
          </div>

          <div className="bg-[#0b0c13] p-8 rounded-3xl border border-white/5 relative overflow-hidden text-left shadow-xl group hover:border-emerald-500/20 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent shadow-[0_0_15px_rgba(52,211,153,0.1)]" />
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 shadow-inner">
              <FiTrendingUp className="w-4 h-4 shadow-[0_0_10px_rgba(52,211,153,0.2)]" />
            </div>
            <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white">02 / Clear Capital Yield</h3>
            <p className="text-slate-400 text-xs mt-3 leading-relaxed">
              Match target salaries instantly. Transparent financial metrics reduce negotiation lifecycles from average 14-day intervals down to hours.
            </p>
          </div>

          <div className="bg-[#0b0c13] p-8 rounded-3xl border border-white/5 relative overflow-hidden text-left shadow-xl group hover:border-purple-500/20 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
            <div className="w-10 h-10 rounded-2xl bg-purple-500/5 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 shadow-inner">
              <FiShield className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white">03 / Secure Loop Architecture</h3>
            <p className="text-slate-400 text-xs mt-3 leading-relaxed">
              Direct telemetry scheduling endpoints synchronize evaluation windows with engineering managers without third-party communication layers.
            </p>
          </div>

        </section>

        {/* CENTRAL PREVIEW: INTERACTIVE PLATFORM SIMULATOR */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
            <div className="text-left">
              <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest block">Live Sandbox Console</span>
              <h3 className="text-xl font-bold text-white tracking-tight font-display">Explore the Terminal Blueprint</h3>
            </div>

            {/* Platform View Switcher */}
            <div className="flex bg-slate-950 p-1 border border-white/5 rounded-xl w-fit space-x-1 font-mono self-start sm:self-auto shadow-inner">
              <button
                onClick={() => setActiveTab("JOBS")}
                className={`px-5 py-2.5 rounded-lg text-[9px] font-black tracking-wider uppercase transition-all duration-300 cursor-pointer flex items-center gap-2 border-0 outline-none ${activeTab === "JOBS" ? 'bg-indigo-600 text-white shadow-[0_4px_15px_rgba(99,102,241,0.3)]' : 'text-slate-500 hover:text-slate-400 bg-transparent'}`}
              >
                <FiCompass className="w-3.5 h-3.5" />
                Position Matrix ({sampleJobs.length})
              </button>
              <button
                onClick={() => setActiveTab("INTERVIEWS")}
                className={`px-5 py-2.5 rounded-lg text-[9px] font-black tracking-wider uppercase transition-all duration-300 cursor-pointer flex items-center gap-2 border-0 outline-none ${activeTab === "INTERVIEWS" ? 'bg-indigo-600 text-white shadow-[0_4px_15px_rgba(99,102,241,0.3)]' : 'text-slate-500 hover:text-slate-400 bg-transparent'}`}
              >
                <FiCpu className="w-3.5 h-3.5" />
                Assessment Loops ({sampleInterviews.length})
              </button>
            </div>
          </div>

          {/* ACTIVE WORKSPACE RENDER PREVIEW */}
          {activeTab === "JOBS" ? (
            <div className="grid grid-cols-1 gap-4 text-left">
              {sampleJobs.map(job => (
                <div key={job.id} className="bg-[#0b0c13] p-6 rounded-2xl border border-white/5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 group relative overflow-hidden hover:border-indigo-500/20 transition-all duration-300">
                  <div className="space-y-2 relative z-10">
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="font-bold text-white text-base tracking-tight">{job.title}</h4>
                      <span className={`text-[8px] font-mono font-bold uppercase tracking-wider border px-2 py-0.5 rounded ${getStatusBadge(job.status)}`}>
                        {job.status === 'EXPLORING' ? 'Open Entry' : job.status}
                      </span>
                    </div>
                    <p className="text-indigo-400 text-xs font-semibold tracking-wide font-mono">{job.company}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                      <span className="flex items-center gap-1">📍 {job.location}</span>
                      <span className="flex items-center gap-1">💰 {job.salary}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate(user ? '/joblist' : '/registerpage')}
                    className="px-5 py-3 bg-slate-900/60 hover:bg-slate-800 text-white border border-slate-800/80 hover:border-slate-700 rounded-xl text-[9px] font-mono font-black uppercase tracking-widest transition-all cursor-pointer relative z-10"
                  >
                    {user ? "View Job Listings" : "View Parameters"}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#0b0c13] rounded-2xl border border-white/5 shadow-2xl overflow-hidden text-left">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-950 text-slate-500 text-[9px] font-mono font-bold uppercase tracking-[0.2em] border-b border-white/5">
                      <th className="py-5 px-6">System Assessment Node</th>
                      <th className="py-5 px-6">Assigned Evaluator</th>
                      <th className="py-5 px-6">Timeline Coordinate</th>
                      <th className="py-5 px-6 text-right">Verification Sync</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-white/5 font-mono">
                    {sampleInterviews.map(interview => (
                      <tr key={interview.id} className="bg-transparent hover:bg-white/[0.01]">
                        <td className="py-5 px-6 font-sans">
                          <div className="font-bold text-white text-sm tracking-tight mb-0.5">{interview.job_title}</div>
                          <div className="text-slate-500 text-[9px] font-mono font-bold uppercase tracking-wider">Assessment Matrix</div>
                        </td>
                        <td className="py-5 px-6 text-[10px] tracking-wider text-indigo-400 font-bold">
                          {interview.interviewer_name}
                        </td>
                        <td className="py-5 px-6 text-slate-300">
                          <div className="text-slate-200">{interview.dateString}</div>
                          <div className="text-[9px] font-medium text-slate-500 mt-1 uppercase tracking-wider">{interview.timeString}</div>
                        </td>
                        <td className="py-5 px-6 text-right">
                          <span className="text-[8px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded shadow-[0_0_15px_rgba(52,211,153,0.05)]">
                            ● Synchronized
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* DUAL GATEWAY ACTION CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-left">
          
          <div className="p-8 bg-[#0b0c13] border border-white/5 rounded-3xl relative overflow-hidden shadow-xl group hover:border-indigo-500/20 transition-all duration-300">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/[0.01] blur-3xl rounded-full pointer-events-none" />
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/5 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shadow-sm">
                <FiZap className="w-4 h-4 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight font-display">For Elite Engineering Talent</h3>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                Gain entry into direct tracking indexes. Upload your verifiable credentials vector card and connect straight to tech leads, skipping screening loops.
              </p>
              <button 
                onClick={() => navigate(user ? '/joblist' : '/registerpage?type=candidate')}
                className="mt-2 px-5 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-mono font-black text-[9px] uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_25px_rgba(99,102,241,0.25)] flex items-center gap-2 group cursor-pointer border-0 outline-none"
              >
                {user ? "View Job Listings" : "Access Candidate Network"}
                <FiArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          <div className="p-8 bg-[#0b0c13] border border-white/5 rounded-3xl relative overflow-hidden shadow-xl group hover:border-emerald-500/20 transition-all duration-300">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/5 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shadow-sm">
                <FiLayers className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight font-display">For Scale Operations</h3>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                Deploy exact computational project goals. Tap into pre-evaluated technical portfolios tailored natively to your operational tech arrays.
              </p>
              <button 
                onClick={() => navigate(user ? (user.role === 'HR' ? '/hr-dashboard' : '/hr-profile') : '/registerpage?type=employer')}
                className="mt-2 px-5 py-3.5 bg-slate-900 hover:bg-slate-850 text-white font-mono font-black text-[9px] uppercase tracking-widest rounded-xl border border-slate-800/80 transition-all flex items-center gap-2 group cursor-pointer outline-none"
              >
                {user ? "View HR Console" : "Provision Corporate Seat"}
                <FiArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 text-emerald-400" />
              </button>
            </div>
          </div>

        </section>

      </main>
    </div>
  );
};

export default DashboardPage;