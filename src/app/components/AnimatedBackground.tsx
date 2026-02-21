import { motion } from "motion/react";

interface AnimatedBackgroundProps {
  darkMode?: boolean;
}

export function AnimatedBackground({ darkMode = false }: AnimatedBackgroundProps) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradient Background */}
      <div className={`absolute inset-0 transition-colors duration-500 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900' 
          : 'bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50'
      }`} />
      
      {/* Animated Floating Elements */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${
            darkMode ? 'opacity-10' : 'opacity-20'
          }`}
          style={{
            width: Math.random() * 100 + 50,
            height: Math.random() * 100 + 50,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: darkMode
              ? `linear-gradient(135deg, 
                  ${['#6366F1', '#EC4899', '#3B82F6', '#A855F7'][Math.floor(Math.random() * 4)]}, 
                  ${['#4F46E5', '#DB2777', '#2563EB', '#9333EA'][Math.floor(Math.random() * 4)]})`
              : `linear-gradient(135deg, 
                  ${['#E9D5FF', '#FBCFE8', '#BFDBFE', '#FED7AA'][Math.floor(Math.random() * 4)]}, 
                  ${['#DDD6FE', '#F9A8D4', '#93C5FD', '#FDBA74'][Math.floor(Math.random() * 4)]})`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Subtle Grid Pattern */}
      <div className={`absolute inset-0 ${
        darkMode
          ? 'bg-[linear-gradient(rgba(139,92,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.02)_1px,transparent_1px)]'
          : 'bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)]'
      } bg-[size:50px_50px]`} />
    </div>
  );
}
