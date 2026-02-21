import { motion, AnimatePresence } from "motion/react";
import { Star, Zap, Trophy, Target, Flame, PartyPopper } from "lucide-react";
import { useEffect, useState } from "react";

type RewardType = 'correct' | 'levelup' | 'streak' | 'achievement';

interface RewardAnimationProps {
  type: RewardType;
  points?: number;
  show: boolean;
  onComplete?: () => void;
  darkMode?: boolean;
}

export function RewardAnimation({ 
  type, 
  points = 0, 
  show, 
  onComplete,
  darkMode = false 
}: RewardAnimationProps) {
  const [stars, setStars] = useState<Array<{ id: number; x: number; delay: number }>>([]);

  useEffect(() => {
    if (show && type === 'correct') {
      // Generate falling stars
      const newStars = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.3
      }));
      setStars(newStars);

      // Auto complete after animation
      const timer = setTimeout(() => {
        onComplete?.();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [show, type, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Correct Answer - Falling Stars */}
          {type === 'correct' && (
            <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
              {stars.map((star) => (
                <motion.div
                  key={star.id}
                  className="absolute"
                  initial={{ 
                    top: '-10%', 
                    left: `${star.x}%`,
                    opacity: 1,
                    scale: 0
                  }}
                  animate={{ 
                    top: '110%',
                    opacity: [0, 1, 1, 0],
                    scale: [0, 1.5, 1, 0.5],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ 
                    duration: 2,
                    delay: star.delay,
                    ease: "easeIn"
                  }}
                >
                  <Star 
                    className="w-8 h-8 text-[#F59E0B] fill-[#F59E0B]" 
                    strokeWidth={2} 
                  />
                </motion.div>
              ))}

              {/* Points Popup */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1.5, 1],
                  opacity: [0, 1, 1],
                  y: [0, -20]
                }}
                exit={{ 
                  scale: 0,
                  opacity: 0,
                  y: -40
                }}
                transition={{ duration: 0.6 }}
              >
                <div 
                  className="px-8 py-4 rounded-[20px] font-bold text-2xl text-white flex items-center gap-3"
                  style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    boxShadow: 'var(--shadow-success)'
                  }}
                >
                  <Star className="w-8 h-8 fill-current" strokeWidth={2} />
                  <span>+{points} 점</span>
                </div>
              </motion.div>
            </div>
          )}

          {/* Level Up */}
          {type === 'levelup' && (
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 200,
                  damping: 15
                }}
                className="relative"
              >
                {/* Glow Background */}
                <motion.div
                  className="absolute inset-0 rounded-[24px] blur-3xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)'
                  }}
                />

                {/* Content */}
                <div 
                  className={`relative px-12 py-8 rounded-[24px] ${
                    darkMode ? 'bg-[#1E293B]' : 'bg-white'
                  }`}
                  style={{ boxShadow: 'var(--shadow-xl)' }}
                >
                  <div className="text-center">
                    <motion.div
                      animate={{
                        rotate: [0, 360],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity
                      }}
                    >
                      <Trophy className="w-20 h-20 text-[#F59E0B] fill-[#F59E0B] mx-auto mb-4" strokeWidth={2} />
                    </motion.div>
                    <h2 className={`text-4xl font-bold mb-2 bg-gradient-to-r from-[#F59E0B] via-[#EC4899] to-[#6366F1] bg-clip-text text-transparent`}>
                      레벨 업!
                    </h2>
                    <p className={`text-xl ${
                      darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'
                    }`}>
                      축하합니다! 🎉
                    </p>
                  </div>
                </div>

                {/* Confetti */}
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2"
                    initial={{ 
                      scale: 0,
                      x: 0,
                      y: 0
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      x: (Math.random() - 0.5) * 400,
                      y: (Math.random() - 0.5) * 400,
                      rotate: Math.random() * 360
                    }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.05,
                      ease: "easeOut"
                    }}
                  >
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{
                        background: ['#F59E0B', '#EC4899', '#6366F1', '#10B981'][i % 4]
                      }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}

          {/* Streak */}
          {type === 'streak' && (
            <div className="fixed top-24 left-1/2 -translate-x-1/2 pointer-events-none z-50">
              <motion.div
                initial={{ scale: 0, y: -20, opacity: 0 }}
                animate={{ 
                  scale: [0, 1.2, 1],
                  y: 0,
                  opacity: 1
                }}
                exit={{ 
                  scale: 0,
                  y: -20,
                  opacity: 0
                }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }}
                className="px-6 py-3 rounded-[16px] font-bold text-white flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #EF4444 0%, #F97316 100%)',
                  boxShadow: '0 8px 24px rgba(239, 68, 68, 0.4)'
                }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    rotate: [-10, 10, -10]
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity
                  }}
                >
                  <Flame className="w-6 h-6 fill-current" strokeWidth={2} />
                </motion.div>
                <span className="text-lg">연속 정답! 🔥</span>
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    rotate: [10, -10, 10]
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity
                  }}
                >
                  <Zap className="w-6 h-6 fill-current" strokeWidth={2} />
                </motion.div>
              </motion.div>
            </div>
          )}

          {/* Achievement */}
          {type === 'achievement' && (
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
              <motion.div
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{ 
                  scale: 1,
                  rotate: 0,
                  opacity: 1
                }}
                exit={{ 
                  scale: 0,
                  rotate: 180,
                  opacity: 0
                }}
                transition={{ 
                  type: "spring",
                  stiffness: 200,
                  damping: 15
                }}
                className={`px-8 py-6 rounded-[20px] ${
                  darkMode ? 'bg-[#1E293B]' : 'bg-white'
                }`}
                style={{ boxShadow: 'var(--shadow-xl)' }}
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{
                      rotate: [0, 360]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    <Target className="w-16 h-16 text-[#6366F1]" strokeWidth={2} />
                  </motion.div>
                  <div>
                    <h3 className={`text-2xl font-bold mb-1 ${
                      darkMode ? 'text-white' : 'text-[#1F2937]'
                    }`}>
                      목표 달성!
                    </h3>
                    <p className={`text-base ${
                      darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'
                    }`}>
                      새로운 배지를 획득했습니다!
                    </p>
                  </div>
                  <PartyPopper className="w-12 h-12 text-[#EC4899]" strokeWidth={2} />
                </div>
              </motion.div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
