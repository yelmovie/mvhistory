import { motion, AnimatePresence } from "motion/react";
import { 
  Moon, Sun, BookOpen, MessageSquare, Trophy, Wand2, MapPin, Award, 
  ArrowRight, ChevronRight, LogIn, User, LogOut, ChevronLeft, BookMarked,
  Sparkles, Zap, Medal, Gift, Target, Users, Star, Crown, X, Flame, Globe
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import {
  loadLeaderboard, getLevelTitle, getLevelColor, getExpInLevel, SCORE_PER_LEVEL,
  type LeaderboardEntry,
} from "../utils/leaderboard";
import { getChattedCharacterCount } from "../utils/studyRecord";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import type { UserProfile } from "../utils/supabaseClient";
import { t, type Lang } from "../utils/i18n";
import goodsImage from "@/assets/ad91fb6c6a4c819be7ad8de71de184cc8308eded.png";
import museumImage from "@/assets/b43467c9625f8cae55d080a380868b6690f988f2.png";
import artifactImage from "@/assets/d14bfe2bd2778a4895c55492daf17c122c9a6b38.png";
import comicsImage from "@/assets/2ae797fc976780ab3e9c34c87a23ed231e43f575.png";

interface WelcomeScreenProps {
  onStart: () => void;
  darkMode: boolean;
  onToggleTheme: () => void;
  lang?: Lang;
  onToggleLang?: () => void;
  onGoToGoodsGenerator?: () => void;
  onGoToMuseumTour?: () => void;
  onGoToArtifactExpert?: () => void;
  onGoToCharacterCollection?: () => void;
  onGoToCharacterChat?: () => void;
  onOpenLogin?: () => void;
  currentUser?: { name: string; email: string } | null;
  onLogout?: () => void;
  userProfile?: UserProfile | null;
  isLoadingProfile?: boolean;
  pendingStart?: boolean;
  onClearPendingStart?: () => void;
  onGoToAdmin?: () => void;
}

export function WelcomeScreen({ 
  onStart, 
  darkMode, 
  onToggleTheme,
  lang = 'ko',
  onToggleLang,
  onGoToGoodsGenerator,
  onGoToCharacterCollection,
  onGoToCharacterChat,
  onOpenLogin,
  currentUser,
  onLogout,
  userProfile,
  isLoadingProfile = false,
  pendingStart = false,
  onClearPendingStart,
  onGoToAdmin,
}: WelcomeScreenProps) {
  // 개발자 모드 진입: 저작권 문구를 5회 연속 클릭
  const [adminClickCount, setAdminClickCount] = useState(0);
  const adminClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // ── 미니 리더보드 패널 ─────────────────────────────────────
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [lbEntries, setLbEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    if (showLeaderboard) {
      setLbEntries(loadLeaderboard());
    }
  }, [showLeaderboard]);

  // 로그인 완료 후 pendingStart가 있으면 자동으로 학습 시작
  useEffect(() => {
    if (pendingStart && currentUser) {
      onClearPendingStart?.();
      onStart();
    }
  }, [pendingStart, currentUser]);

  // 학습 시작 핸들러: 로그인되지 않은 경우 로그인 모달 열기
  const handleStartLearning = () => {
    if (!currentUser) {
      onOpenLogin?.();
    } else {
      onStart();
    }
  };

  // 대화한 역사 인물 수 (localStorage)
  const chattedCount = currentUser
    ? getChattedCharacterCount(currentUser.email || currentUser.name)
    : 0;

  // Use real data from Supabase or fallback to mock data
  const userStats = userProfile ? {
    level: userProfile.level,
    exp: userProfile.exp,
    maxExp: userProfile.maxExp,
    totalCards: 0,
    totalCardsAvailable: 210,
    chattedCount,
    points: userProfile.points
  } : {
    level: 1,
    exp: 0,
    maxExp: 100,
    totalCards: 0,
    totalCardsAvailable: 210,
    chattedCount,
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
                <h1 className="font-bold text-xl bg-gradient-to-r from-[#2563EB] to-[#4F46E5] bg-clip-text text-transparent">
                  {t(lang, 'appTitle')}
                </h1>
                <p className={`text-xs ${darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'}`}>
                  {t(lang, 'appSubtitle')}
                </p>
              </div>
            </motion.div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">

              {/* ── 리더보드 버튼 ── */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLeaderboard(v => !v)}
                className={`relative flex items-center gap-1.5 px-3 py-2.5 rounded-[16px] font-bold text-sm transition-all ${
                  showLeaderboard
                    ? 'text-white'
                    : darkMode
                    ? 'bg-[#1E3A8A]/50 hover:bg-[#1E3A8A]/70 text-[#93C5FD]'
                    : 'bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#B45309]'
                }`}
                style={showLeaderboard ? {
                  background: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
                  boxShadow: '0 4px 14px -4px rgba(245,158,11,0.6)',
                } : {}}
                title={t(lang, 'hallOfFame')}
              >
                <Crown className="w-4 h-4" strokeWidth={2} />
                <span className="hidden sm:inline">{t(lang, 'hallOfFame')}</span>
              </motion.button>

              {/* Language Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onToggleLang}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-[16px] transition-all text-xs font-bold ${
                  darkMode 
                    ? 'bg-[#1E3A8A]/50 hover:bg-[#1E3A8A]/70 text-[#93C5FD]' 
                    : 'bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB]'
                }`}
                title={lang === 'ko' ? 'Switch to English' : '한국어로 전환'}
              >
                <Globe className="w-4 h-4" strokeWidth={2} />
                <span className="hidden sm:inline">{t(lang, 'langToggle')}</span>
              </motion.button>

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
                  className="flex items-center gap-2 font-bold rounded-[16px] text-white transition-all px-5 py-2.5 text-sm"
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
              <div className="grid gap-2 grid-cols-3">
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
                        카드 수집
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

                {/* 대화 인물 수 & Points */}
                <div 
                  className={`rounded-[20px] p-4 backdrop-blur-sm border ${
                    darkMode ? 'bg-[#1E3A8A]/40 border-[#2563EB]/30' : 'bg-white border-[#E5E7EB]'
                  }`}
                  style={{ boxShadow: darkMode ? 'none' : '0 1px 3px 0 rgb(0 0 0 / 0.05)' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-[#7C3AED]" strokeWidth={2} />
                      <span className={`text-xs font-bold ${
                        darkMode ? 'text-white' : 'text-[#1F2937]'
                      }`}>
                        대화 인물 {userStats.chattedCount}명
                      </span>
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

      {/* ── 명예의 전당 슬라이드 패널 ──────────────────────────────── */}
      <AnimatePresence>
        {showLeaderboard && (
          <motion.div
            key="mini-leaderboard"
            initial={{ opacity: 0, y: -16, scaleY: 0.92 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -12, scaleY: 0.94 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className={`sticky top-[72px] z-40 border-b ${
              darkMode
                ? 'bg-[#0F172A]/98 border-[#1E3A8A]/60'
                : 'bg-white/98 border-[#E5E7EB]'
            }`}
            style={{ boxShadow: '0 8px 32px -8px rgba(0,0,0,0.18)', backdropFilter: 'blur(20px)' }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
              {/* 패널 헤더 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, -8, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Crown className="w-5 h-5 text-[#F59E0B]" fill="#F59E0B" strokeWidth={1.5} />
                  </motion.div>
                  <h2 className={`text-sm font-black tracking-wide ${darkMode ? 'text-white' : 'text-[#1F2937]'}`}>
                    🏆 {t(lang, 'hallOfFame')} — {t(lang, 'topRankers')}
                  </h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    darkMode ? 'bg-[#F59E0B]/20 text-[#FCD34D]' : 'bg-[#FEF3C7] text-[#B45309]'
                  }`}>
                    {lang === 'ko' ? '실시간' : 'Live'}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowLeaderboard(false)}
                  className={`p-1.5 rounded-full transition-all ${
                    darkMode ? 'hover:bg-[#1E293B] text-[#64748B]' : 'hover:bg-[#F3F4F6] text-[#9CA3AF]'
                  }`}
                >
                  <X className="w-4 h-4" strokeWidth={2} />
                </motion.button>
              </div>

              {/* 리더보드 목록 */}
              {lbEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 gap-2">
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Trophy className={`w-10 h-10 ${darkMode ? 'text-[#334155]' : 'text-[#D1D5DB]'}`} strokeWidth={1.5} />
                  </motion.div>
                  <p className={`text-sm font-semibold ${darkMode ? 'text-[#475569]' : 'text-[#9CA3AF]'}`}>
                    {t(lang, 'noRankYet')}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-[#334155]' : 'text-[#D1D5DB]'}`}>
                    {t(lang, 'rankTip')}
                  </p>
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-5">
                  {lbEntries.map((entry, idx) => {
                    const rankColors = [
                      { bg: 'linear-gradient(135deg,#F59E0B,#EF4444)', shadow: 'rgba(245,158,11,0.4)', crown: '👑' },
                      { bg: 'linear-gradient(135deg,#94A3B8,#64748B)', shadow: 'rgba(148,163,184,0.4)', crown: '🥈' },
                      { bg: 'linear-gradient(135deg,#CD7F32,#92400E)', shadow: 'rgba(205,127,50,0.4)', crown: '🥉' },
                      { bg: 'linear-gradient(135deg,#6366F1,#8B5CF6)', shadow: 'rgba(99,102,241,0.3)', crown: '4' },
                      { bg: 'linear-gradient(135deg,#10B981,#059669)', shadow: 'rgba(16,185,129,0.3)', crown: '5' },
                    ];
                    const rc = rankColors[idx] ?? rankColors[4];
                    const lc = getLevelColor(entry.level);
                    const expPct = Math.round((getExpInLevel(entry.score) / SCORE_PER_LEVEL) * 100);
                    const isMe = currentUser && (currentUser.name === entry.name || currentUser.email === entry.name);

                    return (
                      <motion.div
                        key={entry.rank}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.06 }}
                        whileHover={{ y: -3, scale: 1.02 }}
                        className={`relative rounded-[18px] overflow-hidden p-0.5 ${isMe ? 'ring-2 ring-[#F59E0B]' : ''}`}
                        style={{ background: rc.bg, boxShadow: `0 6px 20px -6px ${rc.shadow}` }}
                      >
                        <div className={`rounded-[16px] p-3 h-full flex flex-col gap-1.5 ${
                          darkMode ? 'bg-[#0F172A]' : 'bg-white'
                        }`}>
                          {/* 순위 + 이름 */}
                          <div className="flex items-center gap-2">
                            <span className={`text-base leading-none ${idx < 3 ? '' : 'font-black text-xs'}`}
                              style={idx < 3 ? {} : { background: rc.bg, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                            >
                              {idx < 3 ? rc.crown : `${rc.crown}위`}
                            </span>
                            <span className={`text-sm font-black truncate flex-1 ${darkMode ? 'text-white' : 'text-[#1F2937]'}`}>
                              {entry.name}
                              {isMe && <span className="ml-1 text-[#F59E0B] text-xs">★{t(lang, 'me')}</span>}
                            </span>
                          </div>

                          {/* 레벨 배지 */}
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] font-black px-1.5 py-0.5 rounded-full text-white`}
                              style={{ background: rc.bg }}
                            >
                              Lv.{entry.level}
                            </span>
                            <span className={`text-[10px] font-semibold truncate ${lc.text}`}>
                              {getLevelTitle(entry.level)}
                            </span>
                          </div>

                          {/* 점수 */}
                          <div className="flex items-center gap-1">
                            <Flame className="w-3 h-3 text-[#F59E0B]" fill="#F59E0B" strokeWidth={1} />
                            <span className={`text-xs font-black ${darkMode ? 'text-[#FCD34D]' : 'text-[#B45309]'}`}>
                              {entry.score.toLocaleString()}점
                            </span>
                          </div>

                          {/* EXP 바 */}
                          <div className={`h-1 rounded-full overflow-hidden ${darkMode ? 'bg-[#1E293B]' : 'bg-[#F3F4F6]'}`}>
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: rc.bg }}
                              initial={{ width: 0 }}
                              animate={{ width: `${expPct}%` }}
                              transition={{ duration: 0.8, delay: idx * 0.08 + 0.2, ease: 'easeOut' }}
                            />
                          </div>
                          <span className={`text-[9px] text-right ${darkMode ? 'text-[#475569]' : 'text-[#9CA3AF]'}`}>
                            {getExpInLevel(entry.score).toLocaleString()} / {SCORE_PER_LEVEL.toLocaleString()} EXP
                          </span>
                        </div>

                        {/* 1위 왕관 빛 효과 */}
                        {idx === 0 && (
                          <motion.div
                            className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-8 rounded-full pointer-events-none"
                            style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.6) 0%, transparent 70%)' }}
                            animate={{ opacity: [0.6, 1, 0.6] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* 하단 안내 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className={`mt-3 px-3 py-2 rounded-[12px] flex items-center gap-2 ${
                  darkMode ? 'bg-[#1E293B]/60' : 'bg-[#F9FAFB]'
                }`}
              >
                <Star className="w-3.5 h-3.5 text-[#F59E0B]" fill="#F59E0B" strokeWidth={1} />
                <p className={`text-[11px] ${darkMode ? 'text-[#64748B]' : 'text-[#9CA3AF]'}`}>
                  퀴즈 정답 · 역사 인물 대화(+300점)로 점수를 쌓아 TOP 5에 도전하세요!
                  <span className={`ml-1 font-bold ${darkMode ? 'text-[#93C5FD]' : 'text-[#2563EB]'}`}>
                    10,000점마다 레벨 UP 🚀
                  </span>
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {/* Spline 3D Animation */}
              <motion.div 
                className="relative mx-auto mb-8 h-[400px] rounded-[24px] overflow-hidden"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{ boxShadow: 'var(--shadow-2xl)' }}
              >
                <iframe 
                  src="https://my.spline.design/3dtextbluecopy-JuSbMYCCQUXAWrspNiVJU8oP/" 
                  className="w-full h-full border-0"
                  title="3D Text Animation"
                  loading="lazy"
                />
              </motion.div>

              <h2 className="font-bold leading-tight mb-4 text-5xl md:text-6xl">
                <span className="bg-gradient-to-r from-[#2563EB] to-[#4F46E5] bg-clip-text text-transparent">
                  AI와 함께 떠나는
                </span>
                <br />
                <span className={darkMode ? 'text-[#F9FAFB]' : 'text-[#111827]'}>
                  즐거운 한국사 여행! 🚀
                </span>
              </h2>
              <p className={`text-xl md:text-2xl mb-10 ${darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'} max-w-3xl mx-auto`}>
                퀴즈를 풀고 인물 카드를 모으며, 역사 속 위인과 대화해보세요! ✨
              </p>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartLearning}
                className="group relative inline-flex items-center gap-3 font-bold rounded-[20px] text-white overflow-hidden px-12 py-6 text-xl"
                style={{
                  background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)',
                  boxShadow: '0 20px 25px -5px rgb(37 99 235 / 0.2), 0 8px 10px -6px rgb(37 99 235 / 0.2)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#D97706] via-[#DB2777] to-[#4F46E5] opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center gap-3">
                  {currentUser ? t(lang, 'startLearning') : (lang === 'ko' ? '로그인 후 시작하기' : 'Login to Start')}
                  {currentUser ? (
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                  ) : (
                    <LogIn className="w-6 h-6" strokeWidth={2} />
                  )}
                </span>
              </motion.button>

              {/* 로그인 안내 메시지 */}
              {!currentUser && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className={`mt-3 text-sm ${darkMode ? 'text-[#94A3B8]' : 'text-[#9CA3AF]'}`}
                >
                  {lang === 'ko' ? '로그인하면 학습 기록과 카드를 저장할 수 있어요' : 'Login to save your learning records and cards'}
                </motion.p>
              )}

              {/* Floating Emojis */}
              <div className="relative mt-8 h-16">
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
            </motion.div>
          </motion.section>

          {/* Learning Journey Cards */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-20"
          >
            <h3 className={`font-bold mb-6 text-3xl ${darkMode ? 'text-white' : 'text-[#1F2937]'} text-center`}>
              {lang === 'ko' ? '어떻게 학습하나요?' : 'How to Learn?'}
            </h3>
            
            <div className="grid gap-4 md:grid-cols-3">
              {/* Step 1: Quiz */}
              <motion.button
                onClick={handleStartLearning}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`group relative overflow-hidden rounded-[24px] transition-all border ${
                  darkMode ? 'bg-[#1E293B]/80 border-[#2563EB]/20' : 'bg-white border-[#E5E7EB]'
                } p-8 text-left`}
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
                      className="w-16 h-16 rounded-[16px] flex items-center justify-center group-hover:scale-110 transition-transform"
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
                  <h4 className={`font-bold mb-2 text-2xl ${darkMode ? 'text-[#F9FAFB]' : 'text-[#111827]'}`}>
                    {t(lang, 'featureStudy')}
                  </h4>
                  <p className={`text-base ${darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'} mb-4`}>
                    {lang === 'ko' ? '500개 이상의 재미있는 역사 퀴즈를 풀면서 실력을 키워보세요!' : 'Improve your skills with 500+ fun history quizzes!'}
                  </p>
                  <div className={`flex items-center gap-2 ${darkMode ? 'text-[#60A5FA]' : 'text-[#2563EB]'}`}>
                    <span className="text-sm font-bold">{lang === 'ko' ? '퀴즈 시작하기' : 'Start Quiz'}</span>
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
                } p-8 text-left`}
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
                      className="w-16 h-16 rounded-[16px] flex items-center justify-center group-hover:scale-110 transition-transform"
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
                  <h4 className={`font-bold mb-2 text-2xl ${darkMode ? 'text-[#F9FAFB]' : 'text-[#111827]'}`}>
                    {t(lang, 'featureChat')}
                  </h4>
                  <p className={`text-base ${darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'} mb-4`}>
                    {lang === 'ko' ? 'AI 기반 역사 속 위인과 직접 대화하며, 당시 시대를 생생히 느껴보세요!' : 'Chat directly with AI-powered historical figures to experience history vividly!'}
                  </p>
                  <div className={`flex items-center gap-2 ${darkMode ? 'text-[#60A5FA]' : 'text-[#2563EB]'}`}>
                    <span className="text-sm font-bold">{lang === 'ko' ? '대화 시작' : 'Start Chat'}</span>
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
                } p-8 text-left`}
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
                      className="w-16 h-16 rounded-[16px] flex items-center justify-center group-hover:scale-110 transition-transform"
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
                  <h4 className={`font-bold mb-2 text-2xl ${darkMode ? 'text-[#F9FAFB]' : 'text-[#111827]'}`}>
                    {t(lang, 'featureCollection')}
                  </h4>
                  <p className={`text-base ${darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'} mb-4`}>
                    {lang === 'ko' ? '퀴즈를 풀고 대화를 나누며 총 210명의 위인 카드를 모아보세요!' : 'Solve quizzes and chat to collect all 210 historical figure cards!'}
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
                      {lang === 'ko' ? '퀴즈 정답 5개 맞추면 카드 1장, 대화 10번 하면 특별 카드 획득!' : 'Get 1 card per 5 correct answers, special card for 10 chats!'}
                    </p>
                  </div>

                  <div className={`flex items-center gap-2 ${
                    darkMode ? 'text-[#60A5FA]' : 'text-[#2563EB]'
                  }`}>
                    <span className="text-sm font-bold">{lang === 'ko' ? '컬렉션 보기' : 'View Collection'}</span>
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
              <h3 className={`font-bold text-3xl ${darkMode ? 'text-white' : 'text-[#1F2937]'}`}>
                {lang === 'ko' ? '더 많은 학습 도구' : 'More Learning Tools'}
              </h3>
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
            </div>

            <div 
              ref={scrollContainerRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {/* AI Goods Generator */}
              <motion.button
                whileHover={{ y: -4 }}
                onClick={onGoToGoodsGenerator}
                className={`group ${
                  'flex-shrink-0 w-80 snap-center'
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
                    {lang === 'ko' ? 'AI 역사 굿즈 만들기 🎨' : 'AI History Goods Creator 🎨'}
                  </h4>
                  <p className={`text-sm ${
                    darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'
                  }`}>
                    {lang === 'ko' ? '나만의 역사 캐릭터 굿즈를 AI로 직접 만들어 보세요!' : 'Create your own historical character merchandise with AI!'}
                  </p>
                </div>
              </motion.button>

              {/* Museum Tour */}
              <motion.button
                whileHover={{ y: -4 }}
                onClick={() => window.open('https://artsandculture.google.com/streetview/%EA%B5%AD%EB%A6%BD%EC%A4%91%EC%95%99%EB%B0%95%EB%AC%BC%EA%B4%80/bgGbp0dbiyydYw?hl=ko&sv_lng=126.98118893974714&sv_lat=37.52390286881644&sv_h=76&sv_p=0&sv_pid=Ki9KQM__LJebq_uYpYyGBQ&sv_z=1', '_blank')}
                className={`group ${
                  'flex-shrink-0 w-80 snap-center'
                } rounded-[20px] overflow-hidden transition-all ${
                  darkMode ? 'bg-[#1E293B]' : 'bg-white'
                } text-left`}
                style={{ boxShadow: 'var(--shadow-md)' }}
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <ImageWithFallback 
                    src={museumImage}
                    alt="국립중앙박물관 가상투어"
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
                    {lang === 'ko' ? '국립중앙박물관 가상 투어 🏛️' : 'National Museum Virtual Tour 🏛️'}
                  </h4>
                  <p className={`text-sm ${
                    darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'
                  }`}>
                    {lang === 'ko' ? '집에서도 박물관을 직접 방문하는 것처럼 생생하게 둘러보세요!' : 'Experience the museum as if you were visiting it in person, from home!'}
                  </p>
                </div>
              </motion.button>

              {/* Artifact Expert */}
              <motion.button
                whileHover={{ y: -4 }}
                onClick={() => window.open('https://my.heritage.go.kr/main/index.do', '_blank')}
                className={`group ${
                  'flex-shrink-0 w-80 snap-center'
                } rounded-[20px] overflow-hidden transition-all ${
                  darkMode ? 'bg-[#1E293B]' : 'bg-white'
                } text-left`}
                style={{ boxShadow: 'var(--shadow-md)' }}
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <ImageWithFallback 
                    src={artifactImage}
                    alt="문화재청 문화유산 탐방"
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
                    {lang === 'ko' ? '문화재청 문화유산 탐방 🗺️' : 'Cultural Heritage Exploration 🗺️'}
                  </h4>
                  <p className={`text-sm ${
                    darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'
                  }`}>
                    {lang === 'ko' ? '우리나라의 소중한 문화유산을 온라인으로 직접 탐방해 보세요!' : "Explore Korea's precious cultural heritage online!"}
                  </p>
                </div>
              </motion.button>

              {/* History Comics */}
              <motion.button
                whileHover={{ y: -4 }}
                onClick={() => window.open('https://www.youtube.com/watch?v=UEpxN7RPTDU&list=PLYiHEYASbCxI4_Rw4Ict2G0mzNAd4dQd8', '_blank')}
                className={`group ${
                  'flex-shrink-0 w-80 snap-center'
                } rounded-[20px] overflow-hidden transition-all ${
                  darkMode ? 'bg-[#1E293B]' : 'bg-white'
                } text-left`}
                style={{ boxShadow: 'var(--shadow-md)' }}
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <ImageWithFallback 
                    src={comicsImage}
                    alt="한국사 역사 만화"
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
                    {lang === 'ko' ? '한국사 역사 만화 영상 🎬' : 'Korean History Animation Videos 🎬'}
                  </h4>
                  <p className={`text-sm ${
                    darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'
                  }`}>
                    {lang === 'ko' ? '재미있는 애니메이션으로 한국사 핵심 내용을 쉽게 이해해요!' : 'Understand key Korean history content easily through fun animations!'}
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
            className={`mt-16 p-10 rounded-[20px] ${
              darkMode 
                ? 'bg-gradient-to-br from-[#1E293B] to-[#334155]' 
                : 'bg-gradient-to-br from-[#EEF2FF] to-[#FCE7F3]'
            }`}
          >
            <div className="text-center mb-8">
              <h3 className={`font-bold text-3xl ${darkMode ? 'text-white' : 'text-[#1F2937]'} mb-3`}>
                이런 것들을 배울 수 있어요! 🌟
              </h3>
              <p className={`text-base ${darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'}`}>
                초등학교 교과서 내용을 재미있게 게임으로 학습해요
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                '시대별 역사 흐름과 핵심 사건 이해하기',
                '210명의 위인 카드를 모으며 인물 학습하기',
                '500개 이상 퀴즈로 실력 쑥쑥 키우기',
                'AI 위인과 직접 대화하며 역사 체험하기',
                '3D 애니메이션으로 생생한 역사 시각화',
                'AI 굿즈 만들기로 창의력 키우기'
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
                  <span className={`text-base ${darkMode ? 'text-[#F8FAFC]' : 'text-[#1F2937]'} font-medium`}>
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
            <p
              className={`text-sm select-none cursor-default ${darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'}`}
              onClick={() => {
                const next = adminClickCount + 1;
                setAdminClickCount(next);
                if (adminClickTimerRef.current) clearTimeout(adminClickTimerRef.current);
                if (next >= 5) {
                  setAdminClickCount(0);
                  onGoToAdmin?.();
                } else {
                  adminClickTimerRef.current = setTimeout(() => setAdminClickCount(0), 3000);
                }
              }}
            >
              {t(lang, 'footerCopy')}
              {adminClickCount > 0 && adminClickCount < 5 && (
                <span className="ml-2 text-indigo-400 text-xs">({5 - adminClickCount}번 더 클릭)</span>
              )}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
