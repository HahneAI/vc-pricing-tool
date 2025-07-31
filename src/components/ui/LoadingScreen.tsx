import { MessageCircle } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-enterprise-gray-light flex flex-col items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {/* Logo with pulse animation */}
          <div className="w-20 h-20 bg-enterprise-blue text-white rounded-2xl flex items-center justify-center shadow-professional-lg">
            <MessageCircle size={40} />
          </div>
          {/* Subtle ping animation */}
          <div className="absolute inset-0 bg-enterprise-blue-light rounded-2xl animate-ping opacity-30 -z-10"></div>
        </div>

        {/* Brand Name */}
        <h1 className="text-4xl font-display font-bold text-enterprise-blue mt-6">
          TradeSphere
        </h1>

        {/* Loading text */}
        <p className="text-enterprise-gray">
          Initializing AI Pricing Engine...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
