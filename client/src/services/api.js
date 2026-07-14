import { supabase } from './supabase';
import toast from 'react-hot-toast';

// ─── Open-Meteo (completely free, no API key) ──────────────────────────────
const OM_BASE = import.meta.env.OPEN_METEO_BASE_URL || 'https://api.open-meteo.com/v1';
const OM_GEO  = 'https://geocoding-api.open-meteo.com/v1';

// WMO weather codes → description mapping
const WMO = {
  0:{d:'Clear sky',m:'Clear',i:'01d'},1:{d:'Mainly clear',m:'Clouds',i:'02d'},
  2:{d:'Partly cloudy',m:'Clouds',i:'03d'},3:{d:'Overcast',m:'Clouds',i:'04d'},
  45:{d:'Foggy',m:'Fog',i:'50d'},48:{d:'Depositing rime fog',m:'Fog',i:'50d'},
  51:{d:'Light drizzle',m:'Drizzle',i:'09d'},53:{d:'Moderate drizzle',m:'Drizzle',i:'09d'},
  55:{d:'Dense drizzle',m:'Drizzle',i:'09d'},61:{d:'Slight rain',m:'Rain',i:'10d'},
  63:{d:'Moderate rain',m:'Rain',i:'10d'},65:{d:'Heavy rain',m:'Rain',i:'10d'},
  71:{d:'Slight snow',m:'Snow',i:'13d'},73:{d:'Moderate snow',m:'Snow',i:'13d'},
  75:{d:'Heavy snow',m:'Snow',i:'13d'},80:{d:'Rain showers',m:'Rain',i:'09d'},
  85:{d:'Snow showers',m:'Snow',i:'13d'},95:{d:'Thunderstorm',m:'Thunderstorm',i:'11d'},
  96:{d:'Thunderstorm with hail',m:'Thunderstorm',i:'11d'},99:{d:'Thunderstorm with hail',m:'Thunderstorm',i:'11d'},
};
const wmo = (c) => WMO[c] || {d:'Unknown',m:'Unknown',i:'01d'};

// ─── Weather helpers (called directly from components/hooks) ────────────────

/** Fetch current weather + daily summary from Open-Meteo */
export async function fetchCurrentWeather(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat, longitude: lon, timezone: 'auto',
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl,uv_index,cloud_cover,visibility,is_day',
    daily: 'temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset',
    forecast_days: 1,
  });
  const res = await fetch(`${OM_BASE}/forecast?${params}`);
  if (!res.ok) throw new Error('Failed to fetch weather');
  const d = await res.json();
  const c = d.current || {};
  const day = d.daily || {};
  const w = wmo(c.weather_code);
  return {
    location: `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
    country: '',
    coordinates: { lat, lon },
    current: {
      temp: Math.round(c.temperature_2m),
      feelsLike: Math.round(c.apparent_temperature),
      tempMin: Math.round(day.temperature_2m_min?.[0] ?? c.temperature_2m),
      tempMax: Math.round(day.temperature_2m_max?.[0] ?? c.temperature_2m),
      humidity: c.relative_humidity_2m,
      pressure: c.pressure_msl,
      visibility: c.visibility,
      windSpeed: Math.round((c.wind_speed_10m || 0) / 3.6 * 10) / 10,
      windDeg: c.wind_direction_10m,
      clouds: c.cloud_cover,
      uvi: c.uv_index || 0,
      description: w.d,
      main: w.m,
      icon: c.is_day === 0 ? w.i.replace('d','n') : w.i,
      iconUrl: `https://openweathermap.org/img/wn/${c.is_day === 0 ? w.i.replace('d','n') : w.i}@2x.png`,
      sunrise: day.sunrise?.[0] ? Math.floor(new Date(day.sunrise[0]).getTime()/1000) : null,
      sunset: day.sunset?.[0] ? Math.floor(new Date(day.sunset[0]).getTime()/1000) : null,
      dt: Math.floor(Date.now()/1000),
    },
    alerts: analyzeAlerts(d),
    cropAdvice: getCropAdvice(d),
  };
}

/** Fetch 7-day forecast from Open-Meteo */
export async function fetchForecast(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat, longitude: lon, timezone: 'auto',
    hourly: 'temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl,uv_index,cloud_cover',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weather_code,wind_speed_10m_max,sunrise,sunset',
    forecast_days: 7,
  });
  const res = await fetch(`${OM_BASE}/forecast?${params}`);
  if (!res.ok) throw new Error('Failed to fetch forecast');
  const d = await res.json();
  const h = d.hourly || {};
  const day = d.daily || {};

  const hourly = (h.time || []).slice(0, 48).map((t, i) => {
    const wc = wmo(h.weather_code?.[i]);
    return {
      time: Math.floor(new Date(t).getTime()/1000),
      temp: Math.round(h.temperature_2m?.[i] ?? 0),
      feelsLike: Math.round(h.temperature_2m?.[i] ?? 0),
      humidity: h.relative_humidity_2m?.[i],
      windSpeed: Math.round((h.wind_speed_10m?.[i] || 0) / 3.6 * 10) / 10,
      pressure: h.pressure_msl?.[i],
      description: wc.d,
      icon: wc.i,
      rain: h.precipitation?.[i] || 0,
    };
  });

  const daily = (day.time || []).map((t, i) => {
    const wc = wmo(day.weather_code?.[i]);
    return {
      date: new Date(t).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'}),
      tempMin: Math.round(day.temperature_2m_min?.[i] ?? 0),
      tempMax: Math.round(day.temperature_2m_max?.[i] ?? 0),
      windSpeed: Math.round((day.wind_speed_10m_max?.[i] || 0) / 3.6 * 10) / 10,
      rain: day.precipitation_sum?.[i] || 0,
      description: wc.d,
      icon: wc.i,
    };
  });

  return { hourly, daily, alerts: [] };
}

/** Search locations via Open-Meteo Geocoding (free) */
export async function searchLocations(query) {
  if (!query || query.length < 2) return [];
  const res = await fetch(`${OM_GEO}/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
  if (!res.ok) return [];
  const d = await res.json();
  return (d.results || []).map((loc) => ({
    name: loc.name,
    state: loc.admin1 || '',
    country: loc.country_code || '',
    lat: loc.latitude,
    lon: loc.longitude,
    label: `${loc.name}${loc.admin1 ? `, ${loc.admin1}` : ''}, ${loc.country_code || ''}`,
  }));
}

// ─── Alert analysis (stateless, works on Open-Meteo response) ──────────────
function analyzeAlerts(data) {
  const alerts = [];
  const c = data.current || {};
  const w = wmo(c.weather_code);
  const temp = c.temperature_2m ?? 25;
  const feelsLike = c.apparent_temperature ?? temp;
  const humidity = c.relative_humidity_2m ?? 60;
  const windKmh = c.wind_speed_10m ?? 0;
  const windMs = Math.round(windKmh / 3.6 * 10) / 10;
  const desc = w.d.toLowerCase();

  // India-specific: Monsoon & heavy rain
  if (desc.includes('heavy') && desc.includes('rain')) alerts.push({ type:'heavy_rain', severity:'danger', title:'🌧️ भारी बारिश / Heavy Rain Warning', message:'Heavy monsoon rain expected. Risk of flooding and waterlogging in fields.', recommendation:'Clear drainage channels immediately. Move livestock to higher ground. Protect harvested crops from moisture.' });
  else if (desc.includes('moderate rain') || desc.includes('rain showers')) alerts.push({ type:'heavy_rain', severity:'info', title:'🌧️ बारिश / Rain Expected', message:`Moderate rain expected. ${(humidity > 70) ? 'Pre-monsoon conditions detected.' : ''}`, recommendation:'Reduce irrigation. Ensure field drainage is clear.' });

  // Thunderstorm - common in India during pre-monsoon
  if (desc.includes('thunderstorm') || w.m === 'Thunderstorm') alerts.push({ type:'storm', severity:'danger', title:'⛈️ तूफ़ान / Thunderstorm Alert', message:'Thunderstorm with lightning detected. Very dangerous for field workers.', recommendation:'All field workers must return home immediately. Stay away from trees and open fields. Disconnect electrical equipment.' });

  // India-specific: Heatwave (very common in Rajasthan, Central India)
  if (temp >= 45) alerts.push({ type:'heat_wave', severity:'danger', title:'🔥 लू / Severe Heatwave Alert', message:`EXTREME HEAT: ${temp}°C (feels like ${feelsLike}°C). IMD heatwave warning!`, recommendation:'NO outdoor work between 11 AM - 4 PM. Water crops at dawn only. Provide shade and water for livestock.' });
  else if (temp >= 40 || feelsLike >= 42) alerts.push({ type:'heat_wave', severity:'danger', title:'🌡️ लू / Heatwave Alert', message:`Extreme heat: ${temp}°C (feels like ${feelsLike}°C).`, recommendation:'Avoid outdoor work midday. Water crops early morning. Provide shade for livestock.' });
  else if (temp >= 37) alerts.push({ type:'heat_wave', severity:'warning', title:'⚠️ गर्मी / High Temperature Warning', message:`High temperature: ${temp}°C. Stay hydrated.`, recommendation:'Increase irrigation frequency. Use mulching to retain soil moisture.' });

  // Cold wave - affects North India (Punjab, Haryana, UP)
  if (temp <= 2) alerts.push({ type:'cold_wave', severity:'danger', title:'❄️ शीत लहर / Severe Cold Wave', message:`Temperature: ${temp}°C. Severe cold wave warning for Northern India.`, recommendation:'Protect all standing crops with frost sheets. Keep livestock in sheltered areas. Use irrigation for frost protection.' });
  else if (temp <= 5) alerts.push({ type:'frost', severity:'danger', title:'❄️ पाला / Frost Warning', message:`Temperature dropped to ${temp}°C. Frost expected on crops.`, recommendation:'Cover sensitive crops (vegetables, pulses) with plastic sheets. Irrigate fields before nightfall.' });
  else if (temp <= 10) alerts.push({ type:'low_temperature', severity:'warning', title:'🥶 ठंड / Cold Alert', message:`Low temperature: ${temp}°C. Monitor crop health.`, recommendation:'Delay sowing of summer crops. Protect nursery plants.' });

  // Humidity - critical for rice, fungal diseases
  if (humidity >= 90) alerts.push({ type:'high_humidity', severity:'warning', title:'💧 अधिक नमी / Very High Humidity', message:`Humidity ${humidity}%. Extreme risk of rice blast, wheat rust, and other fungal diseases.`, recommendation:'Apply preventive fungicide. Avoid overhead irrigation. Improve field drainage.' });
  else if (humidity >= 80) alerts.push({ type:'high_humidity', severity:'warning', title:'💧 नमी / High Humidity Alert', message:`Humidity ${humidity}%. High risk of fungal diseases.`, recommendation:'Monitor for disease symptoms. Apply preventive fungicide if needed.' });

  // Wind - affects standing crops like sugarcane, maize, cotton
  if (windMs >= 20) alerts.push({ type:'strong_winds', severity:'danger', title:'💨 तेज़ हवा / Severe Wind Alert', message:`Dangerous winds: ${windMs} m/s (${Math.round(windKmh)} km/h).`, recommendation:'ALL field workers return home. Stake sugarcane, maize immediately. Secure loose materials.' });
  else if (windMs >= 15) alerts.push({ type:'strong_winds', severity:'warning', title:'💨 हवा / Strong Wind Alert', message:`Strong winds: ${windMs} m/s (${Math.round(windKmh)} km/h).`, recommendation:'Stake tall crops. Use windbreaks for cotton and vegetables.' });

  // Fog - affects North India during winter
  if (c.visibility && c.visibility < 500 && (desc.includes('fog') || desc.includes('mist'))) alerts.push({ type:'fog', severity:'warning', title:'🌫️ कोहरा / Dense Fog Alert', message:'Dense fog reducing visibility. Dangerous for travel and transport.', recommendation:'Delay transport of produce. Be careful on highways. Fog may damage standing wheat if prolonged.' });

  // Drought conditions
  if (humidity < 20 && temp > 35 && !desc.includes('rain')) alerts.push({ type:'drought', severity:'danger', title:'🏜️ सूखा / Drought Warning', message:`Critically low humidity (${humidity}%) with high temperature (${temp}°C).`, recommendation:'Conserve water urgently. Use drip irrigation. Prioritize irrigation for standing crops.' });

  // Pre-monsoon conditions
  if (temp > 35 && humidity > 60 && desc.includes('cloud')) alerts.push({ type:'storm', severity:'info', title:'🌤️ मानसून पूर्व / Pre-Monsoon Activity', message:'Pre-monsoon thunderstorm conditions detected. Monsoon approaching.', recommendation:'Prepare drainage channels. Check and repair farm equipment. Stock seeds for kharif season.' });

  return alerts;
}

// ─── Crop advice (stateless, works on Open-Meteo response) ──────────────────
function getCropAdvice(data) {
  const c = data.current || {};
  const temp = c.temperature_2m ?? 25;
  const humidity = c.relative_humidity_2m ?? 60;
  const windKmh = c.wind_speed_10m ?? 5;
  const windMs = Math.round(windKmh / 3.6 * 10) / 10;
  const w = wmo(c.weather_code);
  const desc = w.d.toLowerCase();

  const recommendations = [];
  const riskFactors = [];

  // India-specific temperature thresholds
  if (temp > 42) { recommendations.push({ type:'irrigation', advice:'critical', message:'Extreme heat! Water crops at dawn and dusk only. Use sprinkler irrigation to cool crops.' }); riskFactors.push({ risk:'Severe heat stress', level:'high', suggestion:'Install shade nets. Mulch heavily to retain moisture.' }); }
  else if (temp > 35) { recommendations.push({ type:'irrigation', advice:'increase', message:'Increase irrigation. Water early morning (5-7 AM) to reduce evaporation.' }); riskFactors.push({ risk:'Heat stress', level:'high', suggestion:'Use mulching. Provide shade for young plants.' }); }
  else if (temp > 30) { recommendations.push({ type:'irrigation', advice:'normal', message:'Maintain regular irrigation schedule.' }); riskFactors.push({ risk:'Moderate heat', level:'moderate', suggestion:'Monitor for wilting. Ensure adequate drainage.' }); }
  else if (temp < 10) { recommendations.push({ type:'irrigation', advice:'delay', message:'Cold weather - reduce irrigation. Water during afternoon when warmer.' }); riskFactors.push({ risk:'Cold damage', level:'high', suggestion:'Cover sensitive crops with frost protection sheets.' }); }

  // India-specific humidity thresholds (monsoon awareness)
  if (humidity > 90) { recommendations.push({ type:'disease', advice:'critical', message:'Very high humidity! Spray preventive fungicide immediately. Risk of blight and mildew.' }); riskFactors.push({ risk:'Fungal epidemic', level:'high', suggestion:'Apply copper-based fungicide. Improve air circulation.' }); }
  else if (humidity > 80) { recommendations.push({ type:'disease', advice:'warning', message:'High humidity increases risk of fungal diseases like blast, blight, and rust.' }); riskFactors.push({ risk:'Fungal infection', level:'high', suggestion:'Apply preventive fungicide. Avoid overhead irrigation.' }); }
  else if (humidity < 25) { recommendations.push({ type:'irrigation', advice:'increase', message:'Very low humidity - increase irrigation. Use drip irrigation for efficiency.' }); riskFactors.push({ risk:'Drought stress', level:'high', suggestion:'Mulch fields. Use drip irrigation.' }); }

  // Monsoon and rain
  if (desc.includes('heavy rain') || desc.includes('moderate rain')) { recommendations.push({ type:'irrigation', advice:'stop', message:'Monsoon/rain expected. Stop all irrigation. Ensure proper drainage in fields.' }); recommendations.push({ type:'harvesting', advice:'delay', message:'Do not harvest during rain. Protect harvested crops from moisture.' }); }
  else if (desc.includes('rain') || desc.includes('drizzle')) { recommendations.push({ type:'irrigation', advice:'reduce', message:'Light rain expected. Reduce irrigation accordingly.' }); }
  
  // Wind protection for standing crops
  if (windMs > 15) { recommendations.push({ type:'protection', advice:'critical', message:`Strong winds (${windMs} m/s)! Stake tall crops like sugarcane and maize immediately.` }); riskFactors.push({ risk:'Wind damage', level:'high', suggestion:'Install windbreaks. Stake tall crops.' }); }
  else if (windMs > 10) { recommendations.push({ type:'protection', advice:'wind', message:`Moderate winds (${windMs} m/s). Protect young seedlings and flowers.` }); riskFactors.push({ risk:'Wind damage', level:'moderate', suggestion:'Use temporary windbreaks.' }); }
  
  // Harvesting conditions
  if (temp > 25 && humidity < 50 && !desc.includes('rain')) { recommendations.push({ type:'harvesting', advice:'favorable', message:'Good conditions for harvesting. Ideal for wheat, mustard, and pulses.' }); }
  else if (desc.includes('rain')) { recommendations.push({ type:'harvesting', advice:'delay', message:'Rain expected. Delay harvesting. Protect stored grain from moisture.' }); }

  // India-specific: Monsoon preparedness
  if (temp > 28 && humidity > 70 && desc.includes('cloud')) {
    recommendations.push({ type:'monsoon', advice:'prepare', message:'Pre-monsoon conditions detected. Prepare drainage channels.' });
  }

  return { recommendations, riskFactors };
}

// ─── Supabase CRUD helpers ──────────────────────────────────────────────────

/** Save weather history record to Supabase */
export async function saveWeatherHistory(userId, weather) {
  const c = weather.current || {};
  const { error } = await supabase.from('weather_history').insert({
    user_id: userId,
    location: weather.location || '',
    temperature: Math.round(c.temp ?? 0),
    feels_like: Math.round(c.feelsLike ?? 0),
    humidity: Math.round(c.humidity ?? 0),
    pressure: Math.round(c.pressure ?? 0),
    visibility: Math.round(c.visibility ?? 0),
    wind_speed: c.windSpeed ?? 0,
    wind_deg: Math.round(c.windDeg ?? 0),
    clouds: Math.round(c.clouds ?? 0),
    uvi: c.uvi ?? 0,
    description: c.description || 'Unknown',
    icon: c.icon || '01d',
    raw_data: { temp: c.temp, humidity: c.humidity, description: c.description },
  });
  if (error) console.error('Failed to save weather history:', error);
}

/** Fetch weather history for charts */
export async function getWeatherHistory(userId, days = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data, error } = await supabase
    .from('weather_history')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: true })
    .limit(100);
  if (error) { console.error(error); return []; }
  return (data || []).map((r) => ({
    time: r.created_at,
    temp: r.temperature,
    humidity: r.humidity,
    windSpeed: r.wind_speed,
    pressure: r.pressure,
    uvi: r.uvi,
    description: r.description,
  }));
}

/** Save alerts to Supabase */
export async function saveAlerts(userId, alerts, weather) {
  for (const alert of alerts) {
    const { data: existing } = await supabase
      .from('alerts')
      .select('id')
      .eq('user_id', userId)
      .eq('type', alert.type)
      .gte('created_at', new Date(Date.now() - 3600000).toISOString())
      .limit(1);
    if (existing && existing.length > 0) continue;

    await supabase.from('alerts').insert({
      user_id: userId,
      type: alert.type,
      severity: alert.severity,
      title: alert.title,
      message: alert.message,
      recommendation: alert.recommendation || '',
      location_name: weather.location,
      latitude: weather.coordinates?.lat,
      longitude: weather.coordinates?.lon,
      weather_data: weather.current ? { temp: weather.current.temp, humidity: weather.current.humidity, windSpeed: weather.current.windSpeed, description: weather.current.description } : null,
    });
  }
}

/** Get alerts for user */
export async function getAlerts(userId, { severity, isRead, limit = 20, page = 1 } = {}) {
  let query = supabase.from('alerts').select('*', { count: 'exact' }).eq('user_id', userId).order('created_at', { ascending: false }).range((page - 1) * limit, page * limit - 1);
  if (severity) query = query.eq('severity', severity);
  if (isRead !== undefined) query = query.eq('is_read', isRead);
  const { data, count, error } = await query;
  if (error) { console.error(error); return { data: [], total: 0 }; }
  return { data: data || [], total: count || 0 };
}



/** Save crop recommendation */
export async function saveCropRecommendation(userId, weather, advice) {
  const wmoCode = weather?.current?.description || 'normal';
  await supabase.from('crop_recommendations').insert({
    user_id: userId,
    weather_condition: wmoCode,
    title: `Crop Advice - ${new Date().toLocaleDateString()}`,
    description: `Based on current conditions: ${weather.current?.description || ''}`,
    advice: advice.recommendations ? { irrigation: advice.recommendations.find((r) => r.type === 'irrigation')?.advice || 'normal' } : null,
    risk_factors: advice.riskFactors || [],
  });
}

/** Get notifications */
export async function getNotifications(userId, { limit = 20, page = 1 } = {}) {
  let query = supabase.from('notifications').select('*', { count: 'exact' }).eq('user_id', userId).order('created_at', { ascending: false }).range((page - 1) * limit, page * limit - 1);
  const { data, count, error } = await query;
  if (error) return { data: [], total: 0, unread: 0 };
  const { count: unread } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('is_read', false);
  return { data: data || [], total: count || 0, unread: unread || 0 };
}

/** Admin – get all users via RPC (bypasses RLS) */
export async function adminGetUsers({ search, limit = 50 } = {}) {
  const { data, error } = await supabase.rpc('admin_get_farmers', { p_search: search || null, p_limit: limit });
  if (error) { console.error('adminGetUsers error:', error); return []; }
  return data || [];
}

/** Admin – get stats via RPC (bypasses RLS) */
export async function adminGetStats() {
  const { data, error } = await supabase.rpc('admin_get_stats');
  if (error) { console.error('adminGetStats error:', error); return { totalUsers: 0, activeToday: 0, totalAlerts: 0, unreadAlerts: 0 }; }
  return data || { totalUsers: 0, activeToday: 0, totalAlerts: 0, unreadAlerts: 0 };
}

/** Admin – delete user via RPC (bypasses RLS) */
export async function adminDeleteUser(userId) {
  const { error } = await supabase.rpc('admin_delete_user', { p_user_id: userId });
  if (error) { console.error('adminDeleteUser error:', error); throw error; }
}

/** Admin – broadcast alert via RPC (bypasses RLS) */
export async function adminBroadcastAlert(data) {
  const { data: count, error } = await supabase.rpc('admin_broadcast_alert', {
    p_type: data.type,
    p_severity: data.severity,
    p_title: data.title,
    p_message: data.message,
    p_recommendation: data.recommendation || '',
  });
  if (error) { console.error('adminBroadcastAlert error:', error); throw error; }
  return count;
}
