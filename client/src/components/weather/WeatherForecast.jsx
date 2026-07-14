import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WiDaySunny, WiCloud, WiRain, WiSnow, WiThunderstorm } from 'react-icons/wi';

const getWeatherIcon = (icon) => {
  if (!icon) return WiDaySunny;
  if (icon.includes('01')) return WiDaySunny;
  if (icon.includes('02') || icon.includes('03') || icon.includes('04')) return WiCloud;
  if (icon.includes('09') || icon.includes('10')) return WiRain;
  if (icon.includes('11')) return WiThunderstorm;
  if (icon.includes('13')) return WiSnow;
  return WiDaySunny;
};

const ForecastCard = ({ data, type }) => {
  const Icon = getWeatherIcon(data.icon);

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="glass-card p-4 text-center cursor-pointer group min-w-[100px]"
    >
      {type === 'hourly' ? (
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {new Date(data.time * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </p>
      ) : (
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {data.date?.split(',')[0]}
        </p>
      )}
      <Icon className="w-8 h-8 mx-auto my-2 text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform" />
      <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
        {type === 'daily' ? `${data.tempMax}°` : `${data.temp}°`}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize truncate">
        {data.description}
      </p>
      {type === 'daily' && (
        <div className="flex justify-center space-x-2 mt-1">
          <span className="text-xs text-blue-500">{data.tempMin}°</span>
          <span className="text-xs text-red-500">{data.tempMax}°</span>
        </div>
      )}
    </motion.div>
  );
};

const WeatherForecast = ({ forecast, loading }) => {
  const [activeTab, setActiveTab] = useState('hourly');

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="skeleton h-6 w-32 mb-6" />
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton h-32 w-24 flex-shrink-0 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!forecast) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Weather Forecast
        </h3>
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('hourly')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === 'hourly'
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Hourly
          </button>
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === 'daily'
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            7 Days
          </button>
        </div>
      </div>

      {/* Forecast Cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: activeTab === 'hourly' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          className="flex space-x-3 overflow-x-auto pb-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none' }}
        >
          {activeTab === 'hourly'
            ? forecast.hourly?.map((hour, i) => (
                <ForecastCard key={i} data={hour} type="hourly" />
              ))
            : forecast.daily?.map((day, i) => (
                <ForecastCard key={i} data={day} type="daily" />
              ))}
        </motion.div>
      </AnimatePresence>

      {/* Forecast Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Rain Chance</p>
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {forecast.hourly?.slice(0, 3)?.reduce((sum, h) => sum + (h.rain || 0), 0).toFixed(1)}mm
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Avg Humidity</p>
          <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
            {Math.round(forecast.hourly?.slice(0, 8)?.reduce((sum, h) => sum + h.humidity, 0) / 8)}%
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Max Wind</p>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {Math.max(...(forecast.hourly?.map((h) => h.windSpeed) || [0]))} m/s
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Pressure</p>
          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {forecast.hourly?.[0]?.pressure || 'N/A'} hPa
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default WeatherForecast;
