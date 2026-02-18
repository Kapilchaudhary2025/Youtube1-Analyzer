import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, ExternalLink, Calendar, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const res = await axios.get(`${API_URL}/reports`);
            setReports(res.data);
        } catch (err) {
            console.error("Failed to fetch reports", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Trend Reports</h2>
                <p className="text-gray-500 dark:text-gray-400">History of viral alerts sent to your email.</p>
            </div>

            {loading ? (
                 <div className="space-y-4">
                    {[1,2,3].map(i => (
                        <div key={i} className="h-24 bg-gray-200 dark:bg-white/5 rounded-xl animate-pulse" />
                    ))}
                 </div>
            ) : (
                <div className="bg-white dark:bg-[#1E1E24]/40 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
                    {reports.length === 0 ? (
                        <div className="p-10 text-center text-gray-500">No reports generated yet.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-white/5 text-gray-400 text-xs uppercase tracking-wider font-semibold">
                                    <tr>
                                        <th className="p-4">Trend</th>
                                        <th className="p-4 hidden md:table-cell">Metrics</th>
                                        <th className="p-4 hidden md:table-cell">Type</th>
                                        <th className="p-4">Time Sent</th>
                                        <th className="p-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {reports.map((report, idx) => (
                                        <motion.tr 
                                            key={report.video_id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <img 
                                                        src={report.thumbnail_url} 
                                                        alt="" 
                                                        className="w-16 h-10 object-cover rounded-md bg-gray-700"
                                                    />
                                                    <div className="max-w-[200px] md:max-w-xs">
                                                        <div className="font-semibold text-sm line-clamp-1 text-gray-900 dark:text-white">{report.title}</div>
                                                        <div className="text-xs text-gray-500">{report.channel_title}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 hidden md:table-cell">
                                                <div className="text-sm">
                                                    <span className="font-mono">{report.view_count?.toLocaleString()}</span> views
                                                </div>
                                                <div className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                                                    Score: {Math.round(report.engagement_score)}
                                                </div>
                                            </td>
                                            <td className="p-4 hidden md:table-cell">
                                                <span className={`px-2 py-1 rounded text-xs font-medium 
                                                    ${report.trend_type?.includes('Fire') || report.trend_type?.includes('Exploding') 
                                                        ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' 
                                                        : 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                                                    }`}
                                                >
                                                    {report.trend_type || 'Trending'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-1.5">
                                                    <CheckCircle size={14} className="text-green-500" />
                                                    {new Date(report.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </div>
                                                <div className="text-xs opacity-60">
                                                     {new Date(report.timestamp).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <a 
                                                    href={`https://youtu.be/${report.video_id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-blue-500 hover:text-white transition-all text-gray-400"
                                                >
                                                    <ExternalLink size={16} />
                                                </a>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Reports;
