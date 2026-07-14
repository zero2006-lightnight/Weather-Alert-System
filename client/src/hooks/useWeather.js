import { useState, useEffect, useCallback } from 'react';
import { fetchCurrentWeather, fetchForecast, getWeatherHistory, searchLocations as searchLocationsAPI } from '../services/api';
import toast from 'react-hot-toast';

/**
 * Fetch current weather + forecast directly from Open-Meteo (free, no key).
 */
export const useWeather = (lat, lon) => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (latitude, longitude) => {
    if (!latitude || !longitude) return;
    setLoading(true);
    setError(null);
    try {
      const [w, f] = await Promise.all([
        fetchCurrentWeather(latitude, longitude),
        fetchForecast(latitude, longitude),
      ]);
      setWeather(w);
      setForecast(f);
    } catch (err) {
      const msg = err.message || 'Failed to fetch weather data';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (lat && lon) fetchData(lat, lon);
  }, [lat, lon, fetchData]);

  return { weather, forecast, loading, error, refetch: fetchData };
};

/**
 * Fetch weather history from Supabase.
 */
export const useWeatherHistory = (userId, days = 7) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getWeatherHistory(userId, days);
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch weather history:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, days]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  return { history, loading, refetch: fetchHistory };
};


