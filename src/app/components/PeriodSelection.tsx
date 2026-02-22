import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Crown, Castle, Book, Landmark, User, Clock, ArrowLeft, Sparkles, Lock, Check, Star, Trophy, BookOpen, Users } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { loadStudyRecord, getChattedCharacterCount } from "../utils/studyRecord";
import threeKingdomsImage from "@/assets/6b4564927ec716928025b4c46f68af9df8be654f.png";
import threeKingdomsPeriodImage from "@/assets/3a7e2a63f6d253ca92d3db51250a099617d15e0b.png";
import goryeoImage from "@/assets/1105dce94caf890eb621c1b71be4414f9420e1f9.png";
import joseonImage from "@/assets/abe16d9bdd53420e54ce45952218625c1a5effb8.png";
import modernImage from "@/assets/c8395fb1e81b33dc6ddcedd243fec905c5b59ff9.png";
import historicalChatImage from "@/assets/7f6ad079cea18a9dd330a63f11e0997dd62dbb78.png";

interface PeriodSelectionProps {
  onSelectPeriod: (period: string) => void;
  onBack: () => void;
  darkMode?: boolean;
  completedQuestions?: number[];
  quizData?: any;
  currentUser?: { name: string; email: string } | null;
}

export function PeriodSelection({ 
  onSelectPeriod, 
  onBack, 
  darkMode = false, 
  completedQuestions = [],
  quizData = {},
  currentUser = null,
}: PeriodSelectionProps) {

  // 학습자 기록 로드 — prop과 studyRecord 중 더 많은 것 사용
  const userId = currentUser?.email ?? 'guest';
  const studyRecord = loadStudyRecord(userId);
  const chattedCount = getChattedCharacterCount(userId);

  // completedIds: prop(App.tsx 실시간) + studyRecord(localStorage 영속) 합산
  const mergedCompletedIds = [
    ...new Set([...completedQuestions, ...studyRecord.completedQuestionIds])
  ];

  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [hoveredPeriod, setHoveredPeriod] = useState<string | null>(null);
  // 완료 도장 애니메이션: periodId → 트리거 여부
  const [stampingPeriod, setStampingPeriod] = useState<string | null>(null);
  const [stampedPeriods, setStampedPeriods] = useState<Set<string>>(new Set());
  const prevCompletedRef = useRef<Record<string, number>>({});

  // Calculate completion stats for each period
  const getPeriodStats = (periodId: string) => {
    const questions = quizData[periodId] || [];
    const totalQuestions = questions.length;
    const completedCount = questions.filter((q: any) => mergedCompletedIds.includes(q.id)).length;
    const percentage = totalQuestions > 0 ? Math.round((completedCount / totalQuestions) * 100) : 0;
    
    return {
      totalQuestions,
      completedCount,
      percentage,
      hasCompleted: completedCount > 0,
      isFullyCompleted: totalQuestions > 0 && completedCount >= totalQuestions
    };
  };

  // 완료 도장 애니메이션 트리거 감지
  useEffect(() => {
    const periodIds = ['three-kingdoms', 'three-kingdoms-period', 'goryeo', 'joseon', 'modern'];
    periodIds.forEach(pid => {
      const stats = getPeriodStats(pid);
      const prevCount = prevCompletedRef.current[pid] ?? -1;
      if (
        stats.isFullyCompleted &&
        prevCount !== stats.completedCount &&
        !stampedPeriods.has(pid)
      ) {
        // 새로 100% 달성
        setStampingPeriod(pid);
        setStampedPeriods(prev => new Set([...prev, pid]));
        setTimeout(() => setStampingPeriod(null), 2000);
      }
      prevCompletedRef.current[pid] = stats.completedCount;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mergedCompletedIds.length]);

  const periods = [
    {
      id: 'three-kingdoms',
      label: '고조선·삼국 이전',
      description: '고조선부터 삼국 이전',
      emoji: '🏺',
      icon: Crown,
      borderColor: '#92400E', // 고조선/청동기
      borderGradient: 'linear-gradient(135deg, #92400E 0%, #D97706 100%)',
      iconBg: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
      imageUrl: threeKingdomsImage,
      locked: false
    },
    {
      id: 'three-kingdoms-period',
      label: '삼국시대',
      description: '고구려, 백제, 신라',
      emoji: '⚔️',
      icon: Castle,
      borderColor: '#059669', // 삼국시대
      borderGradient: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
      iconBg: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
      imageUrl: threeKingdomsPeriodImage,
      locked: false
    },
    {
      id: 'goryeo',
      label: '고려시대',
      description: '불교와 청자의 나라',
      emoji: '🏯',
      icon: Book,
      borderColor: '#0891B2', // 고려시대
      borderGradient: 'linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)',
      iconBg: 'linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)',
      imageUrl: goryeoImage,
      locked: false
    },
    {
      id: 'joseon',
      label: '조선시대',
      description: '유교와 한글의 나라',
      emoji: '📜',
      icon: Landmark,
      borderColor: '#DC2626', // 조선/근세
      borderGradient: 'linear-gradient(135deg, #DC2626 0%, #F59E0B 100%)',
      iconBg: 'linear-gradient(135deg, #EF4444 0%, #FBBF24 100%)',
      imageUrl: joseonImage,
      locked: false
    },
    {
      id: 'modern',
      label: '근현대',
      description: '개화기부터 현재까지',
      emoji: '🌏',
      icon: Clock,
      borderColor: '#1E40AF', // 근현대
      borderGradient: 'linear-gradient(135deg, #1E40AF 0%, #6366F1 100%)',
      iconBg: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
      imageUrl: modernImage,
      locked: false
    },
    {
      id: 'person',
      label: '역사 속 위인과 대화하기',
      description: 'AI와 함께 역사 인물 만나기',
      emoji: '🌟',
      icon: User,
      borderColor: '#EC4899',
      borderGradient: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
      iconBg: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
      imageUrl: historicalChatImage,
      isSpecial: true,
      locked: false
    }
  ];

  const handlePeriodClick = (periodId: string) => {
    const period = periods.find(p => p.id === periodId);
    if (period?.locked) return;
    
    setSelectedPeriod(periodId);
    setTimeout(() => {
      onSelectPeriod(periodId);
    }, 300);
  };

  return (
    <div 
      className={`min-h-screen transition-colors duration-300 p-6 lg:p-12 ${darkMode ? 'bg-[#0F172A]' : 'bg-[#FEF7FF]'}`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className={`p-3 rounded-[16px] transition-colors ${
                darkMode 
                  ? 'bg-[#1E293B] hover:bg-[#334155] text-white' 
                  : 'bg-white hover:bg-[#F3F4F6] text-[#1F2937]'
              }`}
              style={{ boxShadow: 'var(--shadow-md)' }}
            >
              <ArrowLeft className="w-6 h-6" strokeWidth={2} />
            </motion.button>
            
            <div>
                <h1 className={`text-3xl lg:text-4xl font-black mb-2 ${
                darkMode ? 'text-white' : 'text-[#1F2937]'
              }`}>
                시대 선택하기
              </h1>
              <p className={`text-sm lg:text-base ${
                darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'
              }`}>
                배우고 싶은 역사 시대를 골라서 퀴즈를 풀어보세요
              </p>
            </div>
          </div>
        </motion.div>

        {/* 학습자 통계 패널 */}
        {(studyRecord.totalAttempts > 0 || completedQuestions.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`mb-8 p-4 rounded-[20px] ${
              darkMode ? 'bg-[#1E293B] border border-[#334155]' : 'bg-white border border-[#E5E7EB]'
            }`}
            style={{ boxShadow: 'var(--shadow-md)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" strokeWidth={2} />
              </div>
              <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-[#1F2937]'}`}>
                {currentUser ? `${currentUser.name}의 학습 기록` : '내 학습 기록'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {/* 총 정답 수 */}
              <div className={`p-3 rounded-[14px] text-center ${darkMode ? 'bg-[#0F172A]' : 'bg-[#F9FAFB]'}`}>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Trophy className="w-4 h-4 text-[#F59E0B]" />
                </div>
                <div className={`text-xl font-black ${darkMode ? 'text-white' : 'text-[#1F2937]'}`}>
                  {studyRecord.totalCorrect || completedQuestions.length}
                </div>
                <div className={`text-xs ${darkMode ? 'text-[#94A3B8]' : 'text-[#9CA3AF]'}`}>총 정답</div>
              </div>
              {/* 대화한 역사 인물 수 */}
              <div className={`p-3 rounded-[14px] text-center ${darkMode ? 'bg-[#0F172A]' : 'bg-[#F9FAFB]'}`}>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className="w-4 h-4 text-[#7C3AED]" />
                </div>
                <div className={`text-xl font-black ${chattedCount > 0 ? 'text-[#7C3AED]' : darkMode ? 'text-white' : 'text-[#1F2937]'}`}>
                  {chattedCount}명
                </div>
                <div className={`text-xs ${darkMode ? 'text-[#94A3B8]' : 'text-[#9CA3AF]'}`}>대화 인물</div>
              </div>
              {/* 오답 노트 수 */}
              <div className={`p-3 rounded-[14px] text-center ${darkMode ? 'bg-[#0F172A]' : 'bg-[#F9FAFB]'}`}>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <BookOpen className="w-4 h-4 text-[#6366F1]" />
                </div>
                <div className={`text-xl font-black ${darkMode ? 'text-white' : 'text-[#1F2937]'}`}>
                  {studyRecord.wrongAnswers.length}
                </div>
                <div className={`text-xs ${darkMode ? 'text-[#94A3B8]' : 'text-[#9CA3AF]'}`}>오답 노트</div>
              </div>
            </div>
            {/* 전체 진행률 바 */}
            {(() => {
              const totalAll = Object.values(quizData).reduce((acc: number, qs: any) => acc + (Array.isArray(qs) ? qs.length : 0), 0);
              const pct = totalAll > 0 ? Math.round((completedQuestions.length / totalAll) * 100) : 0;
              return totalAll > 0 ? (
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-semibold ${darkMode ? 'text-[#94A3B8]' : 'text-[#9CA3AF]'}`}>전체 학습 진행률</span>
                    <span className={`text-xs font-bold ${pct === 100 ? 'text-[#10B981]' : darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'}`}>{completedQuestions.length} / {totalAll} ({pct}%)</span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-[#334155]' : 'bg-[#E5E7EB]'}`}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ) : null;
            })()}
          </motion.div>
        )}

        {/* 2x3 Grid Cards */}
        <div className="grid gap-6 grid-cols-2 lg:grid-cols-3">
          {periods.map((period, index) => {
            const isSelected = selectedPeriod === period.id;
            const isHovered = hoveredPeriod === period.id;
            const Icon = period.icon;
            const periodStats = period.id !== 'person' ? getPeriodStats(period.id) : null;
            const isFullyCompleted = periodStats?.isFullyCompleted ?? false;
            const isStamping = stampingPeriod === period.id;

            return (
              <motion.div
                key={period.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: isFullyCompleted ? -4 : -8 }}
                onHoverStart={() => setHoveredPeriod(period.id)}
                onHoverEnd={() => setHoveredPeriod(null)}
                onClick={() => handlePeriodClick(period.id)}
                className={`relative cursor-pointer rounded-[24px] overflow-hidden transition-all duration-300 ${
                  period.locked ? 'cursor-not-allowed' : ''
                } ${
                  darkMode ? 'bg-[#1E293B]' : 'bg-white'
                }`}
                style={{
                  boxShadow: isFullyCompleted
                    ? `0 0 0 3px #10B981, 0 20px 40px -12px #10B98140`
                    : isHovered || isSelected
                    ? `0 20px 40px -12px ${period.borderColor}40, 0 0 0 3px ${period.borderColor}`
                    : 'var(--shadow-lg)',
                  border: isFullyCompleted
                    ? `3px solid #10B981`
                    : isSelected 
                    ? `3px solid ${period.borderColor}` 
                    : `3px solid ${darkMode ? '#334155' : '#E5E7EB'}`
                }}
              >
                {/* Special Sparkle Effect for "역사 위인" */}
                {period.isSpecial && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.15) 0%, transparent 70%)'
                    }}
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}

                {/* Sparkle Icons for Special Card */}
                {period.isSpecial && (
                  <>
                    <motion.div
                      className="absolute top-4 right-4 z-10"
                      animate={{
                        rotate: [0, 360],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Sparkles className="w-6 h-6 text-[#EC4899]" strokeWidth={2} fill="#EC4899" />
                    </motion.div>
                    <motion.div
                      className="absolute top-8 left-6 z-10"
                      animate={{
                        rotate: [360, 0],
                        scale: [1, 1.3, 1]
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                      }}
                    >
                      <Star className="w-4 h-4 text-[#F472B6]" strokeWidth={2} fill="#F472B6" />
                    </motion.div>
                  </>
                )}

                {/* Image Section */}
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={period.imageUrl}
                    alt={period.label}
                    className={`w-full h-full object-cover transition-transform duration-500 ${
                      isHovered ? 'scale-110' : 'scale-100'
                    } ${period.locked ? 'grayscale blur-sm' : ''}`}
                  />
                  
                  {/* Gradient Overlay */}
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(to bottom, transparent 0%, ${
                        darkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)'
                      } 100%)`
                    }}
                  />

                  {/* Icon Badge */}
                  <motion.div
                    className="absolute top-4 left-4 w-14 h-14 rounded-full flex items-center justify-center z-10"
                    style={{
                      background: period.iconBg,
                      boxShadow: `0 8px 24px -8px ${period.borderColor}60`
                    }}
                    animate={period.isSpecial ? {
                      boxShadow: [
                        `0 8px 24px -8px ${period.borderColor}60`,
                        `0 8px 32px -4px ${period.borderColor}80`,
                        `0 8px 24px -8px ${period.borderColor}60`
                      ]
                    } : {}}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </motion.div>

                  {/* Selected Check Icon */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center z-10"
                        style={{
                          background: period.borderGradient,
                          boxShadow: 'var(--shadow-lg)'
                        }}
                      >
                        <Check className="w-6 h-6 text-white" strokeWidth={3} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Locked Overlay */}
                  {period.locked && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20"
                    >
                      <div className="text-center">
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Lock className="w-12 h-12 text-white mx-auto mb-2" strokeWidth={2} />
                        </motion.div>
                        <p className="text-white font-bold text-sm">잠금 해제</p>
                        <p className="text-white/80 text-xs mt-1">퀴즈를 풀면 열려요</p>
                      </div>
                    </motion.div>
                  )}

                  {/* 완료 도장 오버레이 — 100% 달성 시 */}
                  <AnimatePresence>
                    {isFullyCompleted && (
                      <motion.div
                        key="stamp-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                        style={{
                          background: 'rgba(16, 185, 129, 0.15)',
                        }}
                      >
                        {/* 도장 효과 */}
                        <motion.div
                          initial={isStamping ? { scale: 3, opacity: 0, rotate: -15 } : { scale: 1, opacity: 1, rotate: -12 }}
                          animate={{ scale: 1, opacity: 1, rotate: -12 }}
                          transition={isStamping ? { type: 'spring', stiffness: 400, damping: 20, duration: 0.5 } : {}}
                          className="relative"
                        >
                          {/* 도장 테두리 효과 */}
                          <motion.div
                            className="w-24 h-24 rounded-full border-4 border-[#10B981] flex items-center justify-center bg-white/90"
                            style={{ boxShadow: '0 0 0 4px rgba(16,185,129,0.3), inset 0 0 12px rgba(16,185,129,0.2)' }}
                            animate={isStamping ? {
                              boxShadow: [
                                '0 0 0 4px rgba(16,185,129,0.3)',
                                '0 0 0 12px rgba(16,185,129,0.0)',
                                '0 0 0 4px rgba(16,185,129,0.3)',
                              ]
                            } : {}}
                            transition={{ duration: 0.8 }}
                          >
                            <div className="text-center">
                              <div className="text-2xl">✅</div>
                              <div className="text-[10px] font-black text-[#059669] leading-tight mt-0.5">완료</div>
                            </div>
                          </motion.div>
                          {/* 방사형 파티클 (스탬프 순간) */}
                          {isStamping && Array.from({ length: 8 }).map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-2 h-2 rounded-full bg-[#10B981]"
                              style={{ top: '50%', left: '50%' }}
                              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                              animate={{
                                x: Math.cos((i / 8) * Math.PI * 2) * 60,
                                y: Math.sin((i / 8) * Math.PI * 2) * 60,
                                opacity: 0,
                                scale: 0
                              }}
                              transition={{ duration: 0.6, ease: 'easeOut' }}
                            />
                          ))}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Content Section */}
                <div className="p-6">
                  <h3 className={`text-xl font-black mb-2 ${
                    darkMode ? 'text-white' : 'text-[#1F2937]'
                  }`}>
                    {period.emoji} {period.label}
                  </h3>
                  <p className={`text-sm ${
                    darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'
                  }`}>
                    {period.description}
                  </p>

                  {/* Completion Stats - Only for quiz periods */}
                  {periodStats && periodStats.totalQuestions > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-semibold ${
                          darkMode ? 'text-[#94A3B8]' : 'text-[#9CA3AF]'
                        }`}>
                          진도: {periodStats.completedCount} / {periodStats.totalQuestions}
                        </span>
                        <span className={`text-xs font-bold ${
                          periodStats.percentage === 100 
                            ? 'text-[#10B981]' 
                            : periodStats.percentage >= 50
                            ? 'text-[#F59E0B]'
                            : darkMode ? 'text-[#94A3B8]' : 'text-[#9CA3AF]'
                        }`}>
                          {periodStats.percentage}%
                        </span>
                      </div>
                      <div className={`h-2 rounded-full overflow-hidden ${
                        darkMode ? 'bg-[#334155]' : 'bg-[#E5E7EB]'
                      }`}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: periodStats.percentage === 100 
                              ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)'
                              : periodStats.percentage >= 50
                              ? 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)'
                              : 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)'
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${periodStats.percentage}%` }}
                          transition={{ duration: 1.0, ease: "easeOut" }}
                        />
                      </div>
                      {periodStats.isFullyCompleted ? (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-1 mt-1.5"
                        >
                          <Check className="w-3.5 h-3.5 text-[#10B981]" strokeWidth={3} />
                          <span className="text-xs font-bold text-[#10B981]">
                            이 시대 학습 완료! 🎉
                          </span>
                        </motion.div>
                      ) : (
                        <div className="mt-1">
                          <span className={`text-xs ${darkMode ? 'text-[#475569]' : 'text-[#D1D5DB]'}`}>
                            {periodStats.totalQuestions - periodStats.completedCount}문제 남음
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Border Accent at Bottom */}
                  <motion.div
                    className="mt-4 h-1 rounded-full"
                    style={{
                      background: period.borderGradient
                    }}
                    animate={isHovered ? {
                      scaleX: [1, 1.1, 1],
                      opacity: [0.6, 1, 0.6]
                    } : {}}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />

                {/* Special Badge for "역사 위인" */}
                {period.isSpecial && (
                  <motion.div
                    className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white"
                    style={{
                      background: period.borderGradient,
                      boxShadow: 'var(--shadow-accent)'
                    }}
                    animate={{
                      boxShadow: [
                        '0 4px 12px -4px rgba(236, 72, 153, 0.4)',
                        '0 8px 20px -4px rgba(236, 72, 153, 0.6)',
                        '0 4px 12px -4px rgba(236, 72, 153, 0.4)'
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Sparkles className="w-3 h-3" strokeWidth={2} />
                    AI 대화 체험
                  </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 전체 완료 축하 배너 */}
        {(() => {
          const quizPeriods = ['three-kingdoms', 'three-kingdoms-period', 'goryeo', 'joseon', 'modern'];
          const allDone = quizPeriods.every(pid => {
            const s = getPeriodStats(pid);
            return s.isFullyCompleted;
          });
          return allDone ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 p-6 rounded-[20px] text-center relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%)',
                boxShadow: '0 20px 40px -12px rgba(16,185,129,0.5)'
              }}
            >
              {/* 반짝임 파티클 */}
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-white/60"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: 'easeInOut'
                  }}
                />
              ))}
              <div className="relative z-10">
                <motion.div
                  className="text-4xl mb-2"
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🏆
                </motion.div>
                <h3 className="text-white font-black text-xl mb-1">모든 시대 학습 완료!</h3>
                <p className="text-white/80 text-sm">한국사 전 시대를 마스터했어요! 대단해요! 🎉</p>
              </div>
            </motion.div>
          ) : null;
        })()}

        {/* Bottom Tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className={`mt-8 p-4 rounded-[16px] border ${
            darkMode 
              ? 'bg-[#6366F1]/10 border-[#6366F1]/30' 
              : 'bg-[#EEF2FF] border-[#C7D2FE]'
          }`}
        >
          <p className={`text-sm text-center ${
            darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'
          }`}>
            💡 <span className="font-bold">Tip:</span> 각 시대를 클릭하면 관련 퀴즈를 풀어볼 수 있어요!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
