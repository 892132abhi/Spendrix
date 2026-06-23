import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowRight, FiCpu, FiTrendingUp, FiShield, 
  FiLayers, FiZap, FiCompass, FiCheckCircle, FiSearch, FiBriefcase
} from 'react-icons/fi';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("JOBS"); // JOBS, INTERVIEWS
  const [activeMetric, setActiveMetric] = useState('ACCURACY');

  // Static high-fidelity sample datasets to simulate the premium platform layout live
  const sampleJobs = [
    { id: 1, title: 'Lead Quantitative Systems Engineer', company: 'Spendrix Engine Core', location: 'Remote / NY', salary: '$190K - $240K', status: 'SHORTLISTED' },
    { id: 2, title: 'Senior Blockchain Infrastructure Architect', company: 'Decentralized Capital Corp', location: 'Hybrid / SF', salary: '$210K - $260K', status: 'EXPLORING' },
    { id: 3, title: 'Fintech Full-Stack Protocol Developer', company: 'Nexus Yield Labs', location: 'Remote', salary: '$160K - $195K', status: 'APPLIED' }
  ];

  const sampleInterviews = [
    { id: 1, job_title: 'Lead Quantitative Systems Engineer', interviewer_name: 'Dr. Evelyn Vance (Core Architect)', dateString: 'Fri, Jul 10', timeString: '14:00 UTC', status: 'SHEDULED' },
    { id: 2, job_title: 'Fintech Full-Stack Protocol Developer', interviewer_name: 'Marcus Brody (VP Engineering)', dateString: 'Mon, Jul 13', timeString: '17:30 UTC', status: 'SHEDULED' }
  ];

  // Accent mapping helpers
  const getStatusBadge = (status) => {
    const styles = {
      APPLIED: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',
      SHORTLISTED: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.05)]',
      EXPLORING: 'bg-slate-800/40 border-slate-700/60 text-slate-400'
    };
    return styles[status] || 'bg-slate-800/40 border-slate-700/60 text-slate-450';
  };

  return (
    <div className="min-h-screen bg-[#06070a] text-slate-100 font-sans antialiased pb-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/20 via-[#06070a] to-[#06070a]">
      
      {/* LANDING NAVIGATION BAR */}
      <nav className="w-full bg-[#0c0d14]/60 backdrop-blur-xl border-b border-indigo-500/10 py-5 sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="text-left flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-mono text-xs font-black text-indigo-400 shadow-inner">
              Ω
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white leading-none">SPENDRIX</h1>
              <p className="text-[8px] font-mono font-black text-emerald-400 uppercase tracking-[0.18em] mt-1">Autonomous Sourcing Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/login')} 
              className="text-xs font-mono font-bold uppercase text-slate-400 hover:text-white tracking-wider bg-transparent border-0 cursor-pointer outline-none transition-colors"
            >
              System Login
            </button>
            <button 
              onClick={() => navigate('/register')} 
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] border-0 cursor-pointer active:scale-95"
            >
              Initialize Node
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-16 space-y-16">
        
        {/* HERO HEADER CALLOUT */}
        <section className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/5 border border-indigo-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span className="text-[9px] font-mono font-black uppercase tracking-[0.2em] text-indigo-400">Recruitment Decentralized</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
            Hiring metrics built for <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-slate-200 to-emerald-400">high-velocity squads.</span>
          </h2>
          <p className="text-slate-400 text-sm md:text-base font-medium leading-relaxed max-w-2xl mx-auto">
            Spendrix maps algorithmic skill telemetry, clean financial alignment values, and technical sandbox performance validation straight into a unified, bento-grid platform dashboard.
          </p>
        </section>

        {/* HIGH-RESOLUTION BENTO MATRIX HIGHLIGHTS */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="bg-[#0c0d14] p-6 rounded-2xl border border-slate-800/80 relative overflow-hidden text-left shadow-xl group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
            <div className="w-10 h-10 rounded-xl bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-inner">
              <FiBriefcase className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white">01 / Vector Matching</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Bypass broken keyword matching filters. Spendrix directly assesses coding frameworks and quantitative engineering capabilities via secure pipeline tests.
            </p>
          </div>

          <div className="bg-[#0c0d14] p-6 rounded-2xl border border-slate-800/80 relative overflow-hidden text-left shadow-xl group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent shadow-[0_0_15px_rgba(52,211,153,0.1)]" />
            <div className="w-10 h-10 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-inner">
              <FiTrendingUp className="w-4 h-4 shadow-[0_0_10px_rgba(52,211,153,0.2)]" />
            </div>
            <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white">02 / Clear Capital Yield</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Match target salaries instantly. Transparent financial metrics reduce negotiation lifecycles from average 14-day intervals down to hours.
            </p>
          </div>

          <div className="bg-[#0c0d14] p-6 rounded-2xl border border-slate-800/80 relative overflow-hidden text-left shadow-xl group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
            <div className="w-10 h-10 rounded-xl bg-purple-500/5 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 shadow-inner">
              <FiShield className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white">03 / Secure Loop Architecture</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Direct telemetry scheduling endpoints synchronize evaluation windows with engineering managers without third-party communication layers.
            </p>
          </div>

        </section>

        {/* CENTRAL PREVIEW: INTERACTIVE PLATFORM SIMULATOR */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
            <div className="text-left">
              <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest block">Live Sandbox Console</span>
              <h3 className="text-xl font-bold text-white tracking-tight">Explore the Terminal Blueprint</h3>
            </div>

            {/* Platform View Workspace Tabs Switcher */}
            <div className="flex bg-[#0c0d14] p-1.5 border border-slate-800 rounded-xl w-fit space-x-1 shadow-inner font-mono self-start sm:self-auto">
              <button
                onClick={() => setActiveTab("JOBS")}
                className={`px-5 py-2 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer flex items-center gap-2 ${activeTab === "JOBS" ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'text-slate-500 hover:text-slate-400'}`}
              >
                <FiCompass className="w-3.5 h-3.5" />
                Position Matrix Preview ({sampleJobs.length})
              </button>
              <button
                onClick={() => setActiveTab("INTERVIEWS")}
                className={`px-5 py-2 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer flex items-center gap-2 ${activeTab === "INTERVIEWS" ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'text-slate-500 hover:text-slate-400'}`}
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
                <div key={job.id} className="bg-[#0c0d14] p-6 rounded-2xl border border-slate-800/60 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 group relative overflow-hidden">
                  <div className="space-y-1.5 relative z-10">
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="font-bold text-white text-base tracking-tight">{job.title}</h4>
                      <span className={`text-[8px] font-mono font-bold uppercase tracking-wider border px-2 py-0.5 rounded ${getStatusBadge(job.status)}`}>
                        {job.status === 'EXPLORING' ? 'Open Entry' : job.status}
                      </span>
                    </div>
                    <p className="text-indigo-400 text-xs font-semibold tracking-wide font-mono">{job.company}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1.5 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                      <span className="flex items-center gap-1"><span className="text-indigo-500">📍</span> {job.location}</span>
                      <span className="flex items-center gap-1"><span className="text-emerald-400">💰</span> {job.salary}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate('/register')}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 text-white border border-slate-800 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest transition-all cursor-pointer relative z-10"
                  >
                    View Parameters
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#0c0d14] rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden text-left">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-950 text-slate-500 text-[10px] font-mono font-bold uppercase tracking-[0.15em] border-b border-slate-900">
                      <th className="py-4 px-6">System Assessment Node</th>
                      <th className="py-4 px-6">Assigned Evaluator</th>
                      <th className="py-4 px-6">Timeline Coordinate</th>
                      <th className="py-4 px-6 text-right">Verification Sync</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-slate-900 font-mono">
                    {sampleInterviews.map(interview => (
                      <tr key={interview.id} className="bg-transparent hover:bg-slate-900/10">
                        <td className="py-5 px-6 font-sans">
                          <div className="font-bold text-white text-sm tracking-tight mb-0.5">{interview.job_title}</div>
                          <div className="text-slate-500 text-[9px] font-mono font-bold uppercase tracking-wider">Assessment Matrix</div>
                        </td>
                        <td className="py-5 px-6 text-[10px] tracking-wider text-indigo-400 font-bold">
                          {interview.interviewer_name}
                        </td>
                        <td className="py-5 px-6 text-slate-300">
                          <div className="text-slate-200">{interview.dateString}</div>
                          <div className="text-[10px] font-medium text-slate-500 mt-0.5">{interview.timeString}</div>
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
          
          <div className="p-8 bg-gradient-to-b from-[#0e111a] to-[#0c0d14] border border-indigo-500/10 rounded-3xl relative overflow-hidden shadow-xl group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/[0.01] blur-3xl rounded-full pointer-events-none" />
            <div className="space-y-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-sm">
                <FiZap className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">For Elite Engineering Talent</h3>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                Gain entry into direct tracking indexes. Upload your verifiable credentials vector card and connect straight to tech leads, skipping screening loops.
              </p>
              <button 
                onClick={() => navigate('/register?type=candidate')}
                className="mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_20px_rgba(99,102,241,0.2)] flex items-center gap-2 group cursor-pointer border-0 outline-none"
              >
                Access Candidate Network
                <FiArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          <div className="p-8 bg-gradient-to-b from-[#0e111a] to-[#0c0d14] border border-slate-800/80 rounded-3xl relative overflow-hidden shadow-xl group">
            <div className="space-y-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-sm">
                <FiLayers className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">For Scale Operations</h3>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                Deploy exact computational project goals. Tap into pre-evaluated technical portfolios tailored natively to your operational tech arrays.
              </p>
              <button 
                onClick={() => navigate('/register?type=employer')}
                className="mt-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-850 text-white font-mono font-bold text-[10px] uppercase tracking-widest rounded-xl border border-slate-800 transition-all flex items-center gap-2 group cursor-pointer outline-none"
              >
                Provision Corporate Seat
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