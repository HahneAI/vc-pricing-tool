import { useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  useEffect(() => {
    // Set app title
    document.title = 'TradeSphere - AI Pricing Tool';
  }, []);
  
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <ChatInterface />
      </div>
    </ThemeProvider>
  );
}

export default App;