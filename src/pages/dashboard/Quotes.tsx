import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Loader2, Bot } from 'lucide-react';
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
  // Generate a unique session ID that persists for this chat session
  const sessionIdRef = useRef<string>(`quote_session_${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastPollTimeRef = useRef<Date>(new Date());

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Let's make some profit. What are we doing today?",
      sender: 'ai',
      timestamp: new Date(),
      sessionId: sessionIdRef.current
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Replace with your actual Make.com webhook URL
  const MAKE_WEBHOOK_URL = 'https://hook.us1.make.com/swi79ksdmw85xk1wjmqpac4rvbcw0p7v';
  const NETLIFY_API_URL = `/.netlify/functions/chat-messages/${sessionIdRef.current}`;

  // Send user message to Make.com
  const sendUserMessageToMake = async (userMessageText: string) => {
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
          source: 'quote_engine',
          techId: '22222222-2222-2222-2222-222222222222'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message to Make.com');
      }
      
      console.log('✅ User message sent to Make.com successfully');
    } catch (error) {
      console.error('❌ Error sending user message to Make.com:', error);
      throw error;
    }
  };

  // Poll for new AI messages with duplicate prevention
  const pollForAiMessages = async () => {
    console.log('🔍 POLLING - Session:', sessionIdRef.current);
    console.log('🔍 POLLING - URL:', NETLIFY_API_URL);
    
    try {
      const response = await fetch(`${NETLIFY_API_URL}?since=${lastPollTimeRef.current.toISOString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch AI messages');
      }

      const newAiMessages = await response.json();
      console.log('🔍 RECEIVED DATA:', newAiMessages);
      
      if (newAiMessages.length > 0) {
        console.log('✅ PROCESSING MESSAGES:', newAiMessages.length);
        
        const processedMessages = newAiMessages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));

        // Add duplicate prevention logic
        setMessages(currentMessages => {
          const existingIds = new Set(currentMessages.map(msg => msg.id));
          const uniqueNewMessages = processedMessages.filter(msg => !existingIds.has(msg.id));
          
          if (uniqueNewMessages.length > 0) {
            console.log(`✅ ADDING ${uniqueNewMessages.length} NEW UNIQUE MESSAGES TO CHAT`);
            setIsLoading(false);
            lastPollTimeRef.current = new Date();
            return [...currentMessages, ...uniqueNewMessages];
          } else {
            console.log('ℹ️ No new unique messages to add');
            return currentMessages;
          }
        });
      }
    } catch (error) {
      console.error('Error polling for AI messages:', error);
    }
  };

  // Set up polling interval
  useEffect(() => {
    const pollingInterval = setInterval(pollForAiMessages, 3000); // Poll every 3 seconds
    
    return () => clearInterval(pollingInterval);
  }, []); // Empty dependency array - we want this to run once

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true); // Start loading indicator

    try {
      await sendUserMessageToMake(userMessageText);
      // Keep loading state - AI response will come via polling
    } catch (error) {
      const errorMessage: Message = {
        id: uuidv4(),
        text: "Sorry, there was an error sending your message. Please try again.",
        sender: 'ai',
        timestamp: new Date(),
        sessionId: sessionIdRef.current
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false); // Stop loading if sending fails
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <DashboardLayout title="AI Quote Engine">
      {/* Mobile-first responsive container */}
      <div className="h-full flex flex-col">
        
        {/* Header - compact on mobile */}
        <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4 flex-shrink-0 px-2 md:px-0">
          <MessageCircle className="h-6 w-6 md:h-8 md:w-8 text-primary-600 flex-shrink-0" />
          <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
            AI Quote Engine
          </h2>
        </div>

        {/* Chat container - mobile optimized */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col min-h-0 overflow-hidden">
          
          {/* Chat Messages Area - optimized scroll */}
          <div className="flex-1 overflow-y-auto px-3 md:px-4 py-3 md:py-4 space-y-3 md:space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-[85%] md:max-w-xs lg:max-w-md px-3 md:px-4 py-2 md:py-3 rounded-lg
                    ${message.sender === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }
                  `}
                >
                  {/* Enhanced message rendering with mobile-optimized typography */}
                  <div 
                    className="text-sm md:text-base whitespace-pre-wrap leading-relaxed"
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
            ))}
            
            {/* Enhanced AI Thinking State - mobile optimized */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 px-3 md:px-4 py-3 rounded-lg flex items-center gap-2 md:gap-3 max-w-[85%]">
                  <Bot className="h-4 w-4 md:h-5 md:w-5 text-primary-600 flex-shrink-0" />
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin text-primary-600" />
                    <span className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                      AI is analyzing...
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Area - mobile-first with touch optimization */}
          <div className="border-t dark:border-gray-700 p-3 md:p-4 bg-white dark:bg-gray-800 rounded-b-lg flex-shrink-0">
            <div className="flex gap-2 md:gap-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about pricing, quotes, or business..."
                className="
                  flex-1 px-3 md:px-4 py-3 md:py-2 text-sm md:text-base
                  border border-gray-300 dark:border-gray-600 rounded-lg
                  focus:ring-2 focus:ring-primary-500 focus:border-transparent
                  dark:bg-gray-700 dark:text-white
                  touch-manipulation
                "
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputText.trim()}
                className="
                  px-4 md:px-6 py-3 md:py-2 bg-primary-600 text-white rounded-lg 
                  hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed 
                  flex items-center gap-2 font-medium text-sm md:text-base
                  min-w-[48px] min-h-[48px] md:min-h-[40px]
                  touch-manipulation transition-colors
                "
              >
                <Send className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                <span className="hidden md:inline">Send</span>
              </button>
            </div>
            
            {/* Session info - more compact on mobile */}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate">
              <span className="md:hidden">Session: {sessionIdRef.current.slice(-8)}</span>
              <span className="hidden md:inline">Session ID: {sessionIdRef.current}</span>
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Quotes;