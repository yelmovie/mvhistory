import { motion } from "motion/react";
import { Monitor, Tablet, Smartphone } from "lucide-react";

interface ViewModeIndicatorProps {
  viewMode: 'desktop' | 'tablet' | 'mobile';
  darkMode?: boolean;
}

export function ViewModeIndicator({ viewMode, darkMode = false }: ViewModeIndicatorProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`px-4 py-2 rounded-full shadow-lg ${
          darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-700'
        } border ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        } flex items-center gap-2`}
      >
        {viewMode === 'desktop' && <Monitor className="w-4 h-4" />}
        {viewMode === 'tablet' && <Tablet className="w-4 h-4" />}
        {viewMode === 'mobile' && <Smartphone className="w-4 h-4" />}
        <span className="text-sm font-medium">
          {viewMode === 'desktop' && '데스크톱'}
          {viewMode === 'tablet' && '태블릿'}
          {viewMode === 'mobile' && '모바일'}
        </span>
        <span className="text-xs text-gray-500">
          {viewMode === 'desktop' && '(Full)'}
          {viewMode === 'tablet' && '(768px)'}
          {viewMode === 'mobile' && '(375px)'}
        </span>
      </motion.div>
    </div>
  );
}
