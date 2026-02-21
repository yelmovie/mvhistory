import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lightbulb, Send, ArrowLeft, Image as ImageIcon, CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight, SkipForward, Home } from "lucide-react";
import { imageCacheService } from "../utils/imageCache";
import { checkSpellingSimilarity } from "../data/quizData";
import { PointsBadge } from "./gamification/PointsBadge";
import { LevelIndicator } from "./gamification/LevelIndicator";
import { ExpBar } from "./gamification/ExpBar";
import { CircularProgress } from "./gamification/CircularProgress";
import { RewardAnimation } from "./gamification/RewardAnimation";

interface QuizScreenProps {
  question: {
    id: number;
    question: string;
    type: 'multiple-choice' | 'short-answer';
    options?: string[];
    hints: string[];
    answer: string;
    explanation?: string;
    imagePrompt?: string;
  };
  currentQuestion: number;
  totalQuestions: number;
  onSubmitAnswer: (answer: string, hintsUsed: number) => void;
  onBack: () => void;
  onHome?: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSkip: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  darkMode?: boolean;
  viewMode?: 'desktop' | 'tablet' | 'mobile';
}

export function QuizScreen({
  question,
  currentQuestion,
  totalQuestions,
  onSubmitAnswer,
  onBack,
  onHome,
  onPrevious,
  onNext,
  onSkip,
  canGoPrevious,
  canGoNext,
  darkMode = false,
  viewMode = 'desktop'
}: QuizScreenProps) {
  const [userAnswer, setUserAnswer] = useState("");
  const [currentHint, setCurrentHint] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [questionImage, setQuestionImage] = useState<string>("");
  const [imageLoading, setImageLoading] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [submittedAnswer, setSubmittedAnswer] = useState("");
  const [spellingError, setSpellingError] = useState(false);
  const [spellingHint, setSpellingHint] = useState("");
  const [selectedOption, setSelectedOption] = useState<string>("");
  
  // Gamification states
  const [points, setPoints] = useState(2850);
  const [level, setLevel] = useState(5);
  const [exp, setExp] = useState(350);
  const [maxExp] = useState(500);
  const [showReward, setShowReward] = useState(false);
  const [rewardType, setRewardType] = useState<'correct' | 'levelup' | 'streak'>('correct');
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);

  // Load image
  useEffect(() => {
    setImageLoading(true);
    setShowResult(false);
    setIsCorrect(false);
    setSubmittedAnswer("");
    setUserAnswer("");
    setSelectedOption("");
    setCurrentHint(0);
    setShowHints(false);
    setSpellingError(false);
    setSpellingHint("");
    
    const loadImage = async () => {
      setImageLoading(true);
      try {
        const apiKey = localStorage.getItem('openai_api_key') || 'YOUR_OPENAI_API_KEY_HERE';
        const prompt = (question as any).imagePrompt || question.question;
        const imageUrl = await imageCacheService.generateImage(question.id, prompt, apiKey);
        setQuestionImage(imageUrl);
      } catch (error) {
        console.error('Failed to load image:', error);
      } finally {
        setImageLoading(false);
      }
    };
    
    loadImage();
  }, [question.id]);

  const handleShowHint = () => {
    if (currentHint < question.hints.length) {
      setCurrentHint(currentHint + 1);
      setShowHints(true);
    }
  };

  const calculatePoints = (hintsUsed: number) => {
    const basePoints = 100;
    const hintPenalty = hintsUsed * 20;
    return Math.max(basePoints - hintPenalty, 10);
  };

  const handleSubmit = () => {
    const answer = question.type === 'multiple-choice' ? selectedOption : userAnswer;
    
    if (!answer.trim()) return;

    setSubmittedAnswer(answer);
    
    const correct = answer.trim().toLowerCase() === question.answer.trim().toLowerCase();
    
    if (correct) {
      setIsCorrect(true);
      setShowResult(true);
      setSpellingError(false);
      
      // Calculate and award points
      const earnedPts = calculatePoints(currentHint);
      setEarnedPoints(earnedPts);
      setPoints(prev => prev + earnedPts);
      setExp(prev => {
        const newExp = prev + earnedPts;
        if (newExp >= maxExp) {
          // Level up!
          setLevel(l => l + 1);
          setTimeout(() => {
            setRewardType('levelup');
            setShowReward(true);
          }, 1500);
          return newExp - maxExp;
        }
        return newExp;
      });
      
      // Check streak
      const newStreak = consecutiveCorrect + 1;
      setConsecutiveCorrect(newStreak);
      
      if (newStreak >= 3) {
        setTimeout(() => {
          setRewardType('streak');
          setShowReward(true);
        }, 800);
      } else {
        setRewardType('correct');
        setShowReward(true);
      }
    } else if (question.type === 'short-answer') {
      const { isSimilar } = checkSpellingSimilarity(answer, question.answer);
      
      if (isSimilar) {
        setSpellingError(true);
        setSpellingHint(`거의 맞았어요! 철자를 확인해보세요. 정답은 "${question.answer}"입니다. 다시 입력해주세요!`);
        setUserAnswer("");
      } else {
        setIsCorrect(false);
        setShowResult(true);
        setSpellingError(false);
        setConsecutiveCorrect(0);
      }
    } else {
      setIsCorrect(false);
      setShowResult(true);
      setSpellingError(false);
      setConsecutiveCorrect(0);
    }
  };

  const handleNext = () => {
    onSubmitAnswer(submittedAnswer, currentHint);
    setShowResult(false);
    setIsCorrect(false);
    setSubmittedAnswer("");
    setUserAnswer("");
    setSelectedOption("");
    setCurrentHint(0);
    setShowHints(false);
    setSpellingError(false);
    setSpellingHint("");
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setSpellingError(false);
    setSpellingHint("");
  };

  return (
    <div className={`min-h-screen transition-colors ${
      darkMode ? 'bg-[#0F172A]' : 'bg-[#FEF7FF]'
    } ${viewMode === 'mobile' ? 'p-4 py-6' : 'p-6'}`}>
      {/* Reward Animations */}
      <RewardAnimation 
        type={rewardType}
        points={earnedPoints}
        show={showReward}
        onComplete={() => setShowReward(false)}
        darkMode={darkMode}
      />

      {/* Gamification Header */}
      <div className="max-w-5xl mx-auto mb-6">
        <div className={`${
          darkMode ? 'bg-[#1E293B]' : 'bg-white'
        } rounded-[20px] p-4`}
          style={{ boxShadow: 'var(--shadow-md)' }}
        >
          <div className={`flex items-center justify-between ${
            viewMode === 'mobile' ? 'flex-col gap-4' : 'gap-6'
          }`}>
            {/* Left: Level & Points */}
            <div className={`flex items-center gap-4 ${
              viewMode === 'mobile' ? 'w-full justify-between' : ''
            }`}>
              <LevelIndicator 
                level={level}
                userName="학습자"
                size={viewMode === 'mobile' ? 'small' : 'medium'}
                darkMode={darkMode}
              />
              <PointsBadge 
                points={points}
                size={viewMode === 'mobile' ? 'small' : 'medium'}
                darkMode={darkMode}
              />
            </div>

            {/* Center: Progress */}
            {viewMode !== 'mobile' && (
              <div className="flex items-center gap-3">
                <CircularProgress 
                  current={currentQuestion}
                  total={totalQuestions}
                  size={50}
                  darkMode={darkMode}
                  color="#6366F1"
                />
                <span className={`text-sm font-bold ${
                  darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'
                }`}>
                  문제 진행
                </span>
              </div>
            )}

            {/* Right: EXP Bar */}
            <div className={viewMode === 'mobile' ? 'w-full' : 'flex-1 max-w-xs'}>
              <ExpBar 
                currentExp={exp}
                maxExp={maxExp}
                showLabel={viewMode !== 'mobile'}
                size={viewMode === 'mobile' ? 'small' : 'medium'}
                darkMode={darkMode}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto flex items-center gap-4">
        {/* Left Arrow */}
        {viewMode !== 'mobile' && (
          <motion.button
            whileHover={{ scale: canGoPrevious ? 1.1 : 1 }}
            whileTap={{ scale: canGoPrevious ? 0.9 : 1 }}
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              canGoPrevious
                ? 'bg-[#6366F1] hover:bg-[#4F46E5] text-white'
                : darkMode
                  ? 'bg-[#334155] text-[#64748B] cursor-not-allowed'
                  : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
            }`}
            style={canGoPrevious ? { boxShadow: 'var(--shadow-primary)' } : {}}
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2} />
          </motion.button>
        )}

        {/* Quiz Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1"
        >
          {/* Header Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className={`flex items-center gap-2 px-4 py-2 rounded-[16px] font-bold ${
                  darkMode 
                    ? 'bg-[#1E293B] hover:bg-[#334155] text-white' 
                    : 'bg-white hover:bg-[#F9FAFB] text-[#1F2937]'
                }`}
                style={{ boxShadow: 'var(--shadow-sm)' }}
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                <span className="text-sm">뒤로</span>
              </motion.button>

              {onHome && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onHome}
                  className="p-2 rounded-[16px] transition-all text-white"
                  style={{
                    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                    boxShadow: 'var(--shadow-primary)'
                  }}
                >
                  <Home className="w-4 h-4" strokeWidth={2} />
                </motion.button>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSkip}
              disabled={!canGoNext}
              className={`flex items-center gap-2 px-4 py-2 rounded-[16px] font-bold transition-all ${
                canGoNext
                  ? 'bg-[#F59E0B] hover:bg-[#D97706] text-white'
                  : darkMode
                    ? 'bg-[#334155] text-[#64748B] cursor-not-allowed'
                    : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
              }`}
              style={canGoNext ? { boxShadow: 'var(--shadow-secondary)' } : {}}
            >
              <SkipForward className="w-4 h-4" strokeWidth={2} />
              <span className="text-sm">패스</span>
            </motion.button>
          </div>

          {/* Question Card */}
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${
              darkMode ? 'bg-[#1E293B]' : 'bg-white'
            } rounded-[20px] p-6 sm:p-8`}
            style={{ boxShadow: 'var(--shadow-lg)' }}
          >
            {/* Question Header */}
            <div className="flex items-center justify-between mb-6">
              <div className={`px-4 py-2 rounded-full font-bold ${
                darkMode 
                  ? 'bg-[#6366F1]/20 text-[#A5B4FC]'
                  : 'bg-[#EEF2FF] text-[#6366F1]'
              }`}>
                {currentQuestion}/{totalQuestions}
              </div>
              
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                question.type === 'multiple-choice'
                  ? darkMode
                    ? 'bg-[#6366F1]/20 text-[#A5B4FC]'
                    : 'bg-[#EEF2FF] text-[#6366F1]'
                  : darkMode
                    ? 'bg-[#10B981]/20 text-[#6EE7B7]'
                    : 'bg-[#D1FAE5] text-[#10B981]'
              }`}>
                {question.type === 'multiple-choice' ? '객관식' : '주관식'}
              </div>
            </div>

            {/* Question Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative w-full aspect-video rounded-[16px] overflow-hidden mb-6"
              style={{ boxShadow: 'var(--shadow-md)' }}
            >
              {imageLoading ? (
                <div className={`absolute inset-0 flex items-center justify-center ${
                  darkMode ? 'bg-[#334155]' : 'bg-[#F3F4F6]'
                }`}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="text-[#6366F1]"
                  >
                    <div className="w-12 h-12 border-4 border-[#6366F1] border-t-transparent rounded-full" />
                  </motion.div>
                </div>
              ) : questionImage ? (
                <img
                  src={questionImage}
                  alt="Question illustration"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`absolute inset-0 flex items-center justify-center ${
                  darkMode ? 'bg-[#334155]' : 'bg-[#F3F4F6]'
                }`}>
                  <ImageIcon className={`w-16 h-16 ${
                    darkMode ? 'text-[#64748B]' : 'text-[#9CA3AF]'
                  }`} strokeWidth={2} />
                </div>
              )}
            </motion.div>

            {/* Question Text */}
            <h2 className={`text-xl sm:text-2xl font-bold mb-6 ${
              darkMode ? 'text-white' : 'text-[#1F2937]'
            }`}>
              {question.question}
            </h2>

            {/* Multiple Choice Options */}
            {question.type === 'multiple-choice' && question.options && (
              <div className="space-y-3 mb-6">
                {question.options.map((option, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOptionSelect(option)}
                    disabled={showResult}
                    className={`w-full p-4 rounded-[16px] text-left transition-all border-2 font-medium ${
                      selectedOption === option
                        ? 'bg-[#6366F1] border-[#6366F1] text-white'
                        : darkMode
                          ? 'bg-[#334155] border-[#475569] text-white hover:bg-[#475569]'
                          : 'bg-white border-[#E5E7EB] text-[#1F2937] hover:bg-[#F9FAFB]'
                    } ${showResult ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                    style={selectedOption === option ? { boxShadow: 'var(--shadow-primary)' } : {}}
                  >
                    <span className="font-bold mr-3">{index + 1}.</span>
                    {option}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Short Answer Input */}
            {question.type === 'short-answer' && !showResult && (
              <div className="mb-6">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => {
                    setUserAnswer(e.target.value);
                    setSpellingError(false);
                    setSpellingHint("");
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="답을 입력하세요..."
                  className={`w-full px-6 py-4 rounded-[12px] border-2 text-lg transition-all ${
                    darkMode
                      ? 'bg-[#334155] border-[#475569] text-white placeholder-[#94A3B8]'
                      : 'bg-white border-[#E5E7EB] text-[#1F2937] placeholder-[#9CA3AF]'
                  } focus:outline-none focus:border-[#6366F1]`}
                  style={{ boxShadow: 'var(--shadow-sm)' }}
                />
              </div>
            )}

            {/* Spelling Error Hint */}
            <AnimatePresence>
              {spellingError && spellingHint && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`mb-6 p-4 rounded-[16px] border-2 ${
                    darkMode
                      ? 'bg-[#FBBF24]/20 border-[#FBBF24]/50 text-[#FDE68A]'
                      : 'bg-[#FEF3C7] border-[#FBBF24] text-[#92400E]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <p className="text-sm font-medium">{spellingHint}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hints Section */}
            {!showResult && (
              <div className="mb-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleShowHint}
                  disabled={currentHint >= question.hints.length}
                  className={`w-full sm:w-auto px-6 py-3 rounded-[16px] flex items-center gap-2 font-bold transition-all ${
                    currentHint >= question.hints.length
                      ? darkMode
                        ? 'bg-[#334155] text-[#64748B] cursor-not-allowed'
                        : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                      : 'bg-[#FBBF24] hover:bg-[#F59E0B] text-white'
                  }`}
                  style={currentHint < question.hints.length ? { boxShadow: 'var(--shadow-md)' } : {}}
                >
                  <Lightbulb className="w-5 h-5" strokeWidth={2} />
                  힌트 보기 ({currentHint}/{question.hints.length})
                </motion.button>

                <AnimatePresence>
                  {showHints && currentHint > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-2"
                    >
                      {question.hints.slice(0, currentHint).map((hint, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-4 rounded-[12px] border ${
                            darkMode
                              ? 'bg-[#6366F1]/20 border-[#6366F1]/30 text-[#A5B4FC]'
                              : 'bg-[#EEF2FF] border-[#C7D2FE] text-[#6366F1]'
                          }`}
                        >
                          <p className="text-sm font-medium">💡 {hint}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Submit Button */}
            {!showResult && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={question.type === 'multiple-choice' ? !selectedOption : !userAnswer.trim()}
                className={`w-full py-4 rounded-[16px] font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                  (question.type === 'multiple-choice' ? !selectedOption : !userAnswer.trim())
                    ? darkMode
                      ? 'bg-[#334155] text-[#64748B] cursor-not-allowed'
                      : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                    : 'text-white'
                }`}
                style={(question.type === 'multiple-choice' ? selectedOption : userAnswer.trim()) ? {
                  background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
                  boxShadow: 'var(--shadow-primary)'
                } : {}}
              >
                <Send className="w-5 h-5" strokeWidth={2} />
                제출하기
              </motion.button>
            )}

            {/* Result Section */}
            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`p-6 rounded-[20px] border-2 ${
                    isCorrect
                      ? darkMode
                        ? 'bg-[#10B981]/20 border-[#10B981]/50'
                        : 'bg-[#D1FAE5] border-[#10B981]'
                      : darkMode
                        ? 'bg-[#EF4444]/20 border-[#EF4444]/50'
                        : 'bg-[#FEE2E2] border-[#EF4444]'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    {isCorrect ? (
                      <CheckCircle className={`w-8 h-8 ${
                        darkMode ? 'text-[#6EE7B7]' : 'text-[#10B981]'
                      }`} strokeWidth={2} />
                    ) : (
                      <XCircle className={`w-8 h-8 ${
                        darkMode ? 'text-[#FCA5A5]' : 'text-[#EF4444]'
                      }`} strokeWidth={2} />
                    )}
                    <h3 className={`text-2xl font-bold ${
                      isCorrect
                        ? darkMode ? 'text-[#6EE7B7]' : 'text-[#10B981]'
                        : darkMode ? 'text-[#FCA5A5]' : 'text-[#EF4444]'
                    }`}>
                      {isCorrect ? '정답입니다! 🎉' : '아쉽지만 틀렸어요 😢'}
                    </h3>
                  </div>

                  {!isCorrect && (
                    <div className={`mb-4 p-4 rounded-[12px] ${
                      darkMode ? 'bg-[#334155]' : 'bg-white'
                    }`}>
                      <p className={`text-sm mb-2 ${
                        darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'
                      }`}>
                        정답:
                      </p>
                      <p className={`text-xl font-bold ${
                        darkMode ? 'text-white' : 'text-[#1F2937]'
                      }`}>
                        {question.answer}
                      </p>
                    </div>
                  )}

                  {question.explanation && (
                    <div className={`mb-6 p-4 rounded-[12px] ${
                      darkMode ? 'bg-[#334155]/50' : 'bg-white/50'
                    }`}>
                      <p className={`text-sm ${darkMode ? 'text-[#F8FAFC]' : 'text-[#1F2937]'}`}>
                        {question.explanation}
                      </p>
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNext}
                    className="w-full py-4 rounded-[16px] font-bold text-lg text-white flex items-center justify-center gap-2"
                    style={{
                      background: isCorrect 
                        ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                        : 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                      boxShadow: isCorrect ? 'var(--shadow-success)' : 'var(--shadow-primary)'
                    }}
                  >
                    다음 문제
                    <ChevronRight className="w-5 h-5" strokeWidth={2} />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Right Arrow */}
        {viewMode !== 'mobile' && (
          <motion.button
            whileHover={{ scale: canGoNext ? 1.1 : 1 }}
            whileTap={{ scale: canGoNext ? 0.9 : 1 }}
            onClick={onNext}
            disabled={!canGoNext}
            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              canGoNext
                ? 'bg-[#6366F1] hover:bg-[#4F46E5] text-white'
                : darkMode
                  ? 'bg-[#334155] text-[#64748B] cursor-not-allowed'
                  : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
            }`}
            style={canGoNext ? { boxShadow: 'var(--shadow-primary)' } : {}}
          >
            <ChevronRight className="w-6 h-6" strokeWidth={2} />
          </motion.button>
        )}
      </div>
    </div>
  );
}
