import { useEffect } from "react";
import { motion } from "motion/react";
import { Trophy, TrendingUp, Target, Sparkles, Gift, Home, BookOpen, Star, Users } from "lucide-react";
import confetti from "canvas-confetti";
import { loadStudyRecord, getChattedCharacterCount } from "../utils/studyRecord";

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
  currentUser?: { name: string; email: string } | null;
  selectedPeriod?: string;
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
  onGoToCollection,
  currentUser = null,
  selectedPeriod = '',
}: ResultScreenProps) {
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  const hasUnlockedCharacter = correctAnswers >= 5;

  // 학습자 누적 기록 로드
  const userId = currentUser?.email ?? 'guest';
  const studyRecord = loadStudyRecord(userId);
  const chattedCount = getChattedCharacterCount(userId);

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
          <h2 className="text-4xl font-bold text-gray-800 mb-2">
            {percentage === 100 ? '🎊 완벽해요!' : percentage >= 80 ? '🎉 훌륭해요!' : percentage >= 60 ? '👏 잘했어요!' : '💪 수고했어요!'}
          </h2>
          <p className="text-lg text-gray-600">
            {totalQuestions}문제 중 {correctAnswers}개 정답! {percentage >= 80 ? '정말 대단해요!' : '다음엔 더 잘할 수 있을 거예요!'}
          </p>
          {currentUser && (
            <p className="text-sm text-gray-500 mt-1">
              {currentUser.name}님의 학습 기록이 저장되었습니다 ✅
            </p>
          )}
        </motion.div>

        {/* Character Unlock Notification - 카드 획득 시 눈에 띄는 배너 */}
        {hasUnlockedCharacter && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="mb-6 rounded-3xl shadow-2xl overflow-hidden"
            style={{ boxShadow: '0 0 40px rgba(251, 191, 36, 0.4), 0 8px 32px rgba(0,0,0,0.2)' }}
          >
            {/* 상단 헤더 */}
            <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 px-6 pt-5 pb-4">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 1.5 }}
                >
                  <Gift className="w-10 h-10 text-white drop-shadow-lg" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-black text-white drop-shadow">
                    🎉 역사 인물 카드 획득!
                  </h3>
                  <p className="text-white/90 text-sm font-semibold">
                    퀴즈 {Math.floor(correctAnswers / 5) * 5}개 정답 달성 — 새 카드가 추가됐어요
                  </p>
                </div>
              </div>
            </div>
            {/* 하단 CTA */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-amber-300/60 px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-amber-800 text-sm font-medium flex-1">
                  획득한 카드를 컬렉션에서 확인하고 역사 인물과 대화해 보세요!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onGoToCollection}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white font-bold text-sm shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)' }}
                >
                  <Sparkles className="w-4 h-4" />
                  카드 보기
                </motion.button>
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

        {/* 누적 학습 기록 패널 */}
        {studyRecord.totalAttempts > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-6 backdrop-blur-xl bg-gradient-to-br from-indigo-50/90 to-purple-50/90 border border-indigo-200/60 rounded-3xl p-5 shadow-lg"
          >
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-indigo-800 text-sm">📊 내 누적 학습 기록</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/70 rounded-2xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Trophy className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-amber-600">{studyRecord.totalCorrect}</div>
                <div className="text-xs text-gray-500">누적 정답</div>
              </div>
              <div className="bg-white/70 rounded-2xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className="w-4 h-4 text-purple-500" />
                </div>
                <div className={`text-2xl font-black ${chattedCount > 0 ? 'text-purple-600' : 'text-gray-700'}`}>
                  {chattedCount}명
                </div>
                <div className="text-xs text-gray-500">대화 인물</div>
              </div>
              <div className="bg-white/70 rounded-2xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-2xl font-black text-purple-600">{studyRecord.wrongAnswers.length}</div>
                <div className="text-xs text-gray-500">오답 노트</div>
              </div>
            </div>
            {selectedPeriod && studyRecord.periodStats[selectedPeriod] && (
              <div className="mt-3 pt-3 border-t border-indigo-200/60">
                <div className="flex justify-between items-center text-xs text-indigo-700 mb-1">
                  <span>이번 시대 진행률</span>
                  <span className="font-bold">
                    {studyRecord.periodStats[selectedPeriod].completedCount} / {studyRecord.periodStats[selectedPeriod].totalQuestions}문제
                  </span>
                </div>
                <div className="h-2 bg-indigo-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${studyRecord.periodStats[selectedPeriod].totalQuestions > 0
                        ? Math.round((studyRecord.periodStats[selectedPeriod].completedCount / studyRecord.periodStats[selectedPeriod].totalQuestions) * 100)
                        : 0}%`
                    }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}

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
          ) : null}

          {/* 카드 컬렉션 버튼 - 획득 시 강조, 항상 표시 */}
          <motion.button
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGoToCollection}
            className={`py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all ${
              hasUnlockedCharacter
                ? 'text-white'
                : 'backdrop-blur-xl bg-gradient-to-br from-pink-100/80 to-rose-100/80 border border-pink-200/60'
            }`}
            style={hasUnlockedCharacter ? {
              background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)'
            } : {}}
          >
            <div className="flex flex-col items-center gap-2">
              <Sparkles className={`w-6 h-6 ${hasUnlockedCharacter ? 'text-white' : 'text-pink-600'}`} />
              <span className={`font-bold ${hasUnlockedCharacter ? 'text-white' : 'text-pink-700'}`}>
                {hasUnlockedCharacter ? '🃏 획득 카드 확인' : '카드 컬렉션'}
              </span>
            </div>
          </motion.button>
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
