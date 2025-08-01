import React from 'react';
import * as Icons from 'lucide-react';
import { config } from '../../utils/environment-config';

// A bit of a hack to dynamically render Lucide icons from a string
const DynamicIcon = ({ name, ...props }: { name: string } & Icons.LucideProps) => {
  const IconComponent = Icons[name as keyof typeof Icons];

  if (!IconComponent) {
    // Fallback icon if the specified icon name is not found
    return <Icons.MessageCircle {...props} />;
  }

  return <IconComponent {...props} />;
};


const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-enterprise-gray-light flex flex-col items-center justify-center z-50" style={{
        backgroundColor: 'var(--landscape-neutral)'
    }}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {/* Logo with pulse animation */}
          <div className="w-20 h-20 bg-enterprise-blue text-white rounded-2xl flex items-center justify-center shadow-professional-lg" style={{
              backgroundColor: 'var(--landscape-primary)',
              color: 'white'
          }}>
            <DynamicIcon name={config.loadingIcon} size={40} />
          </div>
          {/* Subtle ping animation */}
          <div className="absolute inset-0 bg-enterprise-blue-light rounded-2xl animate-ping opacity-30 -z-10" style={{
              backgroundColor: 'var(--landscape-accent)'
          }}></div>
        </div>

        {/* Brand Name */}
        <h1 className="text-4xl font-display font-bold text-enterprise-blue mt-6" style={{
            color: 'var(--landscape-primary)'
        }}>
          {config.companyName}
        </h1>

        {/* Loading text */}
        <p className="text-enterprise-gray" style={{
            color: 'var(--landscape-secondary)'
        }}>
          {config.statusMessages.processing}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
