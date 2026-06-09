import React, { useState, useEffect, useRef } from 'react';

export default function WorkspacePage({ initialJobDescription = "Full Stack Python Developer" }) {
  const [documents, setDocuments] = useState([]);
  const [activeDocText, setActiveDocText] = useState(''); 
  const [chatHistory, setChatHistory] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  const [jobDescription, setJobDescription] = useState(initialJobDescription);
  const [questionsKit, setQuestionsKit] = useState([]);
  const [isGeneratingKit, setIsGeneratingKit] = useState(false);

  const chatBottomRef = useRef(null);
  const AI_SERVICE_BASE = '/ai/workspace';

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const tempId = Date.now();
    const newDoc = { id: tempId, name: file.name, status: 'Processing...', active: false };
    setDocuments(prev => [...prev, newDoc]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${AI_SERVICE_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        setActiveDocText(data.extracted_text);
        setDocuments(prev => prev.map(doc => 
          doc.id === tempId ? { ...doc, status: 'Ready', active: true } : { ...doc, active: false }
        ));
      } else {
        throw new Error(data.detail || "Extraction failure");
      }
    } catch (err) {
      setDocuments(prev => prev.map(doc => doc.id === tempId ? { ...doc, status: 'Failed' } : doc));
    }
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || isChatLoading) return;
    if (!activeDocText) {
      alert("Please upload and select an active document first!");
      return;
    }

    const currentQuery = messageInput;
    setMessageInput('');
    setChatHistory(prev => [...prev, { sender: 'USER', text: currentQuery }]);
    setIsChatLoading(true);

    const formData = new FormData();
    formData.append('message', currentQuery);
    formData.append('doc_text', activeDocText);

    try {
      const response = await fetch(`${AI_SERVICE_BASE}/message`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        setChatHistory(prev => [...prev, { sender: 'AI', text: data.reply }]);
      } else {
        alert(data.detail || "Chat process error.");
      }
    } catch (err) {
      console.error("Vector communication failure:", err);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleCompileInterviewKit = async () => {
    if (!activeDocText) return;

    setIsGeneratingKit(true);
    setQuestionsKit([]);

    const formData = new FormData();
    formData.append('doc_text', activeDocText);
    formData.append('job_description', jobDescription);

    try {
      const response = await fetch(`${AI_SERVICE_BASE}/generate-kit`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        setQuestionsKit(data.kit.questions || []);
      } else {
        alert("Failed to compile matrix schema objects.");
      }
    } catch (err) {
      console.error("Generator execution error:", err);
    } finally {
      setIsGeneratingKit(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0b0f19] text-slate-100 font-sans antialiased overflow-hidden flex flex-col">
      <header className="h-16 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-black text-white text-sm shadow-md">
            S
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">Spendrix AI Platform</h1>
            <p className="text-[11px] text-slate-400 font-medium tracking-tight -mt-0.5">Unified Recruitment Hub</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-full px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          AI Engine Online
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden w-full max-w-[1600px] mx-auto p-4 gap-4">
        {/* LEFT COLUMN: UPLOAD & CHAT */}
        <section className="w-full md:w-[45%] flex flex-col gap-4 h-full">
          <div className="bg-slate-950 rounded-xl border border-slate-800/60 p-4 shadow-xl flex flex-col gap-3 shrink-0">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Context Source Core</h2>
            <label className="border border-dashed border-slate-800 hover:border-indigo-500/40 bg-slate-900/20 rounded-lg p-4 text-center cursor-pointer transition flex flex-col items-center justify-center group">
              <svg className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-xs font-semibold text-slate-300">Upload Evaluation Document</span>
              <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} />
            </label>

            {documents.length > 0 && (
              <div className="max-h-[85px] overflow-y-auto space-y-1.5 pr-1">
                {documents.map(doc => (
                  <div key={doc.id} className={`flex items-center justify-between p-2 rounded-lg border text-xs transition ${doc.active ? 'bg-indigo-950/30 border-indigo-500/30 text-indigo-300' : 'bg-slate-900/60 border-slate-800/80 text-slate-400'}`}>
                    <div className="flex items-center gap-2 truncate">
                      <span>📄</span>
                      <span className="font-medium truncate">{doc.name}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${doc.status === 'Ready' ? 'bg-emerald-950/60 text-emerald-400' : 'bg-slate-900 text-slate-500 animate-pulse'}`}>{doc.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-950 rounded-xl border border-slate-800/60 flex flex-col flex-1 overflow-hidden shadow-xl">
            <div className="p-3 bg-slate-900/40 border-b border-slate-800/60">
              <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Document Query Vector Engine</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-950">
              {chatHistory.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-[280px] mx-auto space-y-2">
                  <p className="text-xs text-slate-500 font-medium">Upload a source document to interact with its semantic mappings here.</p>
                </div>
              )}
              {chatHistory.map((chat, idx) => (
                <div key={idx} className={`flex ${chat.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs ${chat.sender === 'USER' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-900 text-slate-300 border border-slate-800/80 rounded-tl-none'}`}>{chat.text}</div>
                </div>
              ))}
              {isChatLoading && <div className="text-[10px] text-slate-400 animate-pulse">Extracting context parameters...</div>}
              <div ref={chatBottomRef} />
            </div>
            <form onSubmit={handleSendChatMessage} className="p-2.5 border-t border-slate-800/60 bg-slate-900/40 flex gap-2 shrink-0">
              <input type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} placeholder={activeDocText ? "Is there structural architectural competency?" : "Awaiting data context..."} disabled={!activeDocText} className="flex-1 bg-slate-950 border border-slate-800/80 rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-500" />
              <button type="submit" disabled={!activeDocText || isChatLoading} className="bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold px-4 rounded-lg transition">Query</button>
            </form>
          </div>
        </section>

        {/* RIGHT COLUMN: EVALUATION KIT */}
        <section className="flex-1 bg-slate-950 rounded-xl border border-slate-800/60 flex flex-col overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-900/30 border-b border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="space-y-1 flex-1">
              <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400">Target Pipeline Blueprint</h2>
              <input type="text" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Specify targeted execution role..." className="w-full max-w-sm bg-slate-950 border border-slate-800/80 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500" />
            </div>
            {!isGeneratingKit && (
              <button onClick={handleCompileInterviewKit} disabled={!activeDocText} className="bg-emerald-600 hover:bg-emerald-500 text-xs font-bold px-4 py-2 rounded-lg transition shadow-md self-end sm:self-center">
                {questionsKit.length > 0 ? 'Regenerate Matrix' : 'Compile Evaluation Matrix'}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950">
            {questionsKit.length === 0 && !isGeneratingKit && (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-[340px] mx-auto">
                <p className="text-xs text-slate-500 font-medium">Provide a blueprint rule, then invoke the matrix compiler.</p>
              </div>
            )}
            {isGeneratingKit && <div className="text-center text-xs text-emerald-400 animate-pulse pt-12">Processing Multi-Vector Semantic Scans...</div>}
            
            {questionsKit.length > 0 && (
              <div className="space-y-4 max-w-2xl mx-auto">
                {questionsKit.map((q, idx) => (
                  <div key={idx} className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-3 shadow-md">
                    <div className="flex justify-between items-start gap-2 border-b border-slate-800/60 pb-2">
                      <div>
                        <span className="text-[9px] font-black tracking-widest text-indigo-400 uppercase bg-indigo-950/60 border border-indigo-900/40 px-2 py-0.5 rounded">Matrix ID-0{idx + 1}</span>
                        <h3 className="text-sm font-semibold text-white leading-snug pt-1">{q.question_text}</h3>
                      </div>
                      <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded italic">{q.target_skill}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 bg-slate-950/40 p-2 rounded"><strong className="text-slate-300">Intent:</strong> {q.intent}</p>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="p-2 rounded bg-emerald-950/10 border border-emerald-900/20 text-emerald-300"><span className="text-[9px] font-bold tracking-wider uppercase block text-emerald-400">Elite Target Metric</span>{q.grading_rubric?.ideal}</div>
                      <div className="p-2 rounded bg-amber-950/10 border border-amber-900/20 text-amber-300"><span className="text-[9px] font-bold tracking-wider uppercase block text-amber-400">Acceptable Threshold</span>{q.grading_rubric?.acceptable}</div>
                      <div className="p-2 rounded bg-red-950/10 border border-red-900/20 text-red-300"><span className="text-[9px] font-bold tracking-wider uppercase block text-red-400">Disqualification Indicator</span>{q.grading_rubric?.red_flag}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}