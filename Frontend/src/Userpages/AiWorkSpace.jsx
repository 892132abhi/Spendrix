import React, { useEffect, useRef, useState } from 'react';

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
    <div className="min-h-screen w-full bg-[#0b0f19] text-slate-200 font-sans antialiased flex flex-col items-center">
      <div className="w-full max-w-3xl flex flex-col h-screen p-4 md:p-6">
        <header className="flex items-center justify-between border-b border-slate-800/60 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500 shadow-sm"></span>
            <h1 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Spendrix Workspace
            </h1>
          </div>

          {docText && (
            <button
              onClick={resetWorkspace}
              className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-1 rounded-md hover:text-red-400 hover:border-red-900/40 transition"
            >
              Clear Session
            </button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto py-6 space-y-6 scrollbar-thin">
          {!docText && !isUploading && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4 my-auto pt-20">
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

          {isUploading && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 pt-20">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-indigo-400 tracking-wide">
                  Processing document...
                </p>
                <p className="text-[10px] text-slate-600 italic">
                  Extracting PDF text for the AI workspace.
                </p>
              </div>
            </div>
          )}

          {docText &&
            chatHistory.map((chat, idx) => (
              <div
                key={`${chat.sender}-${idx}`}
                className={`flex w-full ${
                  chat.sender === 'USER' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-xl px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap transition-all shadow-sm ${
                    chat.sender === 'USER'
                      ? 'bg-indigo-600 text-white font-medium rounded-tr-none'
                      : 'bg-slate-900/80 text-slate-300 border border-slate-800/60 rounded-tl-none'
                  }`}
                >
                  {chat.text}
                </div>
              </div>
            ))}

          {isChatLoading && (
            <div className="flex justify-start">
              <div className="text-[10px] tracking-wide font-medium text-slate-400 bg-slate-900/40 px-3 py-2 rounded-lg border border-slate-800/40 flex items-center gap-2 animate-pulse">
                <span className="h-1 w-1 rounded-full bg-indigo-500 animate-ping"></span>
                AI is reading the document...
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        <footer className="pt-3 border-t border-slate-800/60 shrink-0">
          <form
            onSubmit={handleSendChatMessage}
            className="relative flex items-center bg-slate-900/60 rounded-xl border border-slate-800/80 p-1.5 focus-within:border-indigo-500/80 transition-all shadow-xl"
          >
            {docText && (
              <div className="absolute -top-7 left-1 flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 bg-indigo-950/50 border border-indigo-900/40 px-2 py-0.5 rounded-md">
                <span className="max-w-[180px] truncate">{fileName}</span>
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
              className="h-8 px-4 bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-slate-800 disabled:text-slate-600 rounded-lg text-xs font-bold transition shadow-md shrink-0"
            >
              Ask
            </button>
          </form>

          <p className="text-[9px] text-slate-600 text-center mt-2 tracking-wide">
            Spendrix AI Engine
          </p>
        </footer>
      </div>
    </div>
  );
}