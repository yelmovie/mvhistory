import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Send, Sparkles, User, Gift, Plus, X, Home } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'character';
  timestamp: Date;
}

interface HistoricalCharacter {
  id: string;
  name: string;
  period: string;
  description: string;
  imageUrl: string;
  greeting: string;
  isCustom?: boolean;
}

interface CharacterChatScreenProps {
  onBack: () => void;
  onHome?: () => void;
  darkMode?: boolean;
  onUnlockCharacter?: (characterId: string, reason: 'quiz' | 'chat') => void;
}

export function CharacterChatScreen({ onBack, onHome, darkMode = false, onUnlockCharacter }: CharacterChatScreenProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<HistoricalCharacter | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnlocked, setHasUnlocked] = useState<Set<string>>(new Set());
  const [showUnlockNotification, setShowUnlockNotification] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customCharacterName, setCustomCharacterName] = useState('');
  const [customCharacters, setCustomCharacters] = useState<HistoricalCharacter[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const historicalCharacters: HistoricalCharacter[] = [
    {
      id: 'sejong',
      name: '세종대왕',
      period: '조선시대',
      description: '한글을 창제하신 성군',
      imageUrl: 'https://images.unsplash.com/photo-1578648693974-9438ebc063bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraW5nJTIwc2Vqb25nJTIwa29yZWFuJTIwaGlzdG9yaWNhbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MDg0MDU4OXww&ixlib=rb-4.1.0&q=80&w=1080',
      greeting: '안녕하십니까? 짐은 조선 제4대 왕 세종이옵니다. 무엇이 궁금하신가요?'
    },
    {
      id: 'yisunsin',
      name: '이순신 장군',
      period: '조선시대',
      description: '임진왜란의 영웅',
      imageUrl: 'https://images.unsplash.com/photo-1763887486232-0e0968e4618b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZG1pcmFsJTIweWklMjBzdW4lMjBzaW4lMjBzdGF0dWV8ZW58MXx8fHwxNzcwODQwNTg5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      greeting: '하하, 좋은 날이오! 나는 이순신이라 하오. 무엇이든 물어보시오.'
    },
    {
      id: 'sinsaimdang',
      name: '신사임당',
      period: '조선시대',
      description: '예술가이자 학자',
      imageUrl: 'https://images.unsplash.com/photo-1673802866679-25ed4f1ae8ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjBxdWVlbiUyMGhpc3RvcmljYWwlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzA4NDA1OTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
      greeting: '안녕하세요. 저는 신사임당입니다. 예술과 학문에 대해 이야기 나눠요.'
    },
    {
      id: 'jeongyakyong',
      name: '정약용',
      period: '조선시대',
      description: '실학자이자 발명가',
      imageUrl: 'https://images.unsplash.com/photo-1753184649034-cadec03611da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjBzY2hvbGFyJTIwdHJhZGl0aW9uYWwlMjBwYWludGluZ3xlbnwxfHx8fDE3NzA4NDA1OTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
      greeting: '반갑소. 나는 정약용이오. 실학과 과학에 대해 함께 이야기해봅시다.'
    },
    {
      id: 'yuGwansun',
      name: '유관순',
      period: '근현대',
      description: '독립운동가',
      imageUrl: 'https://images.unsplash.com/photo-1559722530-0562aef6306a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjBpbmRlcGVuZGVuY2UlMjBhY3RpdmlzdCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MDg0MDU5MHww&ixlib=rb-4.1.0&q=80&w=1080',
      greeting: '안녕하세요. 저는 유관순입니다. 우리나라의 독립을 위해 싸웠어요.'
    },
    {
      id: 'gwanggaeto',
      name: '광개토대왕',
      period: '삼국시대',
      description: '고구려의 정복군주',
      imageUrl: 'https://images.unsplash.com/photo-1671101460428-e3f6a532c7c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMGtvcmVhbiUyMGdlbmVyYWwlMjB3YXJyaW9yfGVufDF8fHx8MTc3MDg0MDU5MXww&ixlib=rb-4.1.0&q=80&w=1080',
      greeting: '과인은 고구려의 광개토대왕이다. 영토 확장과 고구려의 위대함을 말해주마.'
    }
  ];

  const allCharacters = [...historicalCharacters, ...customCharacters];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 욕설 필터링 함수
  const containsBadWords = (text: string): boolean => {
    const badWords = ['욕설1', '욕설2', '비속어']; // 실제로는 더 많은 단어 추가
    return badWords.some(word => text.includes(word));
  };

  const handleAddCustomCharacter = () => {
    if (!customCharacterName.trim()) return;

    const newCharacter: HistoricalCharacter = {
      id: `custom-${Date.now()}`,
      name: customCharacterName,
      period: '사용자 입력',
      description: '직접 입력한 역사 인물',
      imageUrl: 'https://images.unsplash.com/photo-1578648693974-9438ebc063bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraW5nJTIwc2Vqb25nJTIwa29yZWFuJTIwaGlzdG9yaWNhbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MDg0MDU4OXww&ixlib=rb-4.1.0&q=80&w=1080',
      greeting: `안녕하세요! 저는 ${customCharacterName}입니다. 무엇이 궁금하신가요?`,
      isCustom: true
    };

    setCustomCharacters(prev => [...prev, newCharacter]);
    setCustomCharacterName('');
    setShowCustomInput(false);
    handleSelectCharacter(newCharacter);
  };

  const handleSelectCharacter = (character: HistoricalCharacter) => {
    setSelectedCharacter(character);
    setMessages([
      {
        id: Date.now().toString(),
        text: character.greeting,
        sender: 'character',
        timestamp: new Date()
      }
    ]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedCharacter || isLoading) return;

    // 욕설 필터링
    if (containsBadWords(inputMessage)) {
      alert('교육적인 대화를 위해 바른 말을 사용해주세요! 😊');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // OpenAI API 연동
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer YOUR_OPENAI_API_KEY', // 실제 API 키로 교체 필요
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `당신은 한국의 역사 인물 "${selectedCharacter.name}"입니다. 
              
초등학생(8-13세)과 대화하고 있습니다. 다음 규칙을 반드시 지켜주세요:

1. 언어 수준: 초등학생이 이해하기 쉬운 단어와 문장 사용
2. 교육적 내용: 역사적 사실, 도덕적 가치, 배울 점 중심으로 대화
3. 친근한 태도: 부드럽고 친절하게 설명
4. 긍정적 방향: 항상 희망적이고 교육적인 메시지 전달
5. 안전한 대화: 부적절한 내용, 폭력, 차별 언급 금지
6. 호기심 유발: 역사에 흥미를 가질 수 있도록 재미있게 설명

${selectedCharacter.name}의 시대, 업적, 성격을 반영하여 대화하되, 항상 교육적이고 도덕적인 방향으로 이끌어주세요.
어려운 한자어나 전문 용어는 쉽게 풀어서 설명해주세요.`
            },
            ...messages.map(msg => ({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.text
            })),
            {
              role: 'user',
              content: inputMessage
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error('API 호출 실패');
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      const characterResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'character',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, characterResponse]);

      // Unlock character card after 10 turns (20 messages total - 10 user + 10 character)
      if (selectedCharacter && !hasUnlocked.has(selectedCharacter.id) && messages.length >= 19) {
        setHasUnlocked(prev => new Set(prev).add(selectedCharacter.id));
        onUnlockCharacter?.(selectedCharacter.id, 'chat');
        setShowUnlockNotification(true);
        setTimeout(() => setShowUnlockNotification(false), 5000);
      }
    } catch (error) {
      console.error('API 오류:', error);
      
      // API 오류 시 기본 응답 (교육적 내용)
      const fallbackResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: `좋은 질문이네요! "${inputMessage}"에 대해 말씀드리자면... 역사를 공부하는 것은 과거를 통해 현재를 이해하고 미래를 준비하는 일입니다. 더 궁금한 것이 있나요? 
        
💡 OpenAI API 키를 설정하면 실제 AI 대화가 가능합니다!`,
        sender: 'character',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackResponse]);

      // Still unlock after 10 turns even with fallback
      if (selectedCharacter && !hasUnlocked.has(selectedCharacter.id) && messages.length >= 19) {
        setHasUnlocked(prev => new Set(prev).add(selectedCharacter.id));
        onUnlockCharacter?.(selectedCharacter.id, 'chat');
        setShowUnlockNotification(true);
        setTimeout(() => setShowUnlockNotification(false), 5000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRemoveCustomCharacter = (characterId: string) => {
    setCustomCharacters(prev => prev.filter(c => c.id !== characterId));
    if (selectedCharacter?.id === characterId) {
      setSelectedCharacter(null);
      setMessages([]);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${
      darkMode ? 'text-white' : 'text-gray-900'
    }`}>
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`${
          darkMode 
            ? 'bg-gray-900/80 border-gray-700/50' 
            : 'bg-white/80 border-white/50'
        } backdrop-blur-xl border-b shadow-sm sticky top-0 z-50`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl ${
                  darkMode 
                    ? 'bg-gray-800/60 border-gray-700/50' 
                    : 'bg-white/60 border-white/80'
                } backdrop-blur-xl border shadow-lg hover:shadow-xl transition-all`}
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">뒤로가기</span>
              </motion.button>

              {onHome && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onHome}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl ${
                    darkMode 
                      ? 'bg-purple-600/60 border-purple-500/50 hover:bg-purple-600/80' 
                      : 'bg-purple-500/60 border-purple-400/50 hover:bg-purple-500/80'
                  } backdrop-blur-xl border shadow-lg hover:shadow-xl transition-all`}
                  title="홈으로"
                >
                  <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Sparkles className={`w-5 h-5 ${
                darkMode ? 'text-purple-400' : 'text-purple-600'
              }`} />
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                역사 속 인물과 대화하기
              </h1>
            </div>

            <div className="w-20 sm:w-32" />
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="max-w-7xl mx-auto w-full flex gap-4 sm:gap-6 p-4 sm:p-6 h-[calc(100vh-88px)]">
          {/* Left Sidebar - Character List */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={`w-full sm:w-80 flex-shrink-0 ${
              darkMode 
                ? 'bg-gray-800/50 border-gray-700/50' 
                : 'bg-white/70 border-white/90'
            } backdrop-blur-2xl border-2 rounded-3xl p-4 sm:p-6 shadow-2xl overflow-y-auto`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">대화할 인물 선택</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowCustomInput(!showCustomInput)}
                className={`p-2 rounded-xl ${
                  darkMode 
                    ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30' 
                    : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                } transition-all`}
                title="직접 인물 입력"
              >
                <Plus className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Custom Character Input */}
            <AnimatePresence>
              {showCustomInput && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <div className={`${
                    darkMode 
                      ? 'bg-purple-500/10 border-purple-400/30' 
                      : 'bg-purple-50 border-purple-200'
                  } border-2 rounded-2xl p-4`}>
                    <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      대화하고 싶은 역사 인물의 이름을 입력하세요
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customCharacterName}
                        onChange={(e) => setCustomCharacterName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddCustomCharacter()}
                        placeholder="예: 김구, 안중근"
                        className={`flex-1 px-4 py-2 rounded-xl ${
                          darkMode
                            ? 'bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400'
                            : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                        } border focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm`}
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddCustomCharacter}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm"
                      >
                        추가
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Character List */}
            <div className="space-y-3">
              {allCharacters.map((character) => (
                <motion.div
                  key={character.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectCharacter(character)}
                  className={`relative p-4 rounded-2xl cursor-pointer transition-all border-2 ${
                    selectedCharacter?.id === character.id
                      ? darkMode
                        ? 'bg-purple-500/20 border-purple-400'
                        : 'bg-purple-100 border-purple-400'
                      : darkMode
                        ? 'bg-gray-700/30 border-gray-600/30 hover:bg-gray-700/50'
                        : 'bg-white/50 border-gray-200 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200">
                      <ImageWithFallback
                        src={character.imageUrl}
                        alt={character.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate">{character.name}</h3>
                      <p className={`text-xs truncate ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {character.period}
                      </p>
                      <p className={`text-xs truncate ${
                        darkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        {character.description}
                      </p>
                    </div>
                    {character.isCustom && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCustomCharacter(character.id);
                        }}
                        className={`p-1 rounded-lg ${
                          darkMode 
                            ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10' 
                            : 'text-gray-500 hover:text-red-600 hover:bg-red-100'
                        }`}
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                  {selectedCharacter?.id === character.id && (
                    <motion.div
                      layoutId="selected-indicator"
                      className="absolute right-3 top-3"
                    >
                      <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Side - Chat Area */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {!selectedCharacter ? (
              <div className={`flex-1 flex items-center justify-center ${
                darkMode 
                  ? 'bg-gray-800/50 border-gray-700/50' 
                  : 'bg-white/70 border-white/90'
              } backdrop-blur-2xl border-2 rounded-3xl shadow-2xl`}>
                <div className="text-center p-8">
                  <User className={`w-16 h-16 mx-auto mb-4 ${
                    darkMode ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                  <h3 className="text-xl font-bold mb-2">인물을 선택해주세요</h3>
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    왼쪽에서 대화하고 싶은 역사 인물을 선택하거나<br />
                    직접 입력해보세요!
                  </p>
                </div>
              </div>
            ) : (
              <div className={`flex-1 flex flex-col ${
                darkMode 
                  ? 'bg-gray-800/50 border-gray-700/50' 
                  : 'bg-white/70 border-white/90'
              } backdrop-blur-2xl border-2 rounded-3xl shadow-2xl overflow-hidden`}>
                {/* Chat Header */}
                <div className={`px-6 py-4 border-b ${
                  darkMode ? 'border-gray-700/50' : 'border-gray-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-200">
                      <ImageWithFallback
                        src={selectedCharacter.imageUrl}
                        alt={selectedCharacter.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold">{selectedCharacter.name}</h3>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {selectedCharacter.period} • {selectedCharacter.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6">
                  {/* Character Avatar - Fixed Position */}
                  <div className="flex justify-center mb-6">
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      className="relative"
                    >
                      {/* Animated Ring */}
                      <motion.div
                        animate={{ 
                          scale: isLoading ? [1, 1.1, 1] : 1,
                          rotate: isLoading ? 360 : 0
                        }}
                        transition={{ 
                          scale: { duration: 1.5, repeat: Infinity },
                          rotate: { duration: 3, repeat: Infinity, ease: "linear" }
                        }}
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 p-1 -m-1"
                      />
                      
                      {/* Avatar Image */}
                      <div className={`relative w-32 h-32 rounded-full overflow-hidden border-4 ${
                        darkMode ? 'border-gray-800 bg-gray-800' : 'border-white bg-white'
                      } shadow-2xl`}>
                        <ImageWithFallback
                          src={selectedCharacter.imageUrl}
                          alt={selectedCharacter.name}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Talking Animation Overlay */}
                        {isLoading && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="absolute inset-0 bg-gradient-to-t from-purple-500/30 to-transparent"
                          />
                        )}
                      </div>

                      {/* Status Indicator */}
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-4 border-white shadow-lg"
                      />

                      {/* Name Label */}
                      <div className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap px-4 py-1.5 rounded-full ${
                        darkMode 
                          ? 'bg-gray-700/90 text-white' 
                          : 'bg-white/90 text-gray-900'
                      } shadow-lg text-sm font-bold`}>
                        {selectedCharacter.name}
                      </div>
                    </motion.div>
                  </div>

                  {/* Messages */}
                  <div className="space-y-4 mt-12">
                    <AnimatePresence initial={false}>
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end flex-row-reverse' : 'justify-start'}`}
                        >
                          {/* Small Avatar for character messages */}
                          {message.sender === 'character' && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-400 flex-shrink-0 shadow-md"
                            >
                              <ImageWithFallback
                                src={selectedCharacter.imageUrl}
                                alt={selectedCharacter.name}
                                className="w-full h-full object-cover"
                              />
                            </motion.div>
                          )}

                          <div className={`max-w-[70%] ${message.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                            <div className={`px-4 py-3 rounded-2xl ${
                              message.sender === 'user'
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-tr-none'
                                : darkMode
                                  ? 'bg-gray-700/50 border-gray-600/50 border rounded-tl-none'
                                  : 'bg-gray-100 border-gray-200 border rounded-tl-none'
                            } shadow-md`}>
                              <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                            </div>
                            <p className={`text-xs mt-1 px-2 ${
                              darkMode ? 'text-gray-500' : 'text-gray-500'
                            }`}>
                              {message.timestamp.toLocaleTimeString('ko-KR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start items-start gap-3"
                      >
                        {/* Small Avatar for loading */}
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-400 flex-shrink-0 shadow-md"
                        >
                          <ImageWithFallback
                            src={selectedCharacter.imageUrl}
                            alt={selectedCharacter.name}
                            className="w-full h-full object-cover"
                          />
                        </motion.div>

                        <div className={`px-4 py-3 rounded-2xl rounded-tl-none ${
                          darkMode
                            ? 'bg-gray-700/50 border-gray-600/50 border'
                            : 'bg-gray-100 border-gray-200 border'
                        } shadow-md`}>
                          <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className={`px-6 py-4 border-t ${
                  darkMode ? 'border-gray-700/50' : 'border-gray-200'
                }`}>
                  <div className={`text-xs mb-2 flex items-center gap-2 ${
                    darkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    <Sparkles className="w-3 h-3" />
                    <span>OpenAI GPT-4o-mini 연동 • 초등학생 수준 • 교육적 대화 • 욕설 금지</span>
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="인물에게 질문을 입력하세요..."
                      disabled={isLoading}
                      className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl ${
                        darkMode
                          ? 'bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400'
                          : 'bg-white/80 border-gray-200/50 text-gray-900 placeholder-gray-500'
                      } border-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm sm:text-base disabled:opacity-50`}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      className="px-6 py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      <span className="hidden sm:inline">전송</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Unlock Notification */}
      <AnimatePresence>
        {showUnlockNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <div className={`${
              darkMode 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                : 'bg-gradient-to-r from-purple-500 to-pink-500'
            } text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3`}>
              <Gift className="w-6 h-6" />
              <div>
                <p className="font-bold">인물 카드 획득!</p>
                <p className="text-sm opacity-90">{selectedCharacter?.name} 카드를 받았어요 🎉</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
