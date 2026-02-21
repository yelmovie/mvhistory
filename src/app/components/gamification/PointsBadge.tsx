import { motion } from "motion/react";
import { Star, Sparkles } from "lucide-react";

interface PointsBadgeProps {
  points: number;
  showAnimation?: boolean;
  size?: 'small' | 'medium' | 'large';
  darkMode?: boolean;
}

export function PointsBadge({ 
  points, 
  showAnimation = false, 
  size = 'medium',
  darkMode = false 
}: PointsBadgeProps) {
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm gap-1.5',
    medium: 'px-4 py-2 text-base gap-2',
    large: 'px-5 py-2.5 text-lg gap-2.5'
  };

  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  return (
    <motion.div
      className={`inline-flex items-center font-bold rounded-full ${sizeClasses[size]} ${
        darkMode 
          ? 'bg-gradient-to-r from-[#F59E0B] to-[#F97316] text-white'
          : 'bg-gradient-to-r from-[#F59E0B] to-[#F97316] text-white'
      }`}
      style={{ boxShadow: 'var(--shadow-secondary)' }}
      animate={showAnimation ? {
        scale: [1, 1.2, 1],
        rotate: [0, 10, -10, 0]
      } : {}}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Star className={`${iconSizes[size]} fill-current`} strokeWidth={2} />
      <motion.span
        key={points}
        initial={showAnimation ? { scale: 1.5, opacity: 0 } : {}}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {points.toLocaleString()}
      </motion.span>
      {showAnimation && (
        <motion.div
          className="absolute"
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Sparkles className={iconSizes[size]} strokeWidth={2} />
        </motion.div>
      )}
    </motion.div>
  );
}
