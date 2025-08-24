import React, { useState, useEffect, useRef } from 'react';
import * as Icons from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { flushSync } from 'react-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext'; // Add this import
import {
    getCoreConfig,
    getTerminologyConfig,
    getSmartVisualThemeConfig,
} from '../config/industry';
import { triggerSendEffect } from './ui/IndustryEffects';
import TypingIndicator from './ui/TypingIndicator';
import { ThemeAwareMessageBubble } from './ui/ThemeAwareMessageBubble';
import { ThemeAwareAvatar } from './ui/ThemeAwareAvatar';
import { Message } from '../types/job';

const coreConfig = getCoreConfig();
const terminologyConfig = getTerminologyConfig();

const DynamicIcon = ({ name, ...props }: { name: keyof typeof Icons } & Icons.LucideProps) => {
  const IconComponent = Icons[name];
  if (!IconComponent) {
    return <Icons.MessageCircle {...props} />;
  }
  return <IconComponent {...props} />;
};

const ChatInterface = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth(); // Already importing useAuth - now we use user data!
  const visualConfig = getSmartVisualThemeConfig(theme);

  const generateSessionId = () => {
  if (!user) {
    console.warn("No user context for session generation, using basic session ID");
    return `quote_session_${Date.now()}`;
  }
  
  // Include user context in session ID for better tracking
  const userPrefix = user.first_name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const betaId = user.beta_code_id;
  const timestamp = Date.now();
  
  return `quote_session_${userPrefix}_${betaId}_${timestamp}`;
};
  
  const sessionIdRef = useRef<string>(generateSessionId());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastPollTimeRef = useRef<Date>(new Date());
  const sendButtonRef = useRef<HTMLButtonElement>(null);
  const refreshButtonRef = useRef<HTMLButtonElement>(null);

  const welcomeMessage = import.meta.env.VITE_WELCOME_MESSAGE || `Welcome to ${coreConfig.companyName}! How can I help you today?`;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: welcomeMessage,
      sender: 'ai',
      timestamp: new Date(),
      sessionId: sessionIdRef.current
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // Add logout modal state

  const MAKE_WEBHOOK_URL = coreConfig.makeWebhookUrl;
  const NETLIFY_API_URL = `/.netlify/functions/chat-messages/${sessionIdRef.current}`;

  // Logout handler
  const handleLogout = () => {
    signOut();
    // App.tsx will handle redirecting to login screen via useEffect
  };

  const sendUserMessageToMake = async (userMessageText: string) => {
    if (!MAKE_WEBHOOK_URL) {
      console.warn("Make.com webhook URL is not configured. Skipping message sending.");
      return;
    }

    // Add user data validation
    if (!user) {
      console.error("No user data available for Make.com webhook");
      throw new Error("User not authenticated");
    }

    try {
      const response = await fetch(MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessageText,
          timestamp: new Date().toISOString(),
          sessionId: sessionIdRef.current,
          source: 'TradeSphere',
          techId: user.tech_uuid,           // ✅ REAL tech UUID from logged-in user
          firstName: user.first_name,       // ✅ ADD user's first name to payload
          jobTitle: user.job_title,         // ✅ BONUS: job title for context
          betaCodeId: user.beta_code_id     // ✅ BONUS: beta code ID for tracking
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message to Make.com');
      }
      
      console.log('✅ User message sent to Make.com successfully with user data:', {
        techId: user.tech_uuid,
        firstName: user.first_name,
        sessionId: sessionIdRef.current
      });
    } catch (error) {
      console.error('❌ Error sending user message to Make.com:', error);
      throw error;
    }
  };

  // Poll for new AI messages
  const pollForAiMessages = async () => {
    if (!NETLIFY_API_URL) return;
    
    try {
      const response = await fetch(`${NETLIFY_API_URL}?since=${lastPollTimeRef.current.toISOString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch AI messages');
      }

      const newAiMessages = await response.json();
      
      if (newAiMessages.length > 0) {
        const processedMessages = newAiMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));

        setMessages(prev => {
          const existingIds = new Set(prev.map(msg => msg.id));
          const uniqueNewMessages = processedMessages.filter((msg: Message) => !existingIds.has(msg.id));
          
          if (uniqueNewMessages.length > 0) {
            setIsLoading(false);
            lastPollTimeRef.current = new Date();
            return [...prev, ...uniqueNewMessages];
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Error polling for AI messages:', error);
    }
  };

  // Set up polling interval
  useEffect(() => {
    const pollingInterval = setInterval(pollForAiMessages, 3000);
    return () => clearInterval(pollingInterval);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ENHANCED: Initialize with user context when user changes
  useEffect(() => {
    if (user && !sessionIdRef.current.includes(user.first_name.toLowerCase())) {
    // User logged in or switched - regenerate session with their context
    handleRefreshChat();
  }
}, [user]); // React to user changes

  const handleRefreshChat = () => {
  if (!user) {
    console.error("Cannot refresh chat - no user logged in");
    return;
  }

  // Generate new user-contextual session ID
  sessionIdRef.current = generateSessionId();

  // Reset messages to initial welcome message with user's name
  const personalizedWelcome = user.first_name 
    ? `Hi ${user.first_name}! Let's make some profit. What are we working on today?`
    : welcomeMessage;

  setMessages([{
    id: '1',
    text: personalizedWelcome,
    sender: 'ai',
    timestamp: new Date(),
    sessionId: sessionIdRef.current
  }]);

  // Clear any loading states
  setIsLoading(false);
  setInputText('');

  // Reset polling timestamp
  lastPollTimeRef.current = new Date();

  console.log('🔄 Chat refreshed with new user session:', sessionIdRef.current);
  console.log('👤 User context:', { 
    name: user.first_name, 
    betaId: user.beta_code_id,
    techId: user.tech_uuid 
  });
};

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessageText = inputText;
    const userMessage: Message = {
      id: uuidv4(),
      text: userMessageText,
      sender: 'user',
      timestamp: new Date(),
      sessionId: sessionIdRef.current
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      await sendUserMessageToMake(userMessageText);
    } catch (error) {
      const errorMessage: Message = {
        id: uuidv4(),
        text: "Sorry, there was an error sending your message. Please try again.",
        sender: 'ai',
        timestamp: new Date(),
        sessionId: sessionIdRef.current
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden transition-colors duration-500" style={{ backgroundColor: visualConfig.colors.background }}>
      {/* Header */}
      <header className="flex-shrink-0 border-b transition-colors duration-300" style={{ borderBottomColor: theme === 'light' ? '#e5e7eb' : '#374151', backgroundColor: visualConfig.colors.surface }}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Company Info */}
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {coreConfig.logoUrl ? (
                  <img src={coreConfig.logoUrl} alt={`${coreConfig.companyName} Logo`} className='h-10 w-auto' />
                ) : (
                  <DynamicIcon
                    name={coreConfig.headerIcon}
                    className="h-8 w-8"
                    style={{ color: visualConfig.colors.text.onPrimary }}
                  />
                )}
              </div>
              <div>
                <h1
                  className="text-2xl font-bold"
                  style={{ color: visualConfig.colors.text.primary }}
                >
                  {coreConfig.companyName}
                </h1>
                <p
                  className="text-sm"
                  style={{ color: visualConfig.colors.text.secondary }}
                >
                  {terminologyConfig.businessType}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-3">
              {/* Refresh Button */}
              <button
                ref={refreshButtonRef}
                onClick={handleRefreshChat}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  backgroundColor: visualConfig.colors.primary,
                  color: visualConfig.colors.text.onPrimary,
                  '--tw-ring-color': visualConfig.colors.primary,
                }}
                title="Start a new chat session"
              >
                <DynamicIcon name="RotateCcw" className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">New Chat</span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-3 rounded-xl transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  backgroundColor: theme === 'light' ? '#f3f4f6' : '#374151',
                  color: visualConfig.colors.text.secondary
                }}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ?
                  <Icons.Sun className="h-6 w-6" /> :
                  <Icons.Moon className="h-6 w-6" />
                }
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col overflow-hidden p-4">
        <div
          className="flex-1 rounded-2xl shadow-lg flex flex-col overflow-hidden min-h-0 transition-all duration-300"
          style={{
            backgroundColor: visualConfig.colors.surface,
            borderRadius: visualConfig.patterns.componentShape === 'organic' ? '1.5rem' : '0.75rem'
          }}
        >
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`
                  ${isRefreshing ? 'animate-fade-up-out' : ''}
                  ${!isRefreshing && index === messages.length - 1 && message.sender === 'user' ? 'animate-fade-up-in-delay-user' : ''}
                  ${!isRefreshing && index === messages.length - 1 && message.sender === 'ai' ? 'animate-fade-up-in-delay' : ''}
                `}
              >
                <ThemeAwareMessageBubble
                  message={message}
                  visualConfig={visualConfig}
                  theme={theme}
                />
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-start gap-3 justify-start animate-loading-entry">
                <ThemeAwareAvatar sender="ai" visualConfig={visualConfig} />
                <div
                  className="px-5 py-3 rounded-2xl shadow-md flex items-center gap-3 transition-colors duration-300"
                  style={{ backgroundColor: visualConfig.colors.elevated }}
                >
                  <TypingIndicator />
                  <p
                    className="text-sm"
                    style={{ color: visualConfig.colors.text.secondary }}
                  >
                    {terminologyConfig.statusMessages.thinking}
                  </p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div
            className="border-t p-3 transition-colors duration-300"
            style={{
              backgroundColor: visualConfig.colors.surface,
              borderTopColor: theme === 'light' ? '#e5e7eb' : '#374151'
            }}
          >
            <div className="flex items-center space-x-4 max-w-4xl mx-auto">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={terminologyConfig.placeholderExamples}
                className="flex-1 px-3 py-2 rounded-xl resize-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                style={{
                  backgroundColor: visualConfig.colors.background,
                  color: visualConfig.colors.text.primary,
                  borderColor: visualConfig.colors.secondary,
                  '--tw-ring-color': visualConfig.colors.primary,
                  borderRadius: visualConfig.patterns.componentShape === 'organic' ? '1.25rem' : '0.75rem'
                }}
                rows={1}
                disabled={isLoading}
              />
              <button
                ref={sendButtonRef}
                onClick={handleSendMessage}
                disabled={isLoading || !inputText.trim()}
                className="px-5 py-3 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg"
                style={{
                  backgroundColor: visualConfig.colors.primary,
                  color: visualConfig.colors.text.onPrimary,
                  borderRadius: visualConfig.patterns.componentShape === 'organic' ? '1.25rem' : '0.75rem'
                }}
              >
                <DynamicIcon name="Send" className="h-5 w-5" />
                <span className="hidden sm:inline font-semibold">
                  {terminologyConfig.buttonTexts.send}
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Logout Button - Fixed Position Bottom Right */}
      <button
        onClick={() => setShowLogoutModal(true)}
        className="fixed bottom-6 right-6 p-3 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-300 z-50"
        title="Logout"
      >
        <Icons.LogOut className="h-6 w-6" />
      </button>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-2xl animate-scale-in">
            <div className="text-center">
              <Icons.AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Confirm Logout
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to logout? Your current chat session will be lost.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add these CSS animations in your global styles */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;