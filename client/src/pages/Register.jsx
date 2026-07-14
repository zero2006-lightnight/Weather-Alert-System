import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { HiEye, HiEyeOff, HiOutlineLocationMarker } from 'react-icons/hi';
import toast from 'react-hot-toast';

const cropTypes = ['Rice','Wheat','Maize','Cotton','Sugarcane','Vegetables','Fruits','Pulses','Oilseeds','Mixed','Other'];
const states = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'];

/** Reverse geocode using Nominatim */
const reverseGeocode = async (lat, lon) => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`);
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      return {
        village: addr.village || addr.town || addr.city || addr.hamlet || addr.suburb || '',
        district: addr.county || addr.district || addr.state_district || '',
        state: addr.state || '',
      };
    }
  } catch (e) { console.error('Reverse geocode failed:', e); }
  return { village: '', district: '', state: '' };
};

const Register = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name:'', phone:'', email:'', password:'',
    village:'', district:'', state:'',
    latitude:'', longitude:'', farmSize:'', cropType:'',
  });

  if (isAuthenticated) { navigate('/dashboard',{replace:true}); return null; }

  /** Auto-detect location with reverse geocoding */
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    setDetectingLocation(true);
    toast.loading('Detecting your location...', { id: 'geo' });
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const loc = await reverseGeocode(latitude, longitude);
        setFormData((f) => ({
          ...f,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
          village: f.village || loc.village,
          district: f.district || loc.district,
          state: f.state || loc.state,
        }));
        toast.success('Location detected!', { id: 'geo' });
        setDetectingLocation(false);
      },
      (error) => {
        setDetectingLocation(false);
        let msg = 'Unable to detect location';
        if (error.code === 1) msg = 'Location permission denied';
        else if (error.code === 2) msg = 'Location unavailable';
        else if (error.code === 3) msg = 'Location request timed out';
        toast.error(msg, { id: 'geo' });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  const validate1 = () => { const e={}; if(!formData.name||formData.name.length<2) e.name='Name needs 2+ chars'; if(!formData.phone||!/^[+]?[\d\s-]{10,15}$/.test(formData.phone)) e.phone='Valid phone required'; if(!formData.email||!/\S+@\S+\.\S+/.test(formData.email)) e.email='Valid email required'; if(!formData.password||formData.password.length<6) e.password='Min 6 characters'; setErrors(e); return Object.keys(e).length===0; };
  const validate2 = () => { const e={}; if(!formData.village) e.village='Required'; if(!formData.district) e.district='Required'; if(!formData.state) e.state='Required'; if(!formData.farmSize||formData.farmSize<0.1) e.farmSize='Min 0.1 acres'; if(!formData.cropType) e.cropType='Required'; setErrors(e); return Object.keys(e).length===0; };

  const handleSubmit = async (e) => { e.preventDefault(); if(!validate2()) return; setLoading(true); try { const submitData = { ...formData, latitude: formData.latitude || '20.5937', longitude: formData.longitude || '78.9629' }; await register(submitData); navigate('/dashboard'); } catch(err){} finally{ setLoading(false); } };
  const handleChange = (e) => { setFormData({...formData,[e.target.name]:e.target.value}); if(errors[e.target.name]) setErrors({...errors,[e.target.name]:''}); };
  const nextStep = () => { if(validate1()) setStep(2); };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="w-full max-w-lg">
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"><span className="text-3xl">🌾</span></div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Farmer Registration</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Create your account</p>
          </div>
          <div className="flex items-center justify-center space-x-4 mb-8">
            {[1,2].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${s===step?'bg-blue-600 text-white':s<step?'bg-green-500 text-white':'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>{s<step?'✓':s}</div>
                {s<2&&<div className={`w-12 h-1 mx-2 rounded ${step>1?'bg-green-500':'bg-gray-200 dark:bg-gray-700'}`}/>}
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit}>
            {step===1&&<motion.div initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Personal Information</h3>
              <div><label htmlFor="reg-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label><input id="reg-name" type="text" name="name" value={formData.name} onChange={handleChange} autoComplete="name" className={`input-field ${errors.name?'border-red-500':''}`} placeholder="Farmer Name"/>{errors.name&&<p className="text-red-500 text-xs mt-1">{errors.name}</p>}</div>
              <div><label htmlFor="reg-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label><input id="reg-phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} autoComplete="tel" className={`input-field ${errors.phone?'border-red-500':''}`} placeholder="+91 9876543210"/>{errors.phone&&<p className="text-red-500 text-xs mt-1">{errors.phone}</p>}</div>
              <div><label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label><input id="reg-email" type="email" name="email" value={formData.email} onChange={handleChange} autoComplete="username" className={`input-field ${errors.email?'border-red-500':''}`} placeholder="farmer@example.com"/>{errors.email&&<p className="text-red-500 text-xs mt-1">{errors.email}</p>}</div>
              <div><label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label><div className="relative"><input id="reg-password" type={showPassword?'text':'password'} name="password" value={formData.password} onChange={handleChange} autoComplete="new-password" className={`input-field pr-10 ${errors.password?'border-red-500':''}`} placeholder="Min 6 characters"/><button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPassword?<HiEyeOff className="w-5 h-5"/>:<HiEye className="w-5 h-5"/>}</button></div>{errors.password&&<p className="text-red-500 text-xs mt-1">{errors.password}</p>}</div>
              <button type="button" onClick={nextStep} className="btn-primary w-full py-3 mt-2">Next Step</button>
            </motion.div>}
            {step===2&&<motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Farm Details</h3>
                <button type="button" onClick={detectLocation} disabled={detectingLocation}
                  className="text-xs text-blue-600 hover:underline flex items-center space-x-1 disabled:opacity-50">
                  {detectingLocation ? <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"/> : <HiOutlineLocationMarker className="w-3 h-3"/>}
                  <span>{detectingLocation ? 'Detecting...' : '📍 Auto-detect all'}</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4"><div><label htmlFor="reg-village" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Village</label><input id="reg-village" type="text" name="village" value={formData.village} onChange={handleChange} autoComplete="address-line1" className={`input-field ${errors.village?'border-red-500':''}`} placeholder="Village"/>{errors.village&&<p className="text-red-500 text-xs mt-1">{errors.village}</p>}</div>
              <div><label htmlFor="reg-district" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">District</label><input id="reg-district" type="text" name="district" value={formData.district} onChange={handleChange} autoComplete="address-level2" className={`input-field ${errors.district?'border-red-500':''}`} placeholder="District"/>{errors.district&&<p className="text-red-500 text-xs mt-1">{errors.district}</p>}</div></div>
              <div><label htmlFor="reg-state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label><select id="reg-state" name="state" value={formData.state} onChange={handleChange} autoComplete="address-level1" className={`input-field ${errors.state?'border-red-500':''}`}><option value="">Select State</option>{states.map((s)=><option key={s} value={s}>{s}</option>)}</select>{errors.state&&<p className="text-red-500 text-xs mt-1">{errors.state}</p>}</div>
              <div><label htmlFor="reg-latitude" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">GPS Coordinates</label><div className="grid grid-cols-2 gap-4"><input id="reg-latitude" type="number" step="any" name="latitude" value={formData.latitude} className="input-field" placeholder="Latitude" readOnly/><input id="reg-longitude" type="number" step="any" name="longitude" value={formData.longitude} className="input-field" placeholder="Longitude" readOnly/></div>{formData.latitude&&<p className="text-xs text-green-600 mt-1">✓ Location detected ({formData.latitude}, {formData.longitude})</p>}</div>
              <div className="grid grid-cols-2 gap-4"><div><label htmlFor="reg-farmSize" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Farm Size (acres)</label><input id="reg-farmSize" type="number" step="0.1" name="farmSize" value={formData.farmSize} onChange={handleChange} className={`input-field ${errors.farmSize?'border-red-500':''}`} placeholder="e.g., 5.5"/>{errors.farmSize&&<p className="text-red-500 text-xs mt-1">{errors.farmSize}</p>}</div>
              <div><label htmlFor="reg-cropType" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Crop Type</label><select id="reg-cropType" name="cropType" value={formData.cropType} onChange={handleChange} className={`input-field ${errors.cropType?'border-red-500':''}`}><option value="">Select Crop</option>{cropTypes.map((c)=><option key={c} value={c}>{c}</option>)}</select>{errors.cropType&&<p className="text-red-500 text-xs mt-1">{errors.cropType}</p>}</div></div>
              <div className="flex space-x-3 pt-2"><button type="button" onClick={()=>setStep(1)} className="btn-secondary flex-1 py-3">Back</button><button type="submit" disabled={loading} className="btn-primary flex-1 py-3 flex items-center justify-center">{loading?<><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"/><span>Creating...</span></>:<span>Create Account</span>}</button></div>
            </motion.div>}
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">Already have an account? <Link to="/login" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">Sign in</Link></p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
