import { motion } from "motion/react";
import { Crown, Zap } from "lucide-react";

interface LevelIndicatorProps {
  level: number;
  userName?: string;
  showAnimation?: boolean;
  size?: 'small' | 'medium' | 'large';
  darkMode?: boolean;
}

export function LevelIndicator({ 
  level, 
  userName = "학습자",
  showAnimation = false,
  size = 'medium',
  darkMode = false 
}: LevelIndicatorProps) {
  const sizeClasses = {
    small: {
      container: 'gap-2',
      avatar: 'w-8 h-8 text-xs',
      text: 'text-xs',
      icon: 'w-3 h-3'
    },
    medium: {
      container: 'gap-2.5',
      avatar: 'w-10 h-10 text-sm',
      text: 'text-sm',
      icon: 'w-3.5 h-3.5'
    },
    large: {
      container: 'gap-3',
      avatar: 'w-12 h-12 text-base',
      text: 'text-base',
      icon: 'w-4 h-4'
    }
  };

  const classes = sizeClasses[size];

  return (
    <motion.div
      className={`inline-flex items-center ${classes.container}`}
      animate={showAnimation ? {
        scale: [1, 1.1, 1],
      } : {}}
      transition={{ duration: 0.5 }}
    >
      {/* Avatar with Level */}
      <div className="relative">
        <motion.div
          className={`${classes.avatar} rounded-full flex items-center justify-center font-bold text-white`}
          style={{
            background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
            boxShadow: 'var(--shadow-primary)'
          }}
          animate={showAnimation ? {
            rotate: [0, 360]
          } : {}}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {userName.charAt(0).toUpperCase()}
        </motion.div>
        
        {/* Level Badge */}
        <motion.div
          className={`absolute -bottom-1 -right-1 rounded-full flex items-center justify-center font-bold text-white ${
            size === 'small' ? 'w-5 h-5 text-xs' : size === 'large' ? 'w-7 h-7 text-sm' : 'w-6 h-6 text-xs'
          }`}
          style={{
            background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
            boxShadow: 'var(--shadow-sm)',
            border: darkMode ? '2px solid #1E293B' : '2px solid white'
          }}
          animate={showAnimation ? {
            scale: [0, 1.2, 1],
          } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {level}
        </motion.div>

        {/* Crown for high levels */}
        {level >= 10 && (
          <motion.div
            className="absolute -top-2 -right-2"
            animate={{
              rotate: [-10, 10, -10],
              y: [0, -2, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Crown className={`${classes.icon} text-[#F59E0B] fill-[#F59E0B]`} strokeWidth={2} />
          </motion.div>
        )}
      </div>

      {/* Level Info */}
      <div>
        <div className={`flex items-center gap-1 ${classes.text} font-bold ${
          darkMode ? 'text-white' : 'text-[#1F2937]'
        }`}>
          <Zap className={`${classes.icon} text-[#F59E0B] fill-[#F59E0B]`} strokeWidth={2} />
          <span>레벨 {level}</span>
        </div>
        {size !== 'small' && (
          <p className={`text-xs ${darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'}`}>
            {userName}
          </p>
        )}
      </div>
    </motion.div>
  );
}
