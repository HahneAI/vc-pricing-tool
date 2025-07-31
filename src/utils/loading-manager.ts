import { useState, useEffect } from 'react';

const LOADING_DURATION = 300; // 300ms intentional delay

interface LoadingConfig {
  duration?: number;
  animation?: 'fade' | 'slide' | 'custom';
  customComponent?: React.ComponentType;
}

/**
 * Custom hook to manage the initial application loading state.
 * It enforces a minimum loading duration to prevent jarring flashes.
 * @param {LoadingConfig} config - Configuration for the loading behavior.
 * @returns {boolean} - Returns true if the app is currently in the initial loading state.
 */
export const useAppLoading = (config: LoadingConfig = {}): boolean => {
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, config.duration || LOADING_DURATION);

    return () => clearTimeout(timer);
  }, [config.duration]);

  return isAppLoading;
};
