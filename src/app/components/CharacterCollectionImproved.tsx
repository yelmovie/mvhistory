import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, Lock, Star, Calendar, Home, 
  Sparkles, Info, Crown, Castle, Book, Landmark, Clock 
} from "lucide-react";
import type { Character } from "../data/quizData";
import { getCachedImage } from "../utils/aiImageGenerator";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface CharacterCollectionImprovedProps {
  onBack: () => void;
  onHome?: () => void;
  darkMode?: boolean;
  characters: Character[];
  onSelectCharacter?: (character: Character) => void;
  viewMode?: 'desktop' | 'tablet' | 'mobile';
}

export function CharacterCollectionImproved({ 
  onBack,
  onHome,
  darkMode = false,
  characters,
  onSelectCharacter,
  viewMode = 'desktop'
}: CharacterCollectionImprovedProps) {
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  // Period mapping
  const periodMapping: Record<string, string> = {
    '고조선': '고조선',
    '삼국시대': '삼국시대',
    '고려': '고려시대',
    '조선': '조선시대',
    '근현대': '근현대'
  };

  // Group characters by period
  const groupedCharacters: Record<string, Character[]> = {};
  
  characters.forEach(char => {
    const displayPeriod = periodMapping[char.period] || char.period;
    if (!groupedCharacters[displayPeriod]) {
      groupedCharacters[displayPeriod] = [];
    }
    groupedCharacters[displayPeriod].push(char);
  });

  // Period configuration
  const periodOrder = ['고조선', '삼국시대', '고려시대', '조선시대', '근현대'];
  
  const periodConfig = {
    '고조선': {
      icon: Crown,
      color: '#92400E',
      gradient: 'linear-gradient(135deg, #92400E 0%, #D97706 100%)',
      bgColor: darkMode ? 'rgba(217, 119, 6, 0.1)' : 'rgba(251, 191, 36, 0.1)',
      years: 'BC 2333 ~ BC 108',
    },
    '삼국시대': {
      icon: Castle,
      color: '#059669',
      gradient: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
      bgColor: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(209, 250, 229, 0.6)',
      years: 'BC 57 ~ 935',
    },
    '고려시대': {
      icon: Book,
      color: '#0891B2',
      gradient: 'linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)',
      bgColor: darkMode ? 'rgba(6, 182, 212, 0.1)' : 'rgba(207, 250, 254, 0.6)',
      years: '918 ~ 1392',
    },
    '조선시대': {
      icon: Landmark,
      color: '#DC2626',
      gradient: 'linear-gradient(135deg, #DC2626 0%, #F59E0B 100%)',
      bgColor: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(254, 226, 226, 0.6)',
      years: '1392 ~ 1897',
    },
    '근현대': {
      icon: Clock,
      color: '#1E40AF',
      gradient: 'linear-gradient(135deg, #1E40AF 0%, #6366F1 100%)',
      bgColor: darkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(238, 242, 255, 0.6)',
      years: '1897 ~ 현재',
    }
  };

  const unlockedCount = characters.filter(c => c.unlocked).length;
  const totalCount = characters.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  const toggleFlip = (characterId: number) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(characterId)) {
        newSet.delete(characterId);
      } else {
        newSet.add(characterId);
      }
      return newSet;
    });
  };

  return (
    <div className={`min-h-screen transition-colors ${
      darkMode ? 'bg-[#0F172A]' : 'bg-[#FEF7FF]'
    } ${viewMode === 'mobile' ? 'p-4 py-6' : 'p-6 lg:p-8'}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Navigation */}
          <div className="flex items-center gap-2 mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className={`p-3 rounded-[16px] transition-colors ${
                darkMode 
                  ? 'bg-[#1E293B] hover:bg-[#334155] text-white' 
                  : 'bg-white hover:bg-[#F9FAFB] text-[#1F2937]'
              }`}
              style={{ boxShadow: 'var(--shadow-md)' }}
            >
              <ArrowLeft className="w-6 h-6" strokeWidth={2} />
            </motion.button>

            {onHome && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onHome}
                className="p-3 rounded-[16px] transition-all text-white"
                style={{
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                  boxShadow: 'var(--shadow-primary)'
                }}
              >
                <Home className="w-6 h-6" strokeWidth={2} />
              </motion.button>
            )}
          </div>

          {/* Title & Progress */}
          <div className={`${
            darkMode ? 'bg-[#1E293B]' : 'bg-white'
          } rounded-[24px] p-6 sm:p-8`}
            style={{ boxShadow: 'var(--shadow-lg)' }}
          >
            <div className={`flex items-center justify-between gap-6 ${
              viewMode === 'mobile' ? 'flex-col' : ''
            }`}>
              {/* Left: Title */}
              <div className="flex-1">
                <h1 className={`text-3xl lg:text-4xl font-black mb-2 ${
                  darkMode ? 'text-white' : 'text-[#1F2937]'
                }`}>
                  역사 인물 카드 컬렉션
                </h1>
                <p className={`text-sm lg:text-base ${
                  darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'
                }`}>
                  퀴즈를 풀며 역사 속 인물들을 모아보세요! 🎴
                </p>
              </div>

              {/* Right: Circular Progress */}
              <div className="flex items-center gap-6">
                {/* Circular Progress */}
                <div className="relative">
                  <svg className="w-28 h-28 transform -rotate-90">
                    {/* Background circle */}
                    <circle
                      cx="56"
                      cy="56"
                      r="50"
                      stroke={darkMode ? '#334155' : '#E5E7EB'}
                      strokeWidth="8"
                      fill="none"
                    />
                    {/* Progress circle */}
                    <motion.circle
                      cx="56"
                      cy="56"
                      r="50"
                      stroke="url(#progressGradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                      animate={{ 
                        strokeDashoffset: 2 * Math.PI * 50 * (1 - progressPercent / 100) 
                      }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366F1" />
                        <stop offset="100%" stopColor="#EC4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* Center text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-2xl font-black ${
                      darkMode ? 'text-white' : 'text-[#1F2937]'
                    }`}>
                      {unlockedCount}
                    </span>
                    <span className={`text-xs font-bold ${
                      darkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'
                    }`}>
                      / {totalCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* How to Unlock - Speech Bubble */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`mt-6 p-4 rounded-[16px] border-2 relative ${
                darkMode 
                  ? 'bg-[#6366F1]/10 border-[#6366F1]/30' 
                  : 'bg-[#EEF2FF] border-[#C7D2FE]'
              }`}
            >
              <div className="flex items-start gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                >
                  <Star className={`w-5 h-5 ${
                    darkMode ? 'text-[#FBBF24]' : 'text-[#F59E0B]'
                  }`} strokeWidth={2} fill="currentColor" />
                </motion.div>
                <div>
                  <h3 className={`text-sm font-bold mb-1 ${
                    darkMode ? 'text-[#A5B4FC]' : 'text-[#6366F1]'
                  }`}>
                    💡 인물 카드 획득 방법
                  </h3>
                  <p className={`text-xs ${
                    darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'
                  }`}>
                    각 시대의 퀴즈를 풀면 역사 인물 카드를 획득할 수 있어요! 모든 카드를 모아보세요.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Timeline with Character Cards */}
        <div className="relative">
          {/* Vertical Timeline Line */}
          <div 
            className="absolute left-6 sm:left-10 top-0 bottom-0 w-1 rounded-full"
            style={{
              background: darkMode 
                ? 'linear-gradient(180deg, #334155 0%, #475569 50%, #334155 100%)'
                : 'linear-gradient(180deg, #D1D5DB 0%, #9CA3AF 50%, #D1D5DB 100%)'
            }}
          />

          {/* Period Sections */}
          <div className="space-y-12">
            {periodOrder.map((period, periodIndex) => {
              const chars = groupedCharacters[period] || [];
              if (chars.length === 0) return null;

              const config = periodConfig[period as keyof typeof periodConfig];
              const Icon = config.icon;
              const unlockedInPeriod = chars.filter(c => c.unlocked).length;

              return (
                <motion.div
                  key={period}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: periodIndex * 0.1 }}
                  className="relative"
                >
                  {/* Timeline Marker */}
                  <motion.div
                    className="absolute left-3 sm:left-7 w-8 h-8 rounded-full flex items-center justify-center z-10"
                    style={{
                      background: config.gradient,
                      boxShadow: `0 0 20px ${config.color}60`
                    }}
                    whileHover={{ scale: 1.2 }}
                  >
                    <Icon className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </motion.div>

                  {/* Period Content */}
                  <div className="ml-16 sm:ml-24">
                    {/* Period Header */}
                    <div 
                      className={`inline-block px-6 py-3 rounded-[16px] mb-4`}
                      style={{
                        background: config.bgColor,
                        border: `2px solid ${config.color}40`
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <h2 className={`text-xl sm:text-2xl font-black ${
                          darkMode ? 'text-white' : 'text-[#1F2937]'
                        }`}>
                          {period}
                        </h2>
                        <div className="flex items-center gap-2">
                          <Calendar className={`w-4 h-4 ${
                            darkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'
                          }`} strokeWidth={2} />
                          <span className={`text-sm font-bold ${
                            darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'
                          }`}>
                            {config.years}
                          </span>
                        </div>
                      </div>
                      <div className={`mt-2 text-xs font-bold ${
                        darkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'
                      }`}>
                        획득: {unlockedInPeriod} / {chars.length}
                      </div>
                    </div>

                    {/* Character Cards Grid */}
                    <div className={`grid gap-4 ${
                      viewMode === 'mobile' 
                        ? 'grid-cols-2' 
                        : viewMode === 'tablet' 
                          ? 'grid-cols-3' 
                          : 'grid-cols-4'
                    }`}>
                      {chars.map((character, index) => {
                        const isFlipped = flippedCards.has(character.id);
                        const isLocked = !character.unlocked;

                        return (
                          <motion.div
                            key={character.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: (periodIndex * 0.1) + (index * 0.05) }}
                            whileHover={{ y: -4 }}
                            className="perspective-1000"
                          >
                            <motion.div
                              className="relative w-full aspect-[3/4] cursor-pointer"
                              onClick={() => {
                                if (!isLocked) {
                                  toggleFlip(character.id);
                                }
                              }}
                              animate={{ rotateY: isFlipped ? 180 : 0 }}
                              transition={{ duration: 0.6, ease: "easeInOut" }}
                              style={{ transformStyle: "preserve-3d" }}
                            >
                              {/* Front Side */}
                              <div
                                className={`absolute inset-0 rounded-[20px] overflow-hidden ${
                                  darkMode ? 'bg-[#1E293B]' : 'bg-white'
                                }`}
                                style={{
                                  backfaceVisibility: "hidden",
                                  boxShadow: isLocked 
                                    ? 'var(--shadow-md)' 
                                    : `0 8px 24px -8px ${config.color}60`
                                }}
                              >
                                {isLocked ? (
                                  // Locked Card
                                  <div className={`w-full h-full flex flex-col items-center justify-center ${
                                    darkMode ? 'bg-[#334155]' : 'bg-[#F3F4F6]'
                                  }`}>
                                    <motion.div
                                      animate={{ y: [0, -5, 0] }}
                                      transition={{ duration: 2, repeat: Infinity }}
                                    >
                                      <Lock className={`w-12 h-12 mb-3 ${
                                        darkMode ? 'text-[#64748B]' : 'text-[#9CA3AF]'
                                      }`} strokeWidth={2} />
                                    </motion.div>
                                    <p className={`text-sm font-bold ${
                                      darkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'
                                    }`}>
                                      ???
                                    </p>
                                    <p className={`text-xs mt-2 ${
                                      darkMode ? 'text-[#64748B]' : 'text-[#9CA3AF]'
                                    }`}>
                                      잠김
                                    </p>
                                  </div>
                                ) : (
                                  // Unlocked Card - Front
                                  <div className="relative w-full h-full">
                                    {/* Sparkle Effect */}
                                    <motion.div
                                      className="absolute top-2 right-2 z-10"
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
                                      <Sparkles 
                                        className="w-5 h-5" 
                                        style={{ color: config.color }}
                                        strokeWidth={2} 
                                        fill={config.color}
                                      />
                                    </motion.div>

                                    {/* Character Image */}
                                    <div className="w-full h-[70%] overflow-hidden">
                                      {character.imageUrl ? (
                                        <ImageWithFallback
                                          src={character.imageUrl}
                                          alt={character.name}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div 
                                          className="w-full h-full flex items-center justify-center text-6xl"
                                          style={{ background: config.bgColor }}
                                        >
                                          {character.emoji}
                                        </div>
                                      )}
                                    </div>

                                    {/* Character Name */}
                                    <div 
                                      className="absolute bottom-0 left-0 right-0 p-3"
                                      style={{
                                        background: config.gradient
                                      }}
                                    >
                                      <p className="text-center text-white font-black text-sm">
                                        {character.name}
                                      </p>
                                    </div>

                                    {/* Flip Hint */}
                                    <motion.div
                                      className="absolute bottom-12 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full"
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: [0, 1, 0] }}
                                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                                    >
                                      <Info className="w-3 h-3 text-white" strokeWidth={2} />
                                    </motion.div>
                                  </div>
                                )}
                              </div>

                              {/* Back Side */}
                              {!isLocked && (
                                <div
                                  className={`absolute inset-0 rounded-[20px] overflow-hidden p-4 ${
                                    darkMode ? 'bg-[#1E293B]' : 'bg-white'
                                  }`}
                                  style={{
                                    backfaceVisibility: "hidden",
                                    transform: "rotateY(180deg)",
                                    boxShadow: `0 8px 24px -8px ${config.color}60`,
                                    border: `2px solid ${config.color}40`
                                  }}
                                >
                                  <div className="h-full flex flex-col">
                                    {/* Name Header */}
                                    <div 
                                      className="px-3 py-2 rounded-[12px] mb-3"
                                      style={{ background: config.bgColor }}
                                    >
                                      <h3 className={`text-center font-black text-sm ${
                                        darkMode ? 'text-white' : 'text-[#1F2937]'
                                      }`}>
                                        {character.name}
                                      </h3>
                                    </div>

                                    {/* Character Info */}
                                    <div className="flex-1 overflow-y-auto">
                                      <div className="space-y-2">
                                        <div>
                                          <p className={`text-xs font-bold mb-1 ${
                                            darkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'
                                          }`}>
                                            시대
                                          </p>
                                          <p className={`text-sm font-medium ${
                                            darkMode ? 'text-white' : 'text-[#1F2937]'
                                          }`}>
                                            {character.period}
                                          </p>
                                        </div>
                                        
                                        <div>
                                          <p className={`text-xs font-bold mb-1 ${
                                            darkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'
                                          }`}>
                                            역할
                                          </p>
                                          <p className={`text-sm font-medium ${
                                            darkMode ? 'text-white' : 'text-[#1F2937]'
                                          }`}>
                                            {character.role}
                                          </p>
                                        </div>

                                        {character.description && (
                                          <div>
                                            <p className={`text-xs font-bold mb-1 ${
                                              darkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'
                                            }`}>
                                              설명
                                            </p>
                                            <p className={`text-xs leading-relaxed ${
                                              darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'
                                            }`}>
                                              {character.description}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Flip Back Hint */}
                                    <div className="mt-3 text-center">
                                      <p className={`text-xs font-medium ${
                                        darkMode ? 'text-[#64748B]' : 'text-[#9CA3AF]'
                                      }`}>
                                        클릭하여 뒤집기 🔄
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom Spacing */}
        <div className="h-12" />
      </div>
    </div>
  );
}
