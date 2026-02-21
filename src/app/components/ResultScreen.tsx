import { useEffect } from "react";
import { motion } from "motion/react";
import { Trophy, TrendingUp, Target, Sparkles, Gift, Home } from "lucide-react";
import confetti from "canvas-confetti";

interface ResultScreenProps {
  totalScore: number;
  maxScore: number;
  correctAnswers: number;
  totalQuestions: number;
  onRetry: () => void;
  onHome?: () => void;
  onViewWrongAnswers: () => void;
  onGoToLeaderboard: () => void;
  onGoToCollection: () => void;
}

export function ResultScreen({
  totalScore,
  maxScore,
  correctAnswers,
  totalQuestions,
  onRetry,
  onHome,
  onViewWrongAnswers,
  onGoToLeaderboard,
  onGoToCollection
}: ResultScreenProps) {
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  const hasUnlockedCharacter = correctAnswers >= 5;

  // Trigger confetti on mount based on performance
  useEffect(() => {
    const triggerConfetti = () => {
      if (percentage >= 80) {
        // Perfect/Excellent score - big celebration
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min: number, max: number) {
          return Math.random() * (max - min) + min;
        }

        const interval: any = setInterval(function() {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            colors: ['#6366F1', '#EC4899', '#F59E0B', '#10B981']
          });
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            colors: ['#6366F1', '#EC4899', '#F59E0B', '#10B981']
          });
        }, 250);
      } else if (percentage >= 60) {
        // Good score - medium celebration
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366F1', '#EC4899', '#F59E0B']
        });
      } else if (percentage >= 40) {
        // OK score - small celebration
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.6 },
          colors: ['#6366F1', '#F59E0B']
        });
      }
    };

    // Delay to match animation
    const timeout = setTimeout(triggerConfetti, 500);
    return () => clearTimeout(timeout);
  }, [percentage]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        {/* Celebration Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="flex justify-center mb-6"
        >
          <div className="text-8xl">🎉</div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-2">완료!</h2>
          <p className="text-lg text-gray-600">
            수고하셨어요! 4개 맞혔어요! 다음엔 더 잘할 수 있을 거예요! 💪
          </p>
        </motion.div>

        {/* Character Unlock Notification */}
        {hasUnlockedCharacter && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="mb-6 backdrop-blur-xl bg-gradient-to-br from-yellow-100/80 to-orange-100/80 border-2 border-yellow-300/60 rounded-3xl p-6 shadow-2xl"
          >
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              >
                <Gift className="w-12 h-12 text-yellow-600" />
              </motion.div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-yellow-800 mb-1">
                  🎉 새로운 인물 카드 획득!
                </h3>
                <p className="text-yellow-700">
                  5개 이상 정답! 역사 인물 카드를 획득했어요. 컬렉션에서 확인하세요!
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Score Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <div className="backdrop-blur-xl bg-purple-100/60 border border-purple-200/60 rounded-3xl p-6 text-center shadow-lg">
            <div className="text-sm text-purple-600 mb-2">총점</div>
            <div className="text-4xl font-bold text-purple-700">{totalScore}</div>
          </div>
          <div className="backdrop-blur-xl bg-pink-100/60 border border-pink-200/60 rounded-3xl p-6 text-center shadow-lg">
            <div className="text-sm text-pink-600 mb-2">최고점</div>
            <div className="text-4xl font-bold text-pink-700">{maxScore}</div>
          </div>
          <div className="backdrop-blur-xl bg-blue-100/60 border border-blue-200/60 rounded-3xl p-6 text-center shadow-lg">
            <div className="text-sm text-blue-600 mb-2">정답</div>
            <div className="text-4xl font-bold text-blue-700">{correctAnswers}</div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-4 mb-6"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRetry}
            className="py-4 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-blue-100/80 to-cyan-100/80 border border-blue-200/60 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex flex-col items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <span className="text-blue-700 font-bold">다시 도전</span>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={onViewWrongAnswers}
            className="py-4 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-purple-100/80 to-pink-100/80 border border-purple-200/60 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex flex-col items-center gap-2">
              <Target className="w-6 h-6 text-purple-600" />
              <span className="text-purple-700 font-bold">오답노트</span>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGoToLeaderboard}
            className="py-4 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-amber-100/80 to-yellow-100/80 border border-amber-200/60 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex flex-col items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-600" />
              <span className="text-amber-700 font-bold">순위 등록</span>
            </div>
          </motion.button>

          {onHome ? (
            <motion.button
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={onHome}
              className="py-4 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-green-100/80 to-emerald-100/80 border border-green-200/60 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex flex-col items-center gap-2">
                <Home className="w-6 h-6 text-green-600" />
                <span className="text-green-700 font-bold">첫 화면으로</span>
              </div>
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGoToCollection}
              className="py-4 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-pink-100/80 to-rose-100/80 border border-pink-200/60 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex flex-col items-center gap-2">
                <Sparkles className="w-6 h-6 text-pink-600" />
                <span className="text-pink-700 font-bold">카드 컬렉션</span>
              </div>
            </motion.button>
          )}
        </motion.div>

        {/* Info Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-gray-500"
        >
          5개의 퀴즈를 맞히면 순위를 등록할 수 있다. 틀린문제는 오답노트에서 다시 확인할 수 있다.
        </motion.p>
      </motion.div>
    </div>
  );
}
