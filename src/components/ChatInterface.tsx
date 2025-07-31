import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Loader2, Bot, Sun, Moon, User, Clock, Check, CheckCheck, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useTheme } from '../context/ThemeContext';
import Avatar from './ui/Avatar';
import TypingIndicator from './ui/TypingIndicator';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  sessionId?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'error';
}

const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);

  if (seconds < 5) return "just now";
  if (minutes < 1) return `${seconds} seconds ago`;
  if (minutes < 60) return `${minutes} minutes ago`;

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatMessageText = (text: string) => {
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');

  const lines = html.split('\n');
  let inList = false;
  html = lines.map(line => {
    if (line.startsWith('- ')) {
      const listItem = `<li>${line.substring(2)}</li>`;
      if (!inList) {
        inList = true;
        return `<ul>${listItem}`;
      }
      return listItem;
    } else {
      if (inList) {
        inList = false;
        return `</ul>${line}`;
      }
      return line;
    }
  }).join('<br />');

  if (inList) {
    html += '</ul>';
  }

  return html.replace(/<br \/>/g, '\n').replace(/\n/g, '<br />');
};


const ChatInterface = () => {
  const { theme, toggleTheme } = useTheme();
  
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

  // AI Agent webhook URL
  const MAKE_WEBHOOK_URL = 'https://hook.us1.make.com/swi79ksdmw85xk1wjmqpac4rvbcw0p7v';
  const NETLIFY_API_URL = `/.netlify/functions/chat-messages/${sessionIdRef.current}`;

  // Send user message to Make.com AI Agent
  const sendUserMessageToMake = async (userMessageText: string) => {
    try {
      const response = await fetch(MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessageText,                           // ✅ Original AI agent format
          timestamp: new Date().toISOString(),                // ✅ Original AI agent format
          sessionId: sessionIdRef.current,                    // ✅ Original AI agent format
          source: 'quote_engine',                            // ✅ Original AI agent format
          techId: '22222222-2222-2222-2222-222222222222'     // ✅ Original AI agent format
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message to Make.com');
      }
      
      console.log('✅ User message sent to AI agent successfully');
    } catch (error) {
      console.error('❌ Error sending user message to AI agent:', error);
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
        console.log('✅ ADDING MESSAGES TO CHAT:', newAiMessages.length);
        
        const processedMessages = newAiMessages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));

        setMessages(prev => [...prev, ...processedMessages]);
        setIsLoading(false);
        lastPollTimeRef.current = new Date();
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
    const messageId = uuidv4();
    const userMessage: Message = {
      id: messageId,
      text: userMessageText,
      sender: 'user',
      timestamp: new Date(),
      sessionId: sessionIdRef.current,
      status: 'sending',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      await sendUserMessageToMake(userMessageText);
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, status: 'sent' } : m));
    } catch (error) {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, status: 'error', text: `${m.text}\n\n[Error: Could not send message]` } : m));
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
    <div className="h-screen flex flex-col bg-enterprise-gray-light dark:bg-gray-900 font-sans">
      {/* Header */}
      <header className="w-full p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-enterprise-blue text-white p-2 rounded-lg shadow-md">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display text-gray-800 dark:text-white">
                TradeSphere
              </h1>
              <p className="text-sm text-enterprise-gray dark:text-gray-400">AI Pricing Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ?
                <Sun className="h-5 w-5 text-gray-500 dark:text-gray-400" /> :
                <Moon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              }
            </button>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <main className="flex-1 flex flex-col overflow-hidden p-4">
        <div className="flex-1 bg-white dark:bg-gray-800/50 rounded-2xl shadow-professional flex flex-col overflow-hidden min-h-0 glass-effect">

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'ai' && <Avatar sender="ai" />}
                <div
                  className={`max-w-md lg:max-w-2xl px-5 py-3 rounded-2xl shadow-md message-bubble-animate ${
                    message.sender === 'user'
                      ? 'bg-enterprise-blue text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100'
                  }`}
                >
                  <div
                    className="text-base whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: formatMessageText(message.text) }}
                  />
                  <div className="flex items-center justify-end mt-2">
                    <p className="text-xs opacity-60">
                      {formatRelativeTime(message.timestamp)}
                    </p>
                    {message.sender === 'user' && message.status && (
                      <div className="ml-2">
                        {message.status === 'sending' && <Clock className="h-3 w-3 opacity-60" />}
                        {message.status === 'sent' && <Check className="h-3 w-3 opacity-60" />}
                        {message.status === 'delivered' && <CheckCheck className="h-3 w-3 opacity-60" />}
                        {message.status === 'error' && <AlertCircle className="h-3 w-3 text-red-400" />}
                      </div>
                    )}
                  </div>
                </div>
                {message.sender === 'user' && <Avatar sender="user" />}
              </div>
            ))}

            {/* AI Thinking State */}
            {isLoading && (
              <div className="flex items-start gap-3 justify-start">
                <Avatar sender="ai" />
                <div className="bg-white dark:bg-gray-700 px-5 py-3 rounded-2xl shadow-md flex items-center gap-3">
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Area */}
          <div className="border-t border-gray-200/50 dark:border-gray-700/50 p-4 bg-white/30 dark:bg-gray-800/30 flex-shrink-0">
            <div className="flex items-center space-x-3 max-w-4xl mx-auto">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe the job details to generate a price..."
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-enterprise-blue-light focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-base resize-none"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputText.trim()}
                className="px-5 py-3 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-300 btn-gradient shadow-md"
              >
                <Send className="h-5 w-5" />
                <span className="hidden sm:inline font-semibold">Send</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatInterface;