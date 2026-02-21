import { motion } from "motion/react";
import { ArrowLeft, Plus, User } from "lucide-react";
import type { Character } from "../data/quizData";
import { getCachedImage } from "../utils/aiImageGenerator";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface CharacterSelectionScreenProps {
  onBack: () => void;
  darkMode?: boolean;
  characters: Character[];
  onSelectCharacter: (character: Character) => void;
  viewMode?: 'desktop' | 'tablet' | 'mobile';
}

export function CharacterSelectionScreen({ 
  onBack, 
  darkMode = false,
  characters,
  onSelectCharacter,
  viewMode = 'desktop'
}: CharacterSelectionScreenProps) {
  // Group characters by period
  const groupedCharacters: Record<string, Character[]> = {};
  
  characters.forEach(char => {
    if (!groupedCharacters[char.period]) {
      groupedCharacters[char.period] = [];
    }
    groupedCharacters[char.period].push(char);
  });

  // Only show unlocked characters
  const periods = ['고조선', '삼국시대', '고려시대', '조선시대', '근현대'];
  
  return (
    <div className={`min-h-screen ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 ${
        darkMode ? 'bg-gray-900/80' : 'bg-white/80'
      } backdrop-blur-xl border-b ${
        darkMode ? 'border-gray-800' : 'border-gray-200'
      } shadow-sm`}>
        <div className={`max-w-6xl mx-auto flex items-center justify-between ${
          viewMode === 'mobile' ? 'px-3 py-3' : 'px-6 py-4'
        }`}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className={`flex items-center gap-2 ${
              viewMode === 'mobile' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2 text-base'
            } ${
              darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-gray-100 hover:bg-gray-200'
            } rounded-xl transition-colors`}
          >
            <ArrowLeft className={viewMode === 'mobile' ? 'w-4 h-4' : 'w-5 h-5'} />
            <span>뒤로가기</span>
          </motion.button>
          
          <h1 className={`font-bold ${
            viewMode === 'mobile' ? 'text-base' : 'text-xl'
          }`}>
            <span className="mr-2">✨</span>
            역사 속 인물과 대화하기
          </h1>
          
          <div className={viewMode === 'mobile' ? 'w-16' : 'w-24'} />
        </div>
      </header>

      {/* Main Content */}
      <div className={`max-w-6xl mx-auto ${viewMode === 'mobile' ? 'px-3 py-4' : 'px-6 py-8'}`}>
        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${viewMode === 'mobile' ? 'p-3 rounded-xl mb-4' : 'p-6 rounded-2xl mb-8'} ${
            darkMode 
              ? 'bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-800' 
              : 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`${viewMode === 'mobile' ? 'w-10 h-10' : 'w-12 h-12'} bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0`}>
              <User className={`${viewMode === 'mobile' ? 'w-5 h-5' : 'w-6 h-6'} text-white`} />
            </div>
            <div className="flex-1">
              <h3 className={`font-bold mb-1 ${viewMode === 'mobile' ? 'text-sm' : 'text-lg'} ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                인물을 선택해주세요
              </h3>
              <p className={`${viewMode === 'mobile' ? 'text-xs' : 'text-sm'} ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                잠금 해제된 대화할 역사 인물을 선택하거나 직접 입력해보세요!
              </p>
            </div>
          </div>
        </motion.div>

        {/* Character List by Period */}
        {periods.map((period, periodIndex) => {
          const periodChars = groupedCharacters[period]?.filter(c => c.unlocked) || [];
          
          if (periodChars.length === 0) return null;
          
          return (
            <motion.div
              key={period}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: periodIndex * 0.1 }}
              className={viewMode === 'mobile' ? 'mb-4' : 'mb-8'}
            >
              <h2 className={`font-bold mb-3 ${
                viewMode === 'mobile' ? 'text-base' : 'text-xl'
              } ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {period}
              </h2>
              
              <div className={`grid gap-3 ${
                viewMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3'
              }`}>
                {periodChars.map((character, charIndex) => (
                  <motion.button
                    key={character.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: periodIndex * 0.1 + charIndex * 0.05 }}
                    whileHover={{ scale: 1.03, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelectCharacter(character)}
                    className={`${
                      viewMode === 'mobile' ? 'p-3 rounded-xl' : 'p-4 rounded-2xl'
                    } ${
                      darkMode 
                        ? 'bg-gray-800 hover:bg-gray-750 border-gray-700' 
                        : 'bg-white hover:bg-gray-50 border-gray-200'
                    } border-2 shadow-lg hover:shadow-xl transition-all text-left`}
                  >
                    {viewMode === 'mobile' ? (
                      <div className="flex items-center gap-3">
                        {(() => {
                          const cachedImage = getCachedImage(character.id);
                          const displayImage = cachedImage || character.imageUrl;
                          return displayImage ? (
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 flex-shrink-0 border-2 border-purple-300 dark:border-purple-600">
                              <ImageWithFallback
                                src={displayImage}
                                alt={character.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 border-2 border-purple-300 dark:border-purple-600">
                              <span className="text-2xl">{character.emoji || '👤'}</span>
                            </div>
                          );
                        })()}
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-sm font-bold mb-0.5 ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {character.name}
                          </h3>
                          <p className={`text-xs ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {character.role}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {(() => {
                          const cachedImage = getCachedImage(character.id);
                          const displayImage = cachedImage || character.imageUrl;
                          return displayImage ? (
                            <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 mb-3 border-4 border-purple-200 dark:border-purple-700">
                              <ImageWithFallback
                                src={displayImage}
                                alt={character.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-full aspect-square rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-3 flex items-center justify-center border-4 border-purple-200 dark:border-purple-700">
                              <span className="text-6xl">{character.emoji || '👤'}</span>
                            </div>
                          );
                        })()}
                        <h3 className={`text-lg font-bold mb-1 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {character.name}
                        </h3>
                        <p className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {character.role}
                        </p>
                        <p className={`text-xs mt-2 line-clamp-2 ${
                          darkMode ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          {character.description}
                        </p>
                      </>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          );
        })}

        {/* Empty State */}
        {characters.filter(c => c.unlocked).length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center ${viewMode === 'mobile' ? 'py-12' : 'py-20'}`}
          >
            <div className={`${viewMode === 'mobile' ? 'text-5xl' : 'text-6xl'} mb-4`}>🔒</div>
            <h3 className={`font-bold mb-2 ${
              viewMode === 'mobile' ? 'text-base' : 'text-xl'
            } ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              아직 해금된 인물이 없어요
            </h3>
            <p className={`${viewMode === 'mobile' ? 'text-xs' : 'text-sm'} ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              퀴즈를 풀거나 인물과 대화하여 카드를 획득해보세요!
            </p>
          </motion.div>
        )}

        {/* Custom Character Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`${viewMode === 'mobile' ? 'mt-6' : 'mt-12'}`}
        >
          <div className={`${
            viewMode === 'mobile' ? 'p-4 rounded-xl' : 'p-6 rounded-2xl'
          } ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
          } border-2 border-dashed`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`${viewMode === 'mobile' ? 'w-8 h-8' : 'w-10 h-10'} bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center`}>
                <Plus className={`${viewMode === 'mobile' ? 'w-4 h-4' : 'w-5 h-5'} text-white`} />
              </div>
              <h3 className={`font-bold ${viewMode === 'mobile' ? 'text-sm' : 'text-lg'} ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                직접 입력하기
              </h3>
            </div>
            <p className={`mb-3 ${viewMode === 'mobile' ? 'text-xs' : 'text-sm'} ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              대화하고 싶은 역사 인물의 이름을 입력하여 대화를 시작할 수 있어요.
            </p>
            <button
              onClick={() => {
                const customName = prompt('대화하고 싶은 역사 인물의 이름을 입력하세요:');
                if (customName && customName.trim()) {
                  const customCharacter: Character = {
                    id: 'custom-' + Date.now(),
                    name: customName.trim(),
                    period: '사용자 입력',
                    role: '역사 인물',
                    description: `${customName.trim()}과의 대화`,
                    unlocked: true,
                    imageUrl: '',
                    emoji: '📝'
                  };
                  onSelectCharacter(customCharacter);
                }
              }}
              className={`w-full ${
                viewMode === 'mobile' ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-base'
              } bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl`}
            >
              인물 이름 입력하기
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
