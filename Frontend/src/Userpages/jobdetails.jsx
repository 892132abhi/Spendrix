import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/instance';
import { toast } from 'react-hot-toast';

const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`jobs/singlejoblist/${id}/`);
        setJob(response.data);
      } catch (err) {
        toast.error("Could not retrieve corporate structural position data");
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, navigate]);

  const handleApply = async () => {
    const loadingToast = toast.loading("Submitting verification profile dossier...");
    try {
      await api.post(`applications/applyjob/${id}/`);
      toast.success("Dossier Synced to Operational Platform Ledger!", { id: loadingToast });
    } catch (error) {
      const msg = error.response?.data?.detail || "Profile verification path already exists for this track.";
      toast.error(msg, { id: loadingToast });
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center text-amber-600 font-black uppercase tracking-widest text-xs animate-pulse">
      Syncing Corporate Position Data Metrics...
    </div>
  );

  if (!job) return null;

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-stone-400 hover:text-orange-600 font-black text-[10px] uppercase tracking-widest mb-8 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        Return to Open Market Matrices
      </button>

      <div className="bg-white rounded-[3rem] border border-orange-100 shadow-2xl overflow-hidden">
        
        {/* Luxury Banner Layout */}
        <div className="p-10 md:p-14 border-b border-amber-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-gradient-to-b from-stone-50 to-amber-50/20">
          <div>
            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-950 border border-amber-300 rounded-lg text-[10px] font-black uppercase tracking-widest mb-4">
              {job.job_type ? job.job_type.replace('_', ' ') : 'CORE STRUCTURAL'}
            </span>
            <h1 className="text-4xl font-black text-stone-950 tracking-tight mb-2 italic uppercase">{job.title}</h1>
            <p className="text-orange-600 font-bold flex items-center gap-2 text-sm tracking-wide">
              <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
              {job.location} Operations HQ
            </p>
          </div>
          <button 
            onClick={handleApply}
            className="w-full md:w-auto px-10 py-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-orange-500/10 hover:-translate-y-0.5 transition-all active:scale-95"
          >
            Submit Application Dossier
          </button>
        </div>

        {/* Informational Bento Metric Segment */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-10 bg-white border-b border-amber-100">
          {[
            { label: 'Target Remuneration', value: job.salary || 'Executive Remuneration' },
            { label: 'Placement Protocol', value: job.job_type ? job.job_type.replace('_', ' ') : 'N/A', color: 'text-amber-700' },
            { label: 'Experience Tier Required', value: `${job.experience || 0}+ Metric Years` },
            { label: 'Placement Pipeline Status', value: job.job_status || 'Open Evaluation', color: 'text-orange-600' },
            { label: 'Compatibility Index score', value: '94%', color: 'text-amber-600 font-black' }
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-2xl bg-stone-50/50 border border-amber-100/60 flex flex-col justify-between shadow-inner">
              <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2">{item.label}</p>
              <p className={`text-xs font-black uppercase tracking-tight ${item.color || 'text-stone-800'}`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Content Section */}
        <div className="p-10 md:p-14 space-y-12 bg-gradient-to-b from-white to-stone-50/30">
          <section>
            <h3 className="text-xs font-black text-stone-900 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
              <span className="w-8 h-[2px] bg-orange-500"></span>
              Operational Parameters & Narrative
            </h3>
            <p className="text-stone-700 text-base leading-relaxed whitespace-pre-wrap font-medium max-w-4xl">
              {job.description}
            </p>
          </section>

          <section>
            <h3 className="text-xs font-black text-stone-900 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
              <span className="w-8 h-[2px] bg-amber-500"></span>
              Architectural Tech Framework Requirements
            </h3>
            <div className="flex flex-wrap gap-3">
              {job.skills?.split(',').map((skill, i) => (
                <span key={i} className="px-6 py-3 bg-white border-2 border-amber-100/80 text-stone-800 font-bold rounded-xl text-xs uppercase tracking-tight hover:border-orange-400 transition-colors shadow-sm">
                  {skill.trim()}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;