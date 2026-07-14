import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiMail, HiPhone, HiLocationMarker } from 'react-icons/hi';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending
    await new Promise((r) => setTimeout(r, 1000));
    toast.success('Message sent! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">📞 Contact Us</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Have questions? We'd love to hear from you.</p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="glass-card p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                    <HiMail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Email</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">support@weatheralert.com</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">info@weatheralert.com</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center">
                    <HiPhone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Phone</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">+91 1800-123-4567</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Mon-Sat 9:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center">
                    <HiLocationMarker className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Address</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Weather Alert Systems Pvt. Ltd.</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Hyderabad, Telangana, India</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Send a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input id="contact-name" type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field" required />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input id="contact-email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field" required />
                </div>
                <div>
                  <label htmlFor="contact-subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                  <input id="contact-subject" type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="input-field" required />
                </div>
                <div>
                  <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                  <textarea id="contact-message" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="input-field" rows={4} required />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
