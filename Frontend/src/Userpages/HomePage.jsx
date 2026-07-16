import { useNavigate } from 'react-router-dom';
import { 
  FiBriefcase, FiTrendingUp, FiShield
} from 'react-icons/fi';

const DashboardPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

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
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-indigo-500/5 border border-indigo-500/25 rounded-full shadow-inner">
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

      </main>
    </div>
  );
};

export default DashboardPage;