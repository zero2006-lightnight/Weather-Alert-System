import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiTrash, HiCheck, HiFilter } from 'react-icons/hi';

const severityConfig = {
  danger: {
    icon: '🚨', label: 'Critical',
    bgColor: 'bg-red-50 dark:bg-red-900/20', borderColor: 'border-red-500',
    textColor: 'text-red-700 dark:text-red-300',
  },
  warning: {
    icon: '⚠️', label: 'Warning',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20', borderColor: 'border-yellow-500',
    textColor: 'text-yellow-700 dark:text-yellow-300',
  },
  info: {
    icon: 'ℹ️', label: 'Info',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20', borderColor: 'border-blue-500',
    textColor: 'text-blue-700 dark:text-blue-300',
  },
};

const AlertItem = ({ alert, onMarkRead, onDelete }) => {
  const config = severityConfig[alert.severity] || severityConfig.info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`relative ${config.bgColor} border-l-4 ${config.borderColor} rounded-xl p-4 hover:shadow-md transition-all duration-300 ${
        !alert.is_read ? 'ring-2 ring-blue-500/20' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-lg">{config.icon}</span>
            <span className={`text-xs font-semibold ${config.textColor}`}>{config.label}</span>
            {!alert.is_read && <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
            {alert.is_broadcast && (
              <span className="badge bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs">Broadcast</span>
            )}
          </div>
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{alert.title}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{alert.message}</p>
          {alert.recommendation && (
            <div className="mt-2 bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
              <p className="text-xs text-green-700 dark:text-green-300">
                🌱 <span className="font-medium">Recommendation:</span> {alert.recommendation}
              </p>
            </div>
          )}
          <div className="flex items-center space-x-4 mt-2">
            <span className="text-xs text-gray-400">{new Date(alert.created_at).toLocaleString()}</span>
            {alert.location_name && <span className="text-xs text-gray-400">📍 {alert.location_name}</span>}
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          {!alert.is_read && (
            <button onClick={() => onMarkRead(alert.id)}
              className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200" title="Mark as read">
              <HiCheck className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => onDelete(alert.id)}
            className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200" title="Delete alert">
            <HiTrash className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const AlertList = ({ alerts, loading, onMarkRead, onMarkAllRead, onDelete }) => {
  const [filter, setFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (<div key={i} className="skeleton h-24 rounded-xl" />))}
      </div>
    );
  }

  const filtered = alerts?.filter((a) => {
    if (filter === 'unread') return !a.is_read;
    if (filter === 'danger') return a.severity === 'danger';
    if (filter === 'warning') return a.severity === 'warning';
    return true;
  }).sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const unreadCount = alerts?.filter((a) => !a.is_read).length || 0;

  if (!alerts?.length) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="text-6xl mb-4">🔔</div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No Alerts Yet</h3>
        <p className="text-gray-500 dark:text-gray-400">You'll receive weather alerts here when conditions require attention.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-2">
            <HiFilter className="w-5 h-5 text-gray-400" />
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {[
                { key: 'all', label: 'All' }, { key: 'unread', label: 'Unread' },
                { key: 'danger', label: 'Critical' }, { key: 'warning', label: 'Warnings' },
              ].map((f) => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    filter === f.key
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                  }`}>{f.label}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">{unreadCount} unread</span>
            {unreadCount > 0 && (
              <button onClick={onMarkAllRead} className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium">Mark all read</button>
            )}
            <label htmlFor="alert-sort" className="sr-only">Sort order</label>
            <select id="alert-sort" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}
              className="text-sm bg-transparent border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 text-gray-600 dark:text-gray-300">
              <option value="newest">Newest</option><option value="oldest">Oldest</option>
            </select>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {filtered?.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((alert) => (
              <AlertItem key={alert.id} alert={alert} onMarkRead={onMarkRead} onDelete={onDelete} />
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 text-center"><p className="text-gray-500">No alerts match the current filter.</p></div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AlertList;
