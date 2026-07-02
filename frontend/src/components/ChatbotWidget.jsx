import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../services/api';
import { 
  IoClose, 
  IoSend, 
  IoChatbubbleEllipsesOutline, 
  IoFitnessOutline, 
  IoSparkles, 
  IoMedicalOutline,
  IoReloadOutline
} from 'react-icons/io5';

const ChatbotWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const chatKey = `dietplanner_chat_${user?.id || user?.username || 'guest'}`;
  
  // Load initial chat history from sessionStorage
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(chatKey);
      return saved ? JSON.parse(saved) : [
        { 
          role: 'model', 
          text: "Hi! I'm DietPlanner AI. Ask me anything about your daily goals, BMI, meal plans, or workout nutrition! 🥗" 
        }
      ];
    } catch (e) {
      return [
        { 
          role: 'model', 
          text: "Hi! I'm DietPlanner AI. Ask me anything about your daily goals, BMI, meal plans, or workout nutrition! 🥗" 
        }
      ];
    }
  });

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Persist history to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(chatKey, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save chat to sessionStorage:', e);
    }
  }, [messages, chatKey]);

  // Handle suggestion chips
  const handleSuggestionClick = (text) => {
    handleSend(text);
  };

  // Reset chat history
  const handleResetChat = () => {
    if (window.confirm("Are you sure you want to clear the conversation?")) {
      const initialMsg = [
        { 
          role: 'model', 
          text: "Hi! I'm DietPlanner AI. Ask me anything about your daily goals, BMI, meal plans, or workout nutrition! 🥗" 
        }
      ];
      setMessages(initialMsg);
      try {
        sessionStorage.setItem(chatKey, JSON.stringify(initialMsg));
      } catch (e) {}
    }
  };

  // Send message handler
  const handleSend = async (textToSend = input) => {
    const trimmedText = textToSend.trim();
    if (!trimmedText || isLoading) return;

    setError(null);
    setInput('');
    
    // Add user message to history
    const newMessages = [...messages, { role: 'user', text: trimmedText }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Skip the initial welcome message (index 0) and the current user message (last)
      // Gemini requires history to start with a 'user' role, not 'model'
      const apiHistory = newMessages
        .slice(1, -1) // skip welcome msg and current msg
        .map(msg => ({
          role: msg.role,
          parts: [{ text: msg.text }]
        }));

      const res = await chatAPI.sendMessage(trimmedText, apiHistory);
      
      if (res.success) {
        setMessages(prev => [...prev, { role: 'model', text: res.reply }]);
      } else {
        setError(res.message || 'Something went wrong.');
      }
    } catch (err) {
      console.error('Chat error:', err);
      const status = err.response?.status;
      const serverMsg = err.response?.data?.message;
      
      if (status === 429) {
        setError("You're sending messages too fast. Please wait a moment.");
      } else if (status === 503) {
        setError(serverMsg || 'AI service temporarily unavailable. Try again in a minute.');
      } else if (status === 500) {
        setError(serverMsg || 'AI encountered an error. Please try again.');
      } else {
        setError('Failed to send message. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Don't render chatbot if user is not logged in
  if (!user) return null;

  // Suggestion chips configurations
  const suggestions = [
    { text: "How many calories left?", icon: "🔥" },
    { text: "What is my BMI?", icon: "⚖️" },
    { text: "Suggest a healthy snack", icon: "🍎" },
    { text: "Workout nutrition ideas", icon: "💪" }
  ];

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full accent-gradient text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-emerald-400 group cursor-pointer focus:outline-none"
        aria-label="Open AI Assistant"
      >
        {isOpen ? (
          <IoClose className="text-2xl transform rotate-0 hover:rotate-90 transition-all duration-300" />
        ) : (
          <div className="relative">
            <IoChatbubbleEllipsesOutline className="text-2xl animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
          </div>
        )}
      </button>

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] h-[550px] max-h-[calc(100vh-8rem)] rounded-2xl flex flex-col z-50 transition-all duration-300 transform scale-100 origin-bottom-right glass-card overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-light accent-gradient text-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <IoFitnessOutline className="text-lg text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">DietPlanner AI</h3>
                <span className="text-[10px] text-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-ping"></span>
                  Online Assistant
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleResetChat}
                title="Clear Chat"
                className="p-1 hover:bg-white/10 rounded transition-colors text-white cursor-pointer"
              >
                <IoReloadOutline className="text-base" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded transition-colors text-white cursor-pointer"
              >
                <IoClose className="text-lg" />
              </button>
            </div>
          </div>

          {/* Messages List Area */}
          <div className="flex-1 overflow-y-auto p-4 custom-scroll space-y-3 bg-[#0a0c10]/20">
            {messages.map((msg, index) => {
              const isBot = msg.role === 'model';
              return (
                <div 
                  key={index}
                  className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                    {isBot && (
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <IoSparkles className="text-[12px] text-emerald-500" />
                      </div>
                    )}
                    
                    <div className="flex flex-col">
                      <div 
                        className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                          isBot 
                            ? 'bg-card text-primary rounded-tl-none border border-light' 
                            : 'bg-emerald-600 text-white rounded-tr-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Loading typing indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[85%] flex-row">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <IoSparkles className="text-[12px] text-emerald-500 animate-spin" />
                  </div>
                  <div className="bg-card text-primary rounded-2xl rounded-tl-none border border-light p-3 flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Suggestions - Horizontal scroll, single line */}
            {messages.length === 1 && !isLoading && (
              <div className="flex gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
                {suggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(sug.text)}
                    className="text-[10px] bg-card hover:bg-emerald-500/10 border border-light hover:border-emerald-500/20 rounded-full px-2.5 py-1 text-primary transition-all duration-200 flex items-center gap-1 cursor-pointer whitespace-nowrap flex-shrink-0"
                  >
                    <span>{sug.icon}</span>
                    <span>{sug.text}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex justify-center p-2">
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl px-3 py-2 text-[10px] flex items-center gap-1.5">
                  <IoMedicalOutline className="text-xs" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Panel */}
          <div className="p-3 border-t border-light bg-card">
            <div className="flex items-center gap-2 bg-[#0a0c10]/5 dark:bg-[#fff]/5 rounded-xl px-3 py-1.5 border border-light focus-within:border-emerald-500/50 transition-all duration-300">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask me anything..."
                rows={1}
                className="flex-1 bg-transparent text-xs outline-none border-none resize-none max-h-20 custom-scroll text-primary py-1"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${
                  input.trim() && !isLoading
                    ? 'bg-emerald-500 text-white cursor-pointer hover:scale-105' 
                    : 'text-secondary cursor-not-allowed opacity-50'
                }`}
                title="Send Message"
              >
                <IoSend className="text-xs" />
              </button>
            </div>
            <div className="flex justify-center items-center px-1 mt-1.5">
              <span className="text-[9px] text-secondary flex items-center gap-1">
                <IoMedicalOutline className="text-[8px]" /> Cannot replace medical advice
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
