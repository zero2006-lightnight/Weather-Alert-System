import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { HiEye, HiEyeOff } from 'react-icons/hi';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  if (isAuthenticated) { navigate('/dashboard', { replace: true }); return null; }

  const validate = () => {
    const e = {};
    if (!formData.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Invalid email format';
    if (!formData.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) { /* toast handled in AuthContext */ } finally { setLoading(false); }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl">🌤️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Welcome Back</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Sign in to your account</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <input id="login-email" type="email" name="email" value={formData.email} onChange={handleChange}
                autoComplete="username"
                className={`input-field ${errors.email ? 'border-red-500' : ''}`} placeholder="farmer@example.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <div className="relative">
                <input id="login-password" type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                  autoComplete="current-password"
                  className={`input-field pr-10 ${errors.password ? 'border-red-500' : ''}`} placeholder="Enter your password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center">
              {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span className="ml-2">Signing in...</span></> : <span>Sign In</span>}
            </button>
          </form>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700" /></div>
            <div className="relative flex justify-center"><span className="px-4 text-sm text-gray-500 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">or continue with</span></div>
          </div>
          <div className="space-y-3">
            <p className="text-xs text-center text-gray-400">Demo Accounts</p>
            <div className="flex space-x-2">
              <button type="button" onClick={() => setFormData({ email: 'admin@weatheralert.com', password: 'admin123' })}
                className="flex-1 px-3 py-2 text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 transition-colors">👑 Admin</button>
              <button type="button" onClick={() => setFormData({ email: 'farmer@example.com', password: 'farmer123' })}
                className="flex-1 px-3 py-2 text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 transition-colors">🌾 Farmer</button>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account? <Link to="/register" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">Register here</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
