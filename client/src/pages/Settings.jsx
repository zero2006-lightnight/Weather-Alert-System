import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';
import { HiSave } from 'react-icons/hi';

const Settings = () => {
  const { profile, updateUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', newPass: '', confirm: '' });

  const prefs = profile?.preferences || {};
  const [preferences, setPreferences] = useState({
    emailNotifications: prefs.emailNotifications ?? true,
    smsNotifications: prefs.smsNotifications ?? false,
    browserNotifications: prefs.browserNotifications ?? true,
    language: prefs.language || 'en',
  });

  const handleToggle = async (key) => {
    const newVal = !preferences[key];
    setPreferences((p) => ({ ...p, [key]: newVal }));
    try {
      await updateUser({ preferences: { ...preferences, [key]: newVal } });
    } catch (err) {
      setPreferences((p) => ({ ...p, [key]: !newVal }));
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPass !== passwordData.confirm) { toast.error('Passwords do not match'); return; }
    if (passwordData.newPass.length < 6) { toast.error('Min 6 characters'); return; }
    const { error } = await supabase.auth.updateUser({ password: passwordData.newPass });
    if (error) { toast.error(error.message); return; }
    toast.success('Password changed');
    setPasswordData({ current: '', newPass: '', confirm: '' });
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">⚙️ Settings</h1>

          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">🔔 Notifications</h2>
            <div className="space-y-4">
              {[
                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive alerts via email' },
                { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Get SMS alerts on your phone' },
                { key: 'browserNotifications', label: 'Browser Notifications', desc: 'Show desktop notifications' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{item.label}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                  </div>
                  <button onClick={() => handleToggle(item.key)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${preferences[item.key] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${preferences[item.key] ? 'translate-x-6' : ''}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">🔒 Change Password</h2>
            <form onSubmit={handlePassword} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div><label htmlFor="settings-new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label><input id="settings-new-password" type="password" value={passwordData.newPass} onChange={(e) => setPasswordData({...passwordData, newPass: e.target.value})} autoComplete="new-password" className="input-field" required /></div>
                <div><label htmlFor="settings-confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm</label><input id="settings-confirm-password" type="password" value={passwordData.confirm} onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})} autoComplete="new-password" className="input-field" required /></div>
              </div>
              <button type="submit" className="btn-primary flex items-center space-x-2"><HiSave className="w-5 h-5" /><span>Update Password</span></button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
