import { motion } from "motion/react";
import { ArrowLeft, Award, Trophy, Medal, Target, Zap, Star, BookOpen, Users, Flame } from "lucide-react";
import { Badge, BadgeTier } from "./Badge";
import { useState } from "react";

interface BadgeData {
  id: string;
  name: string;
  description: string;
  tier: BadgeTier;
  unlocked: boolean;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  category: string;
}

interface BadgeCollectionProps {
  onBack: () => void;
  darkMode?: boolean;
  viewMode?: 'desktop' | 'tablet' | 'mobile';
}

export function BadgeCollection({ 
  onBack, 
  darkMode = false,
  viewMode = 'desktop'
}: BadgeCollectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Mock badge data
  const badges: BadgeData[] = [
    {
      id: 'first-quiz',
      name: '첫 걸음',
      description: '첫 퀴즈 완료',
      tier: 'bronze',
      unlocked: true,
      icon: BookOpen,
      category: 'quiz'
    },
    {
      id: 'quiz-master',
      name: '퀴즈 마스터',
      description: '100개 퀴즈 완료',
      tier: 'gold',
      unlocked: true,
      icon: Trophy,
      category: 'quiz'
    },
    {
      id: 'perfect-score',
      name: '완벽한 점수',
      description: '만점 달성',
      tier: 'gold',
      unlocked: false,
      icon: Star,
      category: 'achievement'
    },
    {
      id: 'speed-demon',
      name: '스피드 러너',
      description: '10초 안에 정답',
      tier: 'silver',
      unlocked: true,
      icon: Zap,
      category: 'achievement'
    },
    {
      id: 'streak-5',
      name: '연속 5일',
      description: '5일 연속 학습',
      tier: 'bronze',
      unlocked: true,
      icon: Flame,
      category: 'streak'
    },
    {
      id: 'streak-30',
      name: '한달 챌린지',
      description: '30일 연속 학습',
      tier: 'gold',
      unlocked: false,
      icon: Flame,
      category: 'streak'
    },
    {
      id: 'card-collector',
      name: '카드 수집가',
      description: '50개 인물 카드 수집',
      tier: 'silver',
      unlocked: true,
      icon: Users,
      category: 'collection'
    },
    {
      id: 'history-expert',
      name: '역사 전문가',
      description: '모든 시대 완료',
      tier: 'gold',
      unlocked: false,
      icon: Medal,
      category: 'achievement'
    },
    {
      id: 'chat-master',
      name: '대화의 달인',
      description: '10명과 대화 완료',
      tier: 'silver',
      unlocked: false,
      icon: Users,
      category: 'chat'
    }
  ];

  const categories = [
    { id: 'all', name: '전체', icon: Award },
    { id: 'quiz', name: '퀴즈', icon: BookOpen },
    { id: 'achievement', name: '성취', icon: Trophy },
    { id: 'streak', name: '연속', icon: Flame },
    { id: 'collection', name: '수집', icon: Users }
  ];

  const filteredBadges = selectedCategory === 'all' 
    ? badges 
    : badges.filter(b => b.category === selectedCategory);

  const stats = {
    total: badges.length,
    unlocked: badges.filter(b => b.unlocked).length,
    gold: badges.filter(b => b.tier === 'gold' && b.unlocked).length,
    silver: badges.filter(b => b.tier === 'silver' && b.unlocked).length,
    bronze: badges.filter(b => b.tier === 'bronze' && b.unlocked).length
  };

  return (
    <div 
      className={`min-h-screen transition-colors duration-300 ${
        viewMode === 'mobile' ? 'p-4 py-6' : 'p-6 lg:p-12'
      } ${
        darkMode ? 'bg-[#0F172A]' : 'bg-[#FEF7FF]'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`flex items-center justify-between ${
          viewMode === 'mobile' ? 'mb-6' : 'mb-10'
        }`}>
          <motion.button
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className={`flex items-center gap-2 font-bold rounded-[20px] transition-all ${
              viewMode === 'mobile' ? 'px-4 py-2.5 text-sm' : 'px-6 py-3 text-base'
            } ${
              darkMode 
                ? 'bg-[#1E293B] hover:bg-[#334155] text-white' 
                : 'bg-white hover:bg-[#F9FAFB] text-[#1F2937]'
            }`}
            style={{ boxShadow: 'var(--shadow-md)' }}
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            <span>뒤로가기</span>
          </motion.button>
        </div>

        {/* Title & Stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-center ${viewMode === 'mobile' ? 'mb-6' : 'mb-10'}`}
        >
          <h2 className={`font-bold leading-tight mb-3 ${
            viewMode === 'mobile' ? 'text-2xl' : 'text-4xl md:text-5xl'
          }`}>
            <span className="bg-gradient-to-r from-[#F59E0B] via-[#EC4899] to-[#6366F1] bg-clip-text text-transparent">
              배지 컬렉션 🏆
            </span>
          </h2>
          <p className={`${
            viewMode === 'mobile' ? 'text-sm mb-4' : 'text-lg mb-6'
          } ${darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'}`}>
            획득한 배지: {stats.unlocked} / {stats.total}
          </p>

          {/* Stats Cards */}
          <div className={`grid gap-3 max-w-2xl mx-auto ${
            viewMode === 'mobile' ? 'grid-cols-2' : 'grid-cols-4'
          }`}>
            <div 
              className={`p-4 rounded-[16px] ${
                darkMode ? 'bg-[#1E293B]' : 'bg-white'
              }`}
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="text-3xl mb-1">🥇</div>
              <div className={`text-2xl font-bold ${
                darkMode ? 'text-white' : 'text-[#1F2937]'
              }`}>
                {stats.gold}
              </div>
              <div className={`text-xs ${
                darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'
              }`}>
                골드
              </div>
            </div>

            <div 
              className={`p-4 rounded-[16px] ${
                darkMode ? 'bg-[#1E293B]' : 'bg-white'
              }`}
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="text-3xl mb-1">🥈</div>
              <div className={`text-2xl font-bold ${
                darkMode ? 'text-white' : 'text-[#1F2937]'
              }`}>
                {stats.silver}
              </div>
              <div className={`text-xs ${
                darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'
              }`}>
                실버
              </div>
            </div>

            <div 
              className={`p-4 rounded-[16px] ${
                darkMode ? 'bg-[#1E293B]' : 'bg-white'
              }`}
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="text-3xl mb-1">🥉</div>
              <div className={`text-2xl font-bold ${
                darkMode ? 'text-white' : 'text-[#1F2937]'
              }`}>
                {stats.bronze}
              </div>
              <div className={`text-xs ${
                darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'
              }`}>
                브론즈
              </div>
            </div>

            <div 
              className={`p-4 rounded-[16px] ${
                darkMode ? 'bg-[#1E293B]' : 'bg-white'
              }`}
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="text-3xl mb-1">📊</div>
              <div className={`text-2xl font-bold ${
                darkMode ? 'text-white' : 'text-[#1F2937]'
              }`}>
                {Math.round((stats.unlocked / stats.total) * 100)}%
              </div>
              <div className={`text-xs ${
                darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'
              }`}>
                달성률
              </div>
            </div>
          </div>
        </motion.div>

        {/* Category Filter */}
        <div className={`flex gap-2 justify-center mb-8 ${
          viewMode === 'mobile' ? 'flex-wrap' : ''
        }`}>
          {categories.map((category, index) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-[12px] font-bold transition-all ${
                selectedCategory === category.id
                  ? darkMode
                    ? 'bg-[#6366F1] text-white'
                    : 'bg-[#6366F1] text-white'
                  : darkMode
                    ? 'bg-[#1E293B] text-[#CBD5E1] hover:bg-[#334155]'
                    : 'bg-white text-[#6B7280] hover:bg-[#F9FAFB]'
              } ${viewMode === 'mobile' ? 'text-sm' : 'text-base'}`}
              style={{ 
                boxShadow: selectedCategory === category.id 
                  ? 'var(--shadow-primary)' 
                  : 'var(--shadow-sm)' 
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <category.icon className="w-4 h-4" strokeWidth={2} />
              <span>{category.name}</span>
            </motion.button>
          ))}
        </div>

        {/* Badge Grid */}
        <motion.div
          layout
          className={`grid gap-4 ${
            viewMode === 'mobile' 
              ? 'grid-cols-2'
              : viewMode === 'tablet'
                ? 'grid-cols-3'
                : 'grid-cols-4 lg:grid-cols-5'
          }`}
        >
          {filteredBadges.map((badge, index) => (
            <motion.div
              key={badge.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Badge
                name={badge.name}
                description={badge.description}
                tier={badge.tier}
                unlocked={badge.unlocked}
                icon={badge.icon}
                darkMode={darkMode}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredBadges.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Award className={`w-16 h-16 mx-auto mb-4 ${
              darkMode ? 'text-[#475569]' : 'text-[#D1D5DB]'
            }`} strokeWidth={2} />
            <p className={`text-lg ${
              darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'
            }`}>
              이 카테고리에 배지가 없습니다
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
