import { motion } from "motion/react";
import { Award, Lock, Sparkles } from "lucide-react";

export type BadgeTier = 'gold' | 'silver' | 'bronze';

interface BadgeProps {
  name: string;
  description: string;
  tier: BadgeTier;
  unlocked: boolean;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  showAnimation?: boolean;
  onClick?: () => void;
  darkMode?: boolean;
}

const tierColors = {
  gold: {
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
    glow: 'var(--shadow-secondary)',
    bg: '#FEF3C7',
    darkBg: '#78350F',
    text: '#92400E'
  },
  silver: {
    gradient: 'linear-gradient(135deg, #94A3B8 0%, #CBD5E1 100%)',
    glow: '0 4px 20px rgba(148, 163, 184, 0.4)',
    bg: '#F1F5F9',
    darkBg: '#475569',
    text: '#475569'
  },
  bronze: {
    gradient: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
    glow: '0 4px 20px rgba(249, 115, 22, 0.4)',
    bg: '#FFEDD5',
    darkBg: '#7C2D12',
    text: '#7C2D12'
  }
};

export function Badge({ 
  name, 
  description, 
  tier, 
  unlocked, 
  icon: Icon = Award,
  showAnimation = false,
  onClick,
  darkMode = false 
}: BadgeProps) {
  const colors = tierColors[tier];

  return (
    <motion.button
      onClick={onClick}
      disabled={!unlocked}
      className={`relative rounded-[20px] p-4 transition-all ${
        unlocked ? 'cursor-pointer' : 'cursor-not-allowed'
      } ${
        darkMode 
          ? unlocked ? 'bg-[#1E293B]' : 'bg-[#0F172A]'
          : unlocked ? 'bg-white' : 'bg-[#F3F4F6]'
      }`}
      style={{ 
        boxShadow: unlocked ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        opacity: unlocked ? 1 : 0.6
      }}
      whileHover={unlocked ? { scale: 1.05, y: -4 } : {}}
      whileTap={unlocked ? { scale: 0.98 } : {}}
      initial={showAnimation ? { scale: 0, rotate: -180 } : {}}
      animate={showAnimation ? { 
        scale: 1, 
        rotate: 0,
      } : {}}
      transition={{ 
        type: "spring",
        stiffness: 200,
        damping: 15
      }}
    >
      {/* Badge Icon */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          {unlocked ? (
            <>
              <motion.div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: colors.gradient,
                  boxShadow: colors.glow
                }}
                animate={showAnimation ? {
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                } : {}}
                transition={{ duration: 1 }}
              >
                <Icon className="w-8 h-8 text-white" strokeWidth={2} />
              </motion.div>

              {/* Sparkles */}
              {showAnimation && (
                <>
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute top-1/2 left-1/2"
                      initial={{ 
                        scale: 0, 
                        x: 0, 
                        y: 0,
                        opacity: 1
                      }}
                      animate={{ 
                        scale: [0, 1, 0],
                        x: Math.cos((i * 60 * Math.PI) / 180) * 40,
                        y: Math.sin((i * 60 * Math.PI) / 180) * 40,
                        opacity: [1, 1, 0]
                      }}
                      transition={{ 
                        duration: 1,
                        delay: 0.3 + i * 0.05
                      }}
                    >
                      <Sparkles className="w-4 h-4 text-[#F59E0B]" strokeWidth={2} />
                    </motion.div>
                  ))}
                </>
              )}
            </>
          ) : (
            <div 
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                darkMode ? 'bg-[#334155]' : 'bg-[#E5E7EB]'
              }`}
            >
              <Lock className={`w-6 h-6 ${
                darkMode ? 'text-[#64748B]' : 'text-[#9CA3AF]'
              }`} strokeWidth={2} />
            </div>
          )}

          {/* Tier Badge */}
          {unlocked && (
            <motion.div
              className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-xs font-bold"
              style={{
                background: colors.gradient,
                color: 'white',
                boxShadow: 'var(--shadow-sm)'
              }}
              initial={showAnimation ? { scale: 0 } : {}}
              animate={showAnimation ? { scale: 1 } : {}}
              transition={{ delay: 0.8 }}
            >
              {tier === 'gold' ? '🥇' : tier === 'silver' ? '🥈' : '🥉'}
            </motion.div>
          )}
        </div>

        {/* Badge Info */}
        <div className="text-center">
          <h4 className={`font-bold text-sm mb-1 ${
            unlocked 
              ? darkMode ? 'text-white' : 'text-[#1F2937]'
              : darkMode ? 'text-[#64748B]' : 'text-[#9CA3AF]'
          }`}>
            {name}
          </h4>
          <p className={`text-xs ${
            unlocked
              ? darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'
              : darkMode ? 'text-[#64748B]' : 'text-[#9CA3AF]'
          }`}>
            {unlocked ? description : '???'}
          </p>
        </div>
      </div>

      {/* Glow Effect for Animation */}
      {showAnimation && unlocked && (
        <motion.div
          className="absolute inset-0 rounded-[20px] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0.9, 1.1, 0.9]
          }}
          transition={{ 
            duration: 1.5,
            repeat: 2
          }}
          style={{
            background: colors.gradient,
            filter: 'blur(20px)',
            zIndex: -1
          }}
        />
      )}
    </motion.button>
  );
}
