import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiSave, HiOutlineLocationMarker } from 'react-icons/hi';

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

const Profile = () => {
  const { profile, user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    village: profile?.village || '',
    district: profile?.district || '',
    state: profile?.state || '',
    latitude: profile?.latitude || '',
    longitude: profile?.longitude || '',
    farm_size: profile?.farm_size || '',
    crop_type: profile?.crop_type || '',
  });

  /** Auto-detect location with reverse geocoding */
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    setDetectingLocation(true);
    toast.loading('Detecting location...', { id: 'geo' });
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const loc = await reverseGeocode(latitude, longitude);
        setFormData((f) => ({
          ...f,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
          village: loc.village || f.village,
          district: loc.district || f.district,
          state: loc.state || f.state,
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

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await updateUser(formData); setEditing(false); }
    catch (err) { /* toast in context */ } finally { setLoading(false); }
  };

  const field = (label, key, type = 'text') => (
    <div>
      <label htmlFor={`profile-${key}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input id={`profile-${key}`} type={type} value={formData[key]} onChange={(e) => setFormData({...formData, [key]: e.target.value})}
        disabled={!editing} className="input-field disabled:opacity-60" />
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
          <div className="glass-card p-8 text-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl mx-auto">
              {profile?.name?.charAt(0)?.toUpperCase() || 'F'}
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-4">{profile?.name}</h1>
            <p className="text-gray-500 dark:text-gray-400">{profile?.village}, {profile?.district}</p>
          </div>

          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Profile Details</h2>
              <button onClick={() => setEditing(!editing)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${editing ? 'bg-gray-100 dark:bg-gray-700 text-gray-600' : 'bg-blue-600 text-white shadow-lg'}`}>
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {field('Name', 'name')}
                {field('Phone', 'phone', 'tel')}
                {field('Village', 'village')}
                {field('District', 'district')}
                {field('State', 'state')}
                {field('Farm Size (acres)', 'farm_size', 'number')}
                {field('Crop Type', 'crop_type')}
                <div>
                  <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input id="profile-email" type="email" value={user?.email || ''} disabled className="input-field disabled:opacity-60" />
                </div>
              </div>

              {/* Location Section */}
              {editing && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">GPS Location</label>
                    <button type="button" onClick={detectLocation} disabled={detectingLocation}
                      className="text-xs text-blue-600 hover:underline flex items-center space-x-1 disabled:opacity-50">
                      {detectingLocation ? <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"/> : <HiOutlineLocationMarker className="w-3 h-3"/>}
                      <span>{detectingLocation ? 'Detecting...' : '📍 Auto-detect'}</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {field('Latitude', 'latitude')}
                    {field('Longitude', 'longitude')}
                  </div>
                  {formData.latitude && <p className="text-xs text-green-600 mt-1">✓ Location: {formData.latitude}, {formData.longitude}</p>}
                </div>
              )}

              {/* Read-only location display */}
              {!editing && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Location:</span>{' '}
                    {formData.latitude && formData.longitude ? `${formData.latitude}, ${formData.longitude}` : 'Not set'}
                  </p>
                </div>
              )}

              {editing && (
                <div className="flex justify-end pt-4">
                  <button type="submit" disabled={loading} className="btn-primary flex items-center space-x-2">
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><HiSave className="w-5 h-5" /><span>Save Changes</span></>}
                  </button>
                </div>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
