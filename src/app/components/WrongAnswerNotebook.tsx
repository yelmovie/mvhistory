import { motion } from "motion/react";
import { BookOpen, X, RotateCcw, ArrowLeft, Home } from "lucide-react";

interface WrongAnswer {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  category: string;
}

interface WrongAnswerNotebookProps {
  wrongAnswers: WrongAnswer[];
  onClose: () => void;
  onHome?: () => void;
  onRetry?: () => void;
}

export function WrongAnswerNotebook({ wrongAnswers, onClose, onHome, onRetry }: WrongAnswerNotebookProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl backdrop-blur-xl bg-white/60 border border-white/80 shadow-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>뒤로</span>
            </motion.button>

            {onHome && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onHome}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl backdrop-blur-xl bg-purple-500/60 border border-purple-400/50 shadow-lg hover:bg-purple-500/80 transition-all"
                title="홈으로"
              >
                <Home className="w-5 h-5" />
              </motion.button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-800">오답노트</h2>
          </div>

          <div className="w-24" /> {/* Spacer for centering */}
        </div>

        {/* Wrong Answers List */}
        <div className="space-y-4">
          {wrongAnswers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-xl bg-white/60 border border-white/80 rounded-3xl p-12 text-center shadow-xl"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">완벽해요!</h3>
              <p className="text-gray-600">틀린 문제가 없습니다!</p>
            </motion.div>
          ) : (
            wrongAnswers.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="backdrop-blur-xl bg-white/60 border border-white/80 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all"
              >
                {/* Category Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="px-4 py-1.5 rounded-full bg-purple-100/80 border border-purple-200/50">
                    <span className="text-sm text-purple-700 font-bold">{item.category}</span>
                  </div>
                </div>

                {/* Question */}
                <h3 className="text-lg font-bold text-gray-800 mb-4">{item.question}</h3>

                {/* Answers */}
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-red-50/80 border border-red-200/50">
                    <div className="flex items-start gap-3">
                      <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm text-red-600 font-bold mb-1">내 답:</div>
                        <div className="text-gray-700">{item.userAnswer}</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/50">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <div className="text-sm text-emerald-600 font-bold mb-1">정답:</div>
                        <div className="text-gray-700 font-bold">{item.correctAnswer}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Retry Button */}
        {wrongAnswers.length > 0 && onRetry && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRetry}
            className="w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-center gap-2">
              <RotateCcw className="w-5 h-5" />
              <span>틀아가기</span>
            </div>
          </motion.button>
        )}

        {/* Info Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm text-gray-500 mt-6"
        >
          오답과 관련된 문제를 맞추면 인물 역사카드를 획득하여 해당 역사 인물과 대화 할 수 있다.
        </motion.p>
      </motion.div>
    </div>
  );
}
