import { useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import LoadingScreen from './components/ui/LoadingScreen';
import { ThemeProvider } from './context/ThemeContext';
import { getCoreConfig, getVisualThemeConfig } from './config/industry';
import { useAppLoading } from './utils/loading-manager';

const coreConfig = getCoreConfig();
const visualConfig = getVisualThemeConfig();

function App() {
  const isAppLoading = useAppLoading({ duration: 2000 }); // Increased duration for brand showcase

  useEffect(() => {
    // Set app title from config
    document.title = `${coreConfig.companyName} - AI Assistant`;

    // Set root CSS variables for colors
    const root = document.documentElement;
    root.style.setProperty('--primary-color', visualConfig.colors.primary);
    root.style.setProperty('--secondary-color', visualConfig.colors.secondary);
    root.style.setProperty('--accent-color', visualConfig.colors.accent);

  }, []);

  if (isAppLoading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen transition-colors duration-500">
        <ChatInterface />
      </div>
    </ThemeProvider>
  );
}

export default App;