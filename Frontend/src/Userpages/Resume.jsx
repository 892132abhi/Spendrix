import React, { useState } from 'react';
import api from '../api/instance';
import { toast } from 'react-hot-toast';

const ResumePage = () => {
  const [isParsing, setIsParsing] = useState(false);
  const [resumeData, setResumeData] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('resume', file);
    setIsParsing(true);
    const loadingToast = toast.loading("AI Engine parsing asset record structural values...");

    try {
      const response = await api.patch('accounts/profileupdate/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResumeData(response.data.resume_data);
      toast.success("Ecosystem data matrices loaded!", { id: loadingToast });
    } catch (err) {
      toast.error("Data ingestion failed. Check schema.", { id: loadingToast });
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 pb-20 text-stone-900 bg-stone-50/20 rounded-[3rem]">
      <header className="flex justify-between items-end border-b border-amber-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-stone-950 tracking-tight uppercase italic">Cognitive Profile Analyzer</h1>
          <p className="text-stone-500 font-medium mt-1">Ingest raw CV artifacts into the verified structural ledger matrix.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Upload Container */}
        <div className="lg:col-span-4 space-y-6">
          <div className={`relative group overflow-hidden bg-white p-8 rounded-[2.5rem] border-2 border-dashed transition-all duration-500 flex flex-col items-center text-center ${isParsing ? 'border-orange-500 bg-amber-50/20' : 'border-amber-200 hover:border-orange-400'}`}>
            
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 transition-transform duration-500 shadow-md ${isParsing ? 'bg-gradient-to-r from-amber-500 to-orange-500 scale-110' : 'bg-stone-950 group-hover:scale-110'}`}>
              <span className="text-2xl text-amber-400">📁</span>
            </div>

            <h3 className="text-lg font-black text-stone-950 mb-2 uppercase tracking-tight italic">
              {isParsing ? "Deconstructing Schema..." : "Ingest CV Document"}
            </h3>
            <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mb-8">Premium PDF / System Layouts up to 5MB</p>
            
            <label className="w-full relative">
              <input type="file" className="hidden" onChange={handleFileChange} disabled={isParsing} />
              <div className="cursor-pointer bg-gradient-to-r from-stone-950 to-stone-800 text-amber-400 border border-amber-500/20 py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:from-amber-500 hover:to-orange-500 hover:text-stone-950 transition-all text-center">
                {isParsing ? "Ingesting Indices..." : "Select Target File"}
              </div>
            </label>

            {isParsing && (
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500 w-full animate-pulse" />
            )}
          </div>
        </div>

        {/* Matrix Data Viewer */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-[2.5rem] border border-orange-100/60 shadow-xl min-h-[500px] overflow-hidden flex flex-col">
            
            <div className="px-10 py-6 border-b border-amber-100 flex justify-between items-center bg-stone-50/50">
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em]">Deconstructed Identity Blueprint</span>
              <div className="flex gap-2 items-center">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Cognitive Matrix Link Active</span>
              </div>
            </div>

            {!resumeData && !isParsing ? (
              <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-50">
                <div className="w-16 h-16 border-4 border-amber-100 border-t-amber-500 rounded-full mb-4 animate-spin"></div>
                <p className="font-black text-xs uppercase tracking-widest text-stone-400">Awaiting target system artifact ingestion pipelines.</p>
              </div>
            ) : (
              <div className={`p-10 space-y-12 transition-opacity duration-700 ${isParsing ? 'opacity-20' : 'opacity-100'}`}>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <LuxuryDataField label="Extracted Name Record" value={resumeData?.name} icon="👤" />
                  <LuxuryDataField label="Extracted Index Email" value={resumeData?.email} icon="✉️" />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-amber-700 uppercase tracking-[0.2em] block">Extracted Capabilities Index</label>
                  <div className="flex flex-wrap gap-2">
                    {resumeData?.skills?.map((skill, i) => (
                      <span key={i} className="px-5 py-2.5 bg-stone-950 text-amber-400 border border-amber-500/20 rounded-xl text-xs font-black uppercase tracking-tight">
                        {skill}
                      </span>
                    )) || <p className="text-stone-300 italic text-xs uppercase tracking-widest">Parsing core capability variables...</p>}
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] block">Chronological Deployment History</label>
                  <div className="space-y-4">
                    {resumeData?.experience?.map((exp, i) => (
                      <div key={i} className="group p-6 rounded-2xl border border-amber-100 bg-stone-50/40 hover:border-orange-400 transition-all flex justify-between items-start shadow-inner">
                        <div>
                          <h5 className="font-black text-stone-900 text-sm mb-1 uppercase tracking-tight italic">{exp.role}</h5>
                          <p className="text-xs font-bold text-amber-700 tracking-wide">{exp.company}</p>
                        </div>
                        <span className="text-[10px] font-black text-orange-600 bg-orange-50 border border-orange-100 px-3 py-1 rounded-full uppercase tracking-widest">{exp.duration}</span>
                      </div>
                    )) || <p className="text-stone-300 italic text-xs uppercase tracking-widest">Parsing deployment nodes...</p>}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

const LuxuryDataField = ({ label, value, icon }) => (
  <div className="p-6 bg-stone-50 border border-amber-100 rounded-2xl shadow-inner">
    <div className="flex items-center gap-2 mb-3">
      <span className="text-xs text-amber-600">{icon}</span>
      <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{label}</label>
    </div>
    <p className="text-base font-black text-stone-900 uppercase italic tracking-tight">{value || '---'}</p>
  </div>
);

export default ResumePage;