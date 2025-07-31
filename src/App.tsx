import { useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import LoadingScreen from './components/ui/LoadingScreen';
import { ThemeProvider } from './context/ThemeContext';
import { useAppLoading } from './utils/loading-manager';

function App() {
  const isAppLoading = useAppLoading();

  useEffect(() => {
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