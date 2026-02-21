import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Lock, Unlock, Star, Trophy, Calendar } from "lucide-react";
import { Character } from "../data/quizData";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface TimelineCharacterCollectionProps {
  characters: Character[];
  onClose: () => void;
  darkMode?: boolean;
}

interface PeriodGroup {
  period: string;
  characters: Character[];
  color: string;
  gradient: string;
  yearRange: string;
}

export function TimelineCharacterCollection({ 
  characters, 
  onClose, 
  darkMode = false 
}: TimelineCharacterCollectionProps) {
  // Group characters by period with chronological order
  const periodGroups: PeriodGroup[] = [
    {
      period: '고조선',
      characters: characters.filter(c => c.period === '고조선'),
      color: darkMode ? 'text-amber-400' : 'text-amber-600',
      gradient: darkMode ? 'from-amber-500/20 to-orange-500/20' : 'from-amber-200/40 to-orange-200/40',
      yearRange: '기원전 2333년 ~ 기원전 108년'
    },
    {
      period: '삼국시대',
      characters: characters.filter(c => c.period === '삼국시대'),
      color: darkMode ? 'text-blue-400' : 'text-blue-600',
      gradient: darkMode ? 'from-blue-500/20 to-cyan-500/20' : 'from-blue-200/40 to-cyan-200/40',
      yearRange: '기원전 57년 ~ 676년'
    },
    {
      period: '고려시대',
      characters: characters.filter(c => c.period === '고려시대'),
      color: darkMode ? 'text-green-400' : 'text-green-600',
      gradient: darkMode ? 'from-green-500/20 to-emerald-500/20' : 'from-green-200/40 to-emerald-200/40',
      yearRange: '918년 ~ 1392년'
    },
    {
      period: '조선시대',
      characters: characters.filter(c => c.period === '조선시대'),
      color: darkMode ? 'text-purple-400' : 'text-purple-600',
      gradient: darkMode ? 'from-purple-500/20 to-pink-500/20' : 'from-purple-200/40 to-pink-200/40',
      yearRange: '1392년 ~ 1910년'
    },
    {
      period: '근현대',
      characters: characters.filter(c => c.period === '근현대'),
      color: darkMode ? 'text-red-400' : 'text-red-600',
      gradient: darkMode ? 'from-red-500/20 to-rose-500/20' : 'from-red-200/40 to-rose-200/40',
      yearRange: '1910년 ~ 현재'
    }
  ].filter(group => group.characters.length > 0);

  const unlockedCount = characters.filter(c => c.unlocked).length;
  const totalCount = characters.length;

  return (
    <div className={`min-h-screen ${darkMode ? 'text-white' : 'text-gray-900'}`}>
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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl ${
                darkMode 
                  ? 'bg-gray-800/60 border-gray-700/50' 
                  : 'bg-white/60 border-white/80'
              } backdrop-blur-xl border shadow-lg hover:shadow-xl transition-all`}
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">뒤로가기</span>
            </motion.button>

            <div className="flex items-center gap-2">
              <Trophy className={`w-5 h-5 ${
                darkMode ? 'text-yellow-400' : 'text-yellow-600'
              }`} />
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                역사 인물 카드 컬렉션
              </h1>
            </div>

            <div className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl ${
              darkMode 
                ? 'bg-gray-800/60 border-gray-700/50' 
                : 'bg-white/60 border-white/80'
            } backdrop-blur-xl border shadow-lg flex items-center gap-2`}>
              <Star className={`w-4 h-4 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
              <span className="text-sm sm:text-base font-bold">
                {unlockedCount}/{totalCount}
              </span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Timeline Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${
            darkMode 
              ? 'bg-gray-800/50 border-gray-700/50' 
              : 'bg-white/70 border-white/90'
          } backdrop-blur-2xl border-2 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8`}
          style={{
            boxShadow: darkMode 
              ? '0 10px 40px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)'
              : '0 10px 40px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.9)'
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Trophy className={`w-6 h-6 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
            <h2 className="text-xl sm:text-2xl font-bold">획득 방법</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl ${
              darkMode ? 'bg-purple-500/10 border-purple-400/30' : 'bg-purple-50 border-purple-200/50'
            } border-2`}>
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <span className="text-2xl">📝</span>
                퀴즈 도전
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                퀴즈에서 5개 이상 정답을 맞추면<br />해당 시대의 인물 카드를 획득해요!
              </p>
            </div>
            <div className={`p-4 rounded-xl ${
              darkMode ? 'bg-pink-500/10 border-pink-400/30' : 'bg-pink-50 border-pink-200/50'
            } border-2`}>
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <span className="text-2xl">💬</span>
                인물 대화
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                역사 속 인물과 대화를 나누면<br />해당 인물 카드를 획득해요!
              </p>
            </div>
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Timeline Line */}
          <div className={`absolute left-6 sm:left-1/2 top-0 bottom-0 w-1 ${
            darkMode ? 'bg-gradient-to-b from-gray-700 via-gray-600 to-gray-700' : 'bg-gradient-to-b from-gray-300 via-gray-400 to-gray-300'
          } transform sm:-translate-x-1/2 rounded-full`} />

          {/* Period Groups */}
          <div className="space-y-12 sm:space-y-16">
            {periodGroups.map((group, groupIndex) => (
              <motion.div
                key={group.period}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.2 }}
                className="relative"
              >
                {/* Period Header */}
                <div className="flex items-center gap-4 mb-8 pl-16 sm:pl-0 sm:justify-center">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    className={`relative z-10 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl ${
                      darkMode 
                        ? 'bg-gray-800/80 border-gray-700/50' 
                        : 'bg-white/90 border-white/80'
                    } backdrop-blur-xl border-2 shadow-xl`}
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className={`w-5 h-5 ${group.color}`} />
                      <div>
                        <h2 className={`text-xl sm:text-2xl font-bold ${group.color}`}>
                          {group.period}
                        </h2>
                        <p className={`text-xs sm:text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {group.yearRange}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Character Cards */}
                <div className="space-y-6 sm:space-y-8">
                  {group.characters.map((character, index) => {
                    const isLeft = index % 2 === 0;
                    
                    return (
                      <motion.div
                        key={character.id}
                        initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: groupIndex * 0.2 + index * 0.1 }}
                        className={`relative flex items-center ${
                          isLeft ? 'sm:justify-end sm:pr-8' : 'sm:justify-start sm:pl-8'
                        } pl-16 sm:pl-0`}
                      >
                        {/* Timeline Dot */}
                        <div className={`absolute left-6 sm:left-1/2 transform sm:-translate-x-1/2 w-4 h-4 rounded-full border-4 ${
                          character.unlocked
                            ? darkMode
                              ? 'bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-300'
                              : 'bg-gradient-to-br from-yellow-400 to-orange-400 border-yellow-500'
                            : darkMode
                              ? 'bg-gray-700 border-gray-600'
                              : 'bg-gray-300 border-gray-400'
                        } shadow-lg z-20`} />

                        {/* Character Card */}
                        <motion.div
                          whileHover={{ scale: character.unlocked ? 1.02 : 1 }}
                          className={`w-full sm:w-[calc(50%-3rem)] ${
                            darkMode 
                              ? 'bg-gray-800/70 border-gray-700/50' 
                              : 'bg-white/80 border-white/90'
                          } backdrop-blur-xl border-2 rounded-2xl overflow-hidden shadow-xl ${
                            character.unlocked ? 'cursor-pointer' : 'cursor-default'
                          } transition-all`}
                          style={{
                            boxShadow: character.unlocked
                              ? darkMode 
                                ? '0 10px 30px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)'
                                : '0 10px 30px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.9)'
                              : darkMode
                                ? '0 5px 15px rgba(0, 0, 0, 0.2)'
                                : '0 5px 15px rgba(0, 0, 0, 0.05)'
                          }}
                        >
                          <div className="flex gap-4 p-4 sm:p-5">
                            {/* Character Image/Icon */}
                            <div className="relative flex-shrink-0">
                              {character.unlocked ? (
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shadow-lg">
                                  <ImageWithFallback
                                    src={character.imageUrl || ''}
                                    alt={character.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl flex items-center justify-center ${
                                  darkMode ? 'bg-gray-700/50' : 'bg-gray-200/70'
                                } backdrop-blur-sm`}>
                                  <Lock className={`w-8 h-8 sm:w-10 sm:h-10 ${
                                    darkMode ? 'text-gray-500' : 'text-gray-400'
                                  }`} />
                                </div>
                              )}
                              
                              {character.unlocked && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
                                >
                                  <Unlock className="w-4 h-4 text-white" />
                                </motion.div>
                              )}
                            </div>

                            {/* Character Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1">
                                  <h3 className={`text-lg sm:text-xl font-bold mb-1 ${
                                    character.unlocked 
                                      ? darkMode ? 'text-white' : 'text-gray-900'
                                      : darkMode ? 'text-gray-600' : 'text-gray-400'
                                  }`}>
                                    {character.unlocked ? character.name : '???'}
                                  </h3>
                                  {character.unlocked && character.year && (
                                    <p className={`text-xs sm:text-sm ${
                                      darkMode ? 'text-gray-400' : 'text-gray-600'
                                    }`}>
                                      {character.year}
                                    </p>
                                  )}
                                </div>
                                <div className="text-3xl">{character.icon}</div>
                              </div>

                              <p className={`text-sm sm:text-base mb-3 ${
                                character.unlocked
                                  ? darkMode ? 'text-gray-300' : 'text-gray-700'
                                  : darkMode ? 'text-gray-600' : 'text-gray-400'
                              }`}>
                                {character.unlocked ? character.description : '아직 잠금 상태입니다'}
                              </p>

                              {character.unlocked && character.achievements && (
                                <div className={`space-y-1 text-xs sm:text-sm ${
                                  darkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  {character.achievements.map((achievement, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                      <Star className={`w-3 h-3 ${
                                        darkMode ? 'text-yellow-400' : 'text-yellow-600'
                                      }`} />
                                      <span>{achievement}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`mt-12 ${
            darkMode 
              ? 'bg-gray-800/50 border-gray-700/50' 
              : 'bg-white/70 border-white/90'
          } backdrop-blur-2xl border-2 rounded-3xl p-6 sm:p-8 shadow-2xl text-center`}
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <Trophy className={`w-6 h-6 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
            <h3 className="text-lg sm:text-xl font-bold">컬렉션 진행률</h3>
          </div>
          <div className="flex items-center justify-center gap-4">
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              {Math.round((unlockedCount / totalCount) * 100)}%
            </div>
            <div className={`text-base sm:text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              ({unlockedCount}/{totalCount} 획득)
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
