import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Loader2, Bot, RotateCcw } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import DashboardLayout from '../../components/layout/DashboardLayout';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  sessionId?: string;
}

const Quotes = () => {
  console.log('🟢 QUOTES.TSX - Component initialization started');
  
  // Generate a unique session ID that persists for this chat session
  const sessionIdRef = useRef<string>(`quote_session_${Date.now()}`);
  console.log('🔵 QUOTES.TSX - sessionIdRef created:', sessionIdRef.current);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  console.log('🔵 QUOTES.TSX - messagesEndRef created');
  
  const lastPollTimeRef = useRef<Date>(new Date());
  console.log('🔵 QUOTES.TSX - lastPollTimeRef created:', lastPollTimeRef.current);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Let's make some profit. What are we doing today?",
      sender: 'ai',
      timestamp: new Date(),
      sessionId: sessionIdRef.current
    }
  ]);
  console.log('🔵 QUOTES.TSX - messages state initialized with default message');

  const [inputText, setInputText] = useState('');
  console.log('🔵 QUOTES.TSX - inputText state initialized');

  const [isLoading, setIsLoading] = useState(false);
  console.log('🔵 QUOTES.TSX - isLoading state initialized');

  // Replace with your actual Make.com webhook URL
  const MAKE_WEBHOOK_URL = import.meta.env.VITE_MAKE_WEBHOOK_URL || 'https://hook.us1.make.com/2onxs05qbwu3fezpgdfaugqbers6ab4h';
  console.log('🔵 QUOTES.TSX - MAKE_WEBHOOK_URL configured:', MAKE_WEBHOOK_URL ? 'SET' : 'NOT SET');
  
  const NETLIFY_API_URL = `/.netlify/functions/chat-messages/${sessionIdRef.current}`;
  console.log('🔵 QUOTES.TSX - NETLIFY_API_URL configured:', NETLIFY_API_URL);

  // Send user message to Make.com
  const sendUserMessageToMake = async (userMessageText: string) => {
    console.log('🚀 QUOTES.TSX - sendUserMessageToMake() CALLED with message:', userMessageText);
    console.log('🚀 QUOTES.TSX - sendUserMessageToMake() - sessionId:', sessionIdRef.current);
    console.log('🚀 QUOTES.TSX - sendUserMessageToMake() - webhook URL:', MAKE_WEBHOOK_URL);
    
    try {
      console.log('🚀 QUOTES.TSX - sendUserMessageToMake() - Starting fetch request...');
      
      const payload = {
        message: userMessageText,
        timestamp: new Date().toISOString(),
        sessionId: sessionIdRef.current,
        source: 'quote_engine',
        techId: '22222222-2222-2222-2222-222222222222'
      };
      
      console.log('🚀 QUOTES.TSX - sendUserMessageToMake() - Payload:', payload);
      
      const response = await fetch(MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('🚀 QUOTES.TSX - sendUserMessageToMake() - Response received:', response.status, response.statusText);

      if (!response.ok) {
        console.error('❌ QUOTES.TSX - sendUserMessageToMake() - Response not OK:', response.status, response.statusText);
        throw new Error('Failed to send message to Make.com');
      }
      
      console.log('✅ QUOTES.TSX - sendUserMessageToMake() - User message sent to Make.com successfully');
    } catch (error) {
      console.error('❌ QUOTES.TSX - sendUserMessageToMake() - Error occurred:', error);
      throw error;
    }
    
    console.log('🚀 QUOTES.TSX - sendUserMessageToMake() - Function completed');
  };

  // Poll for new AI messages
  const pollForAiMessages = async () => {
    console.log('🔍 QUOTES.TSX - pollForAiMessages() CALLED');
    console.log('🔍 QUOTES.TSX - pollForAiMessages() - Session:', sessionIdRef.current);
    console.log('🔍 QUOTES.TSX - pollForAiMessages() - API URL:', NETLIFY_API_URL);
    console.log('🔍 QUOTES.TSX - pollForAiMessages() - Last poll time:', lastPollTimeRef.current);
    
    try {
      console.log('🔍 QUOTES.TSX - pollForAiMessages() - Starting fetch request...');
      
      const fetchUrl = `${NETLIFY_API_URL}?since=${lastPollTimeRef.current.toISOString()}`;
      console.log('🔍 QUOTES.TSX - pollForAiMessages() - Full fetch URL:', fetchUrl);
      
      const response = await fetch(fetchUrl);
      
      console.log('🔍 QUOTES.TSX - pollForAiMessages() - Response received:', response.status, response.statusText);
      
      if (!response.ok) {
        console.error('❌ QUOTES.TSX - pollForAiMessages() - Response not OK:', response.status, response.statusText);
        throw new Error('Failed to fetch AI messages');
      }

      const newAiMessages = await response.json();
      console.log('🔍 QUOTES.TSX - pollForAiMessages() - Raw response data:', newAiMessages);
      console.log('🔍 QUOTES.TSX - pollForAiMessages() - Message count:', newAiMessages.length);
      
      if (newAiMessages.length > 0) {
        console.log('✅ QUOTES.TSX - pollForAiMessages() - New messages found, processing...');
        
        const processedMessages = newAiMessages.map((msg, index) => {
          console.log(`🔍 QUOTES.TSX - pollForAiMessages() - Processing message ${index + 1}:`, msg);
          return {
            ...msg,
            timestamp: new Date(msg.timestamp)
          };
        });

        console.log('🔍 QUOTES.TSX - pollForAiMessages() - Processed messages:', processedMessages);
        console.log('🔍 QUOTES.TSX - pollForAiMessages() - Adding messages to chat...');
        
        setMessages(prev => {
          console.log('🔍 QUOTES.TSX - pollForAiMessages() - Previous messages count:', prev.length);
          const newMessages = [...prev, ...processedMessages];
          console.log('🔍 QUOTES.TSX - pollForAiMessages() - New messages count:', newMessages.length);
          return newMessages;
        });
        
        console.log('🔍 QUOTES.TSX - pollForAiMessages() - Setting loading to false...');
        setIsLoading(false);
        
        console.log('🔍 QUOTES.TSX - pollForAiMessages() - Updating last poll time...');
        lastPollTimeRef.current = new Date();
        console.log('🔍 QUOTES.TSX - pollForAiMessages() - New last poll time:', lastPollTimeRef.current);
      } else {
        console.log('🔍 QUOTES.TSX - pollForAiMessages() - No new messages found');
      }
    } catch (error) {
      console.error('❌ QUOTES.TSX - pollForAiMessages() - Error occurred:', error);
    }
    
    console.log('🔍 QUOTES.TSX - pollForAiMessages() - Function completed');
  };

  // Refresh chat functionality
  const handleRefreshChat = () => {
    console.log('🔄 QUOTES.TSX - handleRefreshChat() CALLED');
    console.log('🔄 QUOTES.TSX - handleRefreshChat() - Current sessionId:', sessionIdRef.current);
    console.log('🔄 QUOTES.TSX - handleRefreshChat() - Current messages count:', messages.length);
    
    // Generate new session ID
    const newSessionId = `quote_session_${Date.now()}`;
    sessionIdRef.current = newSessionId;
    console.log('🔄 QUOTES.TSX - handleRefreshChat() - New sessionId generated:', sessionIdRef.current);
    
    // Reset messages with new welcome message
    const welcomeMessage: Message = {
      id: '1',
      text: "Let's make some profit. What are we doing today?",
      sender: 'ai',
      timestamp: new Date(),
      sessionId: sessionIdRef.current
    };
    
    console.log('🔄 QUOTES.TSX - handleRefreshChat() - Welcome message created:', welcomeMessage);
    
    setMessages([welcomeMessage]);
    console.log('🔄 QUOTES.TSX - handleRefreshChat() - Messages reset to welcome message');
    
    setIsLoading(false);
    console.log('🔄 QUOTES.TSX - handleRefreshChat() - Loading state reset to false');
    
    // Reset poll time
    lastPollTimeRef.current = new Date();
    console.log('🔄 QUOTES.TSX - handleRefreshChat() - Poll time reset to:', lastPollTimeRef.current);
    
    console.log('🔄 QUOTES.TSX - handleRefreshChat() - Function completed');
  };

  // Set up polling interval
  useEffect(() => {
    console.log('⚡ QUOTES.TSX - Polling useEffect TRIGGERED');
    console.log('⚡ QUOTES.TSX - Polling useEffect - Setting up polling interval...');
    
    const pollingInterval = setInterval(() => {
      console.log('⏰ QUOTES.TSX - Polling interval FIRED - calling pollForAiMessages()');
      pollForAiMessages();
    }, 3000); // Poll every 3 seconds
    
    console.log('⚡ QUOTES.TSX - Polling useEffect - Interval created with ID:', pollingInterval);
    
    return () => {
      console.log('🧹 QUOTES.TSX - Polling useEffect CLEANUP - clearing interval:', pollingInterval);
      clearInterval(pollingInterval);
    };
  }, []); // Empty dependency array - we want this to run once

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    console.log('⚡ QUOTES.TSX - Auto-scroll useEffect TRIGGERED');
    console.log('⚡ QUOTES.TSX - Auto-scroll useEffect - Messages count:', messages.length);
    console.log('⚡ QUOTES.TSX - Auto-scroll useEffect - messagesEndRef.current:', messagesEndRef.current);
    
    if (messagesEndRef.current) {
      console.log('⚡ QUOTES.TSX - Auto-scroll useEffect - Scrolling to bottom...');
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      console.log('⚡ QUOTES.TSX - Auto-scroll useEffect - Scroll completed');
    } else {
      console.log('⚡ QUOTES.TSX - Auto-scroll useEffect - messagesEndRef not available, skipping scroll');
    }
  }, [messages]);

  // Component mount/unmount tracking
  useEffect(() => {
    console.log('⚡ QUOTES.TSX - Component mount useEffect TRIGGERED - Component mounted');
    
    return () => {
      console.log('🧹 QUOTES.TSX - Component unmount - Component will unmount');
    };
  }, []);

  const handleSendMessage = async () => {
    console.log('📤 QUOTES.TSX - handleSendMessage() CALLED');
    console.log('📤 QUOTES.TSX - handleSendMessage() - inputText:', inputText);
    console.log('📤 QUOTES.TSX - handleSendMessage() - inputText trimmed:', inputText.trim());
    
    if (!inputText.trim()) {
      console.log('⚠️ QUOTES.TSX - handleSendMessage() - Empty input, returning early');
      return;
    }

    const userMessageText = inputText;
    console.log('📤 QUOTES.TSX - handleSendMessage() - userMessageText:', userMessageText);
    
    const userMessage: Message = {
      id: uuidv4(),
      text: userMessageText,
      sender: 'user',
      timestamp: new Date(),
      sessionId: sessionIdRef.current
    };
    
    console.log('📤 QUOTES.TSX - handleSendMessage() - userMessage created:', userMessage);

    // Add user message immediately
    console.log('📤 QUOTES.TSX - handleSendMessage() - Adding user message to messages...');
    setMessages(prev => {
      console.log('📤 QUOTES.TSX - handleSendMessage() - Previous messages count:', prev.length);
      const newMessages = [...prev, userMessage];
      console.log('📤 QUOTES.TSX - handleSendMessage() - New messages count:', newMessages.length);
      return newMessages;
    });
    
    console.log('📤 QUOTES.TSX - handleSendMessage() - Clearing input text...');
    setInputText('');
    
    console.log('📤 QUOTES.TSX - handleSendMessage() - Setting loading to true...');
    setIsLoading(true); // Start loading indicator

    try {
      console.log('📤 QUOTES.TSX - handleSendMessage() - Calling sendUserMessageToMake...');
      await sendUserMessageToMake(userMessageText);
      console.log('✅ QUOTES.TSX - handleSendMessage() - sendUserMessageToMake completed successfully');
      // Keep loading state - AI response will come via polling
    } catch (error) {
      console.error('❌ QUOTES.TSX - handleSendMessage() - Error in sendUserMessageToMake:', error);
      
      const errorMessage: Message = {
        id: uuidv4(),
        text: "Sorry, there was an error sending your message. Please try again.",
        sender: 'ai',
        timestamp: new Date(),
        sessionId: sessionIdRef.current
      };
      
      console.log('📤 QUOTES.TSX - handleSendMessage() - Error message created:', errorMessage);
      
      setMessages(prev => {
        console.log('📤 QUOTES.TSX - handleSendMessage() - Adding error message, prev count:', prev.length);
        const newMessages = [...prev, errorMessage];
        console.log('📤 QUOTES.TSX - handleSendMessage() - New count with error:', newMessages.length);
        return newMessages;
      });
      
      console.log('📤 QUOTES.TSX - handleSendMessage() - Setting loading to false after error');
      setIsLoading(false); // Stop loading if sending fails
    }
    
    console.log('📤 QUOTES.TSX - handleSendMessage() - Function completed');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    console.log('⌨️ QUOTES.TSX - handleKeyPress() CALLED');
    console.log('⌨️ QUOTES.TSX - handleKeyPress() - Key pressed:', e.key);
    console.log('⌨️ QUOTES.TSX - handleKeyPress() - shiftKey:', e.shiftKey);
    
    if (e.key === 'Enter' && !e.shiftKey) {
      console.log('⌨️ QUOTES.TSX - handleKeyPress() - Enter without shift detected, preventing default and sending message');
      e.preventDefault();
      handleSendMessage();
    } else {
      console.log('⌨️ QUOTES.TSX - handleKeyPress() - Key press ignored (not Enter or shift+Enter)');
    }
  };

  // Input text change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('⌨️ QUOTES.TSX - handleInputChange() CALLED');
    console.log('⌨️ QUOTES.TSX - handleInputChange() - Previous value:', inputText);
    console.log('⌨️ QUOTES.TSX - handleInputChange() - New value:', e.target.value);
    setInputText(e.target.value);
  };

  console.log('🎨 QUOTES.TSX - Rendering component...');
  console.log('🎨 QUOTES.TSX - Current state - messages count:', messages.length);
  console.log('🎨 QUOTES.TSX - Current state - inputText:', inputText);
  console.log('🎨 QUOTES.TSX - Current state - isLoading:', isLoading);
  console.log('🎨 QUOTES.TSX - Current state - sessionId:', sessionIdRef.current);

  return (
    <DashboardLayout title="AI Quote Engine">
      {console.log('🎨 QUOTES.TSX - DashboardLayout rendering')}
      
      {/* Container that prevents page scrolling and keeps chat in viewport */}
      <div className="h-[calc(100vh-12rem)] flex flex-col">
        {console.log('🎨 QUOTES.TSX - Main container rendering')}
        
        {/* Header section - fixed height */}
        <div className="flex items-center justify-between gap-3 mb-4">
          {console.log('🎨 QUOTES.TSX - Header section rendering')}
          
          <div className="flex items-center gap-3">
            <MessageCircle className="h-8 w-8 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              AI Quote Engine
            </h1>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => {
              console.log('🔄 QUOTES.TSX - Refresh button CLICKED');
              handleRefreshChat();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 bg-primary-600 hover:bg-primary-700 text-white hover:shadow-lg border-2 border-transparent hover:border-opacity-30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            title="Start a new chat session"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>

        {/* Chat container - takes remaining space */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col min-h-0">
          {console.log('🎨 QUOTES.TSX - Chat container rendering')}
          
          {/* Chat Messages Area - scrollable within container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {console.log('🎨 QUOTES.TSX - Messages area rendering, message count:', messages.length)}
            
            {messages.map((message, index) => {
              console.log(`🎨 QUOTES.TSX - Rendering message ${index + 1}:`, message);
              return (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    {/* Enhanced message rendering with formatting support */}
                    <div 
                      className="text-sm whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html: message.text
                          .replace(/\n/g, '<br />')
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      }}
                    />
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              );
            })}
            
            {/* Enhanced AI Thinking State */}
            {isLoading && (
              <>
                {console.log('🎨 QUOTES.TSX - Rendering loading indicator')}
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-lg flex items-center gap-3">
                    <Bot className="h-5 w-5 text-primary-600" />
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        AI is analyzing your request...
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
            <div ref={messagesEndRef} />
            {console.log('🎨 QUOTES.TSX - Messages end ref placed')}
          </div>

          {/* Chat Input Area - fixed at bottom of chat container */}
          <div className="border-t dark:border-gray-700 p-4 bg-white dark:bg-gray-800 rounded-b-lg flex-shrink-0">
            {console.log('🎨 QUOTES.TSX - Input area rendering')}
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about pricing, quote a job, or chat about business..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                disabled={isLoading}
              />
              <button
                onClick={() => {
                  console.log('📤 QUOTES.TSX - Send button CLICKED');
                  handleSendMessage();
                }}
                disabled={isLoading || !inputText.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Send
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Session ID: {sessionIdRef.current}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

console.log('🟢 QUOTES.TSX - Component definition completed, exporting...');

export default Quotes;