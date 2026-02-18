import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Zap, Search, FileText, Settings, Menu, X, Sun, Moon, Monitor, PlayCircle, Power } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Dashboard from './pages/Dashboard';
import LiveTrends from './pages/LiveTrends';
import Analyzer from './pages/Analyzer';
import Reports from './pages/Reports';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const SidebarItem = ({ icon: Icon, label, path, active }) => {
  return (
    <Link to={path}>
      <motion.div 
        whileHover={{ x: 5 }}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-2 ${
          active 
          ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
          : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
        }`}
      >
        <Icon size={20} />
        <span className="font-medium text-sm">{label}</span>
      </motion.div>
    </Link>
  );
};

const ThemeSelector = () => {
    const { theme, setTheme } = useTheme();
    
    return (
        <div className="bg-gray-100 dark:bg-white/5 p-1 rounded-xl flex items-center justify-between">
            {['light', 'system', 'dark'].map((t) => (
                <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-all ${
                        theme === t 
                        ? 'bg-white dark:bg-[#1E1E24] text-primary shadow-sm' 
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                    }`}
                    title={`${t.charAt(0).toUpperCase() + t.slice(1)} Mode`}
                >
                    {t === 'light' && <Sun size={16} />}
                    {t === 'dark' && <Moon size={16} />}
                    {t === 'system' && <Monitor size={16} />}
                </button>
            ))}
        </div>
    );
};

const Layout = ({ children }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [botActive, setBotActive] = useState(true);
  const [running, setRunning] = useState(false);
  const [botLoading, setBotLoading] = useState(false);

  // Poll Bot Status
  useEffect(() => {
    const checkStatus = () => {
        axios.get(`${API_URL}/stats`)
            .then(res => setBotActive(res.data.bot_active !== false))
            .catch(err => console.error("Failed to fetch bot status", err));
    };
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleBot = async () => {
    setBotLoading(true);
    const newState = !botActive;
    try {
        await axios.post(`${API_URL}/settings`, { key: 'bot_active', value: newState ? '1' : '0' });
        setBotActive(newState);
    } catch (err) {
        console.error("Failed to toggle bot", err);
        alert("Failed to change bot status");
    } finally {
        setBotLoading(false);
    }
  };

  const triggerRun = async () => {
    if (running) return;
    setRunning(true);
    try {
        await axios.post(`${API_URL}/run-cycle`);
        alert("Cycle started! Check your email in ~30 seconds.");
    } catch (err) {
        alert("Failed to start cycle.");
    } finally {
        setTimeout(() => setRunning(false), 5000); 
    }
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Zap, label: 'Live Trends', path: '/trends' },
    { icon: Search, label: 'Analyzer', path: '/analyze' },
    { icon: FileText, label: 'Reports', path: '/reports' }, 
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-hidden transition-colors duration-300 font-sans">
      {/* Mobile Menu */}
      <button 
        className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-lg border border-border bg-card text-foreground"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -280 }}
        animate={{ x: mobileMenuOpen ? 0 : 0 }} 
        className={`fixed md:relative z-40 w-72 h-screen bg-card/80 backdrop-blur-xl border-r border-border p-6 flex flex-col
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} transition-transform duration-300 shadow-xl
        `}
      >
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Zap size={18} className="text-white" fill="currentColor" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            TrendIntel
          </h1>
        </div>

        {/* Run Now Button */}
        <button 
            onClick={triggerRun}
            disabled={running}
            className={`w-full mb-6 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm shadow-md transition-all
                ${running 
                    ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                    : 'bg-primary text-primary-foreground hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]'
                }
            `}
        >
            {running ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <PlayCircle size={18} />
            )}
            {running ? "Analyzing..." : "Run Analysis Now"}
        </button>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <SidebarItem 
              key={item.path} 
              {...item} 
              active={location.pathname === item.path} 
            />
          ))}
        </nav>

        {/* Controls Section */}
        <div className="mt-auto pt-6 border-t border-border space-y-5">
            
            {/* Bot Status - Clearer UI */}
            <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Automation</p>
                <div className={`p-4 rounded-xl border transition-all duration-300 ${
                    botActive 
                    ? 'bg-green-500/10 border-green-500/20' 
                    : 'bg-red-500/5 border-red-500/10'
                }`}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${botActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                            <span className={`text-sm font-bold ${botActive ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                                {botActive ? 'RUNNING' : 'STOPPED'}
                            </span>
                        </div>
                        <button 
                            onClick={toggleBot}
                            disabled={botLoading}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors
                                ${botActive 
                                    ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-500/10 dark:text-red-400' 
                                    : 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-500/10 dark:text-green-400'
                                }
                            `}
                        >
                            {botLoading ? '...' : (botActive ? 'STOP' : 'START')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Theme Selector */}
            <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Appearance</p>
                <ThemeSelector />
            </div>
            
            <div className="flex items-center gap-3 px-2 py-2 opacity-50">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500" />
                <p className="text-sm font-medium text-foreground">Admin</p>
            </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto overflow-x-hidden relative bg-background transition-colors duration-300">
        {/* Background Gradient Effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 p-6 md:p-10 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/trends" element={<LiveTrends />} />
            <Route path="/analyze" element={<Analyzer />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
