import  { useState } from 'react';

const InterviewerFeedback = () => {
  const [scores, setScores] = useState({ technical: 0, softSkills: 0, logic: 0 });
  const [recommendation, setRecommendation] = useState(null); // 'hire' or 'reject'

  const handleScore = (category, value) => {
    setScores({ ...scores, [category]: value });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* --- HEADER --- */}
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Submit Evaluation</h1>
          <p className="text-slate-500 text-sm font-medium">Finalize your assessment for <span className="text-indigo-600 font-bold">Michael Chen</span>.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Interview Date</p>
           <p className="text-xs font-bold text-slate-700">May 07, 2026</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT: TECHNICAL RATING --- */}
        <section className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
            <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Competency Ratings</h3>
            
            {['Technical', 'Soft Skills', 'Logic'].map((cat) => (
              <div key={cat} className="space-y-3">
                <label className="text-xs font-black text-slate-700 uppercase tracking-widest block">{cat} Ability</label>
                <div className="flex justify-between">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleScore(cat.toLowerCase().replace(' ', ''), num)}
                      className={`w-10 h-10 rounded-xl font-black text-xs transition-all border-2 ${
                        scores[cat.toLowerCase().replace(' ', '')] >= num 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                        : 'bg-transparent border-slate-100 text-slate-300 hover:border-indigo-200 hover:text-indigo-400'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- RIGHT: COMMENTS & RECOMMENDATION --- */}
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
            
            {/* Written Comments */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Detailed Observations</h3>
              <textarea 
                placeholder="Describe candidate's performance, technical depth, and specific examples from the interview..."
                className="w-full p-6 bg-slate-50 border-none rounded-[2rem] text-sm font-medium focus:ring-2 focus:ring-indigo-500 min-h-[200px] placeholder:text-slate-300 transition-all"
              />
            </div>

            {/* Final Recommendation Toggle */}
            <div className="pt-8 border-t border-slate-50">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Final Recommendation</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setRecommendation('hire')}
                  className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all ${
                    recommendation === 'hire' 
                    ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-100 scale-[1.02]' 
                    : 'bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M5 13l4 4L19 7" /></svg>
                  Recommend Hire
                </button>
                
                <button 
                  onClick={() => setRecommendation('reject')}
                  className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all ${
                    recommendation === 'reject' 
                    ? 'bg-red-600 text-white shadow-xl shadow-red-100 scale-[1.02]' 
                    : 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12" /></svg>
                  Reject Candidate
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button className="w-full py-5 bg-slate-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-indigo-600 shadow-xl shadow-slate-200 transition-all active:scale-[0.98]">
                Submit Evaluation to HR
              </button>
              <p className="text-center text-[9px] text-slate-400 font-bold uppercase mt-4 tracking-widest">Action cannot be undone once submitted</p>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
};

export default InterviewerFeedback;