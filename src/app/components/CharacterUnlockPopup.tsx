import { motion, AnimatePresence } from "motion/react";
import { X, Star, Sparkles, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import type { Character } from "../data/quizData";
import { getOrGenerateCharacterImage, getCachedImage } from "../utils/aiImageGenerator";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface CharacterUnlockPopupProps {
  isOpen: boolean;
  character: Character | null;
  onClose: () => void;
  darkMode?: boolean;
  reason?: 'quiz' | 'chat';
}

export function CharacterUnlockPopup({ 
  isOpen, 
  character, 
  onClose, 
  darkMode = false,
  reason = 'quiz'
}: CharacterUnlockPopupProps) {
  const [characterImage, setCharacterImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageStatus, setImageStatus] = useState<string>('');
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && character) {
      loadCharacterImage();
    }
  }, [isOpen, character]);

  const loadCharacterImage = async () => {
    if (!character) return;

    // 먼저 캐시 확인
    const cached = getCachedImage(character.id);
    if (cached) {
      setCharacterImage(cached);
      return;
    }

    // 캐시에 없으면 생성
    setImageLoading(true);
    setImageError(null);

    try {
      const imageUrl = await getOrGenerateCharacterImage(
        character.id,
        character.name,
        character.period,
        character.role,
        (status) => setImageStatus(status)
      );
      setCharacterImage(imageUrl);
    } catch (error) {
      console.error('Failed to load character image:', error);
      setImageError(error instanceof Error ? error.message : '이미지를 불러올 수 없습니다');
    } finally {
      setImageLoading(false);
    }
  };

  if (!character) return null;

  const reasonText = reason === 'quiz' 
    ? '퀴즈 5개 이상 정답!' 
    : '인물과 10턴 이상 대화 완료!';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Popup Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className={`relative max-w-md w-full rounded-3xl overflow-hidden shadow-2xl ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            {/* Sparkle Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{ 
                    opacity: 0, 
                    scale: 0,
                    x: Math.random() * 400 - 200,
                    y: Math.random() * 600 - 300
                  }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    y: [0, -100]
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                >
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                </motion.div>
              ))}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className={`absolute top-4 right-4 z-10 p-2 rounded-full transition-colors ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="relative p-8 text-center">
              {/* Success Badge */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white mb-6"
              >
                <Star className="w-5 h-5 fill-current" />
                <span className="font-bold">카드 획득!</span>
                <Star className="w-5 h-5 fill-current" />
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`text-3xl font-bold mb-2 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                축하합니다! 🎉
              </motion.h2>

              {/* Reason */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className={`text-sm mb-6 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {reasonText}
              </motion.p>

              {/* Character Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className={`relative p-6 rounded-2xl mb-6 ${ 
                  darkMode 
                    ? 'bg-gradient-to-br from-purple-900/50 to-blue-900/50 border border-purple-700' 
                    : 'bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200'
                }`}
              >
                {/* Character Image or Loading */}
                <div className="mb-4">
                  {imageLoading ? (
                    <div className="flex flex-col items-center justify-center h-48">
                      <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-3" />
                      <p className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {imageStatus || 'AI로 초상화 생성 중...'}
                      </p>
                    </div>
                  ) : characterImage ? (
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                      <ImageWithFallback
                        src={characterImage}
                        alt={character.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : imageError ? (
                    <div className="flex flex-col items-center justify-center h-48">
                      <div className="text-6xl mb-3">{character.emoji || '👤'}</div>
                      <p className="text-xs text-red-500">{imageError}</p>
                    </div>
                  ) : (
                    <div className="text-6xl">
                      {character.emoji || '👤'}
                    </div>
                  )}
                </div>

                {/* Character Name */}
                <h3 className={`text-2xl font-bold mb-2 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {character.name}
                </h3>

                {/* Character Info */}
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  darkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700'
                }`}>
                  <span>{character.period}</span>
                  <span>•</span>
                  <span>{character.role}</span>
                </div>

                {/* Achievement Badge */}
                <div className="mt-4 pt-4 border-t border-current/10">
                  <p className={`text-sm ${
                    darkMode ? 'text-purple-300' : 'text-purple-700'
                  }`}>
                    이제 {character.name}와(과) 대화할 수 있어요!
                  </p>
                </div>
              </motion.div>

              {/* Action Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                onClick={onClose}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                확인
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
