import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
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
      const response = await axios.post("http://localhost/ai/resume/analyze_resume", formData);
      setAnalysis(response.data);
      toast.success("Resume analyzed successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased text-slate-700">
      <div className="max-w-4xl mx-auto">
        
        {/* Friendly Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Optimize Your Resume
          </h1>
          <p className="text-md text-slate-500 max-w-xl mx-auto leading-relaxed">
            Upload your PDF resume to get instant, actionable feedback on how to stand out to recruiters and pass modern application systems.
          </p>
        </div>

        {/* Soft Dropzone Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm mb-8">
          <label className={`
            relative flex flex-col items-center justify-center w-full h-52 
            border-2 border-dashed rounded-xl cursor-pointer 
            transition-all duration-200
            ${loading ? 'bg-slate-50 border-emerald-300' : 'hover:bg-slate-50/80 border-slate-300 hover:border-emerald-500'}
          `}>
            <div className="flex flex-col items-center justify-center px-4 text-center">
              {loading ? (
                <div className="flex flex-col items-center">
                  {/* Gentle loading spinner */}
                  <div className="w-12 h-12 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin"></div>
                  <p className="mt-4 text-sm text-slate-600 font-medium">Reading your resume, one second...</p>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full mb-3">
                    <FiUploadCloud size={28} />
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    Click to upload your resume <span className="text-slate-400 font-normal">or drag it here</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Accepts PDF format (up to 5MB)</p>
                  
                  {fileName && (
                    <div className="mt-3 flex items-center gap-1.5 text-slate-600 bg-slate-100 px-3 py-1 rounded-full text-xs font-medium">
                      <FiFileText size={14} className="text-slate-400" /> {fileName}
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

        {analysis && !loading && (
          <div className="space-y-6 transition-all duration-300">
            
            {/* Split Header: Score Box & Summary Box */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Score Box */}
              <div className="md:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FiAward size={14} className="text-emerald-500" /> Resume Strength
                </span>
                <div className="flex items-baseline justify-center">
                  <span className="text-6xl font-black text-slate-900 tracking-tight">{analysis.score}</span>
                  <span className="text-slate-400 text-lg ml-0.5">/100</span>
                </div>
                {/* Horizontal Progress Bar */}
                <div className="w-full mt-4 bg-slate-100 rounded-full h-2.5">
                  <div 
                    className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${analysis.score}%` }}
                  />
                </div>
              </div>

              {/* Summary Box */}
              <div className="md:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FiBookOpen size={14} className="text-blue-500" /> Executive Overview
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {analysis.summary || "Your resume demonstrates solid experience layout structures. We have mapped out specific areas below to help refine your wording and increase visibility to hiring software."}
                </p>
              </div>
            </div>

            {/* Twin Columns for Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Strengths Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                  <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                    <FiCheck size={18} />
                  </div>
                  <h3 className="text-md font-bold text-slate-800">What's working well</h3>
                </div>
                <ul className="space-y-3">
                  {analysis.strengths?.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
                      <span className="text-emerald-500 font-bold select-none">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                  <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                    <FiAlertCircle size={18} />
                  </div>
                  <h3 className="text-md font-bold text-slate-800">Things to review</h3>
                </div>
                <ul className="space-y-3">
                  {analysis.weaknesses?.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
                      <span className="text-amber-500 font-bold select-none">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Suggestions Block */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-blue-500 text-white rounded-lg shadow-sm">
                  <FiSmile size={18} />
                </div>
                <h3 className="text-md font-bold text-slate-800">Pro-Tips for Next Steps</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {analysis.suggestions?.map((item, i) => (
                  <div key={i} className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs text-xs sm:text-sm text-slate-600 leading-relaxed">
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