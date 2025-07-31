import { useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import LoadingScreen from './components/ui/LoadingScreen';
import { ThemeProvider } from './context/ThemeContext';
import { config } from './utils/environment-config';
import { useAppLoading } from './utils/loading-manager';


function App() {
  const isAppLoading = useAppLoading();

  useEffect(() => {
    // Set app title
    document.title = `${config.companyName} - AI Pricing Tool`;

    // Set primary color CSS variable
    document.documentElement.style.setProperty('--primary-color', config.primaryColor);
    document.title = 'TradeSphere - AI Pricing Tool';
  }, []);

  if (isAppLoading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider>
      {/* Main Content Fade-in */}
      <div className="min-h-screen bg-enterprise-gray-light dark:bg-gray-900 transition-colors duration-500 animate-fadeIn">
        <ChatInterface />
      </div>
    </ThemeProvider>
  );
}

export default App;