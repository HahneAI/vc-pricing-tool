// ENHANCED ChatInterface.tsx - Adding enterprise performance ON TOP of existing features
import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Icons from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { flushSync } from 'react-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
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
  const { user, signOut } = useAuth();
  const visualConfig = getSmartVisualThemeConfig(theme);

  // ⚡ ENTERPRISE: Performance metrics (NEW)
  const [performanceMetrics, setPerformanceMetrics] = useState({
    webhookLatency: null,
    functionLatency: null,
    totalResponseTime: null,
    makecomProcessingTime: null
  });

  // ⚡ ENTERPRISE: Advanced loading states (NEW)
  const [loadingStage, setLoadingStage] = useState(null);
  const [processingStartTime, setProcessingStartTime] = useState(null);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState(null);
  const [connectionHealth, setConnectionHealth] = useState('healthy');

  const generateSessionId = () => {
    if (!user) {
      console.warn("No user context for session generation, using basic session ID");
      return `quote_session_${Date.now()}`;
    }
    
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
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const MAKE_WEBHOOK_URL = coreConfig.makeWebhookUrl;
  const NETLIFY_API_URL = `/.netlify/functions/chat-messages/${sessionIdRef.current}`;

  // ⚡ ENTERPRISE: Loading stages (NEW)
  const loadingStages = {
    'sending': { 
      message: 'Sending your message...', 
      icon: 'Send', 
      estimate: '< 1 second',
      color: 'text-blue-500' 
    },
    'processing': { 
      message: 'AI is analyzing your request...', 
      icon: 'Bot', 
      estimate: '30-45 seconds',
      color: 'text-purple-500' 
    },
    'calculating': { 
      message: 'Calculating pricing and gathering data...', 
      icon: 'Clock', 
      estimate: '15-30 seconds remaining',
      color: 'text-orange-500' 
    },
    'finalizing': { 
      message: 'Preparing your response...', 
      icon: 'CheckCircle', 
      estimate: '< 5 seconds',
      color: 'text-green-500' 
    }
  };

  const handleLogout = () => {
    signOut();
  };

  // ⚡ ENHANCED: sendUserMessageToMake with performance tracking
  const sendUserMessageToMake = async (userMessageText: string) => {
    if (!MAKE_WEBHOOK_URL) {
      console.warn("Make.com webhook URL is not configured. Skipping message sending.");
      return;
    }

    if (!user) {
      console.error("No user data available for Make.com webhook");
      throw new Error("User not authenticated");
    }

    // ⚡ ENTERPRISE: Performance tracking
    const startTime = performance.now();
    setLoadingStage('sending');
    setProcessingStartTime(Date.now());

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
          techId: user.tech_uuid,
          firstName: user.first_name,
          jobTitle: user.job_title,
          betaCodeId: user.beta_code_id,
          requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
        })
      });

      const webhookLatency = performance.now() - startTime;
      setPerformanceMetrics(prev => ({
        ...prev,
        webhookLatency: webhookLatency.toFixed(2)
      }));

      if (!response.ok) {
        throw new Error('Failed to send message to Make.com');
      }
      
      console.log('✅ User message sent to Make.com successfully with user data:', {
        techId: user.tech_uuid,
        firstName: user.first_name,
        sessionId: sessionIdRef.current
      });

      // ⚡ ENTERPRISE: Advanced loading progression
      setLoadingStage('processing');
      setEstimatedWaitTime(45);
      startEnterprisePolling();
      startLoadingCountdown();

    } catch (error) {
      setLoadingStage(null);
      console.error('❌ Error sending user message to Make.com:', error);
      throw error;
    }
  };

  // ⚡ ENTERPRISE: Loading countdown (NEW)
  const startLoadingCountdown = useCallback(() => {
    let elapsed = 0;
    
    const countdownInterval = setInterval(() => {
      elapsed += 1;
      
      if (elapsed >= 10 && elapsed < 35) {
        setLoadingStage('calculating');
        setEstimatedWaitTime(Math.max(0, 45 - elapsed));
      } else if (elapsed >= 35) {
        setLoadingStage('finalizing');
        setEstimatedWaitTime(Math.max(0, 50 - elapsed));
      }
      
      if (elapsed > 60 || !isLoading) {
        clearInterval(countdownInterval);
        setLoadingStage(null);
        setConnectionHealth(elapsed > 60 ? 'degraded' : 'healthy');
      }
    }, 1000);

    return countdownInterval;
  }, [isLoading]);

  // ⚡ ENTERPRISE: High-performance polling (NEW)
  const startEnterprisePolling = useCallback(() => {
    let pollCount = 0;
    
    const performPoll = async () => {
      const pollStart = performance.now();
      
      try {
        const currentApiUrl = `/.netlify/functions/chat-messages/${sessionIdRef.current}`;
        const response = await fetch(`${currentApiUrl}?since=${lastPollTimeRef.current.toISOString()}`);
        const pollLatency = performance.now() - pollStart;
        
        setPerformanceMetrics(prev => ({
          ...prev,
          functionLatency: pollLatency.toFixed(2)
        }));
        
        if (!response.ok) {
          throw new Error(`Poll failed: ${response.status}`);
        }

        const newMessages = await response.json();
        
        if (newMessages.length > 0) {
          const totalTime = Date.now() - processingStartTime;
          setPerformanceMetrics(prev => ({
            ...prev,
            totalResponseTime: (totalTime / 1000).toFixed(1),
            makecomProcessingTime: (totalTime / 1000 - 1).toFixed(1)
          }));
          
          const processedMessages = newMessages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));

          setMessages(prev => {
            const existingIds = new Set(prev.map(msg => msg.id));
            const uniqueNewMessages = processedMessages.filter(msg => !existingIds.has(msg.id));
            
            if (uniqueNewMessages.length > 0) {
              setIsLoading(false);
              setConnectionHealth('healthy');
              lastPollTimeRef.current = new Date();
              setLoadingStage(null);
              
              console.log(`✅ ENTERPRISE: Message received after ${totalTime}ms total`);
              return [...prev, ...uniqueNewMessages];
            }
            return prev;
          });
          return;
        }
        
        // ⚡ ENTERPRISE: Smart polling intervals
        pollCount++;
        if (pollCount < 5) {
          setTimeout(performPoll, 1000);
        } else if (pollCount < 15) {
          setTimeout(performPoll, 2000);
        } else {
          setTimeout(performPoll, 3000);
        }
        
      } catch (error) {
        console.error('❌ ENTERPRISE: Poll error:', error);
        setConnectionHealth('error');
      }
    };
    
    performPoll();
  }, [processingStartTime]);

  // EXISTING: Regular polling
  const pollForAiMessages = async () => {
    if (!NETLIFY_API_URL) return;
    
    try {
      const currentApiUrl = `/.netlify/functions/chat-messages/${sessionIdRef.current}`;
      const response = await fetch(`${currentApiUrl}?since=${lastPollTimeRef.current.toISOString()}`);
      
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

  // EXISTING: Polling interval
  useEffect(() => {
    const pollingInterval = setInterval(pollForAiMessages, 3000);
    return () => clearInterval(pollingInterval);
  }, []);

  // EXISTING: Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // EXISTING: User context initialization
  useEffect(() => {
    if (user && !sessionIdRef.current.includes(user.first_name.toLowerCase())) {
      handleRefreshChat();
    }
  }, [user]);

  // EXISTING: Personalized welcome
  useEffect(() => {
    if (user && messages.length === 1 && !messages[0].text.includes(user.first_name)) {
      setMessages([{
        id: '1',
        text: `Hey ${user.first_name.charAt(0).toUpperCase() + user.first_name.slice(1).toLowerCase()}, what's the customer scoop?`,
        sender: 'ai',
        timestamp: new Date(),
        sessionId: sessionIdRef.current
      }]);
      console.log('✅ Personalized initial welcome for:', user.first_name);
    }
  }, [user]);

  const handleRefreshChat = () => {
    if (!user) {
      console.error("Cannot refresh chat - no user logged in");
      return;
    }

    sessionIdRef.current = generateSessionId();
    const personalizedWelcome = user.first_name 
      ? `Hey ${user.first_name.charAt(0).toUpperCase() + user.first_name.slice(1).toLowerCase()}, what's the customer scoop?`
      : welcomeMessage;

    setMessages([{
      id: '1',
      text: personalizedWelcome,
      sender: 'ai',
      timestamp: new Date(),
      sessionId: sessionIdRef.current
    }]);

    setInputText('');
    setIsLoading(false);
    setIsRefreshing(false);
    lastPollTimeRef.current = new Date();

    console.log('✅ Chat refreshed with new session and user context');
  };

  // ⚡ ENTERPRISE: Professional loading UI (NEW)
  const renderEnterpriseLoading = () => {
    if (!loadingStage) return null;
    
    const stage = loadingStages[loadingStage];
    
    return (
      <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div className="relative">
          <DynamicIcon name={stage.icon as keyof typeof Icons} className={`w-6 h-6 ${stage.color} animate-pulse`} />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
        </div>
        
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-800">{stage.message}</div>
          <div className="text-xs text-gray-600">
            {estimatedWaitTime !== null ? 
              `Estimated: ${Math.ceil(estimatedWaitTime)}s remaining` : 
              stage.estimate
            }
          </div>
        </div>
        
        {performanceMetrics.webhookLatency && (
          <div className="text-xs text-gray-500">
            Webhook: {performanceMetrics.webhookLatency}ms
          </div>
        )}
      </div>
    );
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

    // EXISTING: Trigger send effect
    if (sendButtonRef.current) {
      triggerSendEffect(sendButtonRef.current);
    }

    try {
      await sendUserMessageToMake(userMessageText);
    } catch (error) {
      const errorMessage: Message = {
        id: uuidv4(),
        text: "I'm having trouble connecting right now. Let me try that again automatically...",
        sender: 'ai',
        timestamp: new Date(),
        sessionId: sessionIdRef.current
      };

      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
      setConnectionHealth('error');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && inputText.trim()) {
        handleSendMessage();
      }
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: visualConfig.colors.background.primary }}>
      <header className="border-b p-4 flex items-center justify-between" style={{ borderColor: visualConfig.colors.border }}>
        <div className="flex items-center space-x-4">
          <ThemeAwareAvatar user={user} size="sm" theme={theme} />
          <div>
            <h2 className="text-xl font-bold" style={{ color: visualConfig.colors.text.primary }}>
              {coreConfig.companyName} Chat
            </h2>
            <div className="flex items-center space-x-2 text-xs" style={{ color: visualConfig.colors.text.secondary }}>
              <div className={`w-2 h-2 rounded-full ${
                connectionHealth === 'healthy' ? 'bg-green-500' : 
                connectionHealth === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span>System {connectionHealth}</span>
              {performanceMetrics.totalResponseTime && (
                <span>• Last response: {performanceMetrics.totalResponseTime}s</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            ref={refreshButtonRef}
            onClick={handleRefreshChat}
            disabled={isLoading || isRefreshing}
            className="p-2 rounded-lg transition-colors"
            style={{ backgroundColor: visualConfig.colors.background.secondary }}
            title="Start New Chat"
          >
            <DynamicIcon name="RotateCcw" className="h-5 w-5" style={{ color: visualConfig.colors.text.primary }} />
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-colors"
            style={{ backgroundColor: visualConfig.colors.background.secondary }}
          >
            <DynamicIcon name={theme === 'dark' ? 'Sun' : 'Moon'} className="h-5 w-5" style={{ color: visualConfig.colors.text.primary }} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <ThemeAwareMessageBubble
              key={message.id}
              message={message}
              user={user}
              theme={theme}
            />
          ))}
          
          {/* ⚡ ENTERPRISE: Show enhanced loading or existing typing */}
          {isLoading && (
            loadingStage ? renderEnterpriseLoading() : <TypingIndicator theme={theme} />
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t p-6" style={{ borderColor: visualConfig.colors.border }}>
          <div className="flex space-x-3 items-end">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={terminologyConfig.ui.chatPlaceholder}
              className="flex-1 p-4 border-2 focus:outline-none focus:ring-4 resize-none transition-all duration-300"
              style={{
                backgroundColor: visualConfig.colors.background.secondary,
                borderColor: visualConfig.colors.border,
                color: visualConfig.colors.text.primary,
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
      </main>

      {/* EXISTING: Logout Button */}
      <button
        onClick={() => setShowLogoutModal(true)}
        className="fixed bottom-6 right-6 p-3 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-300 z-50"
        title="Logout"
      >
        <Icons.LogOut className="h-6 w-6" />
      </button>

      {/* EXISTING: Logout Modal */}
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
                  className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ⚡ ENTERPRISE: Performance debug overlay (only in dev) */}
      {process.env.NODE_ENV === 'development' && performanceMetrics.webhookLatency && (
        <div className="fixed bottom-20 right-4 bg-black bg-opacity-80 text-white text-xs p-2 rounded max-w-xs">
          <div>🚀 ENTERPRISE METRICS</div>
          <div>Webhook: {performanceMetrics.webhookLatency}ms</div>
          {performanceMetrics.functionLatency && <div>Function: {performanceMetrics.functionLatency}ms</div>}
          {performanceMetrics.totalResponseTime && <div>Total: {performanceMetrics.totalResponseTime}s</div>}
          {performanceMetrics.makecomProcessingTime && <div>Make.com: {performanceMetrics.makecomProcessingTime}s</div>}
          <div>Health: {connectionHealth}</div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;