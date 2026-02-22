import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, Home, User, MessageCircle,
  Search, Sparkles, ChevronRight
} from "lucide-react";
import type { Character } from "../data/quizData";
import { getCachedImage } from "../utils/aiImageGenerator";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { getCharacterImagePath } from "../utils/characterImageMap";

// 시대별 폴더 매핑 (카드 이미지 경로)
const PERIOD_FOLDER: Record<string, string> = {
  고조선: "gojoseon", 삼국시대: "three-kingdoms",
  고려: "goryeo", 조선: "joseon", 근현대: "modern",
};
function getCardImgSrc(character: Character): string {
  const folder = PERIOD_FOLDER[character.period];
  if (folder) return getCharacterImagePath(character.id, character.period);
  return character.imageUrl || getCachedImage(character.id) || "";
}

interface CharacterSelectionImprovedProps {
  onBack: () => void;
  onHome?: () => void;
  darkMode?: boolean;
  characters: Character[];
  onSelectCharacter: (character: Character) => void;
}

export function CharacterSelectionImproved({ 
  onBack,
  onHome, 
  darkMode = false,
  characters,
  onSelectCharacter,
}: CharacterSelectionImprovedProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 대화 완료 인물 로드
  const chattedIds: Set<string> = (() => {
    try {
      const raw = localStorage.getItem("chattedCharacterIds_chat");
      return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
    } catch { return new Set(); }
  })();

  // Only show unlocked characters
  const unlockedCharacters = characters.filter(c => c.unlocked);

  // Filter by search query
  const filteredCharacters = unlockedCharacters.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.period.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by period
  const groupedCharacters: Record<string, Character[]> = {};
  filteredCharacters.forEach(char => {
    if (!groupedCharacters[char.period]) {
      groupedCharacters[char.period] = [];
    }
    groupedCharacters[char.period].push(char);
  });

  const periodOrder = ['고조선', '삼국시대', '고려', '조선', '근현대'];
  const periodColors: Record<string, string> = {
    '고조선': '#D97706',
    '삼국시대': '#10B981',
    '고려': '#06B6D4',
    '조선': '#EF4444',
    '근현대': '#6366F1'
  };

  const handleSelectCharacter = (character: Character) => {
    setSelectedCharacter(character);
  };

  const handleStartChat = () => {
    if (selectedCharacter) {
      onSelectCharacter(selectedCharacter);
    }
  };

  const isMobile = false;
  const showSidebar = !isMobile || !selectedCharacter;
  const showPreview = !isMobile || selectedCharacter;

  return (
    <div className={`min-h-screen transition-colors ${
      darkMode ? 'bg-[#0F172A]' : 'bg-[#FEF7FF]'
    }`}>
      {/* Header - Only on mobile */}
      {isMobile && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`sticky top-0 z-50 ${
            darkMode ? 'bg-[#1E293B]' : 'bg-white'
          } border-b ${
            darkMode ? 'border-[#334155]' : 'border-[#E5E7EB]'
          } p-4`}
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <div className="flex items-center gap-2">
            {selectedCharacter ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCharacter(null)}
                className={`p-2 rounded-[12px] ${
                  darkMode ? 'bg-[#334155]' : 'bg-[#F3F4F6]'
                }`}
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={2} />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className={`p-2 rounded-[12px] ${
                  darkMode ? 'bg-[#334155]' : 'bg-[#F3F4F6]'
                }`}
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={2} />
              </motion.button>
            )}

            <h1 className={`flex-1 text-lg font-bold ${
              darkMode ? 'text-white' : 'text-[#1F2937]'
            }`}>
              {selectedCharacter ? selectedCharacter.name : '인물 선택'}
            </h1>

            {onHome && !selectedCharacter && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onHome}
                className="p-2 rounded-[12px] text-white"
                style={{
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'
                }}
              >
                <Home className="w-5 h-5" strokeWidth={2} />
              </motion.button>
            )}
          </div>
        </motion.div>
      )}

      {/* Main Layout */}
      <div className="flex h-screen">
        {/* Left Sidebar - Character List */}
        {showSidebar && (
          <motion.div
            initial={isMobile ? { x: 0 } : { opacity: 0, x: -20 }}
            animate={isMobile ? { x: 0 } : { opacity: 1, x: 0 }}
            className={`${
              isMobile ? 'w-full' : 'w-[380px]'
            } ${
              darkMode ? 'bg-[#1E293B]' : 'bg-white'
            } ${
              isMobile ? '' : 'border-r'
            } ${
              darkMode ? 'border-[#334155]' : 'border-[#E5E7EB]'
            } flex flex-col`}
          >
            {/* Desktop Header */}
            {!isMobile && (
              <div className="p-6 border-b border-[#334155]">
                <div className="flex items-center gap-2 mb-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onBack}
                    className={`p-3 rounded-[16px] ${
                      darkMode ? 'bg-[#334155] hover:bg-[#475569]' : 'bg-[#F3F4F6] hover:bg-[#E5E7EB]'
                    }`}
                  >
                    <ArrowLeft className="w-5 h-5" strokeWidth={2} />
                  </motion.button>

                  {onHome && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onHome}
                      className="p-3 rounded-[16px] text-white"
                      style={{
                        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                        boxShadow: 'var(--shadow-primary)'
                      }}
                    >
                      <Home className="w-5 h-5" strokeWidth={2} />
                    </motion.button>
                  )}
                </div>

                <h2 className={`text-2xl font-black mb-2 ${
                  darkMode ? 'text-white' : 'text-[#1F2937]'
                }`}>
                  인물 선택
                </h2>
                <p className={`text-sm ${
                  darkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'
                }`}>
                  대화하고 싶은 역사 인물을 선택하세요
                </p>
              </div>
            )}

            {/* Search Bar */}
            <div className={`${isMobile ? 'p-4' : 'p-6'} border-b ${
              darkMode ? 'border-[#334155]' : 'border-[#E5E7EB]'
            }`}>
              <div className={`relative ${
                darkMode ? 'bg-[#334155]' : 'bg-[#F3F4F6]'
              } rounded-[16px] overflow-hidden`}>
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  darkMode ? 'text-[#64748B]' : 'text-[#9CA3AF]'
                }`} strokeWidth={2} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="인물 이름 검색..."
                  className={`w-full pl-12 pr-4 py-3 bg-transparent text-sm ${
                    darkMode ? 'text-white placeholder-[#64748B]' : 'text-[#1F2937] placeholder-[#9CA3AF]'
                  } focus:outline-none`}
                />
              </div>
            </div>

            {/* Character List */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {filteredCharacters.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8">
                  <Search className={`w-16 h-16 mb-4 ${
                    darkMode ? 'text-[#475569]' : 'text-[#D1D5DB]'
                  }`} strokeWidth={1.5} />
                  <p className={`text-sm font-medium ${
                    darkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'
                  }`}>
                    검색 결과가 없습니다
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-6">
                  {periodOrder.map((period) => {
                    const chars = groupedCharacters[period];
                    if (!chars || chars.length === 0) return null;

                    return (
                      <div key={period}>
                        {/* Period Header */}
                        <div className="flex items-center gap-2 mb-3 px-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: periodColors[period] }}
                          />
                          <h3 className={`text-xs font-bold uppercase tracking-wider ${
                            darkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'
                          }`}>
                            {period}
                          </h3>
                        </div>

                        {/* Character Cards */}
                        <div className="space-y-2">
                          {chars.map((character) => {
                            const isSelected = selectedCharacter?.id === character.id;

                            return (
                              <motion.button
                                key={character.id}
                                whileHover={{ scale: 1.02, x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSelectCharacter(character)}
                                className={`w-full p-3 rounded-[16px] transition-all flex items-center gap-3 ${
                                  isSelected
                                    ? darkMode
                                      ? 'bg-[#6366F1]/20 border-2 border-[#6366F1]'
                                      : 'bg-[#EEF2FF] border-2 border-[#6366F1]'
                                    : darkMode
                                      ? 'bg-[#334155] hover:bg-[#475569] border-2 border-transparent'
                                      : 'bg-[#F9FAFB] hover:bg-[#F3F4F6] border-2 border-transparent'
                                }`}
                                style={isSelected ? {
                                  boxShadow: '0 8px 24px -8px rgba(99, 102, 241, 0.4)'
                                } : {}}
                              >
                                {/* Avatar */}
                                <div 
                                  className="relative w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                                  style={{
                                    background: `linear-gradient(135deg, ${periodColors[period]}20, ${periodColors[period]}40)`,
                                    border: `2px solid ${periodColors[period]}60`
                                  }}
                                >
                                  <ImageWithFallback
                                    src={getCardImgSrc(character)}
                                    alt={character.name}
                                    className="w-full h-full object-cover"
                                    fallbackEmoji={character.emoji ?? "👤"}
                                  />
                                  
                                  {/* Online Indicator */}
                                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#10B981] rounded-full border-2 border-[#1E293B]" />
                                </div>

                                {/* Info */}
                                <div className="flex-1 text-left min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <p className={`font-bold text-sm truncate ${
                                      darkMode ? 'text-white' : 'text-[#1F2937]'
                                    }`}>
                                      {character.name}
                                    </p>
                                    {isSelected && (
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                      >
                                        <Sparkles className="w-3 h-3 text-[#6366F1]" fill="#6366F1" strokeWidth={2} />
                                      </motion.div>
                                    )}
                                  </div>
                                  <p className={`text-xs truncate ${
                                    darkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'
                                  }`}>
                                    {character.role}
                                  </p>
                                </div>

                                {/* Arrow */}
                                <ChevronRight className={`w-5 h-5 flex-shrink-0 transition-transform ${
                                  isSelected ? 'translate-x-1' : ''
                                } ${
                                  darkMode ? 'text-[#64748B]' : 'text-[#9CA3AF]'
                                }`} strokeWidth={2} />
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 대화 완료 인물 통계 */}
            <div className={`p-4 border-t ${
              darkMode ? 'border-[#334155]' : 'border-[#E5E7EB]'
            }`}>
              <div className={`flex items-center justify-between px-2 py-2 rounded-[12px] ${
                darkMode ? 'bg-[#0F172A]' : 'bg-[#F9FAFB]'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-base">⏳</span>
                  <span className={`text-xs font-semibold ${darkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'}`}>
                    대화 완료 인물
                  </span>
                </div>
                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                  chattedIds.size > 0
                    ? 'bg-purple-100 text-purple-700'
                    : darkMode ? 'bg-[#334155] text-[#64748B]' : 'bg-[#E5E7EB] text-[#9CA3AF]'
                }`}>
                  {chattedIds.size}명
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Right Preview - Selected Character */}
        {showPreview && (
          <motion.div
            initial={isMobile ? { x: 0 } : { opacity: 0, x: 20 }}
            animate={isMobile ? { x: 0 } : { opacity: 1, x: 0 }}
            className="flex-1 flex flex-col"
          >
            <AnimatePresence mode="wait">
              {selectedCharacter ? (
                // Character Preview
                <motion.div
                  key="character-preview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex-1 flex flex-col items-center justify-center p-8"
                >
                  {/* Character Avatar */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 200,
                      damping: 20
                    }}
                    className="relative mb-6"
                  >
                    <div 
                      className="w-32 h-32 rounded-full flex items-center justify-center overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${periodColors[selectedCharacter.period]}40, ${periodColors[selectedCharacter.period]}60)`,
                        border: `4px solid ${periodColors[selectedCharacter.period]}`,
                        boxShadow: `0 20px 60px -12px ${periodColors[selectedCharacter.period]}80`
                      }}
                    >
                      <ImageWithFallback
                        src={getCardImgSrc(selectedCharacter)}
                        alt={selectedCharacter.name}
                        className="w-full h-full object-cover"
                        fallbackEmoji={selectedCharacter.emoji ?? "👤"}
                      />
                    </div>

                    {/* Sparkle Decoration */}
                    <motion.div
                      className="absolute -top-2 -right-2"
                      animate={{
                        rotate: [0, 360],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Sparkles className="w-8 h-8 text-[#F59E0B]" fill="#F59E0B" strokeWidth={2} />
                    </motion.div>
                  </motion.div>

                  {/* Character Info */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center max-w-md"
                  >
                    <h2 className={`text-3xl font-black mb-2 ${
                      darkMode ? 'text-white' : 'text-[#1F2937]'
                    }`}>
                      {selectedCharacter.name}
                    </h2>
                    
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: periodColors[selectedCharacter.period] }}
                      >
                        {selectedCharacter.period}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        darkMode ? 'bg-[#334155] text-[#94A3B8]' : 'bg-[#F3F4F6] text-[#6B7280]'
                      }`}>
                        {selectedCharacter.role}
                      </span>
                    </div>

                    {selectedCharacter.description && (
                      <p className={`text-sm leading-relaxed mb-6 ${
                        darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'
                      }`}>
                        {selectedCharacter.description}
                      </p>
                    )}

                    {/* Start Chat Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleStartChat}
                      className="px-8 py-4 rounded-[16px] font-bold text-white text-lg flex items-center gap-3 mx-auto"
                      style={{
                        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                        boxShadow: '0 12px 32px -8px rgba(99, 102, 241, 0.6)'
                      }}
                    >
                      <MessageCircle className="w-6 h-6" strokeWidth={2} />
                      대화 시작하기
                    </motion.button>
                  </motion.div>
                </motion.div>
              ) : (
                // Empty State
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden"
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5 pointer-events-none">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `radial-gradient(circle, ${darkMode ? '#FFFFFF' : '#6366F1'} 1px, transparent 1px)`,
                      backgroundSize: '40px 40px'
                    }} />
                  </div>

                  {/* Content */}
                  <motion.div
                    animate={{
                      y: [0, -10, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 ${
                      darkMode ? 'bg-[#334155]' : 'bg-[#F3F4F6]'
                    }`}>
                      <User className={`w-16 h-16 ${
                        darkMode ? 'text-[#64748B]' : 'text-[#9CA3AF]'
                      }`} strokeWidth={1.5} />
                    </div>
                  </motion.div>

                  <h3 className={`text-2xl font-black mb-2 ${
                    darkMode ? 'text-white' : 'text-[#1F2937]'
                  }`}>
                    인물을 선택해주세요
                  </h3>
                  <p className={`text-base ${
                    darkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'
                  }`}>
                    좌측에서 대화하고 싶은 인물을 선택하세요
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
