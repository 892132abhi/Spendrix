import React, { useEffect, useRef, useState } from 'react';
import api from '../api/instance';

const TypingDots = () => (
  <div className="flex items-center gap-1.5 px-0.5 py-1">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        style={{ animationDelay: `${i * 0.18}s` }}
        className="block h-1.5 w-1.5 animate-[bounce_1.1s_ease-in-out_infinite] rounded-full bg-indigo-400 opacity-60"
      />
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
  const fileInputRef = useRef(null); // Ref used to programmatically trigger the hidden file selector

  // Hydration Engine: Triggers on Page Load & Mount using your Axios Interceptor
  useEffect(() => {
    const restoreSessionHistory = async () => {
      try {
        const response = await api.get('ai/workspace/history/');
        const data = response.data;

        if (data.messages && data.messages.length > 0) {
          setChatHistory(data.messages);
          setDocText('READY');

          if (data.filename) {
            setFileName(data.filename);
          }
        }
      } catch (err) {
        console.error("Failed to restore session history from MongoDB:", err);
      }
    };

    restoreSessionHistory();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isChatLoading]);

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
    setDocText(''); // Temporarily unmount active chat to show the loader panel cleanly

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('ai/workspace/upload/', formData, {
        headers: {
          'Content-Type': undefined,
        },
      });

      const data = response.data;
      setFileName(data.filename);
      setDocText('READY');

      // Append a fresh notification message context to the timeline indicating a clear document swap
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'AI',
          text: `System Notice: Successfully updated context with new file: ${file.name}.\n\nYou can now ask questions about this newly uploaded document.`,
        },
      ]);
    } catch (err) {
      console.error('Upload stream anomaly:', err);
      const errMsg = err.response?.data?.detail || err.response?.data?.error || 'Error reaching the AI ingestion microservice.';
      alert(errMsg);
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
    formData.append('filename', fileName);

    try {
      const response = await api.post('ai/workspace/chat/', formData);
      const data = response.data;

      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'AI',
          text: data.reply || 'No response returned.',
        },
      ]);
    } catch (err) {
      console.error('Chat engine link crash:', err);
      const errMsg = err.response?.data?.detail || 'Connection failed with the AI service.';
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'AI',
          text: errMsg,
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
    <div className="relative flex h-[calc(100vh-120px)] w-full flex-col overflow-hidden bg-[#070b13] font-sans text-slate-100 antialiased">
      {/* Ambient glass glows for top-tier visual aesthetics */}
      <div className="absolute -top-[10%] -left-[10%] h-[40vw] w-[40vw] rounded-full bg-indigo-650/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-[10%] -right-[10%] h-[40vw] w-[40vw] rounded-full bg-purple-650/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex w-full flex-1 flex-col overflow-hidden p-4 md:p-6 max-w-6xl mx-auto">

        {/* Header Block Panel */}
        <header className="flex shrink-0 items-center justify-between border-b border-slate-800/80 px-4 pb-4 bg-slate-900/10 backdrop-blur-md rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
              <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.982-11.795H14l1-5-8.982 11.795h5.813z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                Spendrix Workspace
              </h1>
              <p className="text-[9px] font-extrabold tracking-widest text-slate-500 uppercase">Context AI Terminal</p>
            </div>
          </div>
          {docText && (
            <button
              onClick={resetWorkspace}
              className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 px-3.5 py-2 text-xs font-bold text-rose-450 shadow-sm transition-all hover:bg-rose-500/10 hover:border-rose-500/30 hover:scale-[1.02] active:scale-98 cursor-pointer"
            >
              <svg className="h-3.5 w-3.5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear Session
            </button>
          )}
        </header>

        {/* Hidden Input element triggered programmatically by our paperclip button */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="application/pdf,.pdf"
          onChange={handleFileUpload}
        />

        {/* Dynamic Central Inner Scroll Panel */}
        <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-800 my-4 flex-1 overflow-y-auto pr-2 space-y-6">

          {/* State A: Upload Form Dashboard Card View */}
          {!docText && !isUploading && (
            <div className="mx-auto flex h-full max-w-lg animate-[fadeIn_0.3s_ease] flex-col items-center justify-center space-y-6 pt-16 text-center">
              <div className="space-y-2 max-w-md">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.08)] mb-2 animate-pulse">
                  <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h2 className="text-lg font-black tracking-tight text-white">
                  Upload Context Document
                </h2>
                <p className="text-xs leading-relaxed text-slate-400">
                  Upload a PDF resume, contract, or general documentation. Spendrix Workspace will extract the context to guide your interactive AI session.
                </p>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-10 shadow-lg transition-all duration-300 hover:border-indigo-500/50 hover:bg-slate-900/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.05)] cursor-pointer group"
              >
                <div className="mb-3 rounded-full bg-slate-800/50 p-3 text-slate-400 transition-all group-hover:bg-indigo-500/10 group-hover:text-indigo-400">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-slate-350 group-hover:text-indigo-400 transition-colors">
                  Select PDF Document
                </span>
                <span className="text-[10px] text-slate-500 mt-1">
                  Supported formats: PDF up to 10MB
                </span>
              </button>
            </div>
          )}

          {/* State B: Processing/Uploading Intermediary Loader Indicator */}
          {isUploading && (
            <div className="flex h-full animate-[fadeIn_0.3s_ease] flex-col items-center justify-center space-y-6 pt-16 text-center">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <div className="absolute inset-0 animate-ping rounded-full bg-indigo-500/10" />
                <div className="absolute inset-0 animate-[spin_1.2s_linear_infinite] rounded-full border-2 border-transparent border-t-indigo-500 border-b-purple-500" />
                <svg className="h-6 w-6 text-indigo-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold tracking-wide text-indigo-400">
                  Ingesting Document...
                </p>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  Extracting text layers, parsing tables, and synchronizing with the AI vector store.
                </p>
              </div>
            </div>
          )}

          {/* State C: Active Chat Dialogue Stream Render View */}
          {docText && chatHistory.map((chat, idx) => {
            const isSystemNotice = chat.text.startsWith("System Notice:");
            if (isSystemNotice) {
              return (
                <div key={`${chat.sender}-${idx}`} className="flex w-full justify-center px-4 py-2 animate-[fadeIn_0.2s_ease]">
                  <div className="flex items-center gap-2.5 rounded-2xl border border-indigo-500/15 bg-indigo-950/20 backdrop-blur-sm px-4 py-2.5 text-[11px] font-medium text-indigo-350 max-w-xl shadow-sm">
                    <svg className="h-4 w-4 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{chat.text}</span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={`${chat.sender}-${idx}`}
                className={`flex w-full animate-[fadeIn_0.2s_ease] px-2 ${chat.sender === 'USER' ? 'justify-end' : 'justify-start'
                  }`}
              >
                <div className={`flex gap-3 max-w-[80%] items-start ${chat.sender === 'USER' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar Icons */}
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-xs shadow-sm ${chat.sender === 'USER'
                      ? 'bg-slate-900 border-slate-800 text-slate-350'
                      : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-450'
                    }`}>
                    {chat.sender === 'USER' ? (
                      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    ) : (
                      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    )}
                  </div>

                  <div
                    className={`rounded-2xl px-4 py-3.5 text-xs leading-relaxed whitespace-pre-wrap shadow-sm transition-all duration-300 ${chat.sender === 'USER'
                        ? 'rounded-tr-none bg-gradient-to-br from-indigo-650 to-violet-750 text-white font-medium shadow-indigo-500/5'
                        : 'rounded-tl-none border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm text-slate-250'
                      }`}
                  >
                    {chat.text}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Chat Engine Generating Response Bubble Panel Loading State */}
          {isChatLoading && (
            <div className="flex justify-start px-2 animate-[fadeIn_0.2s_ease]">
              <div className="flex gap-3 max-w-[80%] items-start">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="rounded-2xl rounded-tl-none border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm px-4 py-4 shadow-sm">
                  <TypingDots />
                </div>
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Footer Area Controls Component Form Bar */}
        <footer className="shrink-0 border-t border-slate-800/60 px-2 pt-2 pb-2 bg-slate-900/5 rounded-b-3xl">
          <form
            onSubmit={handleSendChatMessage}
            className="relative mx-auto flex max-w-3xl items-center rounded-2xl border border-slate-800/90 bg-slate-900/60 p-2 shadow-2xl transition-all duration-300 focus-within:border-indigo-500/40 focus-within:ring-1 focus-within:ring-indigo-500/20"
          >
            {docText && (
              <div className="absolute -top-7.5 left-2 flex items-center gap-1.5 rounded-lg border border-indigo-500/15 bg-indigo-950/70 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-indigo-350 shadow-md animate-[fadeIn_0.2s_ease]">
                <svg className="h-3.5 w-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="max-w-[200px] truncate">{fileName}</span>
              </div>
            )}

            {/* Paperclip Button */}
            {docText && (
              <button
                type="button"
                disabled={isChatLoading}
                onClick={() => fileInputRef.current?.click()}
                title="Upload a different resume"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-800 hover:text-indigo-400 disabled:opacity-40 cursor-pointer"
              >
                <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.415 6.414a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
            )}

            {/* Input Element */}
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={docText ? 'Ask anything about the uploaded document...' : 'Upload a PDF first...'}
              disabled={!docText || isChatLoading}
              className="flex-1 bg-transparent px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none disabled:opacity-30"
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!docText || isChatLoading || !messageInput.trim()}
              className="flex h-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white shadow-md transition-all hover:bg-indigo-550 hover:scale-[1.02] active:scale-98 disabled:bg-slate-850 disabled:text-slate-550 disabled:scale-100 cursor-pointer"
            >
              <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Ask
            </button>
          </form>
          <p className="mt-3.5 text-center text-[8px] font-extrabold uppercase tracking-widest text-slate-600">
            Spendrix Workspace Neural Engine
          </p>
        </footer>
      </div>
    </div>
  );
}