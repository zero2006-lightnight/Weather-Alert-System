import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { adminGetUsers, adminGetStats, adminDeleteUser, adminBroadcastAlert } from '../services/api';
import StatsCards from '../components/admin/StatsCards';
import toast from 'react-hot-toast';
import { HiShieldExclamation, HiRefresh } from 'react-icons/hi';

const Admin = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [bcForm, setBcForm] = useState({ type:'storm', severity:'warning', title:'', message:'', recommendation:'' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [u, s] = await Promise.all([adminGetUsers({ search, limit: 50 }), adminGetStats()]);
      setUsers(u);
      setStats(s);
    } catch (err) { toast.error('Failed to load admin data'); } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try { await adminDeleteUser(id); setUsers((p) => p.filter((u) => u.id !== id)); toast.success(`Deleted ${name}`); }
    catch (err) { toast.error('Delete failed'); }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    try { await adminBroadcastAlert(bcForm); toast.success('Broadcast sent!'); setShowBroadcast(false); }
    catch (err) { toast.error('Failed to send'); }
  };

  if (profile?.role !== 'admin') return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center"><div className="text-6xl mb-4">🚫</div><h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Access Denied</h1><p className="text-gray-500 mt-2">Admin only</p></div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg"><HiShieldExclamation className="w-6 h-6 text-white"/></div>
            <div><h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Admin Panel</h1><p className="text-gray-500 dark:text-gray-400">Manage farmers</p></div>
          </div>
          <div className="flex space-x-3">
            <button onClick={()=>setShowBroadcast(true)} className="btn-primary !py-2 !px-4 text-sm">📡 Broadcast</button>
            <button onClick={fetchData} className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 hover:bg-gray-200"><HiRefresh className="w-5 h-5"/></button>
          </div>
        </motion.div>

        <StatsCards stats={stats} loading={loading} />

        <div className="glass-card p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">👥 Farmers ({users.length})</h3>
            <input id="admin-search" type="text" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search..." className="input-field !w-64 !py-2" />
          </div>
          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_,i)=><div key={i} className="skeleton h-12 rounded-xl" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-3 font-medium">Name</th><th className="pb-3 font-medium">Email</th><th className="pb-3 font-medium">Village</th><th className="pb-3 font-medium">District</th><th className="pb-3 font-medium">Crop</th><th className="pb-3 font-medium">Actions</th>
                </tr></thead>
                <tbody>{users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="py-3"><div className="flex items-center space-x-2"><div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{u.name?.charAt(0)}</div><span className="font-medium text-gray-800 dark:text-gray-200">{u.name}</span></div></td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">{u.email || '-'}</td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">{u.village || '-'}</td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">{u.district || '-'}</td>
                    <td className="py-3"><span className="badge-info">{u.crop_type || '-'}</span></td>
                    <td className="py-3"><button onClick={()=>handleDelete(u.id, u.name)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><span className="text-xs">🗑️</span></button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>

        {showBroadcast && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} className="glass-card p-6 max-w-lg w-full">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">📡 Broadcast Alert</h3>
              <form onSubmit={handleBroadcast} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label htmlFor="bc-type" className="text-sm font-medium text-gray-700 mb-1">Type</label><select id="bc-type" value={bcForm.type} onChange={(e)=>setBcForm({...bcForm,type:e.target.value})} className="input-field"><option value="storm">Storm</option><option value="heavy_rain">Heavy Rain</option><option value="cyclone">Cyclone</option><option value="heat_wave">Heat Wave</option></select></div>
                  <div><label htmlFor="bc-severity" className="text-sm font-medium text-gray-700 mb-1">Severity</label><select id="bc-severity" value={bcForm.severity} onChange={(e)=>setBcForm({...bcForm,severity:e.target.value})} className="input-field"><option value="info">Info</option><option value="warning">Warning</option><option value="danger">Critical</option></select></div>
                </div>
                <div><label htmlFor="bc-title" className="text-sm font-medium text-gray-700 mb-1">Title</label><input id="bc-title" type="text" value={bcForm.title} onChange={(e)=>setBcForm({...bcForm,title:e.target.value})} className="input-field" required /></div>
                <div><label htmlFor="bc-message" className="text-sm font-medium text-gray-700 mb-1">Message</label><textarea id="bc-message" value={bcForm.message} onChange={(e)=>setBcForm({...bcForm,message:e.target.value})} className="input-field" rows={3} required /></div>
                <div><label htmlFor="bc-recommendation" className="text-sm font-medium text-gray-700 mb-1">Recommendation</label><textarea id="bc-recommendation" value={bcForm.recommendation} onChange={(e)=>setBcForm({...bcForm,recommendation:e.target.value})} className="input-field" rows={2} /></div>
                <div className="flex space-x-3 pt-2"><button type="button" onClick={()=>setShowBroadcast(false)} className="btn-secondary flex-1">Cancel</button><button type="submit" className="btn-primary flex-1">Send to All Farmers</button></div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
