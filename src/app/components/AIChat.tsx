import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import type { Character } from "../data/quizData";
import { sendChatMessage, trimChatHistory } from "../utils/openaiAPI";
import { getCachedImage } from "../utils/aiImageGenerator";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatProps {
  character: Character;
  onClose: () => void;
  darkMode?: boolean;
  viewMode?: 'desktop' | 'tablet' | 'mobile';
}

export function AIChat({ 
  character, 
  onClose, 
  darkMode = false,
  viewMode = 'desktop'
}: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `안녕하세요! 저는 ${character.name}입니다. ${character.period}의 ${character.role}로서, 여러분과 이야기를 나누게 되어 기쁩니다. 무엇이든 궁금한 것을 물어보세요!`
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const characterImage = getCachedImage(character.id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setError(null);

    // 사용자 메시지 추가
    const newUserMessage: Message = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, newUserMessage]);

    setIsLoading(true);

    try {
      // 대화 히스토리 준비 (최근 10개만)
      const chatHistory = trimChatHistory([
        ...messages,
        newUserMessage
      ].map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      })));

      // OpenAI API 호출
      const response = await sendChatMessage(
        chatHistory,
        character.name,
        character.period,
        character.role,
        character.description
      );

      // AI 응답 추가
      const assistantMessage: Message = {
        role: 'assistant',
        content: response
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : '응답을 받지 못했습니다. 다시 시도해주세요.');
      
      // 에러 시 사용자 메시지 제거
      setMessages(prev => prev.slice(0, -1));
      setInput(userMessage); // 입력 복원
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`min-h-screen ${
      darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50'
    }`}>
      <div className={`${
        viewMode === 'mobile' ? 'max-w-full' : 'max-w-4xl'
      } mx-auto h-screen flex flex-col`}>
        {/* Header */}
        <header className={`sticky top-0 z-50 ${
          darkMode ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200'
        } backdrop-blur-xl border-b shadow-sm`}>
          <div className={`flex items-center ${
            viewMode === 'mobile' ? 'px-3 py-3 gap-3' : 'px-6 py-4 gap-4'
          }`}>
            {/* Back Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className={`flex items-center gap-2 ${
                viewMode === 'mobile' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2 text-base'
              } ${
                darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-gray-100 hover:bg-gray-200'
              } rounded-xl transition-colors flex-shrink-0`}
            >
              <ArrowLeft className={viewMode === 'mobile' ? 'w-4 h-4' : 'w-5 h-5'} />
              <span>뒤로</span>
            </motion.button>

            {/* Character Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Character Avatar */}
              <div className={`relative ${
                viewMode === 'mobile' ? 'w-10 h-10' : 'w-12 h-12'
              } rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0 ring-2 ring-purple-200 dark:ring-purple-800`}>
                {characterImage ? (
                  <ImageWithFallback
                    src={characterImage}
                    alt={character.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">
                    {character.emoji || '👤'}
                  </div>
                )}
                {/* Online Status Indicator */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
              </div>

              {/* Name & Period */}
              <div className="flex-1 min-w-0">
                <h2 className={`font-bold truncate ${
                  viewMode === 'mobile' ? 'text-sm' : 'text-lg'
                } ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {character.name}
                </h2>
                <p className={`truncate ${
                  viewMode === 'mobile' ? 'text-xs' : 'text-sm'
                } ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {character.period} • {character.role}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <div className={`flex-1 overflow-y-auto ${
          viewMode === 'mobile' ? 'px-3 py-4' : 'px-6 py-6'
        }`}>
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                } mb-4`}
              >
                <div className={`flex ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                } items-end gap-2 ${
                  viewMode === 'mobile' ? 'max-w-[85%]' : 'max-w-[75%]'
                }`}>
                  {/* Avatar for character messages */}
                  {message.role === 'assistant' && (
                    <div className={`${
                      viewMode === 'mobile' ? 'w-8 h-8' : 'w-10 h-10'
                    } rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0 ring-2 ring-purple-100 dark:ring-purple-900`}>
                      {characterImage ? (
                        <ImageWithFallback
                          src={characterImage}
                          alt={character.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">
                          {character.emoji || '👤'}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`${
                    viewMode === 'mobile' ? 'px-3 py-2 rounded-2xl' : 'px-4 py-3 rounded-2xl'
                  } ${
                    message.role === 'user'
                      ? `bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg ${
                          message.role === 'user' ? 'rounded-tr-sm' : ''
                        }`
                      : `${
                          darkMode 
                            ? 'bg-gray-800 text-white border border-gray-700' 
                            : 'bg-white text-gray-900 border border-gray-200'
                        } shadow-md ${message.role === 'assistant' ? 'rounded-tl-sm' : ''}`
                  }`}>
                    <p className={`${
                      viewMode === 'mobile' ? 'text-sm' : 'text-base'
                    } leading-relaxed whitespace-pre-wrap break-words`}>
                      {message.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start mb-4"
            >
              <div className="flex items-end gap-2">
                <div className={`${
                  viewMode === 'mobile' ? 'w-8 h-8' : 'w-10 h-10'
                } rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0`}>
                  {characterImage ? (
                    <ImageWithFallback
                      src={characterImage}
                      alt={character.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg">
                      {character.emoji || '👤'}
                    </div>
                  )}
                </div>
                <div className={`${
                  viewMode === 'mobile' ? 'px-4 py-3' : 'px-5 py-3'
                } ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                } rounded-2xl rounded-tl-sm shadow-md`}>
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                    <span className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      답변 준비 중...
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-4 ${
                viewMode === 'mobile' ? 'p-3' : 'p-4'
              } rounded-xl ${
                darkMode ? 'bg-red-900/30 border border-red-800' : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="flex items-start gap-2">
                <AlertCircle className={`w-5 h-5 flex-shrink-0 ${
                  darkMode ? 'text-red-400' : 'text-red-600'
                }`} />
                <p className={`text-sm ${
                  darkMode ? 'text-red-300' : 'text-red-800'
                }`}>
                  {error}
                </p>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className={`border-t ${
          darkMode ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200'
        } backdrop-blur-xl ${
          viewMode === 'mobile' ? 'p-3' : 'p-4'
        }`}>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`${character.name}에게 질문해보세요...`}
              disabled={isLoading}
              className={`flex-1 ${
                viewMode === 'mobile' ? 'px-4 py-2.5 text-sm' : 'px-5 py-3 text-base'
              } rounded-xl border-2 ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500'
              } outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`${
                viewMode === 'mobile' ? 'px-4 py-2.5' : 'px-6 py-3'
              } rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </motion.button>
          </div>

          {/* Helper Text */}
          <p className={`text-center mt-2 ${
            viewMode === 'mobile' ? 'text-xs' : 'text-xs'
          } ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            역사적 사실에 기반한 교육적인 대화를 나눠보세요 📚
          </p>
        </div>
      </div>
    </div>
  );
}
