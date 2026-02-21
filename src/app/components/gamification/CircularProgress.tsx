import { motion } from "motion/react";
import { Check } from "lucide-react";

interface CircularProgressProps {
  current: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  darkMode?: boolean;
  color?: string;
}

export function CircularProgress({ 
  current, 
  total, 
  size = 50,
  strokeWidth = 4,
  showLabel = true,
  darkMode = false,
  color = '#6366F1'
}: CircularProgressProps) {
  const percentage = Math.min((current / total) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  const isComplete = current >= total;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={darkMode ? '#334155' : '#E5E7EB'}
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress Circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isComplete ? '#10B981' : color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            filter: `drop-shadow(0 0 4px ${isComplete ? '#10B981' : color}40)`
          }}
        />
      </svg>

      {/* Center Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {isComplete ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 500,
              damping: 15,
              delay: 0.8
            }}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-[#10B981]"
            style={{ boxShadow: 'var(--shadow-success)' }}
          >
            <Check className="w-5 h-5 text-white" strokeWidth={3} />
          </motion.div>
        ) : showLabel ? (
          <div className="text-center">
            <motion.div
              key={current}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`font-bold ${
                size <= 40 ? 'text-xs' : size <= 60 ? 'text-sm' : 'text-base'
              } ${darkMode ? 'text-white' : 'text-[#1F2937]'}`}
            >
              {current}
            </motion.div>
            <div className={`${
              size <= 40 ? 'text-[10px]' : 'text-xs'
            } ${darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'}`}>
              /{total}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
