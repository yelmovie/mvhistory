import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Lightbulb, Send, ArrowLeft,
  CheckCircle, XCircle, AlertCircle,
  Home, Check, X, ArrowRight, Loader2
} from "lucide-react";
import confetti from "canvas-confetti";
import { checkSpellingSimilarity } from "../data/quizData";
import { PointsBadge } from "./gamification/PointsBadge";
import { LevelIndicator } from "./gamification/LevelIndicator";
import { ExpBar } from "./gamification/ExpBar";
import { RewardAnimation } from "./gamification/RewardAnimation";
import { generateQuizHint } from "../utils/openaiApi";

const _supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ngvsfcekfzzykvcsjktp.supabase.co';
const _anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndnNmY2VrZnp6eWt2Y3Nqa3RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MDYyMDksImV4cCI6MjA4NjQ4MjIwOX0.49FGaOySPc63Pxf6G-QS5T3LVoAie3XWGJsBY1djSZY';

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
    category?: string;
  };
  nextQuestionId?: number;
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
  darkMode = false,
  viewMode = 'desktop'
}: QuizScreenProps) {
  const [userAnswer, setUserAnswer] = useState("");
  const [currentHint, setCurrentHint] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [submittedAnswer, setSubmittedAnswer] = useState("");
  const [spellingError, setSpellingError] = useState(false);
  const [spellingHint, setSpellingHint] = useState("");
  const [selectedOption, setSelectedOption] = useState<string>("");

  // AI 힌트
  const [generatedHints, setGeneratedHints] = useState<string[]>([]);
  const [hintLoading, setHintLoading] = useState(false);

  // 게임화 상태
  const [points, setPoints] = useState(2850);
  const [level] = useState(5);
  const [exp] = useState(350);
  const [maxExp] = useState(500);
  const [showReward, setShowReward] = useState(false);
  const [rewardType, setRewardType] = useState<'correct' | 'levelup' | 'streak'>('correct');
  const [earnedPoints, setEarnedPoints] = useState(0);

  const progressPercent = Math.round((currentQuestion / totalQuestions) * 100);

  // 카테고리 자동 추출
  const extractCategoryFromQuestion = (questionText: string): string => {
    if (questionText.includes('고조선') || questionText.includes('단군')) return '고조선';
    if (questionText.includes('고구려') || questionText.includes('백제') || questionText.includes('신라')) return '삼국시대';
    if (questionText.includes('고려') || questionText.includes('청자') || questionText.includes('팔만대장경')) return '고려';
    if (questionText.includes('조선') || questionText.includes('세종') || questionText.includes('한글')) return '조선';
    if (questionText.includes('독립') || questionText.includes('일제') || questionText.includes('현대')) return '근현대';
    return '한국사';
  };

  const handleShowHint = async () => {
    if (currentHint >= 3) return;
    setHintLoading(true);
    try {
      const category = question.category || extractCategoryFromQuestion(question.question);
      const newHint = await generateQuizHint(
        question.question,
        question.answer,
        currentHint + 1,
        category
      );
      setGeneratedHints(prev => [...prev, newHint]);
      setCurrentHint(currentHint + 1);
      setShowHints(true);
    } catch {
      const fallbackHints = [
        `이 문제는 한국사와 관련이 있어요. 천천히 생각해보세요!`,
        `답은 "${question.answer.length}글자"입니다. 조금만 더 생각해보세요!`,
        `정답은 "${question.answer[0]}"로 시작하는 ${question.answer.length}글자 단어예요!`
      ];
      setGeneratedHints(prev => [...prev, fallbackHints[currentHint]]);
      setCurrentHint(currentHint + 1);
      setShowHints(true);
    } finally {
      setHintLoading(false);
    }
  };

  const calculatePoints = (hintsUsed: number) => {
    const basePoints = 70;
    const hintPenalty = hintsUsed * 10;
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
      const earnedPts = calculatePoints(currentHint);
      setEarnedPoints(earnedPts);
      setPoints(prev => prev + earnedPts);
      setRewardType('correct');
      setShowReward(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366F1', '#EC4899', '#F59E0B', '#10B981']
      });
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
      }
    } else {
      setIsCorrect(false);
      setShowResult(true);
      setSpellingError(false);
    }
  };

  const handleNext = async () => {
    if (isCorrect) {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userId = currentUser.email || 'guest';
        await fetch(
          `${_supabaseUrl}/functions/v1/make-server-48be01a5/quiz/completed`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${_anonKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              userId,
              questionId: question.id,
              period: (question as { period?: string }).period || 'unknown'
            })
          }
        );
      } catch {
        // 오류 무시
      }
    }

    onSubmitAnswer(submittedAnswer, currentHint);
    setShowResult(false);
    setIsCorrect(false);
    setSubmittedAnswer("");
    setUserAnswer("");
    setSelectedOption("");
    setCurrentHint(0);
    setShowHints(false);
    setGeneratedHints([]);
    setSpellingError(false);
    setSpellingHint("");
  };

  const handleOptionSelect = (option: string) => {
    if (showResult) return;
    setSelectedOption(option);
    setSpellingError(false);
    setSpellingHint("");
  };

  const getOptionStatus = (option: string): 'default' | 'selected' | 'correct' | 'wrong' => {
    if (!showResult) return selectedOption === option ? 'selected' : 'default';
    if (option === question.answer) return 'correct';
    if (option === selectedOption && option !== question.answer) return 'wrong';
    return 'default';
  };

  // 카테고리별 배경 색상
  const categoryGradient: Record<string, string> = {
    '고조선': 'from-amber-50 to-yellow-50',
    '삼국시대': 'from-emerald-50 to-green-50',
    '고려': 'from-cyan-50 to-sky-50',
    '조선': 'from-red-50 to-orange-50',
    '근현대': 'from-indigo-50 to-purple-50',
  };
  const categoryGradientDark: Record<string, string> = {
    '고조선': 'from-amber-900/20 to-yellow-900/10',
    '삼국시대': 'from-emerald-900/20 to-green-900/10',
    '고려': 'from-cyan-900/20 to-sky-900/10',
    '조선': 'from-red-900/20 to-orange-900/10',
    '근현대': 'from-indigo-900/20 to-purple-900/10',
  };

  const cat = question.category || extractCategoryFromQuestion(question.question);
  const cardGradient = darkMode
    ? (categoryGradientDark[cat] ?? 'from-gray-800/50 to-gray-900/30')
    : (categoryGradient[cat] ?? 'from-white to-gray-50');

  return (
    <div className={`min-h-screen transition-colors ${
      darkMode ? 'bg-[#0F172A]' : 'bg-[#F5F3FF]'
    } ${viewMode === 'mobile' ? 'p-4 py-6' : 'p-4 sm:p-6'}`}>

      {/* 보상 애니메이션 */}
      <RewardAnimation
        type={rewardType}
        points={earnedPoints}
        show={showReward}
        onComplete={() => setShowReward(false)}
        darkMode={darkMode}
      />

      {/* 게임화 헤더 */}
      <div className="max-w-3xl mx-auto mb-4">
        <div className={`${darkMode ? 'bg-[#1E293B]' : 'bg-white'} rounded-2xl p-3 sm:p-4`}
          style={{ boxShadow: 'var(--shadow-md)' }}>
          <div className={`flex items-center justify-between ${viewMode === 'mobile' ? 'flex-col gap-3' : 'gap-4'}`}>
            <div className={`flex items-center gap-3 ${viewMode === 'mobile' ? 'w-full justify-between' : ''}`}>
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

      {/* 메인 컨텐츠 */}
      <div className="max-w-3xl mx-auto">

        {/* 상단 컨트롤 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-sm ${
                darkMode
                  ? 'bg-[#1E293B] hover:bg-[#334155] text-white'
                  : 'bg-white hover:bg-gray-50 text-gray-800'
              }`}
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
              뒤로
            </motion.button>

            {onHome && (
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={onHome}
                className="p-2 rounded-xl text-white"
                style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', boxShadow: 'var(--shadow-primary)' }}
              >
                <Home className="w-4 h-4" strokeWidth={2} />
              </motion.button>
            )}
          </div>

          {/* 카테고리 뱃지 */}
          {cat && (
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
            }`}>
              {cat}
            </span>
          )}
        </div>

        {/* 진행률 바 */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-sm font-bold ${darkMode ? 'text-[#CBD5E1]' : 'text-gray-500'}`}>
              문제 {currentQuestion} / {totalQuestions}
            </span>
            <span className={`text-sm font-black ${darkMode ? 'text-[#A5B4FC]' : 'text-[#6366F1]'}`}>
              {progressPercent}%
            </span>
          </div>
          <div className={`h-3 rounded-full overflow-hidden ${darkMode ? 'bg-[#334155]' : 'bg-gray-200'}`}>
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #6366F1 0%, #EC4899 100%)',
                boxShadow: '0 0 12px rgba(99,102,241,0.5)'
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* 문제 카드 */}
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl overflow-hidden bg-gradient-to-br ${cardGradient}`}
          style={{
            boxShadow: 'var(--shadow-lg)',
            border: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)'
          }}
        >
          {/* 문제 텍스트 영역 */}
          <div className="px-6 sm:px-8 pt-8 pb-6">
            {/* 문제 번호 */}
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
              >
                Q
              </div>
              <span className={`text-xs font-bold ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                문제 {currentQuestion}
              </span>
            </div>

            {/* 문제 본문 */}
            <h2 className={`text-xl sm:text-2xl font-black leading-relaxed mb-6 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {question.question}
            </h2>

            {/* ── 객관식 보기 ── */}
            {question.type === 'multiple-choice' && question.options && (
              <div className="space-y-3 mb-6">
                {question.options.map((option, index) => {
                  const status = getOptionStatus(option);
                  return (
                    <motion.button
                      key={index}
                      whileHover={!showResult ? { scale: 1.02, x: 4 } : {}}
                      whileTap={!showResult ? { scale: 0.98 } : {}}
                      onClick={() => handleOptionSelect(option)}
                      disabled={showResult}
                      className={`w-full p-4 rounded-2xl text-left transition-all border-2 font-medium flex items-center justify-between ${
                        status === 'selected'
                          ? 'bg-[#6366F1] border-[#6366F1] text-white'
                          : status === 'correct'
                            ? 'bg-[#10B981] border-[#10B981] text-white'
                            : status === 'wrong'
                              ? 'bg-[#EF4444] border-[#EF4444] text-white'
                              : darkMode
                                ? 'bg-gray-800/70 border-gray-700 text-white hover:bg-gray-700 hover:border-[#6366F1]'
                                : 'bg-white border-gray-200 text-gray-800 hover:bg-[#EEF2FF] hover:border-[#6366F1]'
                      } ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      style={
                        status === 'selected'
                          ? { boxShadow: '0 8px 24px -8px rgba(99,102,241,0.6)' }
                          : status === 'correct'
                            ? { boxShadow: '0 8px 24px -8px rgba(16,185,129,0.6)' }
                            : status === 'wrong'
                              ? { boxShadow: '0 8px 24px -8px rgba(239,68,68,0.6)' }
                              : {}
                      }
                    >
                      <span>
                        <span className="font-black mr-3 text-lg">{index + 1}.</span>
                        {option}
                      </span>
                      {status === 'correct' && (
                        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}>
                          <Check className="w-6 h-6" strokeWidth={3} />
                        </motion.div>
                      )}
                      {status === 'wrong' && (
                        <motion.div initial={{ scale: 0, rotate: 180 }} animate={{ scale: 1, rotate: 0 }}>
                          <X className="w-6 h-6" strokeWidth={3} />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* ── 단답형 입력 ── */}
            {question.type === 'short-answer' && !showResult && (
              <div className="mb-6">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={e => {
                    setUserAnswer(e.target.value);
                    setSpellingError(false);
                    setSpellingHint("");
                  }}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="답을 입력하세요..."
                  className={`w-full px-5 py-4 rounded-2xl border-2 text-lg font-medium transition-all focus:outline-none ${
                    darkMode
                      ? 'bg-gray-800/70 border-gray-700 text-white placeholder-gray-500 focus:border-[#6366F1]'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#6366F1]'
                  }`}
                  style={{ boxShadow: 'var(--shadow-sm)' }}
                />
              </div>
            )}

            {/* ── 철자 오류 경고 ── */}
            <AnimatePresence>
              {spellingError && spellingHint && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`mb-5 p-4 rounded-2xl border-2 ${
                    darkMode
                      ? 'bg-amber-900/30 border-amber-500/50 text-amber-300'
                      : 'bg-amber-50 border-amber-300 text-amber-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <p className="text-sm font-medium">{spellingHint}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── 힌트 버튼 ── */}
            {!showResult && (
              <div className="mb-6">
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleShowHint}
                  disabled={currentHint >= 3 || hintLoading}
                  className={`px-5 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all text-sm ${
                    currentHint >= 3 || hintLoading
                      ? darkMode
                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-amber-400 hover:bg-amber-500 text-white'
                  }`}
                  style={currentHint < 3 && !hintLoading ? { boxShadow: '0 8px 24px -8px rgba(251,191,36,0.6)' } : {}}
                >
                  {hintLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      AI 힌트 생성 중...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="w-4 h-4" strokeWidth={2} fill={currentHint < 3 ? "white" : "none"} />
                      AI 힌트 보기 ({currentHint}/3)
                    </>
                  )}
                </motion.button>

                <AnimatePresence>
                  {showHints && generatedHints.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-2 overflow-hidden"
                    >
                      {generatedHints.map((hint, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.08 }}
                          className={`p-4 rounded-2xl border ${
                            darkMode
                              ? 'bg-amber-900/20 border-amber-500/30 text-amber-200'
                              : 'bg-amber-50 border-amber-200 text-amber-900'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-400 text-white flex items-center justify-center text-xs font-black">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className={`text-xs font-bold mb-1 ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                                {index === 0 ? '💡 첫 번째 힌트' : index === 1 ? '💡 두 번째 힌트' : '💡 마지막 힌트'}
                              </p>
                              <p className="text-sm font-medium leading-relaxed">{hint}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* ── 정답/오답 결과 ── */}
            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`mb-6 p-5 rounded-2xl border-2 ${
                    isCorrect
                      ? darkMode
                        ? 'bg-emerald-900/30 border-emerald-500/50'
                        : 'bg-emerald-50 border-emerald-300'
                      : darkMode
                        ? 'bg-red-900/30 border-red-500/50'
                        : 'bg-red-50 border-red-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className={`w-7 h-7 flex-shrink-0 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} strokeWidth={2} />
                    ) : (
                      <XCircle className={`w-7 h-7 flex-shrink-0 ${darkMode ? 'text-red-400' : 'text-red-600'}`} strokeWidth={2} />
                    )}
                    <div>
                      <h3 className={`text-base font-black mb-1.5 ${
                        isCorrect
                          ? darkMode ? 'text-emerald-300' : 'text-emerald-700'
                          : darkMode ? 'text-red-300' : 'text-red-700'
                      }`}>
                        {isCorrect ? '🎉 정답입니다!' : '😢 아쉽지만 오답이에요'}
                      </h3>
                      <p className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        정답: <span className="font-black">{question.answer}</span>
                      </p>
                      {question.explanation && (
                        <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {question.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── 액션 버튼 ── */}
            <div className="flex gap-3">
              {!showResult ? (
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={question.type === 'multiple-choice' ? !selectedOption : !userAnswer.trim()}
                  className={`flex-1 px-6 py-4 rounded-2xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
                    (question.type === 'multiple-choice' ? !selectedOption : !userAnswer.trim())
                      ? darkMode
                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : ''
                  }`}
                  style={
                    (question.type === 'multiple-choice' ? selectedOption : userAnswer.trim())
                      ? {
                          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                          boxShadow: '0 8px 24px -8px rgba(99,102,241,0.6)'
                        }
                      : {}
                  }
                >
                  <Send className="w-5 h-5" strokeWidth={2} />
                  제출하기
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleNext}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold text-white transition-all flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    boxShadow: '0 8px 24px -8px rgba(16,185,129,0.6)'
                  }}
                >
                  다음 문제
                  <ArrowRight className="w-5 h-5" strokeWidth={2} />
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
