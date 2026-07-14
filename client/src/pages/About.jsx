import { motion } from 'framer-motion';

const milestones = [
  { year: '2023', title: 'Project Launch', description: 'Weather Alert System was conceptualized and launched to help farmers.' },
  { year: '2024', title: '10K+ Farmers', description: 'Reached over 10,000 registered farmers across multiple states.' },
  { year: '2025', title: 'AI Integration', description: 'Integrated AI-powered crop recommendations and disease risk analysis.' },
  { year: '2026', title: 'National Expansion', description: 'Expanded services nationwide with multi-language support.' },
];

const team = [
  { name: 'Dr. Rajesh Kumar', role: 'Founder & CEO', bio: 'Agricultural scientist with 20+ years of experience.' },
  { name: 'Priya Sharma', role: 'CTO', bio: 'Full-stack developer and weather data specialist.' },
  { name: 'Amit Patel', role: 'Head of Operations', bio: 'Expert in rural development and farmer outreach.' },
];

const About = () => (
  <div className="min-h-screen pt-24 pb-12 px-4">
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">📖 About Us</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Empowering farmers with weather intelligence.</p>

        {/* Mission */}
        <div className="glass-card p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">🎯 Our Mission</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Weather Alert System for Farmers is dedicated to protecting crops and livelihoods by providing 
            real-time weather monitoring, automatic dangerous weather detection, and smart crop recommendations. 
            We believe that every farmer deserves access to accurate weather intelligence to make informed decisions.
          </p>
        </div>

        {/* Milestones */}
        <div className="glass-card p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">🏆 Milestones</h2>
          <div className="space-y-6">
            {milestones.map((m, i) => (
              <div key={i} className="flex items-start space-x-4">
                <div className="w-16 text-center">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{m.year}</span>
                </div>
                <div className="flex-1 pb-6 border-l-2 border-blue-200 dark:border-blue-800 pl-4">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">{m.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="glass-card p-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">👥 Our Team</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {team.map((member, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
                  {member.name.charAt(0)}
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">{member.name}</h3>
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">{member.role}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  </div>
);

export default About;
