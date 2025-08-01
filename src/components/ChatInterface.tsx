import React, { useState, useEffect, useRef } from 'react';
import * as Icons from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useTheme } from '../context/ThemeContext';
import {
    getCoreConfig,
    getTerminologyConfig,
    getSmartVisualThemeConfig,
    getSeasonalConfig,
    SmartVisualThemeConfig
} from '../config/industry';
import { triggerSendEffect } from './ui/IndustryEffects';
import TypingIndicator from './ui/TypingIndicator';
import { ThemeAwareMessageBubble } from './ui/ThemeAwareMessageBubble';
import { ThemeAwareAvatar } from './ui/ThemeAwareAvatar';
import { Message } from '../types/job';

const coreConfig = getCoreConfig();
const terminologyConfig = getTerminologyConfig();
const seasonalConfig = getSeasonalConfig();

const DynamicIcon = ({ name, ...props }: { name: keyof typeof Icons } & Icons.LucideProps) => {
  const IconComponent = Icons[name];
  if (!IconComponent) {
    return <Icons.MessageCircle {...props} />;
  }
  return <IconComponent {...props} />;
};

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

const StatusIcon = ({ status }: { status: Message['status'] }) => {
    switch (status) {
        case 'sending': return <Icons.Clock className="h-3 w-3 opacity-60" />;
        case 'sent': return <Icons.Check className="h-3 w-3 opacity-60" />;
        case 'delivered': return <Icons.CheckCheck className="h-3 w-3 opacity-60" />;
        case 'error': return <Icons.AlertCircle className="h-3 w-3 text-red-400" />;
        default: return null;
    }
};

const ChatInterface = () => {
  const { theme, toggleTheme } = useTheme();
  const visualConfig = getSmartVisualThemeConfig(theme);
  
  const sessionIdRef = useRef<string>(`quote_session_${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastPollTimeRef = useRef<Date>(new Date());
  const sendButtonRef = useRef<HTMLButtonElement>(null);

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

  const MAKE_WEBHOOK_URL = coreConfig.makeWebhookUrl;
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

    triggerSendEffect(sendButtonRef.current);

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

  const backgroundClass = visualConfig.patterns.backgroundTexture === 'subtle-organic' ? 'background-organic' : 'background-tech';

  return (
    <div
      className="h-screen flex flex-col font-sans transition-colors duration-300"
      style={{ backgroundColor: visualConfig.colors.background }}
    >
      {/* Header with proper theme adaptation */}
      <header
        className="w-full p-4 border-b flex-shrink-0 transition-colors duration-300"
        style={{
          backgroundColor: visualConfig.colors.surface,
          borderBottomColor: theme === 'light' ? '#e5e7eb' : '#374151'
        }}
      >
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div
              className="text-white p-3 rounded-lg shadow-md transition-all duration-300"
              style={{
                backgroundColor: visualConfig.colors.primary,
                color: visualConfig.colors.text.onPrimary
              }}
            >
              <DynamicIcon name={coreConfig.headerIcon} className="h-8 w-8" />
            </div>
            <div>
              <h1
                className="text-xl font-bold transition-colors duration-300"
                style={{ color: visualConfig.colors.text.primary }}
              >
                {coreConfig.companyName}
              </h1>
              <p
                className="text-sm transition-colors duration-300"
                style={{ color: visualConfig.colors.text.secondary }}
              >
                {terminologyConfig.businessType}
              </p>
            </div>
          </div>

          {/* Enhanced Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-3 rounded-full transition-all duration-300 hover:scale-105"
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
            {messages.map((message) => (
              <ThemeAwareMessageBubble
                key={message.id}
                message={message}
                visualConfig={visualConfig}
                theme={theme}
              />
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-start gap-3 justify-start">
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
    </div>
  );
};

export default ChatInterface;