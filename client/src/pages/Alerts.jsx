import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getAlerts } from '../services/api';
import { supabase } from '../services/supabase';
import AlertList from '../components/alerts/AlertList';
import toast from 'react-hot-toast';
import { HiBell } from 'react-icons/hi';

const Alerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  const fetchAlerts = useCallback(async (page = 1) => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, total } = await getAlerts(user.id, { page, limit: 20 });
      setAlerts(data);
      setPagination({ total, page, pages: Math.ceil(total / 20) || 1 });
    } catch (err) {
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const handleMarkRead = async (id) => {
    await supabase.from('alerts').update({ is_read: true }).eq('id', id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, is_read: true } : a)));
  };

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    await supabase.from('alerts').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
    toast.success('All alerts marked as read');
  };

  const handleDelete = async (id) => {
    await supabase.from('alerts').delete().eq('id', id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    toast.success('Alert deleted');
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg"><HiBell className="w-6 h-6 text-white" /></div>
            <div><h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Weather Alerts</h1><p className="text-gray-500 dark:text-gray-400">Stay informed about dangerous weather conditions</p></div>
          </div>
        </motion.div>

        <AlertList alerts={alerts} loading={loading} onMarkRead={handleMarkRead} onMarkAllRead={handleMarkAllRead} onDelete={handleDelete} />

        {pagination.pages > 1 && (
          <div className="flex justify-center space-x-2 mt-6">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <button key={page} onClick={() => fetchAlerts(page)}
                className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${page === pagination.page ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30'}`}>{page}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
