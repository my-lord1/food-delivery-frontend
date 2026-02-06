import { Utensils } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', fullScreen = false }) => {
  const containerSizes = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
  };

  const iconSizes = {
    sm: 16,
    md: 28,
    lg: 48,
  };

  const SpinnerContent = () => (
    <div className={`relative flex items-center justify-center ${containerSizes[size]}`}>
      <div className="absolute inset-0 bg-orange-100 rounded-full animate-ping opacity-75"></div>
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 border-r-orange-400 animate-spin"></div>
      <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-gray-900 animate-spin-slow"></div>
      <div className="relative z-10 bg-white rounded-full p-2 shadow-sm">
        <Utensils size={iconSizes[size]} className="text-orange-600 animate-pulse" strokeWidth={2.5}/>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-md transition-all">
        <SpinnerContent />
        <p className="mt-4 text-sm font-black text-gray-400 tracking-widest uppercase animate-pulse">
          Loading Giggidy...
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      <SpinnerContent />
    </div>
  );
};

export default LoadingSpinner;