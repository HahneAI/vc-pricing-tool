import { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import BetaLogin from './components/BetaLogin';
import OnboardingForm from './components/OnboardingForm';
import ChatInterface from './components/ChatInterface';
import LoadingScreen from './components/ui/LoadingScreen';
import { ThemeProvider } from './context/ThemeContext';
import { ThemeApplicator } from './components/ThemeApplicator';

type AppState = 'loading' | 'login' | 'onboarding' | 'authenticated';

function App() {
  const { user, loading, validateBetaCode, registerBetaUser, signInBetaUser } = useAuth();
  const [appState, setAppState] = useState<AppState>('loading');
  const [validBetaCode, setValidBetaCode] = useState<string>('');
  const [registrationError, setRegistrationError] = useState('');

  useEffect(() => {
    document.title = 'TradeSphere - AI Pricing Assistant';
    
    if (!loading) {
      if (user) {
        setAppState('authenticated');
      } else {
        setAppState('login');
      }
    }
  }, [loading, user]);

  // Handle valid beta code from BetaLogin
  const handleValidBetaCode = (code: string) => {
    setValidBetaCode(code);
    setAppState('onboarding');
  };

  // Handle existing user login from BetaLogin  
  const handleExistingUserLogin = async (email: string, password: string) => {
    const result = await signInBetaUser(email, password);
    if (result.success) {
      setAppState('authenticated');
    } else {
      console.error('Login failed:', result.error);
      // Error will be handled by BetaLogin component
    }
  };

  // Handle onboarding completion
  const handleOnboardingComplete = async (userData: {
    email: string;
    fullName: string;
    jobTitle: string;
    password: string;
  }) => {
    setRegistrationError('');
    
    const result = await registerBetaUser(userData, validBetaCode);
    
    if (result.success) {
      setAppState('authenticated');
    } else {
      setRegistrationError(result.error || 'Registration failed');
      console.error('Registration failed:', result.error);
    }
  };

  // Show loading screen while auth is initializing
  if (appState === 'loading') {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider>
      <ThemeApplicator />
      <div className="min-h-screen transition-colors duration-500 bg-background text-text-primary">
        {appState === 'login' && (
          <BetaLogin
            onValidCode={handleValidBetaCode}
            onExistingUser={handleExistingUserLogin}
          />
        )}
        
        {appState === 'onboarding' && (
          <div>
            <OnboardingForm
              betaCode={validBetaCode}
              onComplete={handleOnboardingComplete}
            />
            {registrationError && (
              <div className="fixed bottom-4 right-4 p-4 bg-red-50 border border-red-200 rounded-lg shadow-lg max-w-sm">
                <p className="text-red-700 text-sm">{registrationError}</p>
                <button 
                  onClick={() => setRegistrationError('')}
                  className="text-red-500 hover:text-red-700 text-xs underline mt-1"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        )}
        
        {appState === 'authenticated' && user && (
          <div>
            {/* Debug info - remove in production */}
            <div className="hidden">
              <p>Logged in as: {user.full_name} ({user.job_title})</p>
              <p>Tech UUID: {user.tech_uuid}</p>
              <p>Beta Code: {user.beta_code_used}</p>
            </div>
            
            <ChatInterface />
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;