import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Crown, Castle, Book, Landmark, User, Clock, ArrowLeft, Sparkles, Lock, Check, Star } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
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
  viewMode?: 'desktop' | 'tablet' | 'mobile';
  completedQuestions?: number[];
  quizData?: any;
}

export function PeriodSelection({ 
  onSelectPeriod, 
  onBack, 
  darkMode = false, 
  viewMode = 'desktop',
  completedQuestions = [],
  quizData = {}
}: PeriodSelectionProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [hoveredPeriod, setHoveredPeriod] = useState<string | null>(null);

  // Calculate completion stats for each period
  const getPeriodStats = (periodId: string) => {
    const questions = quizData[periodId] || [];
    const totalQuestions = questions.length;
    const completedCount = questions.filter((q: any) => completedQuestions.includes(q.id)).length;
    const percentage = totalQuestions > 0 ? Math.round((completedCount / totalQuestions) * 100) : 0;
    
    return {
      totalQuestions,
      completedCount,
      percentage,
      hasCompleted: completedCount > 0
    };
  };

  const periods = [
    {
      id: 'three-kingdoms',
      label: '삼국시대 이전',
      description: '고조선과 초기 역사',
      emoji: '🌄',
      icon: Crown,
      borderColor: '#92400E', // 갈색/베이지
      borderGradient: 'linear-gradient(135deg, #92400E 0%, #D97706 100%)',
      iconBg: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
      imageUrl: threeKingdomsImage,
      locked: false
    },
    {
      id: 'three-kingdoms-period',
      label: '삼국시대',
      description: '고구려, 백제, 신라',
      emoji: '🏰',
      icon: Castle,
      borderColor: '#059669', // 초록색
      borderGradient: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
      iconBg: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
      imageUrl: threeKingdomsPeriodImage,
      locked: false
    },
    {
      id: 'goryeo',
      label: '고려시대',
      description: '문화와 과학의 발전',
      emoji: '📖',
      icon: Book,
      borderColor: '#0891B2', // 청록색
      borderGradient: 'linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)',
      iconBg: 'linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)',
      imageUrl: goryeoImage,
      locked: false
    },
    {
      id: 'joseon',
      label: '조선시대',
      description: '한글과 조선의 왕들',
      emoji: '📜',
      icon: Landmark,
      borderColor: '#DC2626', // 빨강/금색
      borderGradient: 'linear-gradient(135deg, #DC2626 0%, #F59E0B 100%)',
      iconBg: 'linear-gradient(135deg, #EF4444 0%, #FBBF24 100%)',
      imageUrl: joseonImage,
      locked: false
    },
    {
      id: 'modern',
      label: '근현대',
      description: '독립운동과 현대사',
      emoji: '🚀',
      icon: Clock,
      borderColor: '#1E40AF', // 파랑/남색
      borderGradient: 'linear-gradient(135deg, #1E40AF 0%, #6366F1 100%)',
      iconBg: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
      imageUrl: modernImage,
      locked: false
    },
    {
      id: 'person',
      label: '역사 속 인물과 대화하기',
      description: 'AI와 함께 역사 인물 만나기',
      emoji: '💬',
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
      className={`min-h-screen transition-colors duration-300 ${
        viewMode === 'mobile' ? 'p-4 py-6' : 'p-6 lg:p-12'
      } ${darkMode ? 'bg-[#0F172A]' : 'bg-[#FEF7FF]'}`}
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
                탐험하고 싶은 역사 시대를 선택해주세요 🏛️
              </p>
            </div>
          </div>
        </motion.div>

        {/* 2x3 Grid Cards */}
        <div className={`grid gap-6 ${
          viewMode === 'mobile' 
            ? 'grid-cols-1' 
            : viewMode === 'tablet' 
              ? 'grid-cols-2' 
              : 'grid-cols-2 lg:grid-cols-3'
        }`}>
          {periods.map((period, index) => {
            const isSelected = selectedPeriod === period.id;
            const isHovered = hoveredPeriod === period.id;
            const Icon = period.icon;

            return (
              <motion.div
                key={period.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                onHoverStart={() => setHoveredPeriod(period.id)}
                onHoverEnd={() => setHoveredPeriod(null)}
                onClick={() => handlePeriodClick(period.id)}
                className={`relative cursor-pointer rounded-[24px] overflow-hidden transition-all duration-300 ${
                  period.locked ? 'cursor-not-allowed' : ''
                } ${
                  darkMode ? 'bg-[#1E293B]' : 'bg-white'
                }`}
                style={{
                  boxShadow: isHovered || isSelected
                    ? `0 20px 40px -12px ${period.borderColor}40, 0 0 0 3px ${period.borderColor}`
                    : 'var(--shadow-lg)',
                  border: isSelected 
                    ? `3px solid ${period.borderColor}` 
                    : `3px solid ${darkMode ? '#334155' : '#E5E7EB'}`
                }}
              >
                {/* Special Sparkle Effect for "역사 속 인물" */}
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
                        <p className="text-white font-bold text-sm">잠긴 시대</p>
                        <p className="text-white/80 text-xs mt-1">이전 시대를 완료하세요</p>
                      </div>
                    </motion.div>
                  )}
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
                  {period.id !== 'person' && (() => {
                    const stats = getPeriodStats(period.id);
                    return stats.totalQuestions > 0 ? (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-semibold ${
                            darkMode ? 'text-[#94A3B8]' : 'text-[#9CA3AF]'
                          }`}>
                            완료: {stats.completedCount} / {stats.totalQuestions}
                          </span>
                          <span className={`text-xs font-bold ${
                            stats.percentage === 100 
                              ? 'text-[#10B981]' 
                              : stats.percentage >= 50
                              ? 'text-[#F59E0B]'
                              : darkMode ? 'text-[#94A3B8]' : 'text-[#9CA3AF]'
                          }`}>
                            {stats.percentage}%
                          </span>
                        </div>
                        <div className={`h-1.5 rounded-full overflow-hidden ${
                          darkMode ? 'bg-[#334155]' : 'bg-[#E5E7EB]'
                        }`}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{
                              background: stats.percentage === 100 
                                ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)'
                                : stats.percentage >= 50
                                ? 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)'
                                : 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)'
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.percentage}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                        {stats.percentage === 100 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Check className="w-3 h-3 text-[#10B981]" />
                            <span className="text-xs font-semibold text-[#10B981]">
                              완료!
                            </span>
                          </div>
                        )}
                      </div>
                    ) : null;
                  })()}

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

                  {/* Special Badge for "역사 속 인물" */}
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
            💡 <span className="font-bold">Tip:</span> 각 시대를 선택하면 재미있는 퀴즈가 시작됩니다!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
