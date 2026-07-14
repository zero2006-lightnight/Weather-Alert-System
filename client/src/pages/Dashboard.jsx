import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useWeather, useWeatherHistory } from '../hooks/useWeather';
import { searchLocations, saveWeatherHistory, saveAlerts, saveCropRecommendation } from '../services/api';
import WeatherCard from '../components/dashboard/WeatherCard';
import WeatherForecast from '../components/weather/WeatherForecast';
import TemperatureChart from '../components/charts/TemperatureChart';
import HumidityChart from '../components/charts/HumidityChart';
import WindChart from '../components/charts/WindChart';
import toast from 'react-hot-toast';
import { HiRefresh } from 'react-icons/hi';

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searching, setSearching] = useState(false);

  const lat = selectedLocation?.lat || profile?.latitude;
  const lon = selectedLocation?.lon || profile?.longitude;

  const { weather, forecast, loading, refetch } = useWeather(lat, lon);
  const { history, loading: historyLoading, refetch: refetchHistory } = useWeatherHistory(user?.id);
  const recommendations = weather?.cropAdvice || null;

  // Save weather data to Supabase after fetch
  useEffect(() => {
    if (weather && user?.id) {
      saveWeatherHistory(user.id, weather).catch(console.error);
      if (weather.alerts?.length) {
        saveAlerts(user.id, weather.alerts, weather).catch(console.error);
      }
      if (weather.cropAdvice) {
        saveCropRecommendation(user.id, weather, weather.cropAdvice).catch(console.error);
      }
    }
  }, [weather, user]);

  const handleRefresh = useCallback(() => {
    refetch(lat, lon);
    refetchHistory();
    toast.success('Weather data refreshed!');
  }, [lat, lon, refetch, refetchHistory]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) { setSearchResults([]); return; }
    const timeout = setTimeout(async () => {
      setSearching(true);
      const results = await searchLocations(searchQuery);
      setSearchResults(results);
      setSearching(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const getAdviceIcon = (type) => {
    switch (type) {
      case 'irrigation': return '💧';
      case 'disease': return '🦠';
      case 'protection': return '🛡️';
      case 'harvesting': return '🌾';
      case 'fertilizer': return '🧪';
      default: return '🌱';
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">🌾 Welcome, {profile?.name?.split(' ')[0] || 'Farmer'}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{profile?.village}, {profile?.district} • {profile?.crop_type}</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input id="dashboard-search" type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search location..." className="input-field !w-48 md:!w-64 !py-2 !pr-8" />
              {searching && <div className="absolute right-3 top-1/2 -translate-y-1/2"><div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/></div>}
              {searchResults.length > 0 && (
                <div className="absolute top-full mt-1 left-0 right-0 glass-card p-2 z-20 max-h-48 overflow-y-auto">
                  {searchResults.map((loc, i) => (
                    <button key={i} onClick={() => { setSelectedLocation(loc); setSearchQuery(loc.label); setSearchResults([]); }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">📍 {loc.label}</button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={handleRefresh} className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/70 transition-all" title="Refresh">
              <HiRefresh className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <WeatherCard weather={weather} loading={loading} />
            <WeatherForecast forecast={forecast} loading={loading} />
            <div className="grid md:grid-cols-2 gap-6">
              <TemperatureChart data={history} loading={historyLoading} />
              <HumidityChart data={history} loading={historyLoading} />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <WindChart data={history} loading={historyLoading} />
            </div>
          </div>

          <div className="space-y-6">
            {/* Crop Recommendations */}
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">🌱 AI Crop Advisor</h3>
              {recommendations?.recommendations?.length > 0 ? (
                <div className="space-y-3">
                  {recommendations.recommendations.map((rec, i) => (
                    <div key={i} className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                      <div className="flex items-start space-x-3">
                        <span className="text-xl">{getAdviceIcon(rec.type)}</span>
                        <div>
                          <p className="text-sm font-medium text-green-800 dark:text-green-300 capitalize">{rec.type} - {rec.advice?.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-green-700 dark:text-green-400 mt-1">{rec.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {recommendations.riskFactors?.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">⚠️ Risk Factors</h4>
                      {recommendations.riskFactors.map((risk, i) => (
                        <div key={i} className={`flex items-center space-x-2 p-2 rounded-lg mb-1 text-sm ${
                          risk.level === 'high' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' :
                          risk.level === 'moderate' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' :
                          'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'}`}>
                          <span>{risk.level === 'high' ? '🔴' : risk.level === 'moderate' ? '🟡' : '🟢'}</span>
                          <span>{risk.risk}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500"><p>Check the weather to get crop recommendations.</p></div>
              )}
            </motion.div>

            {/* Quick Stats */}
            {weather && (
              <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="glass-card p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">📊 Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"><span className="text-sm text-gray-600 dark:text-gray-400">Temperature</span><span className="font-semibold text-gray-800 dark:text-gray-200">{weather.current.tempMax}° / {weather.current.tempMin}°C</span></div>
                  <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"><span className="text-sm text-gray-600 dark:text-gray-400">Feels Like</span><span className="font-semibold text-gray-800 dark:text-gray-200">{weather.current.feelsLike}°C</span></div>
                  <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"><span className="text-sm text-gray-600 dark:text-gray-400">Cloud Cover</span><span className="font-semibold text-gray-800 dark:text-gray-200">{weather.current.clouds}%</span></div>
                  <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"><span className="text-sm text-gray-600 dark:text-gray-400">Active Alerts</span><span className="font-semibold text-red-500">{weather.alerts?.length || 0}</span></div>
                </div>
              </motion.div>
            )}

            {/* Location Info */}
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}} className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">📍 Location Info</h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600 dark:text-gray-400"><span className="font-medium">Village:</span> {profile?.village}</p>
                <p className="text-gray-600 dark:text-gray-400"><span className="font-medium">District:</span> {profile?.district}</p>
                <p className="text-gray-600 dark:text-gray-400"><span className="font-medium">State:</span> {profile?.state}</p>
                <p className="text-gray-600 dark:text-gray-400"><span className="font-medium">Farm Size:</span> {profile?.farm_size} acres</p>
                <p className="text-gray-600 dark:text-gray-400"><span className="font-medium">Crop:</span> {profile?.crop_type}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
