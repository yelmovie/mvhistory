import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, ArrowLeft, Settings, Sparkles, User, Bot, Loader, MessageSquare, Trophy, Star } from "lucide-react";
import { ConversationManager, chatWithOpenAI, getWelcomeMessage, historicalCharacters } from "../utils/openaiApi";
import { ApiKeySettings } from "./ApiKeySettings";

interface CharacterChatProps {
  characterName: string;
  characterImage?: string;
  onBack: () => void;
  onCardUnlock?: () => void;
  darkMode?: boolean;
  viewMode?: 'desktop' | 'tablet' | 'mobile';
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function CharacterChat({ 
  characterName, 
  characterImage,
  onBack, 
  onCardUnlock,
  darkMode = false,
  viewMode = 'desktop'
}: CharacterChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationManager] = useState(() => new ConversationManager(characterName));
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [hasUnlockedCard, setHasUnlockedCard] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const character = historicalCharacters[characterName as keyof typeof historicalCharacters];

  // 초기 환영 메시지
  useEffect(() => {
    const welcomeMsg: Message = {
      id: '0',
      role: 'assistant',
      content: getWelcomeMessage(characterName),
      timestamp: new Date()
    };
    setMessages([welcomeMsg]);
  }, [characterName]);

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // API 키 확인
  useEffect(() => {
    const storedKey = localStorage.getItem('openai_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, [showSettings]);

  // 카드 획득 체크 (10턴 대화 완료 시)
  useEffect(() => {
    const stats = conversationManager.getStats();
    if (stats.turnCount >= 10 && !hasUnlockedCard) {
      setHasUnlockedCard(true);
      onCardUnlock?.();
    }
  }, [messages, conversationManager, hasUnlockedCard, onCardUnlock]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    if (!apiKey) {
      setShowSettings(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // 대화 매니저에 사용자 메시지 추가
      conversationManager.addUserMessage(userMessage.content);

      // OpenAI API 호출
      const response = await chatWithOpenAI(
        conversationManager.getMessages(),
        apiKey
      );

      // 응답 메시지 추가
      conversationManager.addAssistantMessage(response);
      conversationManager.trimHistory(10); // 최근 10개 메시지만 유지

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '죄송해요, 지금은 대화하기 어려워요. 😢\nAPI 키가 올바른지 확인해주세요!',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const stats = conversationManager.getStats();
  const progress = Math.min((stats.turnCount / 10) * 100, 100);

  return (
    <>
      <div className={`min-h-screen transition-colors ${
        darkMode ? 'bg-[#0F172A]' : 'bg-[#FEF7FF]'
      } ${viewMode === 'mobile' ? 'p-0' : 'p-6'}`}>
        <div className={`${viewMode === 'mobile' ? 'h-screen' : 'max-w-4xl mx-auto h-[90vh]'} flex flex-col`}>
          {/* Header */}
          <div 
            className={`${
              darkMode ? 'bg-[#1E293B]' : 'bg-white'
            } ${viewMode === 'mobile' ? 'rounded-none' : 'rounded-t-[24px]'} p-4`}
            style={{ boxShadow: 'var(--shadow-md)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onBack}
                  className={`p-2 rounded-[12px] ${
                    darkMode ? 'bg-[#334155] hover:bg-[#475569]' : 'bg-[#F3F4F6] hover:bg-[#E5E7EB]'
                  }`}
                >
                  <ArrowLeft className="w-5 h-5" strokeWidth={2} />
                </motion.button>

                {/* Character Avatar */}
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{
                    background: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
                    boxShadow: 'var(--shadow-accent)'
                  }}
                >
                  {characterName.charAt(0)}
                </div>

                <div>
                  <h2 className={`font-bold text-lg ${
                    darkMode ? 'text-white' : 'text-[#1F2937]'
                  }`}>
                    {characterName}
                  </h2>
                  {character && (
                    <p className={`text-xs ${
                      darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'
                    }`}>
                      {character.period} · {character.description}
                    </p>
                  )}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSettings(true)}
                className={`p-2 rounded-[12px] ${
                  darkMode ? 'bg-[#334155] hover:bg-[#475569]' : 'bg-[#F3F4F6] hover:bg-[#E5E7EB]'
                }`}
              >
                <Settings className="w-5 h-5" strokeWidth={2} />
              </motion.button>
            </div>

            {/* Progress to Card Unlock */}
            <div 
              className={`p-3 rounded-[16px] ${
                darkMode ? 'bg-[#334155]/50' : 'bg-[#F9FAFB]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#F59E0B]" strokeWidth={2} />
                  <span className={`text-xs font-bold ${
                    darkMode ? 'text-white' : 'text-[#1F2937]'
                  }`}>
                    인물 카드 획득 진행률
                  </span>
                </div>
                <span className={`text-xs font-bold ${
                  darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'
                }`}>
                  {stats.turnCount}/10 턴
                </span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${
                darkMode ? 'bg-[#475569]' : 'bg-[#E5E7EB]'
              }`}>
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #EC4899 0%, #F472B6 100%)'
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              {progress >= 100 && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs font-bold text-[#10B981] mt-2 flex items-center gap-1"
                >
                  <Star className="w-4 h-4 fill-current" strokeWidth={2} />
                  인물 카드를 획득했어요!
                </motion.p>
              )}
            </div>
          </div>

          {/* Messages */}
          <div 
            className={`flex-1 overflow-y-auto p-4 space-y-4 ${
              darkMode ? 'bg-[#0F172A]' : 'bg-[#FEF7FF]'
            }`}
          >
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div 
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    message.role === 'user'
                      ? 'bg-[#6366F1] text-white'
                      : 'bg-[#EC4899] text-white'
                  }`}
                  style={{
                    boxShadow: message.role === 'user' 
                      ? 'var(--shadow-primary)' 
                      : 'var(--shadow-accent)'
                  }}
                >
                  {message.role === 'user' ? (
                    <User className="w-5 h-5" strokeWidth={2} />
                  ) : (
                    <Bot className="w-5 h-5" strokeWidth={2} />
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`flex flex-col ${
                  message.role === 'user' ? 'items-end' : 'items-start'
                } max-w-[75%]`}>
                  <div 
                    className={`px-4 py-3 rounded-[16px] ${
                      message.role === 'user'
                        ? 'bg-[#6366F1] text-white'
                        : darkMode
                          ? 'bg-[#1E293B] text-white'
                          : 'bg-white text-[#1F2937]'
                    }`}
                    style={{
                      boxShadow: message.role === 'user' 
                        ? 'var(--shadow-primary)' 
                        : 'var(--shadow-md)'
                    }}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                  <span className={`text-xs mt-1 px-2 ${
                    darkMode ? 'text-[#94A3B8]' : 'text-[#9CA3AF]'
                  }`}>
                    {message.timestamp.toLocaleTimeString('ko-KR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </motion.div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-[#EC4899] text-white"
                  style={{ boxShadow: 'var(--shadow-accent)' }}
                >
                  <Bot className="w-5 h-5" strokeWidth={2} />
                </div>
                <div 
                  className={`px-4 py-3 rounded-[16px] ${
                    darkMode ? 'bg-[#1E293B]' : 'bg-white'
                  }`}
                  style={{ boxShadow: 'var(--shadow-md)' }}
                >
                  <div className="flex gap-2">
                    <motion.div
                      className={`w-2 h-2 rounded-full ${
                        darkMode ? 'bg-[#EC4899]' : 'bg-[#EC4899]'
                      }`}
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className={`w-2 h-2 rounded-full ${
                        darkMode ? 'bg-[#EC4899]' : 'bg-[#EC4899]'
                      }`}
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className={`w-2 h-2 rounded-full ${
                        darkMode ? 'bg-[#EC4899]' : 'bg-[#EC4899]'
                      }`}
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div 
            className={`${
              darkMode ? 'bg-[#1E293B]' : 'bg-white'
            } ${viewMode === 'mobile' ? 'rounded-none' : 'rounded-b-[24px]'} p-4 border-t ${
              darkMode ? 'border-[#334155]' : 'border-[#E5E7EB]'
            }`}
            style={{ boxShadow: 'var(--shadow-md)' }}
          >
            {!apiKey && (
              <div 
                className={`mb-3 p-3 rounded-[12px] border ${
                  darkMode 
                    ? 'bg-[#FBBF24]/20 border-[#FBBF24]/50 text-[#FDE68A]'
                    : 'bg-[#FEF3C7] border-[#FBBF24] text-[#92400E]'
                }`}
              >
                <p className="text-xs font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4" strokeWidth={2} />
                  API 키를 설정하면 대화를 시작할 수 있어요!
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={apiKey ? "메시지를 입력하세요..." : "먼저 API 키를 설정해주세요"}
                disabled={isLoading || !apiKey}
                className={`flex-1 px-4 py-3 rounded-[12px] border-2 transition-all ${
                  darkMode
                    ? 'bg-[#334155] border-[#475569] text-white placeholder-[#94A3B8]'
                    : 'bg-white border-[#E5E7EB] text-[#1F2937] placeholder-[#9CA3AF]'
                } focus:outline-none focus:border-[#EC4899] disabled:opacity-50 disabled:cursor-not-allowed`}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading || !apiKey}
                className={`px-6 py-3 rounded-[12px] font-bold text-white flex items-center gap-2 transition-all ${
                  !inputValue.trim() || isLoading || !apiKey
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
                style={{
                  background: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
                  boxShadow: 'var(--shadow-accent)'
                }}
              >
                {isLoading ? (
                  <Loader className="w-5 h-5 animate-spin" strokeWidth={2} />
                ) : (
                  <Send className="w-5 h-5" strokeWidth={2} />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* API Key Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <ApiKeySettings 
            darkMode={darkMode}
            onClose={() => setShowSettings(false)}
            viewMode={viewMode}
          />
        )}
      </AnimatePresence>
    </>
  );
}
