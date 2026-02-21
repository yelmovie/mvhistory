import { Monitor, Tablet, Smartphone } from "lucide-react";

interface ViewModeToggleProps {
  viewMode: 'desktop' | 'tablet' | 'mobile';
  onViewModeChange: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  darkMode?: boolean;
}

export function ViewModeToggle({ viewMode, onViewModeChange, darkMode = false }: ViewModeToggleProps) {
  return (
    <div className={`flex items-center gap-1 p-1 rounded-lg ${
      darkMode ? 'bg-gray-800' : 'bg-gray-100'
    }`}>
      <button
        onClick={() => onViewModeChange('desktop')}
        className={`p-2 rounded-md transition-all ${
          viewMode === 'desktop'
            ? darkMode 
              ? 'bg-blue-600 text-white' 
              : 'bg-blue-500 text-white'
            : darkMode
              ? 'text-gray-400 hover:text-gray-200'
              : 'text-gray-600 hover:text-gray-900'
        }`}
        title="데스크톱"
      >
        <Monitor className="w-4 h-4" />
      </button>
      <button
        onClick={() => onViewModeChange('tablet')}
        className={`p-2 rounded-md transition-all ${
          viewMode === 'tablet'
            ? darkMode 
              ? 'bg-blue-600 text-white' 
              : 'bg-blue-500 text-white'
            : darkMode
              ? 'text-gray-400 hover:text-gray-200'
              : 'text-gray-600 hover:text-gray-900'
        }`}
        title="태블릿"
      >
        <Tablet className="w-4 h-4" />
      </button>
      <button
        onClick={() => onViewModeChange('mobile')}
        className={`p-2 rounded-md transition-all ${
          viewMode === 'mobile'
            ? darkMode 
              ? 'bg-blue-600 text-white' 
              : 'bg-blue-500 text-white'
            : darkMode
              ? 'text-gray-400 hover:text-gray-200'
              : 'text-gray-600 hover:text-gray-900'
        }`}
        title="모바일"
      >
        <Smartphone className="w-4 h-4" />
      </button>
    </div>
  );
}
