import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Send, Sparkles, User, Gift, Plus, X, Home, AlertCircle } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { getOpenAIApiKey } from "../utils/openaiApi";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ngvsfcekfzzykvcsjktp.supabase.co';
const SERVER_BASE = `${SUPABASE_URL}/functions/v1/make-server-48be01a5`;
const MAX_TURNS = 20;

// ========================== 욕설/비방 필터 ==========================
const BAD_WORDS = [
  // 욕설
  '씨발','시발','ㅅㅂ','ㅆㅂ','개새끼','개색','놈','년','씹','ㅆ','새끼','섹','성기',
  '보지','자지','항문','똥','오줌','ㅈㄹ','존나','꺼져','죽어','죽여','닥쳐','병신','미친',
  '바보','멍청','찐따','ㅂㅅ','ㅁㅊ','거지같','지랄','개소리','쓰레기','꺼지','엿먹',
  // 비방/혐오
  '왜놈','쪽발이','짱깨','흑인','nigger','bitch','fuck','shit','asshole','bastard',
  // 성적 표현
  '섹스','야동','포르노','강간','성추행',
];

const containsBadWords = (text: string): boolean => {
  const normalized = text.toLowerCase().replace(/\s/g, '');
  return BAD_WORDS.some(word => normalized.includes(word.toLowerCase()));
};

// ========================== 인물 기본 이미지 (폴백용) ==========================
const CHARACTER_FALLBACK_IMAGES: Record<string, string> = {
  sejong: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Portrait_of_King_Sejong.jpg/400px-Portrait_of_King_Sejong.jpg',
  yisunsin: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Yi_Sun-sin_portrait.jpg/400px-Yi_Sun-sin_portrait.jpg',
  sinsaimdang: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Shin_Saimdang_portrait.jpg/400px-Shin_Saimdang_portrait.jpg',
  jeongyakyong: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Jeong_Yakyong_portrait.jpg/400px-Jeong_Yakyong_portrait.jpg',
  yuGwansun: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Yu_Gwan-sun.jpg/400px-Yu_Gwan-sun.jpg',
  gwanggaeto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Gwanggaeto_stele.jpg/400px-Gwanggaeto_stele.jpg',
};
const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1578648693974-9438ebc063bb?w=400&q=80';

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
  imageLoading?: boolean;
}

interface CharacterChatScreenProps {
  onBack: () => void;
  onHome?: () => void;
  darkMode?: boolean;
  onUnlockCharacter?: (characterId: string, reason: 'quiz' | 'chat') => void;
}

// ========================== 구글 이미지 검색 ==========================
async function fetchCharacterImage(name: string, period: string): Promise<string> {
  try {
    const res = await fetch(`${SERVER_BASE}/search-character-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ characterName: name, period }),
    });
    if (!res.ok) throw new Error('failed');
    const data = await res.json();
    if (data.success && data.imageUrl) return data.imageUrl;
  } catch {
    // ignore, use fallback
  }
  return '';
}

// ========================== 종료 메시지 목록 ==========================
const FAREWELL_PROMPTS: Record<string, string> = {
  sejong: '이제 대화를 마무리할 시간이 되었소. 오늘 우리가 나눈 이야기가 자네의 마음에 씨앗이 되길 바라오. 언제든 책을 펼치고 학문을 게을리 하지 마시게. 부디 건강하게 지내시오!',
  yisunsin: '시간이 다 되었소! 나와 함께해줘서 고맙소. 나라를 사랑하는 마음, 절대 잊지 마시오. 자네도 큰 사람이 될 것이오. 건강히 지내시오!',
  default: '오늘 대화가 즐거웠어요! 함께해줘서 정말 고맙습니다. 역사를 통해 더 지혜로운 사람이 되길 응원할게요. 다음에 또 만나요! 👋',
};

function getFarewellMessage(characterId: string): string {
  return FAREWELL_PROMPTS[characterId] || FAREWELL_PROMPTS.default;
}

export function CharacterChatScreen({ onBack, onHome, darkMode = false, onUnlockCharacter }: CharacterChatScreenProps) {
  const [characters, setCharacters] = useState<HistoricalCharacter[]>([
    {
      id: 'sejong',
      name: '세종대왕',
      period: '조선시대',
      description: '한글을 창제하신 성군',
      imageUrl: CHARACTER_FALLBACK_IMAGES.sejong,
      greeting: '안녕하십니까? 짐은 조선 제4대 왕 세종이옵니다. 무엇이 궁금하신가요?',
    },
    {
      id: 'yisunsin',
      name: '이순신 장군',
      period: '조선시대',
      description: '임진왜란의 영웅',
      imageUrl: CHARACTER_FALLBACK_IMAGES.yisunsin,
      greeting: '하하, 좋은 날이오! 나는 이순신이라 하오. 무엇이든 물어보시오.',
    },
    {
      id: 'sinsaimdang',
      name: '신사임당',
      period: '조선시대',
      description: '예술가이자 학자',
      imageUrl: CHARACTER_FALLBACK_IMAGES.sinsaimdang,
      greeting: '안녕하세요. 저는 신사임당입니다. 예술과 학문에 대해 이야기 나눠요.',
    },
    {
      id: 'jeongyakyong',
      name: '정약용',
      period: '조선시대',
      description: '실학자이자 발명가',
      imageUrl: CHARACTER_FALLBACK_IMAGES.jeongyakyong,
      greeting: '반갑소. 나는 정약용이오. 실학과 과학에 대해 함께 이야기해봅시다.',
    },
    {
      id: 'yuGwansun',
      name: '유관순',
      period: '근현대',
      description: '독립운동가',
      imageUrl: CHARACTER_FALLBACK_IMAGES.yuGwansun,
      greeting: '안녕하세요. 저는 유관순입니다. 우리나라의 독립을 위해 싸웠어요.',
    },
    {
      id: 'gwanggaeto',
      name: '광개토대왕',
      period: '삼국시대',
      description: '고구려의 정복군주',
      imageUrl: CHARACTER_FALLBACK_IMAGES.gwanggaeto,
      greeting: '과인은 고구려의 광개토대왕이다. 영토 확장과 고구려의 위대함을 말해주마.',
    },
  ]);

  const [selectedCharacter, setSelectedCharacter] = useState<HistoricalCharacter | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnlocked, setHasUnlocked] = useState<Set<string>>(new Set());
  const [showUnlockNotification, setShowUnlockNotification] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customCharacterName, setCustomCharacterName] = useState('');
  const [badWordWarning, setBadWordWarning] = useState(false);
  const [isChatEnded, setIsChatEnded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 사용자 메시지만 카운트 (인사말 제외)
  const userTurnCount = messages.filter(m => m.sender === 'user').length;
  const turnsLeft = MAX_TURNS - userTurnCount;
  const isNearEnd = turnsLeft <= 3 && turnsLeft > 0;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 인물 선택 시 구글 이미지 자동 검색
  const loadCharacterImage = useCallback(async (char: HistoricalCharacter) => {
    if (char.imageLoading) return;
    setCharacters(prev => prev.map(c => c.id === char.id ? { ...c, imageLoading: true } : c));
    const url = await fetchCharacterImage(char.name, char.period);
    if (url) {
      setCharacters(prev => prev.map(c => c.id === char.id ? { ...c, imageUrl: url, imageLoading: false } : c));
      setSelectedCharacter(prev => prev?.id === char.id ? { ...prev, imageUrl: url, imageLoading: false } : prev);
    } else {
      setCharacters(prev => prev.map(c => c.id === char.id ? { ...c, imageLoading: false } : c));
    }
  }, []);

  // 앱 마운트 시 사전에 이미지 로딩 (옵션: 첫 선택 시만 로딩)
  const handleSelectCharacter = (character: HistoricalCharacter) => {
    setSelectedCharacter(character);
    setMessages([{
      id: Date.now().toString(),
      text: character.greeting,
      sender: 'character',
      timestamp: new Date(),
    }]);
    setIsChatEnded(false);
    loadCharacterImage(character);
  };

  const handleAddCustomCharacter = async () => {
    if (!customCharacterName.trim()) return;
    const newChar: HistoricalCharacter = {
      id: `custom-${Date.now()}`,
      name: customCharacterName,
      period: '사용자 입력',
      description: '직접 입력한 역사 인물',
      imageUrl: DEFAULT_FALLBACK,
      greeting: `안녕하세요! 저는 ${customCharacterName}입니다. 무엇이 궁금하신가요?`,
      isCustom: true,
    };
    setCharacters(prev => [...prev, newChar]);
    setCustomCharacterName('');
    setShowCustomInput(false);
    handleSelectCharacter(newChar);
  };

  const handleRemoveCustomCharacter = (characterId: string) => {
    setCharacters(prev => prev.filter(c => c.id !== characterId));
    if (selectedCharacter?.id === characterId) {
      setSelectedCharacter(null);
      setMessages([]);
      setIsChatEnded(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedCharacter || isLoading || isChatEnded) return;

    if (containsBadWords(inputMessage)) {
      setBadWordWarning(true);
      setTimeout(() => setBadWordWarning(false), 3000);
      return;
    }

    const currentUserTurns = messages.filter(m => m.sender === 'user').length;
    const isLastTurn = currentUserTurns + 1 >= MAX_TURNS;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const apiKey = getOpenAIApiKey();
      if (!apiKey) throw new Error('NO_API_KEY');

      const systemContent = isLastTurn
        ? `당신은 한국의 역사 인물 "${selectedCharacter.name}"입니다.
시대: ${selectedCharacter.period}. ${selectedCharacter.description}.

⚠️ 이것이 마지막 대화입니다. 반드시 아래 규칙을 지키며 따뜻하게 작별 인사를 해주세요:
1. 지금까지 나눈 대화를 간단히 정리하며 칭찬
2. 앞으로도 역사를 열심히 공부하길 응원하는 메시지
3. 친근하고 따뜻한 이별 인사
4. 초등학생이 이해하는 쉬운 말, 이모지 사용
5. 3-4문장으로 작성`
        : `당신은 한국의 역사 인물 "${selectedCharacter.name}"입니다.
시대: ${selectedCharacter.period}. ${selectedCharacter.description}.

초등학생(8-13세)과 대화하고 있습니다. 반드시 아래 규칙을 지켜주세요:
1. 초등학생이 이해하는 쉬운 단어와 짧은 문장(2-3문장) 사용
2. 존댓말을 쓰되 친근하고 따뜻한 톤 유지
3. 이모지를 적절히 사용해 친근감 표현
4. 역사적 사실을 재미있게, 정확하게 전달
5. 폭력·선정·정치적으로 민감한 내용 절대 금지
6. 어려운 한자어는 풀어서 설명${isNearEnd ? `\n\n⚠️ 대화가 곧 끝납니다 (남은 횟수: ${turnsLeft - 1}회). 슬슬 마무리 분위기를 만들어 주세요.` : ''}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemContent },
            ...messages.map(msg => ({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.text,
            })),
            { role: 'user', content: inputMessage },
          ],
          temperature: 0.75,
          max_tokens: isLastTurn ? 600 : 400,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = (errData as { error?: { message?: string } }).error?.message;
        if (response.status === 401) throw new Error('INVALID_KEY');
        if (response.status === 429) throw new Error('RATE_LIMIT');
        throw new Error(errMsg || `API 오류: ${response.status}`);
      }

      const data = await response.json() as { choices: Array<{ message: { content: string } }> };
      const aiResponse = data.choices[0].message.content;

      const characterResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'character',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, characterResponse]);

      if (isLastTurn) {
        setIsChatEnded(true);
        if (selectedCharacter && !hasUnlocked.has(selectedCharacter.id)) {
          setHasUnlocked(prev => new Set(prev).add(selectedCharacter.id));
          onUnlockCharacter?.(selectedCharacter.id, 'chat');
          setShowUnlockNotification(true);
          setTimeout(() => setShowUnlockNotification(false), 5000);
        }
      }
    } catch (error) {
      const errStr = error instanceof Error ? error.message : '';
      let fallbackText = '좋은 질문이네요! 역사를 공부하는 것은 과거를 통해 현재를 이해하는 일이에요. 😊';
      if (errStr === 'NO_API_KEY') {
        fallbackText = 'AI와 실제 대화하려면 화면 오른쪽 상단의 ⚙️ 설정 버튼을 눌러 OpenAI API 키를 입력해주세요! 🔑';
      } else if (errStr === 'INVALID_KEY') {
        fallbackText = 'API 키가 올바르지 않아요. 설정에서 키를 다시 확인해주세요. 🔑';
      } else if (errStr === 'RATE_LIMIT') {
        fallbackText = '잠시 사용 한도를 초과했어요. 조금 뒤에 다시 시도해주세요! ⏱️';
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: fallbackText,
        sender: 'character',
        timestamp: new Date(),
      }]);

      const currentUserTurnsAfter = messages.filter(m => m.sender === 'user').length + 1;
      if (currentUserTurnsAfter >= MAX_TURNS) setIsChatEnded(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRestartChat = () => {
    if (!selectedCharacter) return;
    setMessages([{
      id: Date.now().toString(),
      text: selectedCharacter.greeting,
      sender: 'character',
      timestamp: new Date(),
    }]);
    setIsChatEnded(false);
  };

  const dark = darkMode;

  return (
    <div className={`min-h-screen flex flex-col ${dark ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`${dark ? 'bg-gray-900/80 border-gray-700/50' : 'bg-white/80 border-white/50'} backdrop-blur-xl border-b shadow-sm sticky top-0 z-50`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl ${dark ? 'bg-gray-800/60 border-gray-700/50' : 'bg-white/60 border-white/80'} backdrop-blur-xl border shadow-lg hover:shadow-xl transition-all`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">뒤로가기</span>
              </motion.button>
              {onHome && (
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={onHome}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl ${dark ? 'bg-purple-600/60 border-purple-500/50 hover:bg-purple-600/80' : 'bg-purple-500/60 border-purple-400/50 hover:bg-purple-500/80'} backdrop-blur-xl border shadow-lg hover:shadow-xl transition-all`}
                  title="홈으로"
                >
                  <Home className="w-4 h-4" />
                </motion.button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className={`w-5 h-5 ${dark ? 'text-purple-400' : 'text-purple-600'}`} />
              <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                역사 속 인물과 대화하기
              </h1>
            </div>
            <div className="w-28" />
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="max-w-7xl mx-auto w-full flex gap-4 p-4 h-[calc(100vh-72px)]">

          {/* ── 왼쪽 사이드바: 인물 목록 ── */}
          <motion.div
            initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            className={`w-72 flex-shrink-0 ${dark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/70 border-white/90'} backdrop-blur-2xl border-2 rounded-3xl p-4 shadow-2xl overflow-y-auto`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold">대화할 인물 선택</h2>
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => setShowCustomInput(!showCustomInput)}
                className={`p-2 rounded-xl ${dark ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'} transition-all`}
                title="직접 인물 입력"
              >
                <Plus className="w-4 h-4" />
              </motion.button>
            </div>

            {/* 사용자 정의 인물 입력 */}
            <AnimatePresence>
              {showCustomInput && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <div className={`${dark ? 'bg-purple-500/10 border-purple-400/30' : 'bg-purple-50 border-purple-200'} border-2 rounded-2xl p-3`}>
                    <p className={`text-xs mb-2 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>역사 인물 이름을 입력하세요</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customCharacterName}
                        onChange={e => setCustomCharacterName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddCustomCharacter()}
                        placeholder="예: 김구, 안중근"
                        className={`flex-1 px-3 py-2 rounded-xl ${dark ? 'bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'} border focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm`}
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={handleAddCustomCharacter}
                        className="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm"
                      >
                        추가
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 인물 카드 목록 */}
            <div className="space-y-2">
              {characters.map(character => (
                <motion.div
                  key={character.id}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectCharacter(character)}
                  className={`relative p-3 rounded-2xl cursor-pointer transition-all border-2 ${
                    selectedCharacter?.id === character.id
                      ? dark ? 'bg-purple-500/20 border-purple-400' : 'bg-purple-100 border-purple-400'
                      : dark ? 'bg-gray-700/30 border-gray-600/30 hover:bg-gray-700/50' : 'bg-white/50 border-gray-200 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* 원형 인물 사진 */}
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-300 shadow-md bg-gray-200">
                        <ImageWithFallback
                          src={character.imageUrl || DEFAULT_FALLBACK}
                          alt={character.name}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                      {character.imageLoading && (
                        <div className="absolute inset-0 rounded-full bg-purple-500/30 flex items-center justify-center">
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm truncate">{character.name}</h3>
                      <p className={`text-xs truncate ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{character.period}</p>
                      <p className={`text-xs truncate ${dark ? 'text-gray-500' : 'text-gray-500'}`}>{character.description}</p>
                    </div>
                    {character.isCustom && (
                      <motion.button
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={e => { e.stopPropagation(); handleRemoveCustomCharacter(character.id); }}
                        className={`p-1 rounded-lg ${dark ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-500 hover:text-red-600 hover:bg-red-100'}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </motion.button>
                    )}
                  </div>
                  {selectedCharacter?.id === character.id && (
                    <div className="absolute right-2.5 top-2.5 w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── 오른쪽: 채팅 영역 ── */}
          <motion.div
            initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {!selectedCharacter ? (
              <div className={`flex-1 flex items-center justify-center ${dark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/70 border-white/90'} backdrop-blur-2xl border-2 rounded-3xl shadow-2xl`}>
                <div className="text-center p-8">
                  <User className={`w-16 h-16 mx-auto mb-4 ${dark ? 'text-gray-600' : 'text-gray-400'}`} />
                  <h3 className="text-xl font-bold mb-2">인물을 선택해주세요</h3>
                  <p className={dark ? 'text-gray-400' : 'text-gray-600'}>
                    왼쪽에서 대화하고 싶은 역사 인물을 선택하거나<br />직접 입력해보세요!
                  </p>
                </div>
              </div>
            ) : (
              <div className={`flex-1 flex flex-col ${dark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/70 border-white/90'} backdrop-blur-2xl border-2 rounded-3xl shadow-2xl overflow-hidden`}>

                {/* 채팅 헤더 */}
                <div className={`px-6 py-3 border-b ${dark ? 'border-gray-700/50' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-300 bg-gray-200 shadow">
                        <ImageWithFallback
                          src={selectedCharacter.imageUrl || DEFAULT_FALLBACK}
                          alt={selectedCharacter.name}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">{selectedCharacter.name}</h3>
                        <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {selectedCharacter.period} · {selectedCharacter.description}
                        </p>
                      </div>
                    </div>
                    {/* 남은 대화 횟수 표시 */}
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      isChatEnded ? (dark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500')
                      : isNearEnd ? 'bg-red-100 text-red-600'
                      : (dark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-600')
                    }`}>
                      {isChatEnded ? '대화 종료' : `남은 대화 ${turnsLeft}회`}
                    </div>
                  </div>
                </div>

                {/* 메시지 영역 */}
                <div className="flex-1 overflow-y-auto p-6">
                  {/* 인물 아바타 (상단 원형) */}
                  <div className="flex justify-center mb-8">
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                      className="relative"
                    >
                      <motion.div
                        animate={{ rotate: isLoading ? 360 : 0 }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 p-1 -m-1"
                      />
                      <div className={`relative w-28 h-28 rounded-full overflow-hidden border-4 ${dark ? 'border-gray-800 bg-gray-800' : 'border-white bg-white'} shadow-2xl`}>
                        <ImageWithFallback
                          src={selectedCharacter.imageUrl || DEFAULT_FALLBACK}
                          alt={selectedCharacter.name}
                          className="w-full h-full object-cover object-top"
                        />
                        {isLoading && (
                          <motion.div
                            animate={{ opacity: [0.2, 0.5, 0.2] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="absolute inset-0 bg-gradient-to-t from-purple-500/30 to-transparent"
                          />
                        )}
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`absolute bottom-1 right-1 w-4 h-4 ${isChatEnded ? 'bg-gray-400' : 'bg-green-500'} rounded-full border-2 border-white shadow`}
                      />
                      <div className={`absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full ${dark ? 'bg-gray-700/90 text-white' : 'bg-white/90 text-gray-900'} shadow text-xs font-bold`}>
                        {selectedCharacter.name}
                      </div>
                    </motion.div>
                  </div>

                  {/* 메시지 목록 */}
                  <div className="space-y-4 mt-10">
                    <AnimatePresence initial={false}>
                      {messages.map(message => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className={`flex items-end gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          {message.sender === 'character' && (
                            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-purple-300 flex-shrink-0 shadow bg-gray-200">
                              <ImageWithFallback
                                src={selectedCharacter.imageUrl || DEFAULT_FALLBACK}
                                alt={selectedCharacter.name}
                                className="w-full h-full object-cover object-top"
                              />
                            </div>
                          )}
                          <div className={`max-w-[72%] flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`px-4 py-3 rounded-2xl shadow-md ${
                              message.sender === 'user'
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-none'
                                : dark
                                  ? 'bg-gray-700/60 border border-gray-600/50 rounded-bl-none'
                                  : 'bg-gray-100 border border-gray-200 rounded-bl-none'
                            }`}>
                              <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.text}</p>
                            </div>
                            <p className={`text-xs mt-1 px-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                              {message.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {isLoading && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-2 justify-start">
                        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-purple-300 flex-shrink-0 bg-gray-200">
                          <ImageWithFallback src={selectedCharacter.imageUrl || DEFAULT_FALLBACK} alt={selectedCharacter.name} className="w-full h-full object-cover object-top" />
                        </div>
                        <div className={`px-4 py-3 rounded-2xl rounded-bl-none ${dark ? 'bg-gray-700/60 border border-gray-600/50' : 'bg-gray-100 border border-gray-200'} shadow-md`}>
                          <div className="flex gap-1.5">
                            {[0, 150, 300].map(delay => (
                              <div key={delay} className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* 대화 종료 배너 */}
                    {isChatEnded && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className={`mx-auto max-w-sm p-4 rounded-2xl text-center border-2 ${dark ? 'bg-purple-900/30 border-purple-500/40' : 'bg-purple-50 border-purple-200'}`}
                      >
                        <p className="text-2xl mb-2">👋</p>
                        <p className={`font-bold text-sm mb-1 ${dark ? 'text-purple-300' : 'text-purple-700'}`}>20번의 대화가 끝났어요!</p>
                        <p className={`text-xs mb-3 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>새로운 대화를 시작하거나 다른 인물을 선택해보세요.</p>
                        <motion.button
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={handleRestartChat}
                          className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold shadow"
                        >
                          다시 대화하기
                        </motion.button>
                      </motion.div>
                    )}
                  </div>
                  <div ref={messagesEndRef} />
                </div>

                {/* 입력 영역 */}
                <div className={`px-5 py-4 border-t ${dark ? 'border-gray-700/50' : 'border-gray-200'}`}>
                  {/* 욕설 경고 */}
                  <AnimatePresence>
                    {badWordWarning && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                        className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl bg-red-100 border border-red-300 text-red-600 text-xs font-semibold"
                      >
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        바른 말을 사용해주세요! 욕설·비방은 사용할 수 없어요 😊
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 남은 횟수 & 욕설 안내 */}
                  <div className={`flex items-center gap-2 text-xs mb-2 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Sparkles className="w-3 h-3" />
                    <span>GPT-4o-mini 연동 · 최대 20턴 · 욕설/비방 금지</span>
                    {isNearEnd && !isChatEnded && (
                      <span className="ml-auto text-red-500 font-semibold animate-pulse">⚠️ 곧 종료돼요!</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={e => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={isChatEnded ? '대화가 종료됐어요. 다시 시작하거나 다른 인물을 선택하세요.' : '인물에게 질문을 입력하세요...'}
                      disabled={isLoading || isChatEnded}
                      className={`flex-1 px-4 py-3 rounded-2xl ${
                        dark
                          ? 'bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400'
                          : 'bg-white/80 border-gray-200/50 text-gray-900 placeholder-gray-500'
                      } border-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm disabled:opacity-50`}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isLoading || isChatEnded}
                      className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span className="text-sm">전송</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* 캐릭터 카드 잠금 해제 알림 */}
      <AnimatePresence>
        {showUnlockNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
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
