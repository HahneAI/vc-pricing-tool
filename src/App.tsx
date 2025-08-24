import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/auth/Login.tsx';
import Register from './pages/auth/Register.tsx';
import ChatInterface from './components/ChatInterface';
import NotFound from './pages/NotFound.tsx';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingScreen from './components/common/LoadingScreen';
import { ThemeProvider } from './context/ThemeContext';
import { ThemeApplicator } from './components/ThemeApplicator';

function App() {
  const { loading } = useAuth();
  
  useEffect(() => {
    document.title = 'TradeSphere - AI Pricing Assistant';
  }, []);
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <ThemeProvider>
      <ThemeApplicator />
      <div className="min-h-screen transition-colors duration-500 bg-background text-text-primary">
        <Routes>
          {/* Auth Routes - Hidden but kept for Task 5 */}
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/" replace />} />
          
          {/* Main Chat Interface (Protected with auto-login) */}
          <Route path="/" element={<ProtectedRoute><ChatInterface /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatInterface /></ProtectedRoute>} />
          
          {/* Mobile Routes - Temporarily commented out until file structure is confirmed */}
          {/* <Route path="/mobile/dashboard" element={<ProtectedRoute><MobileDashboard /></ProtectedRoute>} /> */}
          {/* <Route path="/mobile/time-entry" element={<ProtectedRoute><MobileTimeEntry /></ProtectedRoute>} /> */}
          {/* <Route path="/mobile/job/:id" element={<ProtectedRoute><MobileJobView /></ProtectedRoute>} /> */}
          
          {/* Redirect old CRM routes */}
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/quotes" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;