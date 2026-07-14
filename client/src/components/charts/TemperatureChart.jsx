import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

const TemperatureChart = ({ data, loading }) => {
  const { isDark } = useTheme();
  const chartRef = useRef(null);

  const chartData = {
    labels: data?.map((d) => {
      const date = new Date(d.time);
      return `${date.getHours()}:00`;
    }) || [],
    datasets: [
      {
        label: 'Temperature (°C)',
        data: data?.map((d) => d.temp) || [],
        borderColor: '#3b82f6',
        backgroundColor: (ctx) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? '#1f2937' : '#fff',
        titleColor: isDark ? '#fff' : '#111',
        bodyColor: isDark ? '#d1d5db' : '#374151',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 12,
        padding: 12,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280',
          maxTicksLimit: 8,
        },
      },
      y: {
        grid: {
          color: isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(156, 163, 175, 0.2)',
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280',
          callback: (value) => `${value}°C`,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="skeleton h-5 w-40 mb-4" />
        <div className="skeleton h-48 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
        🌡️ Temperature Trend
      </h3>
      <div className="h-48">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </motion.div>
  );
};

export default TemperatureChart;
