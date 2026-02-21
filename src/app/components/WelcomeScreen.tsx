import { motion } from "motion/react";
import { 
  Moon, Sun, BookOpen, MessageSquare, Trophy, Wand2, MapPin, Award, 
  ArrowRight, ChevronRight, LogIn, User, LogOut, ChevronLeft, BookMarked,
  Star, Sparkles, Zap, Medal, Gift, Target
} from "lucide-react";
import { ViewModeIndicator } from "./ViewModeIndicator";
import { ViewModeToggle } from "./ViewModeToggle";
import { useState, useRef } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import type { UserProfile } from "../utils/supabaseClient";
import goodsImage from "figma:asset/ad91fb6c6a4c819be7ad8de71de184cc8308eded.png";
import museumImage from "figma:asset/b43467c9625f8cae55d080a380868b6690f988f2.png";
import artifactImage from "figma:asset/d14bfe2bd2778a4895c55492daf17c122c9a6b38.png";
import comicsImage from "figma:asset/2ae797fc976780ab3e9c34c87a23ed231e43f575.png";

interface WelcomeScreenProps {
  onStart: () => void;
  darkMode: boolean;
  onToggleTheme: () => void;
  onGoToGoodsGenerator?: () => void;
  onGoToMuseumTour?: () => void;
  onGoToArtifactExpert?: () => void;
  onGoToCharacterCollection?: () => void;
  onGoToCharacterChat?: () => void;
  onOpenLogin?: () => void;
  currentUser?: { name: string; email: string } | null;
  onLogout?: () => void;
  viewMode?: 'desktop' | 'tablet' | 'mobile';
  onViewModeChange?: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  userProfile?: UserProfile | null;
  isLoadingProfile?: boolean;
}

export function WelcomeScreen({ 
  onStart, 
  darkMode, 
  onToggleTheme, 
  onGoToGoodsGenerator,
  onGoToCharacterCollection,
  onGoToCharacterChat,
  onOpenLogin,
  currentUser,
  onLogout,
  viewMode = 'desktop',
  onViewModeChange,
  userProfile,
  isLoadingProfile = false
}: WelcomeScreenProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Use real data from Supabase or fallback to mock data
  const userStats = userProfile ? {
    level: userProfile.level,
    exp: userProfile.exp,
    maxExp: userProfile.maxExp,
    totalCards: 0, // Will be loaded separately
    totalCardsAvailable: 210,
    streak: userProfile.streak,
    points: userProfile.points
  } : {
    level: 1,
    exp: 0,
    maxExp: 100,
    totalCards: 0,
    totalCardsAvailable: 210,
    streak: 0,
    points: 0
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cardWidth = 340;
    const gap = 24;
    const scrollAmount = cardWidth + gap;
    
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const expPercentage = (userStats.exp / userStats.maxExp) * 100;
  const cardPercentage = (userStats.totalCards / userStats.totalCardsAvailable) * 100;

  return (
    <div 
      className="min-h-screen transition-colors duration-300 relative overflow-hidden"
      style={{
        background: darkMode 
          ? 'linear-gradient(180deg, #0F172A 0%, #1E3A8A 50%, #0F172A 100%)'
          : 'linear-gradient(180deg, #F6F8FF 0%, #EEF2FF 50%, #F6F8FF 100%)'
      }}
    >
      {/* Animated Background Shapes - Cool Blue */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-20"
          style={{
            background: darkMode 
              ? 'radial-gradient(circle, #2563EB 0%, transparent 70%)'
              : 'radial-gradient(circle, #DBEAFE 0%, transparent 70%)'
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-96 h-96 rounded-full opacity-20"
          style={{
            background: darkMode 
              ? 'radial-gradient(circle, #4F46E5 0%, transparent 70%)'
              : 'radial-gradient(circle, #E0E7FF 0%, transparent 70%)'
          }}
          animate={{
            x: [0, -40, 0],
            y: [0, 50, 0],
            scale: [1, 1.15, 1]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/3 w-80 h-80 rounded-full opacity-20"
          style={{
            background: darkMode 
              ? 'radial-gradient(circle, #22D3EE 0%, transparent 70%)'
              : 'radial-gradient(circle, #CFFAFE 0%, transparent 70%)'
          }}
          animate={{
            x: [0, 60, 0],
            y: [0, -40, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      {/* Content wrapper with backdrop blur */}
      <div className="relative z-10">
        {/* Header */}
        <header 
          className={`sticky top-0 z-50 border-b transition-all backdrop-blur-xl ${
            darkMode 
              ? 'bg-[#0F172A]/95 border-[#1E3A8A]/50' 
              : 'bg-white/80 border-[#E5E7EB]'
          }`}
          style={{ boxShadow: darkMode ? '0 1px 3px 0 rgb(0 0 0 / 0.3)' : '0 1px 3px 0 rgb(0 0 0 / 0.05)' }}
        >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-[#6366F1] rounded-[20px] blur-md opacity-40" />
                <div 
                  className="relative p-2.5 rounded-[20px]"
                  style={{
                    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                    boxShadow: 'var(--shadow-primary)'
                  }}
                >
                  <BookOpen className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
              </div>
              <div>
                <h1 className={`font-bold ${
                  viewMode === 'mobile' ? 'text-base' : 'text-xl'
                } bg-gradient-to-r from-[#2563EB] to-[#4F46E5] bg-clip-text text-transparent`}>
                  AI 한국사 여행
                </h1>
                {viewMode !== 'mobile' && (
                  <p className={`text-xs ${darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'}`}>
                    초등학생을 위한 역사 학습
                  </p>
                )}
              </div>
            </motion.div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* View Mode Toggle */}
              {onViewModeChange && viewMode !== 'mobile' && (
                <ViewModeToggle 
                  viewMode={viewMode}
                  onViewModeChange={onViewModeChange}
                  darkMode={darkMode}
                />
              )}

              {/* Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onToggleTheme}
                className={`p-2.5 rounded-[16px] transition-all ${
                  darkMode 
                    ? 'bg-[#1E3A8A]/50 hover:bg-[#1E3A8A]/70 text-[#93C5FD]' 
                    : 'bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB]'
                }`}
              >
                {darkMode ? <Sun className="w-5 h-5" strokeWidth={2} /> : <Moon className="w-5 h-5" strokeWidth={2} />}
              </motion.button>

              {/* User Section */}
              {currentUser ? (
                <div className="flex items-center gap-2">
                  {viewMode !== 'mobile' && (
                    <div 
                      className={`px-3 py-2 rounded-[16px] border ${
                        darkMode 
                          ? 'bg-[#334155] border-[#475569]' 
                          : 'bg-gradient-to-r from-[#EEF2FF] to-[#FCE7F3] border-[#E0E7FF]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                          style={{ background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)' }}
                        >
                          {currentUser.name.charAt(0)}
                        </div>
                        <div className="text-left">
                          <p className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-[#1F2937]'}`}>
                            {currentUser.name}
                          </p>
                          <p className={`text-xs ${darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'}`}>
                            Lv.{userStats.level}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onLogout}
                    className={`p-2.5 rounded-[16px] transition-all ${
                      darkMode 
                        ? 'bg-[#1E3A8A]/50 hover:bg-[#1E3A8A]/70 text-[#93C5FD]' 
                        : 'bg-white hover:bg-[#F9FAFB] text-[#2563EB] border border-[#E5E7EB]'
                    }`}
                  >
                    <LogOut className="w-4 h-4" strokeWidth={2} />
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onOpenLogin}
                  className={`flex items-center gap-2 font-bold rounded-[16px] text-white transition-all ${
                    viewMode === 'mobile' ? 'px-3 py-2 text-xs' : 'px-5 py-2.5 text-sm'
                  }`}
                  style={{
                    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                    boxShadow: 'var(--shadow-primary)'
                  }}
                >
                  <LogIn className="w-4 h-4" strokeWidth={2} />
                  <span>로그인</span>
                </motion.button>
              )}
            </div>
          </div>

          {/* Gamification Stats Bar */}
          {currentUser && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-3 pt-3 border-t ${
                darkMode ? 'border-[#1E3A8A]/50' : 'border-[#E5E7EB]'
              }`}
            >
              <div className={`grid gap-2 ${
                viewMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-3'
              }`}>
                {/* Level & EXP */}
                <div 
                  className={`rounded-[20px] p-4 backdrop-blur-sm border ${
                    darkMode ? 'bg-[#1E3A8A]/40 border-[#2563EB]/30' : 'bg-white border-[#E5E7EB]'
                  }`}
                  style={{ boxShadow: darkMode ? 'none' : '0 1px 3px 0 rgb(0 0 0 / 0.05)' }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-[#2563EB]" strokeWidth={2} />
                      <span className={`text-xs font-bold ${
                        darkMode ? 'text-white' : 'text-[#1F2937]'
                      }`}>
                        레벨 {userStats.level}
                      </span>
                    </div>
                    <span className={`text-xs ${
                      darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'
                    }`}>
                      {userStats.exp}/{userStats.maxExp} EXP
                    </span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${
                    darkMode ? 'bg-[#1E3A8A]/30' : 'bg-[#E5E7EB]'
                  }`}>
                    <motion.div 
                      className="h-full rounded-full"
                      style={{
                        background: '#2563EB'
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${expPercentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Card Collection */}
                <div 
                  className={`rounded-[20px] p-4 backdrop-blur-sm border ${
                    darkMode ? 'bg-[#1E3A8A]/40 border-[#2563EB]/30' : 'bg-white border-[#E5E7EB]'
                  }`}
                  style={{ boxShadow: darkMode ? 'none' : '0 1px 3px 0 rgb(0 0 0 / 0.05)' }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-[#2563EB]" strokeWidth={2} />
                      <span className={`text-xs font-bold ${
                        darkMode ? 'text-white' : 'text-[#1F2937]'
                      }`}>
                        인물 카드
                      </span>
                    </div>
                    <span className={`text-xs ${
                      darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'
                    }`}>
                      {userStats.totalCards}/{userStats.totalCardsAvailable}
                    </span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${
                    darkMode ? 'bg-[#1E3A8A]/30' : 'bg-[#E5E7EB]'
                  }`}>
                    <motion.div 
                      className="h-full rounded-full"
                      style={{
                        background: '#2563EB'
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${cardPercentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Streak & Points */}
                <div 
                  className={`rounded-[20px] p-4 backdrop-blur-sm border ${
                    darkMode ? 'bg-[#1E3A8A]/40 border-[#2563EB]/30' : 'bg-white border-[#E5E7EB]'
                  }`}
                  style={{ boxShadow: darkMode ? 'none' : '0 1px 3px 0 rgb(0 0 0 / 0.05)' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-[#2563EB] fill-[#2563EB]" strokeWidth={2} />
                        <span className={`text-xs font-bold ${
                          darkMode ? 'text-white' : 'text-[#1F2937]'
                        }`}>
                          {userStats.streak}일 연속
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-[#6366F1]" strokeWidth={2} />
                      <span className={`text-xs font-bold ${
                        darkMode ? 'text-white' : 'text-[#1F2937]'
                      }`}>
                        {userStats.points.toLocaleString()}P
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className={`${viewMode === 'mobile' ? 'px-4 py-8' : 'px-6 py-12'}`}>
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-center ${viewMode === 'mobile' ? 'mb-10' : 'mb-16'}`}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {/* Spline 3D Animation */}
              {viewMode !== 'mobile' && (
                <motion.div 
                  className={`relative mx-auto mb-8 ${
                    viewMode === 'tablet' ? 'h-[300px]' : 'h-[400px]'
                  } rounded-[24px] overflow-hidden`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  style={{
                    boxShadow: 'var(--shadow-2xl)'
                  }}
                >
                  <iframe 
                    src="https://my.spline.design/3dtextbluecopy-JuSbMYCCQUXAWrspNiVJU8oP/" 
                    className="w-full h-full border-0"
                    title="3D Text Animation"
                    loading="lazy"
                  />
                </motion.div>
              )}

              <h2 className={`font-bold leading-tight mb-4 ${
                viewMode === 'mobile' ? 'text-3xl' : 'text-5xl md:text-6xl'
              }`}>
                <span className="bg-gradient-to-r from-[#2563EB] to-[#4F46E5] bg-clip-text text-transparent">
                  AI와 함께 떠나는
                </span>
                <br />
                <span className={darkMode ? 'text-[#F9FAFB]' : 'text-[#111827]'}>
                  즐거운 한국사 여행! 🚀
                </span>
              </h2>
              <p className={`${
                viewMode === 'mobile' ? 'text-base mb-8' : 'text-xl md:text-2xl mb-10'
              } ${darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'} max-w-3xl mx-auto`}>
                퀴즈를 풀고 인물 카드를 모으며, 역사 속 위인과 대화해보세요! ✨
              </p>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={onStart}
                className={`group relative inline-flex items-center gap-3 font-bold rounded-[20px] text-white overflow-hidden ${
                  viewMode === 'mobile' ? 'px-8 py-4 text-base' : 'px-12 py-6 text-xl'
                }`}
                style={{
                  background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)',
                  boxShadow: '0 20px 25px -5px rgb(37 99 235 / 0.2), 0 8px 10px -6px rgb(37 99 235 / 0.2)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#D97706] via-[#DB2777] to-[#4F46E5] opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center gap-3">
                  학습 시작하기
                  <ArrowRight className={`${
                    viewMode === 'mobile' ? 'w-5 h-5' : 'w-6 h-6'
                  } group-hover:translate-x-1 transition-transform`} strokeWidth={2} />
                </span>
              </motion.button>

              {/* Floating Emojis */}
              {viewMode !== 'mobile' && (
                <div className="relative mt-8">
                  <motion.span
                    className="absolute left-1/4 text-4xl"
                    animate={{ y: [-10, 10, -10] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    📚
                  </motion.span>
                  <motion.span
                    className="absolute right-1/4 text-4xl"
                    animate={{ y: [10, -10, 10] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  >
                    🎯
                  </motion.span>
                </div>
              )}
            </motion.div>
          </motion.section>

          {/* Learning Journey Cards */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={viewMode === 'mobile' ? 'mb-12' : 'mb-20'}
          >
            <h3 className={`font-bold mb-6 ${
              viewMode === 'mobile' ? 'text-2xl' : 'text-3xl'
            } ${darkMode ? 'text-white' : 'text-[#1F2937]'} text-center`}>
              어떻게 학습하나요? 🤔
            </h3>
            
            <div className={`grid gap-4 ${
              viewMode === 'mobile' ? 'grid-cols-1' : 'md:grid-cols-3'
            }`}>
              {/* Step 1: Quiz */}
              <motion.button
                onClick={onStart}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`group relative overflow-hidden rounded-[24px] transition-all border ${
                  darkMode ? 'bg-[#1E293B]/80 border-[#2563EB]/20' : 'bg-white border-[#E5E7EB]'
                } ${viewMode === 'mobile' ? 'p-6' : 'p-8'} text-left`}
                style={{
                  boxShadow: darkMode 
                    ? '0 4px 6px -1px rgb(0 0 0 / 0.3)'
                    : '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)'
                }}
              >
                {/* Background Pattern - Subtle */}
                <div className="absolute top-0 right-0 opacity-5">
                  <div className="w-32 h-32 bg-[#2563EB] rounded-full blur-3xl" />
                </div>

                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div 
                      className={`${
                        viewMode === 'mobile' ? 'w-14 h-14' : 'w-16 h-16'
                      } rounded-[16px] flex items-center justify-center group-hover:scale-110 transition-transform`}
                      style={{
                        background: darkMode ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)',
                        border: darkMode ? '1px solid rgba(37, 99, 235, 0.3)' : '1px solid rgba(37, 99, 235, 0.2)'
                      }}
                    >
                      <BookOpen className={`w-8 h-8 ${darkMode ? 'text-[#60A5FA]' : 'text-[#2563EB]'}`} strokeWidth={2} />
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      darkMode ? 'bg-[#2563EB]/20 text-[#93C5FD]' : 'bg-[#EFF6FF] text-[#2563EB]'
                    }`}>
                      STEP 1
                    </div>
                  </div>

                  <h4 className={`font-bold mb-2 ${
                    viewMode === 'mobile' ? 'text-lg' : 'text-2xl'
                  } ${darkMode ? 'text-[#F9FAFB]' : 'text-[#111827]'}`}>
                    역사 퀴즈 풀기 🎯
                  </h4>
                  <p className={`${
                    viewMode === 'mobile' ? 'text-sm' : 'text-base'
                  } ${darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'} mb-4`}>
                    500개의 초등학생 맞춤 퀴즈로 한국사를 재미있게 학습하세요!
                  </p>

                  <div className={`flex items-center gap-2 ${
                    darkMode ? 'text-[#60A5FA]' : 'text-[#2563EB]'
                  }`}>
                    <span className="text-sm font-bold">지금 시작하기</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                  </div>
                </div>
              </motion.button>

              {/* Step 2: Chat */}
              <motion.button
                onClick={onGoToCharacterChat}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`group relative overflow-hidden rounded-[24px] transition-all border ${
                  darkMode ? 'bg-[#1E293B]/80 border-[#2563EB]/20' : 'bg-white border-[#E5E7EB]'
                } ${viewMode === 'mobile' ? 'p-6' : 'p-8'} text-left`}
                style={{
                  boxShadow: darkMode 
                    ? '0 4px 6px -1px rgb(0 0 0 / 0.3)'
                    : '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)'
                }}
              >
                <div className="absolute top-0 right-0 opacity-5">
                  <div className="w-32 h-32 bg-[#2563EB] rounded-full blur-3xl" />
                </div>

                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div 
                      className={`${
                        viewMode === 'mobile' ? 'w-14 h-14' : 'w-16 h-16'
                      } rounded-[16px] flex items-center justify-center group-hover:scale-110 transition-transform`}
                      style={{
                        background: darkMode ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)',
                        border: darkMode ? '1px solid rgba(37, 99, 235, 0.3)' : '1px solid rgba(37, 99, 235, 0.2)'
                      }}
                    >
                      <MessageSquare className={`w-8 h-8 ${darkMode ? 'text-[#60A5FA]' : 'text-[#2563EB]'}`} strokeWidth={2} />
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      darkMode ? 'bg-[#2563EB]/20 text-[#93C5FD]' : 'bg-[#EFF6FF] text-[#2563EB]'
                    }`}>
                      STEP 2
                    </div>
                  </div>

                  <h4 className={`font-bold mb-2 ${
                    viewMode === 'mobile' ? 'text-lg' : 'text-2xl'
                  } ${darkMode ? 'text-[#F9FAFB]' : 'text-[#111827]'}`}>
                    역사 인물과 대화 💬
                  </h4>
                  <p className={`${
                    viewMode === 'mobile' ? 'text-sm' : 'text-base'
                  } ${darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'} mb-4`}>
                    AI 챗봇으로 세종대왕, 이순신과 직접 대화하며 배워보세요!
                  </p>

                  <div className={`flex items-center gap-2 ${
                    darkMode ? 'text-[#60A5FA]' : 'text-[#2563EB]'
                  }`}>
                    <span className="text-sm font-bold">인물 만나기</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                  </div>
                </div>
              </motion.button>

              {/* Step 3: Collect */}
              <motion.button
                onClick={onGoToCharacterCollection}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`group relative overflow-hidden rounded-[24px] transition-all border ${
                  darkMode ? 'bg-[#1E293B]/80 border-[#2563EB]/20' : 'bg-white border-[#E5E7EB]'
                } ${viewMode === 'mobile' ? 'p-6' : 'p-8'} text-left`}
                style={{
                  boxShadow: darkMode 
                    ? '0 4px 6px -1px rgb(0 0 0 / 0.3)'
                    : '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)'
                }}
              >
                <div className="absolute top-0 right-0 opacity-5">
                  <div className="w-32 h-32 bg-[#2563EB] rounded-full blur-3xl" />
                </div>

                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div 
                      className={`${
                        viewMode === 'mobile' ? 'w-14 h-14' : 'w-16 h-16'
                      } rounded-[16px] flex items-center justify-center group-hover:scale-110 transition-transform`}
                      style={{
                        background: darkMode ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)',
                        border: darkMode ? '1px solid rgba(37, 99, 235, 0.3)' : '1px solid rgba(37, 99, 235, 0.2)'
                      }}
                    >
                      <Trophy className={`w-8 h-8 ${darkMode ? 'text-[#60A5FA]' : 'text-[#2563EB]'}`} strokeWidth={2} />
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      darkMode ? 'bg-[#2563EB]/20 text-[#93C5FD]' : 'bg-[#EFF6FF] text-[#2563EB]'
                    }`}>
                      STEP 3
                    </div>
                  </div>

                  <h4 className={`font-bold mb-2 ${
                    viewMode === 'mobile' ? 'text-lg' : 'text-2xl'
                  } ${darkMode ? 'text-[#F9FAFB]' : 'text-[#111827]'}`}>
                    인물 카드 수집 🏆
                  </h4>
                  <p className={`${
                    viewMode === 'mobile' ? 'text-sm' : 'text-base'
                  } ${darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'} mb-4`}>
                    퀴즈를 풀면서 210명의 역사 인물 카드를 모으세요!
                  </p>

                  <div 
                    className={`p-3 rounded-[12px] mb-3 border ${
                      darkMode 
                        ? 'bg-[#2563EB]/10 border-[#2563EB]/30' 
                        : 'bg-[#EFF6FF] border-[#DBEAFE]'
                    }`}
                  >
                    <p className={`text-xs ${
                      darkMode ? 'text-[#93C5FD]' : 'text-[#2563EB]'
                    }`}>
                      💡 퀴즈 5개 이상 맞추거나 인물과 10턴 대화하면 카드 획득!
                    </p>
                  </div>

                  <div className={`flex items-center gap-2 ${
                    darkMode ? 'text-[#60A5FA]' : 'text-[#2563EB]'
                  }`}>
                    <span className="text-sm font-bold">컬렉션 보기</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                  </div>
                </div>
              </motion.button>
            </div>
          </motion.section>

          {/* Special Features */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className={`font-bold ${
                viewMode === 'mobile' ? 'text-2xl' : 'text-3xl'
              } ${darkMode ? 'text-white' : 'text-[#1F2937]'}`}>
                더 많은 역사 체험 🎨
              </h3>

              {/* Navigation Arrows */}
              {viewMode !== 'mobile' && (
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleScroll('left')}
                    className={`p-3 rounded-[12px] transition-all ${
                      darkMode ? 'bg-[#334155] hover:bg-[#475569]' : 'bg-white hover:bg-[#F9FAFB]'
                    }`}
                    style={{ boxShadow: 'var(--shadow-md)' }}
                  >
                    <ChevronLeft className="w-5 h-5" strokeWidth={2} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleScroll('right')}
                    className={`p-3 rounded-[12px] transition-all ${
                      darkMode ? 'bg-[#334155] hover:bg-[#475569]' : 'bg-white hover:bg-[#F9FAFB]'
                    }`}
                    style={{ boxShadow: 'var(--shadow-md)' }}
                  >
                    <ChevronRight className="w-5 h-5" strokeWidth={2} />
                  </motion.button>
                </div>
              )}
            </div>

            <div 
              ref={scrollContainerRef}
              className={
                viewMode === 'mobile' 
                  ? 'grid grid-cols-1 gap-4' 
                  : 'flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4'
              }
              style={viewMode !== 'mobile' ? { scrollbarWidth: 'none', msOverflowStyle: 'none' } : {}}
            >
              {/* AI Goods Generator */}
              <motion.button
                whileHover={{ y: -4 }}
                onClick={onGoToGoodsGenerator}
                className={`group ${
                  viewMode === 'mobile' ? 'w-full' : 'flex-shrink-0 w-80 snap-center'
                } rounded-[20px] overflow-hidden transition-all ${
                  darkMode ? 'bg-[#1E293B]' : 'bg-white'
                } text-left`}
                style={{ boxShadow: 'var(--shadow-md)' }}
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <ImageWithFallback 
                    src={goodsImage}
                    alt="AI 역사 굿즈 만들기"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 ${
                    darkMode 
                      ? 'bg-gradient-to-t from-[#1E293B]/80 to-transparent' 
                      : 'bg-gradient-to-t from-white/80 to-transparent'
                  }`} />
                  <div className="absolute bottom-4 left-4">
                    <div 
                      className="w-12 h-12 rounded-[12px] backdrop-blur-sm flex items-center justify-center mb-2"
                      style={{ 
                        background: darkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.6)'
                      }}
                    >
                      <Wand2 className="w-6 h-6 text-[#8B5CF6]" strokeWidth={2} />
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h4 className={`font-bold text-lg mb-2 ${
                    darkMode ? 'text-white' : 'text-[#1F2937]'
                  } group-hover:text-[#8B5CF6] transition-colors`}>
                    AI 역사 굿즈 만들기 ✨
                  </h4>
                  <p className={`text-sm ${
                    darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'
                  }`}>
                    역사 인물과 유물로 나만의 창의적인 굿즈를 만들어보세요!
                  </p>
                </div>
              </motion.button>

              {/* Museum Tour */}
              <motion.button
                whileHover={{ y: -4 }}
                onClick={() => window.open('https://artsandculture.google.com/streetview/%EA%B5%AD%EB%A6%BD%EC%A4%91%EC%95%99%EB%B0%95%EB%AC%BC%EA%B4%80/bgGbp0dbiyydYw?hl=ko&sv_lng=126.98118893974714&sv_lat=37.52390286881644&sv_h=76&sv_p=0&sv_pid=Ki9KQM__LJebq_uYpYyGBQ&sv_z=1', '_blank')}
                className={`group ${
                  viewMode === 'mobile' ? 'w-full' : 'flex-shrink-0 w-80 snap-center'
                } rounded-[20px] overflow-hidden transition-all ${
                  darkMode ? 'bg-[#1E293B]' : 'bg-white'
                } text-left`}
                style={{ boxShadow: 'var(--shadow-md)' }}
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <ImageWithFallback 
                    src={museumImage}
                    alt="국립중앙박물관 둘러보기"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 ${
                    darkMode 
                      ? 'bg-gradient-to-t from-[#1E293B]/80 to-transparent' 
                      : 'bg-gradient-to-t from-white/80 to-transparent'
                  }`} />
                  <div className="absolute bottom-4 left-4">
                    <div 
                      className="w-12 h-12 rounded-[12px] backdrop-blur-sm flex items-center justify-center mb-2"
                      style={{ 
                        background: darkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.6)'
                      }}
                    >
                      <MapPin className="w-6 h-6 text-[#6366F1]" strokeWidth={2} />
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h4 className={`font-bold text-lg mb-2 ${
                    darkMode ? 'text-white' : 'text-[#1F2937]'
                  } group-hover:text-[#6366F1] transition-colors`}>
                    국립중앙박물관 둘러보기 🏛️
                  </h4>
                  <p className={`text-sm ${
                    darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'
                  }`}>
                    우리나라 대표 박물관의 소장품과 전시실을 가상으로 체험하세요!
                  </p>
                </div>
              </motion.button>

              {/* Artifact Expert */}
              <motion.button
                whileHover={{ y: -4 }}
                onClick={() => window.open('https://my.heritage.go.kr/main/index.do', '_blank')}
                className={`group ${
                  viewMode === 'mobile' ? 'w-full' : 'flex-shrink-0 w-80 snap-center'
                } rounded-[20px] overflow-hidden transition-all ${
                  darkMode ? 'bg-[#1E293B]' : 'bg-white'
                } text-left`}
                style={{ boxShadow: 'var(--shadow-md)' }}
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <ImageWithFallback 
                    src={artifactImage}
                    alt="우리나라 유물 박사되기"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 ${
                    darkMode 
                      ? 'bg-gradient-to-t from-[#1E293B]/80 to-transparent' 
                      : 'bg-gradient-to-t from-white/80 to-transparent'
                  }`} />
                  <div className="absolute bottom-4 left-4">
                    <div 
                      className="w-12 h-12 rounded-[12px] backdrop-blur-sm flex items-center justify-center mb-2"
                      style={{ 
                        background: darkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.6)'
                      }}
                    >
                      <Award className="w-6 h-6 text-[#60A5FA]" strokeWidth={2} />
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h4 className={`font-bold text-lg mb-2 ${
                    darkMode ? 'text-white' : 'text-[#1F2937]'
                  } group-hover:text-[#3B82F6] transition-colors`}>
                    우리나라 유물 박사되기 🏺
                  </h4>
                  <p className={`text-sm ${
                    darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'
                  }`}>
                    문화재청에서 우리나라의 소중한 유물을 탐험하고 배워보세요!
                  </p>
                </div>
              </motion.button>

              {/* History Comics */}
              <motion.button
                whileHover={{ y: -4 }}
                onClick={() => window.open('https://www.youtube.com/watch?v=UEpxN7RPTDU&list=PLYiHEYASbCxI4_Rw4Ict2G0mzNAd4dQd8', '_blank')}
                className={`group ${
                  viewMode === 'mobile' ? 'w-full' : 'flex-shrink-0 w-80 snap-center'
                } rounded-[20px] overflow-hidden transition-all ${
                  darkMode ? 'bg-[#1E293B]' : 'bg-white'
                } text-left`}
                style={{ boxShadow: 'var(--shadow-md)' }}
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <ImageWithFallback 
                    src={comicsImage}
                    alt="역사 만화 보기"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 ${
                    darkMode 
                      ? 'bg-gradient-to-t from-[#1E293B]/80 to-transparent' 
                      : 'bg-gradient-to-t from-white/80 to-transparent'
                  }`} />
                  <div className="absolute bottom-4 left-4">
                    <div 
                      className="w-12 h-12 rounded-[12px] backdrop-blur-sm flex items-center justify-center mb-2"
                      style={{ 
                        background: darkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.6)'
                      }}
                    >
                      <BookMarked className="w-6 h-6 text-[#10B981]" strokeWidth={2} />
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h4 className={`font-bold text-lg mb-2 ${
                    darkMode ? 'text-white' : 'text-[#1F2937]'
                  } group-hover:text-[#10B981] transition-colors`}>
                    역사 만화 보기 📖
                  </h4>
                  <p className={`text-sm ${
                    darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'
                  }`}>
                    재미있는 웹툰으로 배우는 한국사 이야기를 즐겨보세요!
                  </p>
                </div>
              </motion.button>
            </div>
          </motion.section>

          {/* Info Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`${
              viewMode === 'mobile' ? 'mt-12 p-6' : 'mt-16 p-10'
            } rounded-[20px] ${
              darkMode 
                ? 'bg-gradient-to-br from-[#1E293B] to-[#334155]' 
                : 'bg-gradient-to-br from-[#EEF2FF] to-[#FCE7F3]'
            }`}
          >
            <div className="text-center mb-8">
              <h3 className={`font-bold ${
                viewMode === 'mobile' ? 'text-2xl' : 'text-3xl'
              } ${darkMode ? 'text-white' : 'text-[#1F2937]'} mb-3`}>
                이런 걸 배울 수 있어요! 📚
              </h3>
              <p className={`${
                viewMode === 'mobile' ? 'text-sm' : 'text-base'
              } ${darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'}`}>
                초등학생을 위해 특별히 준비한 한국사 학습 콘텐츠
              </p>
            </div>

            <div className={`grid gap-4 ${
              viewMode === 'mobile' ? 'grid-cols-1' : 'md:grid-cols-2'
            }`}>
              {[
                '고조선부터 근현대까지 한국사 전체 시대',
                '210명의 주요 역사 인물 이야기',
                '500개의 초등학생 맞춤 퀴즈',
                '중요한 역사 사건과 문화유산',
                '3단계 힌트 시스템으로 쉬운 학습',
                'AI 챗봇과 함께하는 대화형 학습'
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className={`flex items-center gap-3 p-4 rounded-[16px] backdrop-blur-sm ${
                    darkMode ? 'bg-[#334155]/50' : 'bg-white/60'
                  }`}
                >
                  <div 
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)'
                    }}
                  >
                    <Star className="w-4 h-4 text-white fill-white" strokeWidth={2} />
                  </div>
                  <span className={`${
                    viewMode === 'mobile' ? 'text-sm' : 'text-base'
                  } ${darkMode ? 'text-[#F8FAFC]' : 'text-[#1F2937]'} font-medium`}>
                    {item}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>
      </main>

        {/* Footer */}
        <footer className={`mt-16 py-8 border-t backdrop-blur-sm ${
          darkMode ? 'border-[#1E3A8A] bg-[#0F172A]/50' : 'border-[#1E40AF] bg-[#1E3A8A]/50'
        }`}>
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className={`text-sm ${darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'}`}>
              © 2025 AI 한국사 여행. 초등학생을 위한 재미있는 역사 학습 플랫폼
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
