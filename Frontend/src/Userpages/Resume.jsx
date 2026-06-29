import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import api from "../api/instance";
import { 
  FiUploadCloud, 
  FiCheck, 
  FiAlertCircle, 
  FiSmile, 
  FiFileText,
  FiAward,
  FiBookOpen
} from "react-icons/fi";

const ResumeAnalyzer = () => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [fileName, setFileName] = useState("");

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setFileName(file.name);
    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const response = await api.post("ai/resume/", formData,{
        headers:{
          'Content-Type': undefined,
        }
      });
      setAnalysis(response.data);
      toast.success("Resume analyzed successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return { text: 'text-emerald-600', bg: 'bg-emerald-500', border: 'border-emerald-200', lightBg: 'bg-emerald-50/50' };
    if (score >= 60) return { text: 'text-indigo-600', bg: 'bg-indigo-500', border: 'border-indigo-200', lightBg: 'bg-indigo-50/50' };
    return { text: 'text-rose-600', bg: 'bg-rose-500', border: 'border-rose-200', lightBg: 'bg-rose-50/50' };
  };

  const scoreTheme = analysis ? getScoreColor(analysis.score) : null;

  return (
    <div className="min-h-screen bg-slate-50/20 py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased text-slate-700">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">
            Optimize Your Resume
          </h1>
          <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            Upload your PDF resume to get instant, actionable feedback on how to stand out to recruiters and pass modern application systems.
          </p>
        </div>

        {/* Dropzone Card */}
        <div className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm mb-8">
          <label className={`
            relative flex flex-col items-center justify-center w-full h-56 
            border-2 border-dashed rounded-2xl cursor-pointer 
            transition-all duration-300
            ${loading ? 'bg-slate-50/80 border-indigo-300' : 'hover:bg-slate-50/40 border-slate-200 hover:border-indigo-500'}
          `}>
            <div className="flex flex-col items-center justify-center px-4 text-center">
              {loading ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                  <p className="mt-4 text-sm text-slate-600 font-bold tracking-tight">Filing data matrices, mapping profiles...</p>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl mb-3 shadow-inner">
                    <FiUploadCloud size={24} />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">
                    Click to import resume <span className="text-slate-400 font-medium">or drop files here</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1.5">Accepts PDF file format (up to 5MB)</p>
                  
                  {fileName && (
                    <div className="mt-4 flex items-center gap-1.5 text-indigo-700 bg-indigo-50/80 border border-indigo-100 px-3 py-1 rounded-xl text-xs font-bold shadow-sm">
                      <FiFileText size={13} /> 
                      <span>{fileName}</span>
                    </div>
                  )}
                </>
              )}
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept=".pdf" 
              onChange={handleFileUpload} 
              disabled={loading}
            />
          </label>
        </div>

        {/* Analysis Results View */}
        {analysis && !loading && (
          <div className="space-y-6 transition-all duration-500 animate-in fade-in slide-in-from-bottom-6">
            
            {/* Split Header: Score Box & Summary Box */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Score Box */}
              <div className="md:col-span-4 bg-white border border-slate-100 rounded-3xl p-8 flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1.5 ${scoreTheme.bg}`}></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1">
                  <FiAward size={13} className="text-indigo-500" />
                  <span>Resume Strength</span>
                </span>
                
                {/* Circular Indicator */}
                <div className="relative w-28 h-28 flex items-center justify-center mb-2">
                  <div className="absolute inset-0 rounded-full border-[8px] border-slate-100"></div>
                  <div className="flex items-baseline justify-center z-10">
                    <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{analysis.score}</span>
                    <span className="text-slate-400 text-sm font-semibold">/100</span>
                  </div>
                </div>
              </div>

              {/* Summary Box */}
              <div className="md:col-span-8 bg-white border border-slate-100 rounded-3xl p-8 shadow-sm flex flex-col justify-center">
                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <FiBookOpen size={13} className="text-indigo-500" />
                  <span>Executive Overview</span>
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  {analysis.summary || "Your resume demonstrates solid experience structures. We have mapped out specific areas below to help refine your wording and increase visibility to hiring software."}
                </p>
              </div>
            </div>

            {/* Columns for Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Strengths Card */}
              <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <FiCheck size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">What's working well</h3>
                </div>
                <ul className="space-y-3.5">
                  {analysis.strengths?.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed font-semibold">
                      <span className="text-emerald-500 font-bold select-none mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses Card */}
              <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
                  <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                    <FiAlertCircle size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Things to review</h3>
                </div>
                <ul className="space-y-3.5">
                  {analysis.weaknesses?.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed font-semibold">
                      <span className="text-rose-500 font-bold select-none mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Suggestions Block */}
            <div className="bg-indigo-50/40 border border-indigo-100/60 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-600/10">
                  <FiSmile size={16} />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Actionable Suggestions</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {analysis.suggestions?.map((item, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-xs text-slate-600 leading-relaxed font-semibold">
                    {item}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzer;