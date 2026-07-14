import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../services/supabase';
import {
  HiMenu, HiX, HiSun, HiMoon, HiBell, HiUser,
  HiLogout, HiCloud, HiShieldExclamation,
  HiChartBar, HiQuestionMarkCircle,
} from 'react-icons/hi';

const navLinks = [
  { path: '/', label: 'Home', icon: HiCloud },
  { path: '/dashboard', label: 'Dashboard', icon: HiCloud },
  { path: '/alerts', label: 'Alerts', icon: HiShieldExclamation },
  { path: '/weather-map', label: 'Weather Map', icon: HiChartBar },
];

const Navbar = () => {
  const { profile, isAuthenticated, isAdmin, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsOpen(false); setShowProfile(false); }, [location]);

  // Fetch unread alerts count
  useEffect(() => {
    if (profile?.id) {
      const fetchUnread = async () => {
        try { const { count } = await supabase.from('alerts').select('*', { count: 'exact', head: true }).eq('user_id', profile.id).eq('is_read', false); setUnreadAlerts(count || 0); }
        catch (err) { console.error(err); }
      };
      fetchUnread();
      const interval = setInterval(fetchUnread, 30000);
      return () => clearInterval(interval);
    }
  }, [profile?.id]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowProfile(false);
        setIsOpen(false);
      }
    };
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg' : 'bg-transparent'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all"><span className="text-white text-xl">🌤️</span></div>
            <div className="hidden sm:block"><h1 className="text-lg font-bold text-gradient">Weather Alert</h1><p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">For Farmers</p></div>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link key={link.path} to={isAuthenticated || link.path === '/' ? link.path : '/login'}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-1.5 ${
                  isActive(link.path) ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                <link.icon className="w-4 h-4" /><span>{link.label}</span>
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <button onClick={toggleTheme} aria-label="Toggle dark mode" className="p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
              {isDark ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <>
                <Link to="/alerts" aria-label={`Alerts${unreadAlerts > 0 ? ` (${unreadAlerts} unread)` : ''}`} className="relative p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                  <HiBell className="w-5 h-5" />
                  {unreadAlerts > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">{unreadAlerts > 9 ? '9+' : unreadAlerts}</span>}
                </Link>

                <div className="relative" ref={profileRef}>
                  <button onClick={() => setShowProfile(!showProfile)} aria-label="User menu" aria-expanded={showProfile} aria-haspopup="true" className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                      {profile?.name?.charAt(0)?.toUpperCase() || 'F'}
                    </div>
                  </button>
                  <AnimatePresence>
                    {showProfile && (
                      <motion.div initial={{opacity:0,scale:0.95,y:-10}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95,y:-10}} className="absolute right-0 mt-2 w-64 glass-card p-2 shadow-xl">
                        <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                          <p className="font-semibold text-gray-800 dark:text-gray-200">{profile?.name}</p>
                          <span className="badge-info mt-1 inline-block">{profile?.village || profile?.email}</span>
                        </div>
                        <div className="py-1">
                          <Link to="/profile" className="flex items-center space-x-2 px-3 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><HiUser className="w-4 h-4" /><span>Profile</span></Link>
                          {isAdmin && <Link to="/admin" className="flex items-center space-x-2 px-3 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><HiShieldExclamation className="w-4 h-4" /><span>Admin Panel</span></Link>}
                          <Link to="/help" className="flex items-center space-x-2 px-3 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><HiQuestionMarkCircle className="w-4 h-4" /><span>Help</span></Link>
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-1">
                          <button onClick={() => { logout(); navigate('/'); }}
                            className="flex items-center space-x-2 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg w-full"><HiLogout className="w-4 h-4" /><span>Logout</span></button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link to="/login" className="btn-secondary !py-2 !px-4 text-sm">Login</Link>
                <Link to="/register" className="btn-primary !py-2 !px-4 text-sm">Register</Link>
              </div>
            )}

            <button onClick={() => setIsOpen(!isOpen)} aria-label={isOpen ? 'Close menu' : 'Open menu'} aria-expanded={isOpen} aria-controls="mobile-menu" className="md:hidden p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
              {isOpen ? <HiX className="w-5 h-5" /> : <HiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div id="mobile-menu" initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} className="md:hidden glass-card mx-4 mb-4 overflow-hidden">
            <div className="p-4 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive(link.path) ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                  <link.icon className="w-5 h-5" /><span>{link.label}</span>
                </Link>
              ))}
              {!isAuthenticated && (
                <div className="flex space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link to="/login" className="btn-secondary flex-1 text-center !py-2.5 text-sm">Login</Link>
                  <Link to="/register" className="btn-primary flex-1 text-center !py-2.5 text-sm">Register</Link>
                </div>
              )}
              {isAuthenticated && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button onClick={() => { logout(); navigate('/'); }}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"><HiLogout className="w-5 h-5" /><span>Logout</span></button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
