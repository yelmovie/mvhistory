import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Lightbulb, Send, ArrowLeft, Image as ImageIcon, 
  CheckCircle, XCircle, AlertCircle, ChevronRight, 
  Home, Check, X, ArrowRight, Loader2
} from "lucide-react";
import confetti from "canvas-confetti";
import { imageCacheService } from "../utils/imageCache";
import { checkSpellingSimilarity } from "../data/quizData";
import { PointsBadge } from "./gamification/PointsBadge";
import { LevelIndicator } from "./gamification/LevelIndicator";
import { ExpBar } from "./gamification/ExpBar";
import { RewardAnimation } from "./gamification/RewardAnimation";
import { ImageWithFallback } from "./figma/ImageWithFallback";
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
    category?: string; // Add category field
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
  
  // AI-generated hints
  const [generatedHints, setGeneratedHints] = useState<string[]>([]);
  const [hintLoading, setHintLoading] = useState(false);
  
  // Gamification states
  const [points, setPoints] = useState(2850);
  const [level, setLevel] = useState(5);
  const [exp, setExp] = useState(350);
  const [maxExp] = useState(500);
  const [showReward, setShowReward] = useState(false);
  const [rewardType, setRewardType] = useState<'correct' | 'levelup' | 'streak'>('correct');
  const [earnedPoints, setEarnedPoints] = useState(0);

  // Progress percentage
  const progressPercent = Math.round((currentQuestion / totalQuestions) * 100);

  // Extract keywords from question for image search
  const extractKeywordsFromQuestion = (questionText: string, category: string): string => {
    // Map categories to Korean search terms for better Google Image results
    const categoryMap: Record<string, string> = {
      '고조선': '고조선 단군 청동기',
      '삼국시대': '삼국시대 신라 불국사',
      '고려': '고려 청자 팔만대장경',
      '조선': '조선 궁궐 경복궁',
      '근현대': '한국 독립 근대',
      '인물': '한국 역사 인물'
    };

    // Extract key historical terms - prioritize Korean for better search results
    const historicalTerms = [
      { kr: '고조선', query: '고조선 단군' },
      { kr: '단군', query: '단군왕검 고조선' },
      { kr: '고구려', query: '고구려 광개토대왕' },
      { kr: '백제', query: '백제 석탑' },
      { kr: '신라', query: '신라 불국사 첨성대' },
      { kr: '통일신라', query: '신라 석굴암' },
      { kr: '고려', query: '고려 청자' },
      { kr: '조선', query: '조선 궁궐' },
      { kr: '세종', query: '세종대왕 한글' },
      { kr: '한글', query: '훈민정음 한글' },
      { kr: '불국사', query: '불국사 석가탑' },
      { kr: '첨성대', query: '첨성대 신라' },
      { kr: '석굴암', query: '석굴암 불상' },
      { kr: '거북선', query: '거북선 이순신' },
      { kr: '이순신', query: '이순신 거북선' },
      { kr: '독립', query: '대한독립 만세' },
      { kr: '3.1운동', query: '3.1운동 만세' },
      { kr: '6.25', query: '한국전쟁' },
      { kr: '한국전쟁', query: '6.25전쟁' },
      { kr: '임진왜란', query: '임진왜란 조선' },
      { kr: '병자호란', query: '병자호란 조선' },
      { kr: '팔만대장경', query: '팔만대장경 고려' },
      { kr: '청자', query: '고려청자' },
      { kr: '백자', query: '조선백자' },
      { kr: '한옥', query: '한옥 전통가옥' },
      { kr: '경복궁', query: '경복궁 광화문' },
      { kr: '창덕궁', query: '창덕궁 비원' },
      { kr: '덕수궁', query: '덕수궁 석조전' },
      { kr: '훈민정음', query: '훈민정음 세종대왕' },
      { kr: '직지심체요절', query: '직지심경 금속활자' },
      { kr: '금속활자', query: '금속활자 인쇄' },
      { kr: '측우기', query: '측우기 조선' },
      { kr: '앙부일구', query: '앙부일구 해시계' },
      { kr: '혼천의', query: '혼천의 천문기구' }
    ];

    // Check if question contains specific terms
    for (const term of historicalTerms) {
      if (questionText.includes(term.kr)) {
        return term.query;
      }
    }

    // Use category-based search
    return categoryMap[category] || '한국 전통 문화재';
  };

  // Get fallback image based on category
  const getFallbackImage = (category: string | undefined, questionText: string): string => {
    // Map categories and keywords to Unsplash search URLs
    const categoryImages: Record<string, string> = {
      '고조선': 'https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=1200&q=80',
      '삼국시대': 'https://images.unsplash.com/photo-1578469550956-0e16b69c6a3d?w=1200&q=80',
      '고려': 'https://images.unsplash.com/photo-1583149577728-9ba4bb93b0b0?w=1200&q=80',
      '조선': 'https://images.unsplash.com/photo-1693928105595-b323b02791ff?w=1200&q=80',
      '근현대': 'https://images.unsplash.com/photo-1583562835057-b06c1c4d0c3f?w=1200&q=80',
      '인물': 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80'
    };

    // Check keywords in question
    if (questionText.includes('궁궐') || questionText.includes('경복궁')) {
      return 'https://images.unsplash.com/photo-1693928105595-b323b02791ff?w=1200&q=80';
    } else if (questionText.includes('불국사') || questionText.includes('석굴암')) {
      return 'https://images.unsplash.com/photo-1578469550956-0e16b69c6a3d?w=1200&q=80';
    } else if (questionText.includes('한옥') || questionText.includes('전통')) {
      return 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80';
    } else if (questionText.includes('독립') || questionText.includes('만세')) {
      return 'https://images.unsplash.com/photo-1583562835057-b06c1c4d0c3f?w=1200&q=80';
    }

    // Use category-based image or default Korean traditional image
    return categoryImages[category || ''] || 'https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=1200&q=80';
  };

  // Load image with deterministic selection
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
    setGeneratedHints([]); // Reset AI-generated hints
    setHintLoading(false);
    
    const loadImage = async () => {
      setImageLoading(true);
      try {
        // First, check if there's a cached image for this question
        const cachedImageResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-48be01a5/quiz-image/${question.id}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (cachedImageResponse.ok) {
          const cachedData = await cachedImageResponse.json();
          if (cachedData.success && cachedData.imageUrl) {
            console.log('Using cached image for question', question.id);
            setQuestionImage(cachedData.imageUrl);
            setImageLoading(false);
            return;
          }
        }

        // Generate search query from the question
        const searchQuery = (question as any).imageQuery || 
          extractKeywordsFromQuestion(question.question, question.category || '조선');
        
        console.log('Searching Google Images for question', question.id, 'with query:', searchQuery);
        
        // Search for image using Google Custom Search API
        const searchResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-48be01a5/search-image`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: searchQuery,
              questionId: question.id
            }),
          }
        );

        const searchData = await searchResponse.json();

        if (searchData.success && searchData.imageUrl) {
          console.log('Found image via Google Search:', searchData.imageUrl);
          setQuestionImage(searchData.imageUrl);
        } else {
          console.warn('Google Search did not return image, using fallback');
          throw new Error(searchData.error || 'No image found');
        }
        
      } catch (error) {
        console.error('Failed to load image from Google:', error);
        // Use category-based fallback image
        const fallbackImage = getFallbackImage(question.category, question.question);
        console.log('Using fallback image:', fallbackImage);
        setQuestionImage(fallbackImage);
      } finally {
        setImageLoading(false);
      }
    };
    
    loadImage();
  }, [question.id]);

  const handleShowHint = async () => {
    if (currentHint < 3) { // 최대 3개의 힌트
      setHintLoading(true);
      try {
        // Use category from question or extract from text
        const category = question.category || extractCategoryFromQuestion(question.question);
        
        // AI로 힌트 생성
        const newHint = await generateQuizHint(
          question.question,
          question.answer,
          currentHint + 1, // 1: 광범위, 2: 중간, 3: 구체적
          category
        );
        
        setGeneratedHints(prev => [...prev, newHint]);
        setCurrentHint(currentHint + 1);
        setShowHints(true);
      } catch (error) {
        console.error('힌트 생성 실패:', error);
        // 오류 시 기본 힌트 사용
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
    }
  };

  // Extract category from question text as fallback
  const extractCategoryFromQuestion = (questionText: string): string => {
    if (questionText.includes('고조선') || questionText.includes('단군')) return '고조선';
    if (questionText.includes('고구려') || questionText.includes('백제') || questionText.includes('신라')) return '삼국시대';
    if (questionText.includes('고려') || questionText.includes('청자') || questionText.includes('팔만대장경')) return '고려';
    if (questionText.includes('조선') || questionText.includes('세종') || questionText.includes('한글')) return '조선';
    if (questionText.includes('독립') || questionText.includes('일제') || questionText.includes('현대')) return '근현대';
    return '한국사';
  };

  const calculatePoints = (hintsUsed: number) => {
    const basePoints = 70; // Elementary school level
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
      
      // Calculate and award points
      const earnedPts = calculatePoints(currentHint);
      setEarnedPoints(earnedPts);
      setPoints(prev => prev + earnedPts);
      
      setRewardType('correct');
      setShowReward(true);
      
      // Trigger confetti effect for correct answer
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
    // Mark question as completed if answered correctly
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
              period: (question as any).period || 'unknown'
            })
          }
        );
        console.log('Question marked as completed:', question.id);
      } catch (error) {
        console.error('Failed to mark question as completed:', error);
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
    setSpellingError(false);
    setSpellingHint("");
  };

  const handleOptionSelect = (option: string) => {
    if (showResult) return;
    setSelectedOption(option);
    setSpellingError(false);
    setSpellingHint("");
  };

  // Get option status
  const getOptionStatus = (option: string): 'default' | 'selected' | 'correct' | 'wrong' => {
    if (!showResult) {
      return selectedOption === option ? 'selected' : 'default';
    }
    if (option === question.answer) return 'correct';
    if (option === selectedOption && option !== question.answer) return 'wrong';
    return 'default';
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
      <div className="max-w-5xl mx-auto">
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
        </div>

        {/* Progress Bar with Percentage */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-bold ${
              darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'
            }`}>
              문제 {currentQuestion} / {totalQuestions}
            </span>
            <span className={`text-sm font-black ${
              darkMode ? 'text-[#A5B4FC]' : 'text-[#6366F1]'
            }`}>
              {progressPercent}%
            </span>
          </div>
          <div className={`h-3 rounded-full overflow-hidden ${
            darkMode ? 'bg-[#334155]' : 'bg-[#E5E7EB]'
          }`}>
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #6366F1 0%, #EC4899 100%)',
                boxShadow: '0 0 12px rgba(99, 102, 241, 0.5)'
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Question Card */}
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${
            darkMode ? 'bg-[#1E293B]' : 'bg-white'
          } rounded-[24px] p-6 sm:p-8`}
          style={{ boxShadow: 'var(--shadow-lg)' }}
        >
          {/* Question Image with Border */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className={`relative w-full aspect-video rounded-[20px] overflow-hidden mb-6 border-4 ${
              darkMode ? 'border-[#334155]' : 'border-[#E5E7EB]'
            }`}
            style={{ 
              boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.2)',
            }}
          >
            {imageLoading && (
              <div className={`absolute inset-0 flex items-center justify-center z-10 ${
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
            )}
            {questionImage ? (
              <ImageWithFallback
                src={questionImage}
                alt="Question illustration"
                className="w-full h-full object-cover"
                onLoad={() => setImageLoading(false)}
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
          <h2 className={`text-xl sm:text-2xl font-black mb-6 leading-relaxed ${
            darkMode ? 'text-white' : 'text-[#1F2937]'
          }`}>
            {question.question}
          </h2>

          {/* Multiple Choice Options */}
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
                    className={`w-full p-4 rounded-[16px] text-left transition-all border-2 font-medium flex items-center justify-between ${
                      status === 'selected'
                        ? 'bg-[#6366F1] border-[#6366F1] text-white'
                        : status === 'correct'
                          ? 'bg-[#10B981] border-[#10B981] text-white'
                          : status === 'wrong'
                            ? 'bg-[#EF4444] border-[#EF4444] text-white'
                            : darkMode
                              ? 'bg-[#334155] border-[#475569] text-white hover:bg-[#A5B4FC]/20 hover:border-[#6366F1]'
                              : 'bg-white border-[#D1D5DB] text-[#1F2937] hover:bg-[#EEF2FF] hover:border-[#6366F1]'
                    } ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    style={
                      status === 'selected' 
                        ? { boxShadow: '0 8px 24px -8px rgba(99, 102, 241, 0.6)' }
                        : status === 'correct'
                          ? { boxShadow: '0 8px 24px -8px rgba(16, 185, 129, 0.6)' }
                          : status === 'wrong'
                            ? { boxShadow: '0 8px 24px -8px rgba(239, 68, 68, 0.6)' }
                            : {}
                    }
                  >
                    <span>
                      <span className="font-black mr-3 text-lg">{index + 1}.</span>
                      {option}
                    </span>
                    {status === 'correct' && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                      >
                        <Check className="w-6 h-6" strokeWidth={3} />
                      </motion.div>
                    )}
                    {status === 'wrong' && (
                      <motion.div
                        initial={{ scale: 0, rotate: 180 }}
                        animate={{ scale: 1, rotate: 0 }}
                      >
                        <X className="w-6 h-6" strokeWidth={3} />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
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
                className={`w-full px-6 py-4 rounded-[16px] border-2 text-lg font-medium transition-all ${
                  darkMode
                    ? 'bg-[#334155] border-[#475569] text-white placeholder-[#94A3B8] focus:border-[#6366F1]'
                    : 'bg-white border-[#D1D5DB] text-[#1F2937] placeholder-[#9CA3AF] focus:border-[#6366F1]'
                } focus:outline-none`}
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

          {/* Hint Button - Yellow Background + Lightbulb Icon */}
          {!showResult && (
            <div className="mb-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleShowHint}
                disabled={currentHint >= 3 || hintLoading}
                className={`w-full sm:w-auto px-6 py-3 rounded-[16px] flex items-center gap-2 font-bold transition-all ${
                  currentHint >= 3 || hintLoading
                    ? darkMode
                      ? 'bg-[#334155] text-[#64748B] cursor-not-allowed'
                      : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                    : 'bg-[#FBBF24] hover:bg-[#F59E0B] text-white'
                }`}
                style={currentHint < 3 && !hintLoading ? { 
                  boxShadow: '0 8px 24px -8px rgba(251, 191, 36, 0.6)' 
                } : {}}
              >
                {hintLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2} />
                    AI 힌트 생성 중...
                  </>
                ) : (
                  <>
                    <Lightbulb className="w-5 h-5" strokeWidth={2} fill={currentHint < 3 ? "white" : "none"} />
                    AI 힌트 보기 ({currentHint}/3)
                  </>
                )}
              </motion.button>

              <AnimatePresence>
                {showHints && currentHint > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 space-y-2"
                  >
                    {generatedHints.map((hint, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-[12px] border ${
                          darkMode
                            ? 'bg-[#FBBF24]/10 border-[#FBBF24]/30 text-[#FDE68A]'
                            : 'bg-[#FEF3C7] border-[#FBBF24]/50 text-[#92400E]'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            darkMode ? 'bg-[#FBBF24] text-[#1F2937]' : 'bg-[#FBBF24] text-white'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Lightbulb className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
                              <span className={`text-xs font-semibold ${
                                darkMode ? 'text-[#FDE68A]' : 'text-[#92400E]'
                              }`}>
                                {index === 0 ? '광범위한 힌트' : index === 1 ? '중간 힌트' : '구체적인 힌트'}
                              </span>
                            </div>
                            <span className="text-sm font-medium leading-relaxed">{hint}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Result Message */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`mb-6 p-6 rounded-[20px] border-2 ${
                  isCorrect
                    ? darkMode
                      ? 'bg-[#10B981]/20 border-[#10B981]/50'
                      : 'bg-[#D1FAE5] border-[#10B981]'
                    : darkMode
                      ? 'bg-[#EF4444]/20 border-[#EF4444]/50'
                      : 'bg-[#FEE2E2] border-[#EF4444]'
                }`}
              >
                <div className="flex items-start gap-4">
                  {isCorrect ? (
                    <CheckCircle className={`w-8 h-8 flex-shrink-0 ${
                      darkMode ? 'text-[#6EE7B7]' : 'text-[#10B981]'
                    }`} strokeWidth={2} />
                  ) : (
                    <XCircle className={`w-8 h-8 flex-shrink-0 ${
                      darkMode ? 'text-[#FCA5A5]' : 'text-[#EF4444]'
                    }`} strokeWidth={2} />
                  )}
                  <div>
                    <h3 className={`text-lg font-bold mb-2 ${
                      isCorrect
                        ? darkMode ? 'text-[#6EE7B7]' : 'text-[#10B981]'
                        : darkMode ? 'text-[#FCA5A5]' : 'text-[#EF4444]'
                    }`}>
                      {isCorrect ? '정답입니다! 🎉' : '아쉽지만 오답이에요 😢'}
                    </h3>
                    <p className={`text-sm mb-3 ${
                      darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'
                    }`}>
                      정답: <span className="font-bold">{question.answer}</span>
                    </p>
                    {question.explanation && (
                      <p className={`text-sm ${
                        darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'
                      }`}>
                        {question.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!showResult ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={
                  question.type === 'multiple-choice' 
                    ? !selectedOption 
                    : !userAnswer.trim()
                }
                className={`flex-1 px-6 py-4 rounded-[16px] font-bold text-white transition-all flex items-center justify-center gap-2 ${
                  (question.type === 'multiple-choice' ? !selectedOption : !userAnswer.trim())
                    ? darkMode
                      ? 'bg-[#334155] text-[#64748B] cursor-not-allowed'
                      : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                    : ''
                }`}
                style={(question.type === 'multiple-choice' ? selectedOption : userAnswer.trim()) ? {
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                  boxShadow: '0 8px 24px -8px rgba(99, 102, 241, 0.6)'
                } : {}}
              >
                <Send className="w-5 h-5" strokeWidth={2} />
                제출하기
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                className="flex-1 px-6 py-4 rounded-[16px] font-bold text-white transition-all flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  boxShadow: '0 8px 24px -8px rgba(16, 185, 129, 0.6)'
                }}
              >
                다음 문제
                <ArrowRight className="w-5 h-5" strokeWidth={2} />
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
