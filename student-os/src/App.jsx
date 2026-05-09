import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import SurvivalPlanRenderer from './components/SurvivalPlanRenderer';
import SurvivalToolbox from './components/SurvivalToolbox';
import { Loader2, AlertTriangle, Send, Trash2 } from 'lucide-react';
import UploadZone from './components/UploadZone';
import { analyzeContent } from './utils/ApiUtils';

function App() {
  const [isCooked, setIsCooked] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [chatInput, setChatInput] = useState('');
  
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, loading]);

  const handleSubmit = async (text, file) => {
    if (!text.trim() && !file) {
      setError("Please provide some text or upload a file.");
      return;
    }
    
    setError(null);
    setLoading(true);

    const newUserMsg = { role: 'user', text, fileData: file };
    const newHistory = [...chatHistory, newUserMsg];
    setChatHistory(newHistory);

    // Clear inputs
    setTextInput('');
    setChatInput('');
    setSelectedFile(null);

    try {
      const responseText = await analyzeContent(newHistory, isCooked);
      setChatHistory(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setChatHistory([]);
    setError(null);
    setTextInput('');
    setChatInput('');
    setSelectedFile(null);
  };

  const themeColors = {
    bg: isCooked ? 'bg-gradient-to-br from-red-950 via-slate-900 to-red-950' : 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950',
    primary: isCooked ? 'text-red-500' : 'text-indigo-400',
    border: isCooked ? 'border-red-500/30' : 'border-white/20',
    ring: isCooked ? 'ring-2 ring-red-500/50' : 'ring-2 ring-white/20',
    accent: isCooked ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700',
    glow: isCooked ? 'shadow-[0_0_30px_-5px_rgba(220,38,38,0.3)]' : 'shadow-[0_0_30px_-5px_rgba(255,255,255,0.1)]',
    card: isCooked ? 'bg-red-500/10 backdrop-blur-md shadow-xl border border-red-500/30' : 'bg-white/10 backdrop-blur-md shadow-xl border border-white/20',
  };

  // Find the first model response to use for flashcards context
  const firstModelMessage = chatHistory.find(m => m.role === 'model');

  return (
    <div className={`min-h-screen flex flex-col ${themeColors.bg} text-slate-200 font-sans transition-colors duration-500 overflow-hidden`}>
      {/* Header */}
      <header className={`border-b ${themeColors.border} bg-black/20 backdrop-blur-md z-10 shrink-0`}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isCooked ? 'bg-red-500/20' : 'bg-white/10'}`}>
               {isCooked ? <AlertTriangle className="w-6 h-6 text-red-500 animate-pulse" /> : <div className="w-6 h-6 text-white font-bold text-xl leading-none">OS</div>}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">StudentOS</h1>
              <p className="text-xs text-slate-300">Transform academic chaos into a survival plan.</p>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-0 flex items-center space-x-4">
            {chatHistory.length > 0 && (
              <button 
                onClick={handleClearChat}
                className="text-xs font-medium text-slate-300 hover:text-white flex items-center px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Clear Chat
              </button>
            )}
            <div className={`flex items-center space-x-2 rounded-full px-3 py-1.5 border ${themeColors.card}`}>
              <span className={`text-sm font-medium ${isCooked ? 'text-red-400' : 'text-slate-300'}`}>
                I'm Cooked 💀
              </span>
              <button
                onClick={() => setIsCooked(!isCooked)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  isCooked ? 'bg-red-500' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isCooked ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 overflow-hidden flex flex-col gap-6">
        
        {/* Input Chaos (Hides when chat starts) */}
        <AnimatePresence>
          {chatHistory.length === 0 && (
            <motion.div 
              initial={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, display: 'none' }}
              className="shrink-0"
            >
              <div 
                className={`p-6 rounded-2xl ${themeColors.card} ${themeColors.glow} transition-all duration-500`}
              >
                <h2 className="text-lg font-semibold mb-4 flex items-center text-white">
                  1. Input Chaos
                </h2>
                
                <UploadZone 
                  onFileSelect={setSelectedFile} 
                  selectedFile={selectedFile} 
                  clearFile={() => setSelectedFile(null)}
                  isCooked={isCooked}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 block">
                    Or Paste Text (Syllabus, announcements, emails)
                  </label>
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Paste your terrifying 10-page syllabus here..."
                    className={`w-full h-32 px-4 py-3 bg-black/20 border rounded-xl focus:outline-none focus:ring-2 resize-none transition-colors backdrop-blur-sm ${
                      isCooked 
                        ? 'border-red-500/30 focus:ring-red-500/50 focus:border-red-500 text-white placeholder-red-200/50' 
                        : 'border-white/20 focus:ring-white/50 focus:border-white/50 text-white placeholder-slate-400'
                    }`}
                  />
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg flex items-start text-red-200 text-sm backdrop-blur-md">
                    <AlertTriangle className="w-5 h-5 mr-2 shrink-0 mt-0.5 text-red-400" />
                    <p>{error}</p>
                  </div>
                )}

                <button
                  onClick={() => handleSubmit(textInput, selectedFile)}
                  disabled={loading}
                  className={`w-full mt-6 py-3.5 px-4 rounded-xl font-bold text-white transition-all transform active:scale-95 flex items-center justify-center space-x-2 ${themeColors.accent} disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Negotiating with Profs...</span>
                    </>
                  ) : (
                    <span>{isCooked ? 'SAVE ME (EMERGENCY)' : 'Analyze & Save Me'}</span>
                  )}
                </button>
                
                <button 
                  onClick={() => setTextInput(`COURSE: Advanced Chaos Theory & Caffeine Dependency (ACT-402)\n\nUPCOMING EXAMS:\n1. Midterm Massacre - May 15th (Covers Chapters 1-12, 40% of grade)\n2. Surprise Quiz - May 20th (Cumulative, 15% of grade)\n3. Final Doomsday - June 5th (Must score >75% to pass the course)\n\nASSIGNMENTS:\n- Case Study: Why I didn't sleep - Due May 12th (5,000 words minimum)\n- Group Project: Fixing a broken calculator - Due May 25th (Peer review will be brutal)\n\nAttendance is mandatory but we know you won't come. Good luck.`)}
                  className="mt-4 text-xs text-slate-400 hover:text-white transition-colors underline underline-offset-4 decoration-white/30 hover:decoration-white block text-center w-full"
                >
                  Use Sample Syllabus
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Survival Plan / Main Chat Window */}
        <div className="flex-1 flex flex-col w-full relative">
          <div 
            className={`flex-1 flex flex-col rounded-2xl ${themeColors.card} transition-all duration-500 overflow-hidden relative shadow-2xl`}
          >
            {/* Empty State */}
            {chatHistory.length === 0 && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center space-y-4 p-8">
                <div className={`p-4 rounded-full ${isCooked ? 'bg-red-500/10' : 'bg-white/10'} border border-white/5`}>
                  <AlertTriangle className={`w-12 h-12 ${isCooked ? 'text-red-400' : 'text-white/50'}`} />
                </div>
                <p className="max-w-xs">
                  {isCooked 
                    ? "Waiting for input. We'll identify exactly what you need to pass." 
                    : "Upload your materials, and we'll extract deadlines and a study plan."}
                </p>
              </div>
            )}

            {/* Chat History Area */}
            {chatHistory.length > 0 && (
              <>
                {/* Floating Toolbox at the top of chat */}
                <div className="shrink-0 sticky top-0 z-10 bg-black/20 backdrop-blur-xl border-b border-white/10 p-4">
                   <SurvivalToolbox result={firstModelMessage?.text} isCooked={isCooked} />
                </div>

                <div className="flex-1 overflow-y-auto space-y-8 p-4 sm:p-6 custom-scrollbar pb-24">
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      {msg.role === 'user' ? (
                        <div className="max-w-[80%] bg-indigo-600/40 backdrop-blur-md border border-indigo-400/30 text-white rounded-2xl rounded-tr-sm px-5 py-3 shadow-lg">
                          {msg.fileData && (
                            <div className="mb-2 text-xs font-semibold text-indigo-200 inline-flex items-center bg-black/20 px-2 py-1 rounded">
                              📎 {msg.fileData.name || 'File attached'}
                            </div>
                          )}
                          <div className="whitespace-pre-wrap text-sm">{msg.text}</div>
                        </div>
                      ) : (
                        <div className="w-full">
                          <SurvivalPlanRenderer result={msg.text} isCooked={isCooked} />
                        </div>
                      )}
                    </div>
                  ))}

                  {loading && (
                    <div className="flex items-start">
                      <div className={`space-y-6 w-full max-w-2xl rounded-xl p-5 ${themeColors.card}`}>
                        <div className="flex items-center space-x-3 mb-4">
                          <Loader2 className={`w-5 h-5 animate-spin ${isCooked ? 'text-red-400' : 'text-white'}`} />
                          <span className="text-sm font-medium text-slate-300">
                            {isCooked ? "Calculating minimum viable effort..." : "Parsing academic jargon..."}
                          </span>
                        </div>
                        <div className="animate-pulse space-y-4">
                          <div className="h-4 bg-white/10 rounded-md w-1/3"></div>
                          <div className="h-4 bg-white/10 rounded-md w-full"></div>
                          <div className="h-4 bg-white/10 rounded-md w-5/6"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  {error && (
                    <div className="p-4 bg-red-500/20 border border-red-500/40 rounded-xl text-red-200 text-sm backdrop-blur-md flex items-start">
                      <AlertTriangle className="w-5 h-5 mr-3 shrink-0 text-red-400" />
                      <div>
                        <p className="font-bold mb-1">Emergency Error</p>
                        <p>{error}</p>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Sticky Chat Input Bar */}
                <div className={`absolute bottom-0 left-0 right-0 p-4 bg-black/40 backdrop-blur-xl border-t ${themeColors.border}`}>
                  <div className="w-full flex items-center space-x-2 relative">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit(chatInput, null);
                        }
                      }}
                      placeholder="Ask a follow-up or report a panic moment..."
                      className={`flex-1 px-4 py-3 bg-black/20 backdrop-blur-sm border rounded-full focus:outline-none focus:ring-2 transition-colors text-sm shadow-inner ${
                        isCooked ? 'border-red-500/30 focus:ring-red-500/50 text-white placeholder-red-200/50' : 'border-white/20 focus:ring-white/50 text-white placeholder-slate-400'
                      }`}
                    />
                    <button
                      onClick={() => handleSubmit(chatInput, null)}
                      disabled={loading || !chatInput.trim()}
                      className={`p-3 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 shadow-lg ${
                        isCooked ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
      </main>
    </div>
  );
}

export default App;
