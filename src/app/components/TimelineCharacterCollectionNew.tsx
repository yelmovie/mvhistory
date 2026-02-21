import { motion } from "motion/react";
import { ArrowLeft, Lock, Star, MessageSquare, Calendar, Home } from "lucide-react";
import type { Character } from "../data/quizData";
import { getCachedImage } from "../utils/aiImageGenerator";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface TimelineCharacterCollectionNewProps {
  onBack: () => void;
  onHome?: () => void;
  darkMode?: boolean;
  characters: Character[];
  onSelectCharacter?: (character: Character) => void;
  viewMode?: 'desktop' | 'tablet' | 'mobile';
}

export function TimelineCharacterCollectionNew({ 
  onBack,
  onHome,
  darkMode = false,
  characters,
  onSelectCharacter,
  viewMode = 'desktop'
}: TimelineCharacterCollectionNewProps) {
  // Period mapping for display
  const periodMapping: Record<string, string> = {
    '고조선': '고조선',
    '삼국시대': '삼국시대',
    '고려': '고려시대',
    '조선': '조선시대',
    '근현대': '근현대'
  };

  // Group characters by period (using display period)
  const groupedCharacters: Record<string, Character[]> = {};
  
  characters.forEach(char => {
    const displayPeriod = periodMapping[char.period] || char.period;
    if (!groupedCharacters[displayPeriod]) {
      groupedCharacters[displayPeriod] = [];
    }
    groupedCharacters[displayPeriod].push(char);
  });

  // Period order for timeline
  const periodOrder = ['고조선', '삼국시대', '고려시대', '조선시대', '근현대'];
  const periodColors = {
    '고조선': 'from-amber-500 to-orange-500',
    '삼국시대': 'from-red-500 to-pink-500',
    '고려시대': 'from-green-500 to-teal-500',
    '조선시대': 'from-blue-500 to-indigo-500',
    '근현대': 'from-purple-500 to-violet-500'
  };

  const periodYears = {
    '고조선': 'BC 2333 ~ BC 108',
    '삼국시대': 'BC 57 ~ 935',
    '고려시대': '918 ~ 1392',
    '조선시대': '1392 ~ 1897',
    '근현대': '1897 ~ 현재'
  };

  const unlockedCount = characters.filter(c => c.unlocked).length;
  const totalCount = characters.length;

  return (
    <div className={`min-h-screen transition-colors ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 ${
        darkMode ? 'bg-gray-900/95' : 'bg-white/95'
      } backdrop-blur-sm border-b ${
        darkMode ? 'border-gray-800' : 'border-gray-200'
      }`}>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={onBack}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                  }`}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                {onHome && (
                  <button
                    onClick={onHome}
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode ? 'bg-purple-600/60 hover:bg-purple-600/80' : 'bg-purple-500/60 hover:bg-purple-500/80'
                    }`}
                    title="홈으로"
                  >
                    <Home className="w-5 h-5" />
                  </button>
                )}
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  인물 카드 컬렉션
                </h1>
                <p className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  한국사 연표로 보는 역사 인물들
                </p>
              </div>
            </div>
            
            {/* Progress */}
            <div className={`px-4 py-2 rounded-full ${
              darkMode ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <span className="font-bold text-blue-600">
                {unlockedCount}
              </span>
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                {' '}/ {totalCount}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Info Banner */}
      <div className={`max-w-6xl mx-auto ${viewMode === 'mobile' ? 'px-3 py-3' : 'px-6 py-6'}`}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${viewMode === 'mobile' ? 'p-3 rounded-xl' : 'p-6 rounded-2xl'} ${
            darkMode 
              ? 'bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-800' 
              : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'
          }`}
        >
          <h3 className={`font-bold ${viewMode === 'mobile' ? 'text-sm mb-2' : 'text-lg mb-2'} ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            💡 카드 획득 방법
          </h3>
          <div className={viewMode === 'mobile' ? 'flex flex-col gap-1.5' : 'grid md:grid-cols-2 gap-3'}>
            <div className={`flex items-center gap-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <Star className={`text-amber-500 flex-shrink-0 ${viewMode === 'mobile' ? 'w-3 h-3' : 'w-5 h-5'}`} />
              <span className={viewMode === 'mobile' ? 'text-xs' : 'text-base'}>해당 시대 퀴즈를 <strong>5개 이상</strong> 맞추기</span>
            </div>
            <div className={`flex items-center gap-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <MessageSquare className={`text-purple-500 flex-shrink-0 ${viewMode === 'mobile' ? 'w-3 h-3' : 'w-5 h-5'}`} />
              <span className={viewMode === 'mobile' ? 'text-xs' : 'text-base'}>해당 인물과 <strong>10턴 이상</strong> 대화하기</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Timeline */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="relative">
          {/* Timeline Line */}
          <div className={`absolute left-8 top-0 bottom-0 w-1 ${
            darkMode ? 'bg-gray-800' : 'bg-gray-200'
          } hidden md:block`} />

          {periodOrder.map((period, periodIndex) => {
            const periodChars = groupedCharacters[period] || [];
            
            return (
              <motion.div
                key={period}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: periodIndex * 0.1 }}
                className={viewMode === 'mobile' ? 'mb-6 relative' : 'mb-16 relative'}
              >
                {/* Period Header */}
                <div className={`flex items-center ${viewMode === 'mobile' ? 'gap-2 mb-3' : 'gap-6 mb-8'}`}>
                  {/* Timeline Dot */}
                  {viewMode !== 'mobile' && (
                    <div className="hidden md:block relative">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: periodIndex * 0.1 + 0.2 }}
                        className={`w-16 h-16 rounded-full bg-gradient-to-br ${
                          periodColors[period as keyof typeof periodColors]
                        } flex items-center justify-center shadow-lg`}
                      >
                        <Calendar className="w-8 h-8 text-white" />
                      </motion.div>
                    </div>
                  )}

                  {/* Period Info */}
                  <div className="flex-1">
                    <h2 className={`font-bold ${viewMode === 'mobile' ? 'text-lg mb-0' : 'text-3xl mb-1'} ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {period}
                    </h2>
                    <p className={`${viewMode === 'mobile' ? 'text-xs' : 'text-sm'} ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {periodYears[period as keyof typeof periodYears]}
                    </p>
                  </div>

                  {/* Period Stats */}
                  <div className={`${viewMode === 'mobile' ? 'px-2 py-1' : 'px-4 py-2'} rounded-full ${
                    darkMode ? 'bg-gray-800' : 'bg-gray-100'
                  }`}>
                    <span className={viewMode === 'mobile' ? 'text-xs' : 'text-sm'}>
                      <span className="font-bold text-blue-600">
                        {periodChars.filter(c => c.unlocked).length}
                      </span>
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {' '}/ {periodChars.length}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Character Cards */}
                <div className={`grid gap-${viewMode === 'mobile' ? '2' : '4'} ${
                  viewMode === 'mobile' ? 'grid-cols-1' : 'md:ml-28 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                }`}>
                  {periodChars.map((character, charIndex) => (
                    <motion.button
                      key={character.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: periodIndex * 0.1 + charIndex * 0.05 }}
                      onClick={() => character.unlocked && onSelectCharacter?.(character)}
                      disabled={!character.unlocked}
                      className={`relative ${viewMode === 'mobile' ? 'p-3 rounded-xl' : 'p-6 rounded-2xl'} transition-all text-left ${
                        character.unlocked
                          ? darkMode
                            ? 'bg-gray-800 hover:bg-gray-750 hover:shadow-xl hover:-translate-y-1'
                            : 'bg-white hover:bg-gray-50 hover:shadow-xl hover:-translate-y-1'
                          : darkMode
                            ? 'bg-gray-800/50 cursor-not-allowed'
                            : 'bg-gray-100/50 cursor-not-allowed'
                      } border ${
                        character.unlocked
                          ? darkMode ? 'border-gray-700' : 'border-gray-200'
                          : darkMode ? 'border-gray-800' : 'border-gray-300'
                      }`}
                    >
                      {/* Lock Overlay */}
                      {!character.unlocked && (
                        <div className={`absolute inset-0 flex items-center justify-center bg-black/60 ${
                          viewMode === 'mobile' ? 'rounded-xl' : 'rounded-2xl'
                        } backdrop-blur-sm z-10`}>
                          <div className="text-center">
                            <Lock className={`text-gray-400 mx-auto ${viewMode === 'mobile' ? 'w-5 h-5 mb-1' : 'w-8 h-8 mb-2'}`} />
                            <p className={`text-gray-400 ${viewMode === 'mobile' ? 'text-xs' : 'text-sm'}`}>잠금</p>
                          </div>
                        </div>
                      )}

                      {/* Character Content */}
                      <div className={character.unlocked ? '' : 'blur-sm'}>
                        {viewMode === 'mobile' ? (
                          <div className="flex items-center gap-3">
                            {(() => {
                              const cachedImage = getCachedImage(character.id);
                              return cachedImage ? (
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex-shrink-0">
                                  <ImageWithFallback
                                    src={cachedImage}
                                    alt={character.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="text-2xl flex-shrink-0">
                                  {character.emoji || '👤'}
                                </div>
                              );
                            })()}
                            <div className="flex-1 min-w-0">
                              <h3 className={`text-sm font-bold truncate ${
                                darkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                                {character.name}
                              </h3>
                              <p className={`text-xs truncate ${
                                darkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {character.role}
                              </p>
                            </div>
                            {character.unlocked && (
                              <div className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full p-1">
                                <Star className="w-3 h-3 text-white fill-current" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            {(() => {
                              const cachedImage = getCachedImage(character.id);
                              return cachedImage ? (
                                <div className="w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 mb-3">
                                  <ImageWithFallback
                                    src={cachedImage}
                                    alt={character.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="text-4xl mb-3">
                                  {character.emoji || '👤'}
                                </div>
                              );
                            })()}
                            <h3 className={`text-xl font-bold mb-1 ${
                              darkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {character.name}
                            </h3>
                            <p className={`text-sm mb-3 ${
                              darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {character.role}
                            </p>
                            <p className={`text-xs line-clamp-2 ${
                              darkMode ? 'text-gray-500' : 'text-gray-500'
                            }`}>
                              {character.description}
                            </p>
                            {/* Unlocked Badge */}
                            {character.unlocked && (
                              <div className="absolute top-3 right-3">
                                <div className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full p-1.5">
                                  <Star className="w-3 h-3 text-white fill-current" />
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
