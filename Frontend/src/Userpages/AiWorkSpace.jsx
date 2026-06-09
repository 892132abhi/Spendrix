import React, { useState, useEffect, useRef } from 'react';

export default function WorkspacePage({ initialJobDescription = "Full Stack Python Developer" }) {
  // --- STATE LAYER ---
  const [fileName, setFileName] = useState('');
  const [uploadStatus, setUploadStatus] = useState(''); // '', 'Processing...', '✅ Ready', '❌ Failed'
  const [docText, setDocText] = useState(''); // Hidden context state driving the RAG loops
  
  // Chat console states
  const [chatHistory, setChatHistory] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  // Interview Guide states
  const [jobDescription, setJobDescription] = useState(initialJobDescription);
  const [questionsKit, setQuestionsKit] = useState([]);
  const [isGeneratingKit, setIsGeneratingKit] = useState(false);

  const chatBottomRef = useRef(null);

  // Keep chat scrolled down smoothly
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // --- API HANDLERS ---

  // Endpoint 1: /workspace/upload
  const handleFileUpload = async (e) => {
    const targetFile = e.target.files[0];
    if (!targetFile) return;

    setFileName(targetFile.name);
    setUploadStatus('Processing...');
    setQuestionsKit([]); // Reset questions for new file context

    const payload = new FormData();
    payload.append('file', targetFile);

    try {
      const response = await fetch('/ai/workspace/upload', {
        method: 'POST',
        body: payload, // Browser sets multipart/form-data headers automatically
      });
      const data = await response.json();

      if (response.ok) {
        setDocText(data.extracted_text);
        setUploadStatus('✅ Ready');
      } else {
        setUploadStatus('❌ Failed');
        alert(data.detail || "Error extracting file text.");
      }
    } catch (err) {
      setUploadStatus('❌ Failed');
      console.error("Upload error:", err);
    }
  };

  // Endpoint 2: /workspace/message
  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || isChatLoading) return;
    if (!docText) {
      alert("Please upload a resume or spec file first to give the AI context!");
      return;
    }

    const clearQuery = messageInput;
    setMessageInput('');
    setChatHistory(prev => [...prev, { sender: 'USER', text: clearQuery }]);
    setIsChatLoading(true);

    // FastAPI router expects standard Form fields
    const payload = new FormData();
    payload.append('message', clearQuery);
    payload.append('doc_text', docText);

    try {
      const response = await fetch('/ai/workspace/message', {
        method: 'POST',
        body: payload,
      });
      const data = await response.json();

      if (response.ok) {
        setChatHistory(prev => [...prev, { sender: 'AI', text: data.reply }]);
      } else {
        alert(data.detail || "Chat processing failed.");
      }
    } catch (err) {
      console.error("Chat engine communication error:", err);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Endpoint 3: /workspace/generate-kit
  const handleCompileInterviewKit = async () => {
    if (!docText) return;

    setIsGeneratingKit(true);
    setQuestionsKit([]);

    const payload = new FormData();
    payload.append('doc_text', docText);
    payload.append('job_description', jobDescription);

    try {
      const response = await fetch('/ai/workspace/generate-kit', {
        method: 'POST',
        body: payload,
      });
      const data = await response.json();

      if (response.ok) {
        // Reads your strict structured JSON array format response mapping
        setQuestionsKit(data.kit.questions || []);
      } else {
        alert("Failed to structure interview questions from context.");
      }
    } catch (err) {
      console.error("Generator error:", err);
    } finally {
      setIsGeneratingKit(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 text-slate-100 p-6 flex justify-center">
      <div className="w-full max-w-4xl space-y-8 pb-16">
        
        {/* Title branding block */}
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Interview Workspace</h1>
          <p className="text-sm text-slate-400 mt-1">Interrogate profile documents dynamically and create tailored performance scripts.</p>
        </div>

        {/* STEP 1 BLOCK: FILE INGESTION */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-indigo-400">1. Context Document Upload</h2>
            {uploadStatus && (
              <span className="text-xs px-3 py-1 bg-slate-900 rounded-full border border-slate-800 font-medium">
                {fileName} ({uploadStatus})
              </span>
            )}
          </div>
          
          <label className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-900/30 rounded-xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center group">
            <svg className="w-8 h-8 text-slate-500 group-hover:text-indigo-400 mb-2 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-sm font-medium text-slate-300">Select candidate resume or technical specifications file</span>
            <span className="text-xs text-slate-600 mt-1">PDF file configuration input limits up to 15MB</span>
            <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} />
          </label>
        </div>

        {/* STEP 2 BLOCK: CHAT WINDOW CONSOLE */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 flex flex-col h-[420px] overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-900/50 border-b border-slate-800">
            <h2 className="text-lg font-bold text-indigo-400">2. Document Assistant Console</h2>
          </div>

          {/* Interactive Bubble Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-sm italic">
                <p>Upload a target file context to start querying raw skills, background histories, or red flags...</p>
              </div>
            )}
            
            {chatHistory.map((chat, idx) => (
              <div key={idx} className={`flex ${chat.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  chat.sender === 'USER' ? 'bg-indigo-600 text-white font-medium' : 'bg-slate-900 text-slate-300 border border-slate-800'
                }`}>
                  {chat.text}
                </div>
              </div>
            ))}
            
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="text-xs text-slate-500 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800/60 animate-pulse">
                  AI parsing vector paths...
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Entry Form Input footer block */}
          <form onSubmit={handleSendChatMessage} className="p-3 border-t border-slate-800 bg-slate-900/40 flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={docText ? "Does this candidate have practical experience with Docker Compose or Kubernetes deployment profiles?" : "Awaiting document load context..."}
              disabled={!docText}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 disabled:opacity-40"
            />
            <button
              type="submit"
              disabled={!docText || isChatLoading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-sm font-semibold px-5 rounded-xl transition shadow-lg"
            >
              Ask
            </button>
          </form>
        </div>

        {/* STEP 3 BLOCK: STRUCTURED GENERATOR INTERFACE */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-emerald-400">3. Target Interview Guide Compilation</h2>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Configure Role Target Context:</label>
              <input 
                type="text"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 mt-1 focus:outline-none focus:border-emerald-500"
              />
            </div>
            
            {!isGeneratingKit && (
              <button
                onClick={handleCompileInterviewKit}
                disabled={!docText}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-sm font-bold px-5 py-2.5 rounded-xl transition shadow-lg self-end"
              >
                {questionsKit.length > 0 ? 'Regenerate Rubrics' : 'Generate Guide'}
              </button>
            )}
          </div>

          {/* Render compilation dynamic components states */}
          {questionsKit.length === 0 && !isGeneratingKit && (
            <p className="text-center text-xs text-slate-600 italic py-6">Provide a target role spec description and click compile above to build custom rubrics from candidate text.</p>
          )}

          {isGeneratingKit && (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-emerald-400 font-medium">FastAPI and OpenAI processing alignment weights...</p>
              <p className="text-xs text-slate-600">Structuring custom metrics down to target output schema formats...</p>
            </div>
          )}

          {questionsKit.length > 0 && (
            <div className="space-y-4">
              {questionsKit.map((q, index) => (
                <div key={index} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-md hover:border-slate-700 transition">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-indigo-400 tracking-wider bg-indigo-950/60 border border-indigo-900/50 px-2 py-0.5 rounded uppercase">Question {index + 1}</span>
                    <span className="bg-slate-800 text-slate-300 font-bold px-2.5 py-0.5 rounded border border-slate-700/60 italic">{q.target_skill}</span>
                  </div>
                  
                  <h3 className="text-base font-semibold text-white leading-snug">{q.question_text}</h3>
                  <p className="text-xs text-slate-400 bg-slate-950/40 p-2 rounded border border-slate-800/40"><strong className="text-slate-300 font-semibold">Evaluation Intent:</strong> {q.intent}</p>
                  
                  {/* Custom Evaluation matrix grid layout */}
                  <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-emerald-300">
                      <strong className="text-emerald-400 font-bold uppercase tracking-wider block text-[10px] mb-0.5">Ideal Elite Benchmark:</strong> {q.grading_rubric?.ideal}
                    </div>
                    <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-900/30 text-amber-300">
                      <strong className="text-amber-400 font-bold uppercase tracking-wider block text-[10px] mb-0.5">Acceptable Passing Criteria:</strong> {q.grading_rubric?.acceptable}
                    </div>
                    <div className="p-2.5 rounded-lg bg-red-950/20 border border-red-900/30 text-red-300">
                      <strong className="text-red-400 font-bold uppercase tracking-wider block text-[10px] mb-0.5">Red Flags / Failure Indicators:</strong> {q.grading_rubric?.red_flag}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}