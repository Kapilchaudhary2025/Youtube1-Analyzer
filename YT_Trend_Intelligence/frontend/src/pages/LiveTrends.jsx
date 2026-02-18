import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, TrendingUp, Clock, Play } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const TrendCard = ({ video, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5, scale: 1.01 }}
      className="group relative bg-card dark:bg-card/70 backdrop-blur-md border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all duration-300 shadow-sm hover:shadow-lg dark:hover:shadow-blue-500/10"
    >
      {/* Image Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
         <img 
            src={video.thumbnail_url} 
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
         />
         <div className="absolute top-3 right-3 z-20 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-xs font-mono border border-white/10 text-white">
            {video.duration || '00:00'}
         </div>
      </div>

      {/* Content */}
      <div className="relative z-20 p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
            ${video.trend_type?.includes('Exploding') ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-500/20' : 
              video.trend_type?.includes('Fast') ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20' : 
              'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20'}
          `}>
            {video.trend_type || 'Trending'}
          </span>
          <span className="text-xs text-gray-500 ml-auto flex items-center gap-1">
             <Clock size={12} /> {video.hours_since_upload}h ago
          </span>
        </div>

        <h3 className="text-lg font-bold leading-tight mb-2 line-clamp-2 text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {video.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">{video.channel_title}</p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
           <div className="flex items-center gap-3">
              <div className="flex flex-col">
                 <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Views</span>
                 <span className="text-sm font-bold font-mono text-foreground">{video.view_count?.toLocaleString()}</span>
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Score</span>
                 <span className="text-sm font-bold font-mono text-green-600 dark:text-green-400">{Math.round(video.engagement_score)}</span>
              </div>
           </div>
           
           <a 
             href={`https://youtu.be/${video.video_id}`} 
             target="_blank" 
             rel="noopener noreferrer"
             className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform"
           >
             <Play size={18} fill="currentColor" />
           </a>
         </div>
       </div>
     </motion.div>
   );
};

const LiveTrends = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        fetchTrends();
        const interval = setInterval(fetchTrends, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, [filter]);

    const fetchTrends = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/trends?category=${filter}`);
            setVideos(response.data);
        } catch (error) {
            console.error("Failed to fetch trends", error);
        } finally {
            setLoading(false);
        }
    };

    const categories = ['All', 'Gaming', 'Technology', 'News & Politics', 'Entertainment'];

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
               <div>
                  <h2 className="text-3xl font-bold mb-1">Live Trends</h2>
                  <p className="text-gray-400">Real-time viral video tracking across India.</p>
               </div>
               
               <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                  {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                            ${filter === cat 
                                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-foreground border border-white/5'}
                        `}
                      >
                        {cat}
                      </button>
                  ))}
               </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="bg-white/5 rounded-2xl h-80 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((video, idx) => (
                        <TrendCard key={video.video_id} video={video} index={idx} />
                    ))}
                    {videos.length === 0 && (
                        <div className="col-span-full py-20 text-center text-gray-500">
                            No trending videos found for this category.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LiveTrends;
