import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load session & profile on mount
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await loadProfile(session.user.id);
      }
      setLoading(false);
    };
    init();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await loadProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const loadProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile(data);
    if (data) localStorage.setItem('profile', JSON.stringify(data));
  };

  const login = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { toast.error(error.message); throw error; }
    setUser(data.user);
    await loadProfile(data.user.id);
    toast.success(`Welcome back!`);
    return data;
  }, []);

  const register = useCallback(async (formData) => {
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          name: formData.name,
          phone: formData.phone,
          role: 'farmer',
          village: formData.village,
          district: formData.district,
          state: formData.state,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          farm_size: parseFloat(formData.farmSize),
          crop_type: formData.cropType,
        },
      },
    });
    if (error) { toast.error(error.message); throw error; }
    setUser(data.user);

    // The trigger handle_new_user() creates a minimal profile row.
    // Update it with the full metadata now.
    if (data.user) {
      await supabase.from('profiles').update({
        name: formData.name,
        phone: formData.phone,
        village: formData.village,
        district: formData.district,
        state: formData.state,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        farm_size: parseFloat(formData.farmSize),
        crop_type: formData.cropType,
      }).eq('id', data.user.id);
      await loadProfile(data.user.id);
    }

    toast.success('Registration successful!');
    return data;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    localStorage.removeItem('profile');
    toast.success('Logged out');
  }, []);

  const updateUser = useCallback(async (updates) => {
    const { error } = await supabase.from('profiles').update(updates).eq('id', user?.id);
    if (error) { toast.error(error.message); throw error; }
    await loadProfile(user.id);
    toast.success('Profile updated');
    return { user: { ...profile, ...updates } };
  }, [user, profile]);

  const isAdmin = profile?.role === 'admin';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isAuthenticated,
      isAdmin,
      login,
      register,
      logout,
      updateUser,
      setUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
