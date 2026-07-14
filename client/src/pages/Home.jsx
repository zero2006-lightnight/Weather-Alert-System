import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  HiCloud, HiShieldExclamation, HiChartBar, HiBell,
  HiUserGroup, HiGlobe, HiLightBulb, HiDeviceMobile,
  HiArrowRight, HiChevronDown,
} from 'react-icons/hi';

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
};

const features = [
  {
    icon: HiCloud,
    title: 'Real-Time Weather',
    description: 'Live weather data with temperature, humidity, wind speed, and UV index for your farm location.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: HiShieldExclamation,
    title: 'Smart Alerts',
    description: 'Automatic detection of heavy rain, storms, heatwaves, frost, and other dangerous conditions.',
    color: 'from-red-500 to-orange-500',
  },
  {
    icon: HiLightBulb,
    title: 'Crop Recommendations',
    description: 'AI-powered advice on irrigation, fertilization, and protection based on weather conditions.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: HiChartBar,
    title: 'Weather Charts',
    description: 'Interactive charts showing temperature, humidity, wind, and rain trends over time.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: HiBell,
    title: 'Multi-Channel Alerts',
    description: 'Receive alerts via email, SMS, browser notifications, and Telegram.',
    color: 'from-yellow-500 to-amber-500',
  },
  {
    icon: HiGlobe,
    title: 'Interactive Map',
    description: 'View weather radar, satellite, and wind layers on an interactive map.',
    color: 'from-indigo-500 to-blue-500',
  },
];

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mb-6">
              🌾 Smart Farming Solution
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight"
          >
            <span className="text-gradient">Weather Alert</span>
            <br />
            <span className="text-gray-800 dark:text-gray-200">System for Farmers</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8 leading-relaxed"
          >
            Protect your crops with real-time weather monitoring and automatic alerts.
            Get instant notifications about dangerous weather conditions and smart crop recommendations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"
          >
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary text-lg px-8 py-4 inline-flex items-center space-x-2">
                <span>Go to Dashboard</span>
                <HiArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-lg px-8 py-4">
                  Get Started Free
                </Link>
                <Link to="/login" className="btn-secondary text-lg px-8 py-4">
                  Sign In
                </Link>
              </>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-16"
          >
            <HiChevronDown className="w-8 h-8 mx-auto text-gray-400 animate-bounce" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Comprehensive weather monitoring and alert system designed specifically for farmers.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card-hover p-6 group"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto glass-card p-12 text-center relative overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Ready to Protect Your Farm?
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of farmers who use our system to make informed decisions and protect their crops.
            </p>
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary text-lg px-8 py-4 inline-flex items-center space-x-2">
                <span>Go to Dashboard</span>
                <HiArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <Link to="/register" className="btn-primary text-lg px-8 py-4">
                Create Free Account
              </Link>
            )}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🌤️</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">Weather Alert System</span>
          </div>
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <Link to="/about" className="hover:text-blue-600 transition-colors">About</Link>
            <Link to="/contact" className="hover:text-blue-600 transition-colors">Contact</Link>
            <Link to="/faq" className="hover:text-blue-600 transition-colors">FAQ</Link>
            <Link to="/help" className="hover:text-blue-600 transition-colors">Help</Link>
          </div>
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Weather Alert System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
