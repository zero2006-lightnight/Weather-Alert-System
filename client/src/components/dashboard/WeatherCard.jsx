import { motion } from 'framer-motion';
import {
  HiSun, HiEye, HiCloud,
} from 'react-icons/hi';
import { WiHumidity, WiStrongWind, WiBarometer, WiSunrise, WiSunset, WiRain } from 'react-icons/wi';
import { WeatherCardSkeleton } from '../common/LoadingSpinner';

const WeatherCard = ({ weather, loading }) => {
  if (loading) return <WeatherCardSkeleton />;
  if (!weather) return null;

  const { current, alerts } = weather;

  const getWeatherBackground = () => {
    const desc = current.description?.toLowerCase() || '';
    const icon = current.icon || '01d';

    if (icon.endsWith('n')) return 'from-gray-800 via-blue-900 to-gray-900';
    if (desc.includes('rain') || desc.includes('drizzle')) return 'from-blue-600 via-blue-500 to-indigo-600';
    if (desc.includes('thunder') || desc.includes('storm')) return 'from-gray-700 via-indigo-800 to-purple-900';
    if (desc.includes('cloud')) return 'from-gray-400 via-gray-500 to-gray-600';
    if (desc.includes('fog') || desc.includes('mist') || desc.includes('haze')) return 'from-gray-300 via-gray-400 to-gray-500';
    if (desc.includes('snow')) return 'from-blue-200 via-blue-300 to-indigo-300';
    return 'from-blue-400 via-blue-500 to-cyan-600';
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const metricItems = [
    {
      label: 'Humidity',
      value: `${current.humidity}%`,
      icon: WiHumidity,
      color: 'text-blue-400',
    },
    {
      label: 'Wind Speed',
      value: `${current.windSpeed?.toFixed(1)} m/s`,
      icon: WiStrongWind,
      color: 'text-cyan-400',
    },
    {
      label: 'Pressure',
      value: `${current.pressure} hPa`,
      icon: WiBarometer,
      color: 'text-yellow-400',
    },
    {
      label: 'Visibility',
      value: `${(current.visibility / 1000).toFixed(1)} km`,
      icon: HiEye,
      color: 'text-emerald-400',
    },
    {
      label: 'UV Index',
      value: current.uvi?.toFixed(1) || '0',
      icon: HiSun,
      color: 'text-orange-400',
    },
    {
      label: 'Cloudiness',
      value: `${current.clouds}%`,
      icon: HiCloud,
      color: 'text-gray-400',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden"
    >
      {/* Main Weather Card */}
      <div className={`rounded-3xl p-6 md:p-8 text-white bg-gradient-to-br ${getWeatherBackground()} shadow-2xl relative`}>

          {/* Location & Date */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">{weather.location || 'Your Location'}</h2>
              <p className="text-white/70 text-sm mt-1">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="text-right">
              <div className="text-6xl font-light">{current.temp}°</div>
              <p className="text-white/80 capitalize mt-1">{current.description}</p>
            </div>
          </div>

          {/* Weather Icon & Feels Like */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <img
                  src={current.iconUrl}
                  alt={current.description}
                  className="w-20 h-20 animate-bounce"
                />
              <div>
                <p className="text-4xl font-bold">{current.temp}°C</p>
                <p className="text-white/70 text-sm">
                  Feels like {current.feelsLike}°C
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <WiSunrise className="text-xl" />
                  <span>{formatTime(current.sunrise)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <WiSunset className="text-xl" />
                  <span>{formatTime(current.sunset)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {metricItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/20 transition-all duration-300"
              >
                <div className="flex items-center space-x-2 mb-1">
                  <item.icon className={`text-xl ${item.color}`} />
                  <span className="text-white/60 text-xs">{item.label}</span>
                </div>
                <p className="text-lg font-semibold">{item.value}</p>
              </motion.div>
            ))}
          </div>
        </div>

      {/* Active Alerts */}
      {alerts && alerts.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Active Alerts</h3>
          {alerts.map((alert, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`alert-${alert.severity} flex items-start space-x-3`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {alert.severity === 'danger' ? '🚨' : alert.severity === 'warning' ? '⚠️' : 'ℹ️'}
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">{alert.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{alert.message}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default WeatherCard;
