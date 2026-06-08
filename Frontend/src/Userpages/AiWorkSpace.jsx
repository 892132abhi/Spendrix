import React, { useState, useEffect, useRef } from 'react';

export default function AIWorkspace({ jobDescription }) {
  const [documents, setDocuments] = useState([]);
  const [extractedText, setExtractedText] = useState(''); 
  const [chatHistory, setChatHistory] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [isGeneratingKit, setIsGeneratingKit] = useState(false);

  const chatEndRef = useRef(null);
  
  // Pointing directly through your existing NGINX routing setup mapping
  const AI_SERVICE_BASE = '/ai/workspace'; 

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const tempId = Date.now();
    setDocuments(prev => [...prev, { id: tempId, name: file.name, status: 'Processing...' }]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${AI_SERVICE_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      
      if (response.ok) {
        setExtractedText(data.extracted_text); 
        setDocuments(prev => prev.map(doc => 
          doc.id === tempId ? { ...doc, status: '✅ Ready' } : doc
        ));
      } else {
        throw new Error(data.detail || "Failed parsing");
      }
    } catch (error) {
      setDocuments(prev => prev.map(doc => doc.id === tempId ? { ...doc, status: '❌ Failed' } : doc));
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentMessage.trim() || isChatLoading) return;
    if (!extractedText) {
      alert("Please upload a document first to provide context!");
      return;
    }

    const userMsg = currentMessage;
    setCurrentMessage('');
    setChatHistory(prev => [...prev, { sender: 'USER', message: userMsg }]);
    setIsChatLoading(true);

    const formData = new FormData();
    formData.append('message', userMsg);
    formData.append('doc_text', extractedText); 

    try {
      const response = await fetch(`${AI_SERVICE_BASE}/message`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      
      if (response.ok) {
        setChatHistory(prev => [...prev, { sender: 'AI', message: data.reply }]);
      } else {
        throw new Error(data.detail || "Chat failed");
      }
    } catch (error) {
      setChatHistory(prev => [...prev, { sender: 'AI', message: "Error communicating with the AI service vector space." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleTriggerGeneration = async () => {
    if (!extractedText) return;
    
    setIsGeneratingKit(true);
    setInterviewQuestions([]);

    const formData = new FormData();
    formData.append('doc_text', extractedText);
    formData.append('job_description', jobDescription || "Full Stack Developer Frameworks");

    try {
      const response = await fetch(`${AI_SERVICE_BASE}/generate-kit`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      
      if (response.ok) {
        setInterviewQuestions(data.kit.questions || []);
      } else {
        alert("Failed to compile structured question schema.");
      }
    } catch (error) {
      console.error("Error generating interview guide:", error);
    } finally {
      setIsGeneratingKit(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 text-slate-100 font-sans p-6 flex justify-center overflow-y-auto">
      <div className="w-full max-w-3xl space-y-8 pb-12">
        
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-bold text-white">AI Interview Workspace</h1>
          <p className="text-sm text-slate-400">Upload files, interact with documents, and build target rubrics seamlessly.</p>
        </div>

        {/* 1. UPLOAD */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-semibold text-indigo-400">1. Upload Context Files</h2>
          <label className="border-2 border-dashed border-slate-800 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center bg-slate-900/50">
            <span className="text-sm font-medium text-slate-300">Drop resume or job specs here</span>
            <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.docx" />
          </label>
          
          <div className="flex flex-wrap gap-2 pt-2">
            {documents.map(doc => (
              <span key={doc.id} className="text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full flex gap-2 items-center">
                <span className="text-slate-300 truncate max-w-[120px]">{doc.name}</span>
                <span className="text-slate-500 font-semibold">{doc.status}</span>
              </span>
            ))}
          </div>
        </div>

        {/* 2. CHAT */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 flex flex-col h-[400px] overflow-hidden">
          <div className="p-4 bg-slate-900/40 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-indigo-400">2. Document Assistant Chat</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950">
            {chatHistory.length === 0 && (
              <p className="text-center text-xs text-slate-600 italic mt-12">Upload a document above and start asking questions...</p>
            )}
            {chatHistory.map((chat, idx) => (
              <div key={idx} className={`flex ${chat.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-xl p-3 text-sm ${
                  chat.sender === 'USER' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-300 border border-slate-800'
                }`}>
                  {chat.message}
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="text-xs text-slate-500 animate-pulse">AI is parsing vector metrics...</div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-900/60 flex gap-2">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Ask anything about the document..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
            />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 px-4 rounded-xl text-sm font-medium transition">
              Ask
            </button>
          </form>
        </div>

        {/* 3. GENERATE KIT */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h2 className="text-lg font-semibold text-emerald-400">3. Structured Interview Kit</h2>
            {!isGeneratingKit && (
              <button 
                onClick={handleTriggerGeneration}
                disabled={!extractedText}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-xs font-semibold px-4 py-2 rounded-xl transition"
              >
                {interviewQuestions.length > 0 ? 'Regenerate Questions' : 'Generate Questions'}
              </button>
            )}
          </div>

          {interviewQuestions.length === 0 && !isGeneratingKit && (
            <p className="text-xs text-slate-500 italic text-center py-4">Click generate above to produce automated evaluation metrics.</p>
          )}

          {isGeneratingKit && (
            <div className="flex flex-col items-center justify-center py-6 space-y-2">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-indigo-400">Evaluating text alignment schemas...</p>
            </div>
          )}

          {interviewQuestions.length > 0 && (
            <div className="space-y-4">
              {interviewQuestions.map((q, index) => (
                <div key={index} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-indigo-400">QUESTION {index + 1}</span>
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-medium italic">{q.target_skill}</span>
                  </div>
                  <h4 className="text-sm font-medium text-white">{q.question_text}</h4>
                  <p className="text-xs text-slate-400"><strong className="text-slate-300">Intent:</strong> {q.intent}</p>
                  
                  <div className="pt-2 mt-2 border-t border-slate-800 text-xs space-y-1">
                    <div className="text-emerald-400"><strong className="text-slate-300">Ideal Answer:</strong> {q.grading_rubric?.ideal}</div>
                    <div className="text-amber-400"><strong className="text-slate-300">Acceptable:</strong> {q.grading_rubric?.acceptable}</div>
                    <div className="text-red-400"><strong className="text-slate-300">Red Flags:</strong> {q.grading_rubric?.red_flag}</div>
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