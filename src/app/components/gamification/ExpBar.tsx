import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

interface ExpBarProps {
  currentExp: number;
  maxExp: number;
  showLabel?: boolean;
  animated?: boolean;
  size?: 'small' | 'medium' | 'large';
  darkMode?: boolean;
}

export function ExpBar({ 
  currentExp, 
  maxExp, 
  showLabel = true,
  animated = true,
  size = 'medium',
  darkMode = false 
}: ExpBarProps) {
  const percentage = Math.min((currentExp / maxExp) * 100, 100);
  
  const sizeClasses = {
    small: 'h-1.5',
    medium: 'h-2.5',
    large: 'h-3'
  };

  const labelSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className={`flex items-center justify-between mb-2 ${labelSizes[size]}`}>
          <div className={`flex items-center gap-1.5 font-bold ${
            darkMode ? 'text-white' : 'text-[#1F2937]'
          }`}>
            <Sparkles className="w-4 h-4 text-[#6366F1]" strokeWidth={2} />
            <span>경험치</span>
          </div>
          <span className={`font-bold ${
            darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'
          }`}>
            {currentExp.toLocaleString()} / {maxExp.toLocaleString()} XP
          </span>
        </div>
      )}
      
      <div className="relative">
        {/* Background */}
        <div 
          className={`w-full ${sizeClasses[size]} rounded-full overflow-hidden ${
            darkMode ? 'bg-[#334155]' : 'bg-[#E5E7EB]'
          }`}
          style={{ boxShadow: 'var(--shadow-inner)' }}
        >
          {/* Progress Bar */}
          <motion.div
            className={`${sizeClasses[size]} rounded-full relative overflow-hidden`}
            style={{
              background: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
              boxShadow: '0 0 10px rgba(99, 102, 241, 0.5)'
            }}
            initial={{ width: 0 }}
            animate={{ width: animated ? `${percentage}%` : `${percentage}%` }}
            transition={{ 
              duration: animated ? 1.5 : 0, 
              ease: "easeOut",
              delay: 0.2
            }}
          >
            {/* Shimmer Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ['-100%', '200%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </motion.div>
        </div>

        {/* Sparkles at the end */}
        {percentage > 5 && (
          <motion.div
            className="absolute top-1/2 -translate-y-1/2"
            style={{ left: `${percentage}%` }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Sparkles className="w-4 h-4 text-[#EC4899] -ml-2" strokeWidth={2} />
          </motion.div>
        )}
      </div>

      {/* Level Up Indicator */}
      {percentage >= 100 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-2 text-center ${labelSizes[size]} font-bold text-[#10B981]`}
        >
          🎉 레벨업 준비 완료!
        </motion.div>
      )}
    </div>
  );
}
