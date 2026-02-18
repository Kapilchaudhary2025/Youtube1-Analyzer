import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Mail, Activity, ArrowUpRight } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const StatCard = ({ label, value, icon: Icon, color, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="bg-card/80 dark:bg-card/40 backdrop-blur-sm border border-gray-100 dark:border-white/5 p-6 rounded-2xl shadow-sm dark:shadow-none"
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon className={color.replace('bg-', 'text-')} size={24} />
      </div>
      {/* Mini chart placeholder */}
      <div className="flex gap-0.5 items-end h-8 opacity-30">
        <div className="w-1 h-3 bg-white rounded-t" />
        <div className="w-1 h-5 bg-white rounded-t" />
        <div className="w-1 h-4 bg-white rounded-t" />
        <div className="w-1 h-7 bg-white rounded-t" />
      </div>
    </div>
    <div className="text-3xl font-bold font-mono mb-1">{value}</div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </motion.div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({ total_analyzed: 0, emails_sent: 0, virality_rate: 0 });
  const [topTrend, setTopTrend] = useState(null);

  const fetchData = () => {
    axios.get(`${API_URL}/stats`).then(res => setStats(res.data)).catch(console.error);
    axios.get(`${API_URL}/trends?limit=1`).then(res => {
        if (res.data && res.data.length > 0) {
            setTopTrend(res.data[0]);
        }
    }).catch(console.error);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Auto-refresh every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Creator</span>
        </h1>
        <p className="text-muted-foreground">System is active. Monitoring YouTube India trends in real-time.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard 
          label="Videos Analyzed" 
          value={stats.total_analyzed?.toLocaleString()} 
          icon={Activity} 
          color="bg-blue-500" 
          index={0} 
        />
        <StatCard 
          label="Emails Sent" 
          value={stats.emails_sent} 
          icon={Mail} 
          color="bg-green-500" 
          index={1} 
        />
        <StatCard 
          label="Avg Viral Score" 
          value={`${stats.virality_rate}%`} 
          icon={TrendingUp} 
          color="bg-purple-500" 
          index={2} 
        />
      </div>

      {/* Hero Section / Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="p-8 rounded-3xl bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-white/10 relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/30 transition-colors duration-700" />
            
            <div className="relative z-10">
                <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold mb-4 border border-blue-500/20">
                    FEATURED
                </span>
                <h3 className="text-2xl font-bold mb-2 text-white">Analyze Your Next Video</h3>
                <p className="text-gray-300 mb-6 max-w-sm">
                    Paste your video URL to get AI-powered predictions on hook retention and viral probability.
                </p>
                <a href="/analyze" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-black font-semibold hover:scale-105 active:scale-95 transition-all">
                    Start Analysis <ArrowUpRight size={18} />
                </a>
            </div>
        </motion.div>

        {/* Featured Trend */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-8 rounded-3xl bg-card/50 dark:bg-card/60 backdrop-blur-md border border-gray-100 dark:border-white/5 flex flex-col justify-center shadow-lg dark:shadow-none"
        >
             <h3 className="text-xl font-bold mb-4">Recent Top Trend</h3>
             {topTrend ? (
                 <div className="bg-white dark:bg-black/30 rounded-xl p-4 flex gap-4 items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-black/50 transition-colors shadow-sm dark:shadow-none" onClick={() => window.open(`https://youtu.be/${topTrend.video_id}`, '_blank')}>
                    <img src={topTrend.thumbnail_url} alt={topTrend.title} className="w-20 h-14 object-cover rounded-lg" />
                    <div>
                        <h4 className="font-bold text-sm line-clamp-1 text-foreground">{topTrend.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span>{topTrend.view_count?.toLocaleString()} views</span>
                            <span className="text-green-600 dark:text-green-400 font-mono">Score: {Math.round(topTrend.engagement_score)}</span>
                        </div>
                    </div>
                 </div>
             ) : (
                 <div className="text-sm text-muted-foreground mt-4 text-center">
                    {stats.total_analyzed > 0 ? "Loading top trend..." : "No analysis data yet. Click 'Run Analysis Now' in sidebar."}
                 </div>
             )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
