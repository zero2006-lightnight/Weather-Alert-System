import { motion } from 'framer-motion';
import { HiUsers, HiBell, HiShieldExclamation, HiChartBar } from 'react-icons/hi';

const statsConfig = [
  { key: 'totalUsers', label: 'Total Farmers', icon: HiUsers, color: 'from-blue-500 to-blue-600', bgLight: 'bg-blue-50 dark:bg-blue-900/20' },
  { key: 'activeToday', label: 'Active Today', icon: HiChartBar, color: 'from-green-500 to-green-600', bgLight: 'bg-green-50 dark:bg-green-900/20' },
  { key: 'totalAlerts', label: 'Total Alerts', icon: HiBell, color: 'from-yellow-500 to-yellow-600', bgLight: 'bg-yellow-50 dark:bg-yellow-900/20' },
  { key: 'unreadAlerts', label: 'Unread Alerts', icon: HiShieldExclamation, color: 'from-red-500 to-red-600', bgLight: 'bg-red-50 dark:bg-red-900/20' },
];

const StatsCards = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card p-6">
            <div className="skeleton h-10 w-10 rounded-xl mb-3" />
            <div className="skeleton h-4 w-20 mb-2" />
            <div className="skeleton h-8 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statsConfig.map((config, index) => (
        <motion.div
          key={config.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass-card p-6 hover:shadow-xl transition-all duration-300"
        >
          <div className={`w-12 h-12 bg-gradient-to-br ${config.color} rounded-xl flex items-center justify-center shadow-lg mb-4`}>
            <config.icon className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{config.label}</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">
            {stats[config.key] ?? 0}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;
