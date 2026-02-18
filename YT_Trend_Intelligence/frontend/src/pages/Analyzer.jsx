import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Analyzer = () => {
  const [url, setUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!url) return;

    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
        const response = await axios.post(`${API_URL}/analyze`, { url });
        // Simulate a bit of "AI thinking" delay for effect if response is too fast
        setTimeout(() => {
             setResult(response.data);
             setAnalyzing(false);
        }, 1500);
    } catch (err) {
        setError("Could not analyze video. Is the URL correct?");
        setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI Video Intelligence
        </h1>
        <p className="text-gray-400 text-lg">
            Decode the psychology behind viral videos.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative z-20 mb-12">
        <div className="absolute inset-0 bg-blue-500/20 blur-3xl opacity-20 rounded-full" />
        <form onSubmit={handleAnalyze} className="relative flex items-center gap-2 p-2 bg-[#1E1E24]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
            <Search className="ml-4 text-gray-400" size={24} />
            <input 
                type="text" 
                placeholder="Paste YouTube Video URL here..." 
                className="flex-1 bg-transparent border-none outline-none text-lg px-4 py-3 placeholder-gray-500 text-white"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
            />
            <button 
                disabled={analyzing}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
                {analyzing ? (
                    <>
                        <Sparkles size={18} className="animate-spin" /> Analyzing
                    </>
                ) : (
                    <> Analyze </>
                )}
            </button>
        </form>
      </div>

      {/* Results View */}
      <AnimatePresence>
        {result && (
            <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
                {/* Score Card */}
                <div className="md:col-span-1 bg-[#1E1E24]/60 backdrop-blur-md border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />
                     <div className="w-40 h-40 rounded-full border-8 border-blue-500/20 flex items-center justify-center mb-6 relative">
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                           <circle 
                              cx="80" cy="80" r="72" 
                              stroke="currentColor" strokeWidth="8" fill="transparent" 
                              className="text-blue-500"
                              strokeDasharray={452}
                              strokeDashoffset={452 - (452 * result.viral_score) / 100}
                              strokeLinecap="round"
                           />
                        </svg>
                        <div className="text-4xl font-bold font-mono">{result.viral_score}</div>
                     </div>
                     <h3 className="text-xl font-bold mb-2">Viral Score</h3>
                     <p className="text-sm text-gray-400">Based on engagement velocity & sentiment</p>
                </div>

                {/* Insights */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-[#1E1E24]/60 backdrop-blur-md border border-white/5 rounded-3xl p-8">
                        <div className="flex items-center gap-3 mb-6">
                             <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                                <Sparkles size={20} />
                             </div>
                             <h3 className="text-xl font-bold">AI Insights</h3>
                        </div>

                        <ul className="space-y-4">
                             <li className="flex gap-4">
                                <CheckCircle className="text-green-400 shrink-0 mt-1" size={18} />
                                <div>
                                    <h4 className="font-bold text-gray-300">Why it's trending</h4>
                                    <p className="text-gray-400 text-sm mt-1">{result.ai_insights.why_trending}</p>
                                </div>
                             </li>
                             <li className="flex gap-4">
                                <CheckCircle className="text-blue-400 shrink-0 mt-1" size={18} />
                                <div>
                                    <h4 className="font-bold text-gray-300">Emotional Trigger</h4>
                                    <p className="text-gray-400 text-sm mt-1">{result.ai_insights.emotional_trigger}</p>
                                </div>
                             </li>
                             <li className="flex gap-4">
                                <CheckCircle className="text-orange-400 shrink-0 mt-1" size={18} />
                                <div>
                                    <h4 className="font-bold text-gray-300">Target Audience</h4>
                                    <p className="text-gray-400 text-sm mt-1">{result.ai_insights.audience}</p>
                                </div>
                             </li>
                        </ul>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
      
      {error && (
        <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-3">
             <AlertCircle size={20} />
             {error}
        </div>
      )}
    </div>
  );
};

export default Analyzer;
