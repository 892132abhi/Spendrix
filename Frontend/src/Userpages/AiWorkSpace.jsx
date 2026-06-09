import React, { useEffect, useRef, useState } from 'react';

// Reusable Typing Animation Dots Component
const TypingDots = () => (
  <div style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '4px 2px' }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{
        width: 6, height: 6, borderRadius: '50%',
        background: '#a78bfa', display: 'block',
        animation: `typingBounce 1.1s ease-in-out ${i * 0.18}s infinite`,
        opacity: 0.5,
      }} />
    ))}
  </div>
);

export default function WorkspacePage() {
  const [docText, setDocText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [chatHistory, setChatHistory] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const chatBottomRef = useRef(null);
  const AI_SERVICE_BASE = '/ai/workspace';

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isChatLoading]);

  const readResponse = async (response) => {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      return response.json();
    }

    const text = await response.text();
    return {
      detail: text || `Request failed with status ${response.status}`,
    };
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please upload a PDF file.');
      e.target.value = '';
      return;
    }

    setFileName(file.name);
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${AI_SERVICE_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await readResponse(response);

      if (!response.ok) {
        alert(data.detail || 'File processing failed.');
        resetWorkspace();
        return;
      }

      setDocText(data.extracted_text || '');
      setChatHistory([
        {
          sender: 'AI',
          text: `System Notice: Successfully processed ${file.name}.\n\nAsk me anything about the uploaded document.`,
        },
      ]);
    } catch (err) {
      console.error('Upload stream anomaly:', err);
      alert('Error reaching the AI ingestion microservice.');
      resetWorkspace();
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();

    const userQuery = messageInput.trim();
    if (!userQuery || isChatLoading || !docText) return;

    setMessageInput('');
    setChatHistory((prev) => [...prev, { sender: 'USER', text: userQuery }]);
    setIsChatLoading(true);

    const formData = new FormData();
    formData.append('message', userQuery);
    formData.append('doc_text', docText);

    try {
      const response = await fetch(`${AI_SERVICE_BASE}/message`, {
        method: 'POST',
        body: formData,
      });

      const data = await readResponse(response);

      if (!response.ok) {
        setChatHistory((prev) => [
          ...prev,
          {
            sender: 'AI',
            text: data.detail || 'Error processing this message.',
          },
        ]);
        return;
      }

      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'AI',
          text: data.reply || 'No response returned.',
        },
      ]);
    } catch (err) {
      console.error('Chat engine link crash:', err);
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'AI',
          text: 'Connection failed with the AI service.',
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const resetWorkspace = () => {
    setDocText('');
    setFileName('');
    setChatHistory([]);
    setMessageInput('');
  };

  return (
    <div className="h-screen w-full bg-[#0b0f19] text-slate-200 font-sans antialiased flex flex-col overflow-hidden">
      {/* ── SEAMLESS HOOK LAYOUT STYLE KEYFRAMES ── */}
      <style>{`
        @keyframes typingBounce {
          0%,60%,100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes uploadPulse {
          0%,100% { opacity: 0.6; } 50% { opacity: 1; }
        }
        .msg-bubble { animation: fadeIn 0.2s ease; }
        
        /* Fixed scrollbar adjustments to use native track sizing safely */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e1e2e; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2a2a3d; }
      `}</style>

      {/* Main Full-Width Wrapper Dashboard Container */}
      <div className="w-full flex flex-col h-full p-4 md:p-6 overflow-hidden">
        
        {/* Header Block Panel */}
        <header className="flex items-center justify-between border-b border-slate-800/60 pb-3 px-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500 shadow-sm animate-pulse"></span>
            <h1 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Spendrix Workspace
            </h1>
          </div>

          {docText && (
            <button
              onClick={resetWorkspace}
              className="text-[10px] font-semibold bg-slate-900 border border-slate-800 text-slate-400 px-3 py-1.5 rounded-md hover:text-red-400 hover:border-red-900/40 transition-all shadow-sm"
            >
              Clear Session
            </button>
          )}
        </header>

        {/* Dynamic Inner Central Feed Workspace View */}
        <div className="flex-1 overflow-y-auto my-4 pr-1 space-y-6 custom-scrollbar">
          
          {/* State A: Upload Form Dashboard Card View */}
          {!docText && !isUploading && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4 pt-20 msg-bubble">
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-white tracking-wide">
                  Upload Context Document
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Upload a PDF resume or document. The AI workspace will extract the text and prepare it for chat.
                </p>
              </div>

              <label className="w-full border border-dashed border-slate-800/80 hover:border-indigo-500/50 bg-slate-900/20 rounded-xl p-8 cursor-pointer transition flex flex-col items-center justify-center group shadow-md">
                <svg
                  className="w-6 h-6 text-slate-500 group-hover:text-indigo-400 mb-2 transition"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v12m6-6H6"
                  />
                </svg>
                <span className="text-xs font-semibold text-slate-300">
                  Select PDF Document
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="application/pdf,.pdf"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          )}

          {/* State B: Processing/Uploading Intermediary Loader Indicator */}
          {isUploading && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 pt-20 msg-bubble">
              <div style={{ position: 'relative', width: 48, height: 48 }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  border: '2px solid #1e1e2e',
                  borderTop: '2px solid #6366f1',
                  borderRadius: '50%',
                  animation: 'spin 0.9s linear infinite',
                }} />
                <div style={{
                  position: 'absolute', inset: 6,
                  border: '1.5px solid rgba(99,102,241,0.1)',
                  borderBottom: '1.5px solid #6366f1',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite reverse',
                }} />
              </div>
              <div className="space-y-0.5">
                <p 
                  style={{ animation: 'uploadPulse 1.5s ease infinite' }}
                  className="text-xs font-semibold text-indigo-400 tracking-wide"
                >
                  Processing document...
                </p>
                <p className="text-[10px] text-slate-600 italic">
                  Extracting PDF text for the AI workspace.
                </p>
              </div>
            </div>
          )}

          {/* State C: Active Chat Dialogue Stream Render View */}
          {docText &&
            chatHistory.map((chat, idx) => (
              <div
                key={`${chat.sender}-${idx}`}
                className={`flex w-full msg-bubble px-2 ${
                  chat.sender === 'USER' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-xl px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap transition-all shadow-sm ${
                    chat.sender === 'USER'
                      ? 'bg-indigo-600 text-white font-medium rounded-tr-none shadow-md shadow-indigo-600/10'
                      : 'bg-slate-900/80 text-slate-300 border border-slate-800/60 rounded-tl-none'
                  }`}
                >
                  {chat.text}
                </div>
              </div>
            ))}

          {/* Chat Engine Generating Response Bubble Panel Loading State */}
          {isChatLoading && (
            <div className="flex justify-start msg-bubble px-2">
              <div className="bg-slate-900/80 border border-slate-800/60 rounded-xl rounded-tl-none px-4 py-3.5 shadow-sm flex items-center justify-center">
                <TypingDots />
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Footer Area Controls Component Form Bar */}
        <footer className="pt-3 border-t border-slate-800/60 shrink-0 px-2">
          <form
            onSubmit={handleSendChatMessage}
            className="relative flex items-center bg-slate-900/60 rounded-xl border border-slate-800/80 p-2 focus-within:border-indigo-500/80 transition-all shadow-xl"
          >
            {docText && (
              <div className="absolute -top-7 left-1 flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 bg-indigo-950/50 border border-indigo-900/40 px-2 py-0.5 rounded-md shadow-sm">
                <span className="max-w-[240px] truncate">{fileName}</span>
              </div>
            )}

            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={
                docText
                  ? 'Ask anything about the uploaded document...'
                  : 'Upload a PDF first...'
              }
              disabled={!docText || isChatLoading}
              className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none disabled:opacity-30"
            />

            <button
              type="submit"
              disabled={!docText || isChatLoading || !messageInput.trim()}
              className="h-8 px-4 bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-slate-800 disabled:text-slate-600 rounded-lg text-xs font-bold transition shadow-md shrink-0 flex items-center justify-center"
            >
              Ask
            </button>
          </form>

          <p className="text-[9px] text-slate-600 text-center mt-2.5 tracking-wider uppercase font-medium">
            Spendrix AI Engine
          </p>
        </footer>
      </div>
    </div>
  );
}