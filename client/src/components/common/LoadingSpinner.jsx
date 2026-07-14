export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12', xl: 'w-16 h-16' };
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizes[size]} border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin`} />
    </div>
  );
};

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin" />
      <p className="text-gray-500 dark:text-gray-400 animate-pulse">Loading...</p>
    </div>
  </div>
);

export const Skeleton = ({ className = '' }) => (
  <div className={`skeleton ${className}`} />
);

export const WeatherCardSkeleton = () => (
  <div className="glass-card p-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="skeleton h-5 w-32" />
      <div className="skeleton h-12 w-12 rounded-xl" />
    </div>
    <div className="skeleton h-10 w-24 mb-2" />
    <div className="skeleton h-4 w-48 mb-4" />
    <div className="grid grid-cols-2 gap-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="skeleton h-12 rounded-lg" />
      ))}
    </div>
  </div>
);

export const ChartSkeleton = () => (
  <div className="glass-card p-6 animate-pulse">
    <div className="skeleton h-5 w-40 mb-4" />
    <div className="skeleton h-48 w-full rounded-xl" />
  </div>
);
