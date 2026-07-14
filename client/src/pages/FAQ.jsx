import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronDown } from 'react-icons/hi';

const faqs = [
  {
    q: 'How does the weather alert system work?',
    a: 'Our system fetches real-time weather data from OpenWeatherMap API and analyzes conditions against predefined thresholds. When dangerous conditions are detected (heavy rain, storms, heatwaves, etc.), alerts are automatically generated and sent via your preferred notification channels.',
  },
  {
    q: 'Is this service free to use?',
    a: 'Yes! The Weather Alert System for Farmers is completely free to use. We believe every farmer should have access to critical weather information to protect their crops and livelihoods.',
  },
  {
    q: 'How accurate are the weather alerts?',
    a: 'Our alerts are based on data from OpenWeatherMap, which uses global weather models and local weather station data. While we strive for high accuracy, we recommend always staying informed through multiple sources during severe weather events.',
  },
  {
    q: 'What types of weather alerts do you provide?',
    a: 'We detect and alert for: Heavy Rain, Thunderstorms, Cyclones, Lightning, Heatwaves, Cold Waves, High Humidity, Low Temperature, Strong Winds, Fog, Drought, and Frost conditions.',
  },
  {
    q: 'How do I get weather alerts on my phone?',
    a: 'You can receive alerts via email, SMS (if enabled), and browser notifications. Simply go to Settings in your dashboard and enable your preferred notification channels.',
  },
  {
    q: 'What crops are supported?',
    a: 'Our system provides general crop recommendations suitable for all major crop types including Rice, Wheat, Maize, Cotton, Sugarcane, Vegetables, Fruits, Pulses, and Oilseeds.',
  },
  {
    q: 'Can I get weather data for multiple locations?',
    a: 'Yes! You can add multiple farm locations to your favorites and compare weather data across all your locations from the dashboard.',
  },
  {
    q: 'How do I update my farm details?',
    a: 'You can update your profile information, farm size, crop type, and location from the Profile page. All changes are saved instantly.',
  },
  {
    q: 'Is my data secure?',
    a: 'Absolutely. We use JWT authentication, bcrypt password hashing, helmet for security headers, and rate limiting to protect against attacks. Your personal information is never shared with third parties.',
  },
  {
    q: 'How do I contact support?',
    a: 'You can reach us through the Contact page, email us at support@weatheralert.com, or call our helpline at +91 1800-123-4567.',
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">❓ Frequently Asked Questions</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Find answers to common questions about our system.</p>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="glass-card overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <span className="font-medium text-gray-800 dark:text-gray-200 pr-4">{faq.q}</span>
                  <HiChevronDown className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
                    openIndex === i ? 'rotate-180' : ''
                  }`} />
                </button>
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-4 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQ;
