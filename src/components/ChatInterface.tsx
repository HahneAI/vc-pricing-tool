import React, { useState, useEffect, useRef } from 'react';
import * as Icons from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useTheme } from '../context/ThemeContext';
import { config } from '../utils/environment-config';
import Avatar from './ui/Avatar';
import TypingIndicator from './ui/TypingIndicator';
import IndustryEffects from './ui/IndustryEffects';


const DynamicIcon = ({ name, ...props }: { name: string } & Icons.LucideProps) => {
  const IconComponent = Icons[name as keyof typeof Icons];

  if (!IconComponent) {
    return <Icons.MessageCircle {...props} />;
  }

  return <IconComponent {...props} />;
};


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
  
  const sessionIdRef = useRef<string>(`quote_session_${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastPollTimeRef = useRef<Date>(new Date());

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: config.welcomeVariants[Math.floor(Math.random() * config.welcomeVariants.length)] || config.welcomeMessage,
      sender: 'ai',
      timestamp: new Date(),
      sessionId: sessionIdRef.current
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const MAKE_WEBHOOK_URL = config.makeWebhookUrl;
  const NETLIFY_API_URL = `/.netlify/functions/chat-messages/${sessionIdRef.current}`;

  const sendUserMessageToMake = async (userMessageText: string) => {
    if (!MAKE_WEBHOOK_URL) {
      console.warn("Make.com webhook URL is not configured. Skipping message sending.");
      return;
    }
    try {
      const response = await fetch(MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessageText,
          timestamp: new Date().toISOString(),
          sessionId: sessionIdRef.current,
          source: 'quote_engine',
          techId: '22222222-2222-2222-2222-222222222222'
        })
      });
      if (!response.ok) throw new Error('Failed to send message to Make.com');
      console.log('✅ User message sent to AI agent successfully');
    } catch (error) {
      console.error('❌ Error sending user message to AI agent:', error);
      throw error;
    }
  };

  const pollForAiMessages = React.useCallback(async () => {
    try {
      const response = await fetch(`${NETLIFY_API_URL}?since=${lastPollTimeRef.current.toISOString()}`);
      if (!response.ok) throw new Error('Failed to fetch AI messages');
      const newAiMessages = await response.json();
      
      if (newAiMessages.length > 0) {
        const processedMessages = newAiMessages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(prev => [...prev, ...processedMessages]);
        setIsLoading(false);
        lastPollTimeRef.current = new Date();
      }
    } catch (e) {
      console.error('Error polling for AI messages:', e);
    }
  }, [NETLIFY_API_URL]);

  useEffect(() => {
    const pollingInterval = setInterval(pollForAiMessages, 3000);
    return () => clearInterval(pollingInterval);
  }, [pollForAiMessages]);

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
    } catch {
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
    <div className="h-screen flex flex-col font-sans" style={{ backgroundColor: 'var(--landscape-neutral)'}}>
      <IndustryEffects />
      <header className="w-full p-4 border-b flex-shrink-0" style={{ borderColor: 'var(--landscape-secondary)'}}>
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="text-white p-3 rounded-lg shadow-md" style={{ backgroundColor: 'var(--landscape-primary)' }}>
              <DynamicIcon name={config.headerIcon} className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display" style={{ color: 'var(--landscape-primary)' }}>
                {config.companyName}
              </h1>
              <p className="text-sm" style={{ color: 'var(--landscape-secondary)'}}>{config.serviceTerminology}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ?
                <Icons.Sun className="h-5 w-5 text-gray-500 dark:text-gray-400" /> :
                <Icons.Moon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              }
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden p-4">
        <div className="flex-1 bg-white/50 dark:bg-gray-800/50 rounded-2xl shadow-professional flex flex-col overflow-hidden min-h-0 glass-effect">
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
                      ? 'text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100'
                  }`}
                  style={{
                    backgroundColor: message.sender === 'user' ? 'var(--landscape-primary)' : 'white'
                  }}
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
                        {message.status === 'sending' && <Icons.Clock className="h-3 w-3 opacity-60" />}
                        {message.status === 'sent' && <Icons.Check className="h-3 w-3 opacity-60" />}
                        {message.status === 'delivered' && <Icons.CheckCheck className="h-3 w-3 opacity-60" />}
                        {message.status === 'error' && <Icons.AlertCircle className="h-3 w-3 text-red-400" />}
                      </div>
                    )}
                  </div>
                </div>
                {message.sender === 'user' && <Avatar sender="user" />}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-3 justify-start">
                <Avatar sender="ai" />
                <div className="bg-white dark:bg-gray-700 px-5 py-3 rounded-2xl shadow-md flex items-center gap-3">
                  <TypingIndicator />
                  <p className="text-sm" style={{ color: 'var(--landscape-secondary)'}}>{config.statusMessages.thinking}</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200/50 dark:border-gray-700/50 p-4 bg-white/30 dark:bg-gray-800/30 flex-shrink-0">
            <div className="flex items-center space-x-3 max-w-4xl mx-auto">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={config.placeholderExamples}
                className="flex-1 px-4 py-3 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-base resize-none"
                style={{
                    borderColor: 'var(--landscape-secondary)',
                    '--tw-ring-color': 'var(--landscape-accent)'
                }}
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputText.trim()}
                className="px-5 py-3 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-300 shadow-md"
                style={{
                    backgroundColor: 'var(--landscape-primary)',
                }}
              >
                <DynamicIcon name={config.sendIcon} className="h-5 w-5" />
                <span className="hidden sm:inline font-semibold">{config.buttonTexts.send}</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatInterface;