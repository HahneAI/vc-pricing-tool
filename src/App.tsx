import { useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import LoadingScreen from './components/ui/LoadingScreen';
import { ThemeProvider } from './context/ThemeContext';
import { getCoreConfig } from './config/industry';
import { useAppLoading } from './utils/loading-manager';
import { ThemeApplicator } from './components/ThemeApplicator';

const coreConfig = getCoreConfig();

function App() {
  const isAppLoading = useAppLoading({ duration: 2000 });

  useEffect(() => {
    document.title = `${coreConfig.companyName} - AI Assistant`;
  }, []);

  if (isAppLoading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider>
      <ThemeApplicator />
      <div className="min-h-screen transition-colors duration-500 bg-background text-text-primary">
        <ChatInterface />
      </div>
    </ThemeProvider>
  );
}

export default App;