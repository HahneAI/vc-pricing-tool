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
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-8 w-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            AI Quote Engine
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow h-[600px] flex flex-col">
          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
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
                  <p 
                    className="text-sm whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: message.text
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br />')
                    }}
                  />
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Enhanced AI Thinking State */}
            {isLoading && (
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
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Area */}
          <div className="border-t dark:border-gray-700 p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about pricing, quote a job, or chat about business..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
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

export default Quotes;