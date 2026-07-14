import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiMail, HiPhone, HiBookOpen, HiQuestionMarkCircle, HiShieldExclamation } from 'react-icons/hi';

const helpCategories = [
  {
    icon: HiBookOpen,
    title: 'Getting Started',
    items: [
      'Create your farmer account with personal and farm details',
      'Enable GPS location for accurate weather data',
      'Set your notification preferences in Settings',
      'Explore the Dashboard to view weather data',
    ],
  },
  {
    icon: HiShieldExclamation,
    title: 'Understanding Alerts',
    items: [
      'Alerts are automatically generated based on weather conditions',
      'Severity levels: Info (blue), Warning (yellow), Critical (red)',
      'Mark alerts as read to track what you have reviewed',
      'Broadcast alerts are sent by administrators for widespread events',
    ],
  },
  {
    icon: HiQuestionMarkCircle,
    title: 'Crop Recommendations',
    items: [
      'AI analyzes weather data to provide farming advice',
      'Recommendations include irrigation, fertilization, and protection tips',
      'Risk factors highlight potential disease or pest threats',
      'Check recommendations daily for best results',
    ],
  },
];

const Help = () => (
  <div className="min-h-screen pt-24 pb-12 px-4">
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">🆘 Help Center</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Guides and resources to help you use the system effectively.</p>

        {/* Help Categories */}
        <div className="space-y-6 mb-8">
          {helpCategories.map((cat, i) => (
            <div key={i} className="glass-card p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                  <cat.icon className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{cat.title}</h2>
              </div>
              <ul className="space-y-2">
                {cat.items.map((item, j) => (
                  <li key={j} className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">🔗 Quick Links</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <Link to="/faq" className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <p className="font-medium text-gray-800 dark:text-gray-200">❓ FAQ</p>
              <p className="text-sm text-gray-500">Frequently asked questions</p>
            </Link>
            <Link to="/contact" className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <p className="font-medium text-gray-800 dark:text-gray-200">📞 Contact Support</p>
              <p className="text-sm text-gray-500">Get help from our team</p>
            </Link>
            <Link to="/about" className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <p className="font-medium text-gray-800 dark:text-gray-200">📖 About Us</p>
              <p className="text-sm text-gray-500">Learn about our mission</p>
            </Link>
            <Link to="/settings" className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <p className="font-medium text-gray-800 dark:text-gray-200">⚙️ Settings</p>
              <p className="text-sm text-gray-500">Manage your preferences</p>
            </Link>
          </div>
        </div>

        {/* Contact */}
        <div className="glass-card p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Still Need Help?</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Our support team is available Monday to Saturday, 9 AM to 6 PM.</p>
          <div className="flex justify-center space-x-4">
            <a href="mailto:support@weatheralert.com" className="btn-primary inline-flex items-center space-x-2">
              <HiMail className="w-5 h-5" />
              <span>Email Support</span>
            </a>
            <a href="tel:+9118001234567" className="btn-secondary inline-flex items-center space-x-2">
              <HiPhone className="w-5 h-5" />
              <span>Call Us</span>
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  </div>
);

export default Help;
