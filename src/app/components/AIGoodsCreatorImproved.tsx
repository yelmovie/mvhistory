import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, Sparkles, Wand2, Download, Loader2, 
  ShoppingBag, Coffee, Shirt, Home, Send, Image as ImageIcon,
  Palette, Zap, Star
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface AIGoodsCreatorImprovedProps {
  onBack: () => void;
  onHome?: () => void;
  darkMode?: boolean;
}

interface GeneratedGoods {
  id: string;
  description: string;
  imageUrl: string;
  timestamp: Date;
}

type GoodsType = 'ecobag' | 'mug' | 'tshirt';

export function AIGoodsCreatorImproved({ 
  onBack, 
  onHome, 
  darkMode = false
}: AIGoodsCreatorImprovedProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedGoodsType, setSelectedGoodsType] = useState<GoodsType>('tshirt');
  const [generationProgress, setGenerationProgress] = useState(0);

  // Example prompts/tags
  const exampleTags = [
    { icon: "👑", text: "이순신 장군 디자인" },
    { icon: "🏯", text: "경복궁 일러스트" },
    { icon: "🎨", text: "한복 입은 세종대왕" },
    { icon: "⚔️", text: "삼국시대 전사" },
    { icon: "🌸", text: "조선 꽃무늬" },
    { icon: "🐉", text: "고려 청자 문양" },
    { icon: "📜", text: "훈민정음 서체" },
    { icon: "🗺", text: "한반도 지도" }
  ];

  const goodsTypes = [
    { 
      id: 'tshirt' as GoodsType, 
      icon: Shirt, 
      name: '티셔츠',
      color: '#6366F1',
      gradient: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'
    },
    { 
      id: 'mug' as GoodsType, 
      icon: Coffee, 
      name: '머그컵',
      color: '#F59E0B',
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)'
    },
    { 
      id: 'ecobag' as GoodsType, 
      icon: ShoppingBag, 
      name: '에코백',
      color: '#10B981',
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
    }
  ];

  const handleTagClick = (text: string) => {
    setPrompt(prev => {
      if (prev.trim()) {
        return `${prev}, ${text}`;
      }
      return text;
    });
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setGenerationProgress(0);
    setGeneratedImage(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    // TODO: OpenAI DALL-E API integration
    // For now, simulate with a delay
    setTimeout(async () => {
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      // Mock generated image
      const mockImages = [
        'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800',
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
        'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800'
      ];
      const randomImage = mockImages[Math.floor(Math.random() * mockImages.length)];
      
      setGeneratedImage(randomImage);
      setIsGenerating(false);
    }, 3000);
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    
    // Create download link
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `history-goods-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`min-h-screen transition-colors relative overflow-hidden ${
      darkMode ? 'bg-[#0F172A]' : 'bg-[#FEF7FF]'
    } p-6 lg:p-8`}>
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -left-40 w-80 h-80 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #6366F1 0%, transparent 70%)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #EC4899 0%, transparent 70%)'
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #F59E0B 0%, transparent 70%)'
          }}
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -180, -360]
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Navigation */}
          <div className="flex items-center gap-2 mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className={`p-3 rounded-[16px] transition-colors ${
                darkMode 
                  ? 'bg-[#1E293B] hover:bg-[#334155] text-white' 
                  : 'bg-white hover:bg-[#F9FAFB] text-[#1F2937]'
              }`}
              style={{ boxShadow: 'var(--shadow-md)' }}
            >
              <ArrowLeft className="w-6 h-6" strokeWidth={2} />
            </motion.button>

            {onHome && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onHome}
                className="p-3 rounded-[16px] transition-all text-white"
                style={{
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                  boxShadow: 'var(--shadow-primary)'
                }}
              >
                <Home className="w-6 h-6" strokeWidth={2} />
              </motion.button>
            )}
          </div>

          {/* Title Section */}
          <div className={`${
            darkMode ? 'bg-[#1E293B]' : 'bg-white'
          } rounded-[24px] p-6 sm:p-8 relative overflow-hidden`}
            style={{ boxShadow: 'var(--shadow-lg)' }}
          >
            {/* Sparkle Decorations */}
            <motion.div
              className="absolute top-4 right-4"
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="w-8 h-8 text-[#F59E0B]" fill="#F59E0B" strokeWidth={2} />
            </motion.div>
            
            <motion.div
              className="absolute bottom-4 left-4"
              animate={{
                rotate: [360, 0],
                scale: [1.2, 1, 1.2]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Palette className="w-8 h-8 text-[#EC4899]" strokeWidth={2} />
            </motion.div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                >
                  <Wand2 className={`w-10 h-10 ${
                    darkMode ? 'text-[#A5B4FC]' : 'text-[#6366F1]'
                  }`} strokeWidth={2} />
                </motion.div>
                <h1 className={`text-3xl lg:text-4xl font-black ${
                  darkMode ? 'text-white' : 'text-[#1F2937]'
                }`}>
                  AI 역사 굿즈 만들기
                </h1>
              </div>
              <p className={`text-base lg:text-lg ${
                darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'
              }`}>
                AI로 나만의 특별한 역사 굿즈를 만들어 보세요! 🎨
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Goods Type Selection */}
            <div className={`${
              darkMode ? 'bg-[#1E293B]' : 'bg-white'
            } rounded-[20px] p-6 mb-6`}
              style={{ boxShadow: 'var(--shadow-md)' }}
            >
              <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                darkMode ? 'text-white' : 'text-[#1F2937]'
              }`}>
                <Star className="w-5 h-5 text-[#F59E0B]" fill="#F59E0B" strokeWidth={2} />
                굿즈 종류 선택
              </h3>
              
              <div className="grid grid-cols-3 gap-3">
                {goodsTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedGoodsType === type.id;
                  
                  return (
                    <motion.button
                      key={type.id}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedGoodsType(type.id)}
                      className={`p-4 rounded-[16px] transition-all flex flex-col items-center gap-2 ${
                        isSelected
                          ? 'text-white'
                          : darkMode
                            ? 'bg-[#334155] hover:bg-[#475569] text-white'
                            : 'bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#1F2937]'
                      }`}
                      style={isSelected ? {
                        background: type.gradient,
                        boxShadow: `0 8px 24px -8px ${type.color}60`
                      } : {}}
                    >
                      <Icon className="w-8 h-8" strokeWidth={2} />
                      <span className="text-sm font-bold">{type.name}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Input Area */}
            <div className={`${
              darkMode ? 'bg-[#1E293B]' : 'bg-white'
            } rounded-[20px] p-6`}
              style={{ boxShadow: 'var(--shadow-md)' }}
            >
              <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                darkMode ? 'text-white' : 'text-[#1F2937]'
              }`}>
                <Zap className="w-5 h-5 text-[#EC4899]" strokeWidth={2} />
                디자인 프롬프트 입력
              </h3>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="원하는 굿즈 디자인을 설명해 주세요 예: 이순신 장군이 배 위에서 용감한 모습"
                className={`w-full h-32 px-4 py-3 rounded-[16px] border-2 text-base resize-none transition-all ${
                  darkMode
                    ? 'bg-[#334155] border-[#475569] text-white placeholder-[#94A3B8] focus:border-[#6366F1]'
                    : 'bg-white border-[#D1D5DB] text-[#1F2937] placeholder-[#9CA3AF] focus:border-[#6366F1]'
                } focus:outline-none`}
                style={{ boxShadow: 'var(--shadow-sm)' }}
              />

              {/* Example Tags */}
              <div className="mt-4">
                <p className={`text-sm font-bold mb-3 ${
                  darkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'
                }`}>
                  예시 태그 클릭하기 (클릭해서 추가)
                </p>
                <div className="flex flex-wrap gap-2">
                  {exampleTags.map((tag, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleTagClick(tag.text)}
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                        darkMode
                          ? 'bg-[#334155] hover:bg-[#475569] text-white'
                          : 'bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#1F2937]'
                      }`}
                      style={{ boxShadow: 'var(--shadow-sm)' }}
                    >
                      <span className="mr-1">{tag.icon}</span>
                      {tag.text}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className={`w-full mt-6 px-6 py-4 rounded-[16px] font-bold text-white transition-all flex items-center justify-center gap-3 ${
                  !prompt.trim() || isGenerating
                    ? darkMode
                      ? 'bg-[#334155] text-[#64748B] cursor-not-allowed'
                      : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                    : ''
                }`}
                style={prompt.trim() && !isGenerating ? {
                  background: 'linear-gradient(135deg, #EC4899 0%, #F59E0B 100%)',
                  boxShadow: '0 8px 24px -8px rgba(236, 72, 153, 0.6)'
                } : {}}
              >
                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="w-6 h-6" strokeWidth={2} />
                    </motion.div>
                    생성 중... {generationProgress}%
                  </>
                ) : (
                  <>
                    <Wand2 className="w-6 h-6" strokeWidth={2} />
                    AI로 굿즈 만들기
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Right Column - Preview Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className={`${
              darkMode ? 'bg-[#1E293B]' : 'bg-white'
            } rounded-[20px] p-6 h-full`}
              style={{ boxShadow: 'var(--shadow-md)' }}
            >
              <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                darkMode ? 'text-white' : 'text-[#1F2937]'
              }`}>
                <ImageIcon className="w-5 h-5 text-[#10B981]" strokeWidth={2} />
                미리보기 화면
              </h3>

              {/* Preview Area */}
              <div className={`relative w-full aspect-square rounded-[16px] overflow-hidden ${
                darkMode ? 'bg-[#334155]' : 'bg-[#F3F4F6]'
              }`}
                style={{ boxShadow: 'var(--shadow-sm)' }}
              >
                <AnimatePresence mode="wait">
                  {isGenerating ? (
                    // Loading Animation
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center"
                    >
                      {/* Animated Circles */}
                      <div className="relative w-32 h-32 mb-6">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="absolute inset-0 border-4 rounded-full"
                            style={{
                              borderColor: i === 0 ? '#6366F1' : i === 1 ? '#EC4899' : '#F59E0B',
                              borderTopColor: 'transparent'
                            }}
                            animate={{
                              rotate: 360,
                              scale: [1, 1.1, 1]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "linear",
                              delay: i * 0.2
                            }}
                          />
                        ))}
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 180, 360]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <Sparkles className="w-12 h-12 text-[#F59E0B]" fill="#F59E0B" strokeWidth={2} />
                        </motion.div>
                      </div>

                      <p className={`text-lg font-bold mb-2 ${
                        darkMode ? 'text-white' : 'text-[#1F2937]'
                      }`}>
                        AI가 멋진 굿즈를 만드는 중...
                      </p>
                      <p className={`text-sm ${
                        darkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'
                      }`}>
                        {generationProgress}% 완료
                      </p>

                      {/* Progress Bar */}
                      <div className={`w-3/4 h-2 rounded-full mt-4 overflow-hidden ${
                        darkMode ? 'bg-[#475569]' : 'bg-[#E5E7EB]'
                      }`}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: 'linear-gradient(90deg, #6366F1 0%, #EC4899 50%, #F59E0B 100%)'
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${generationProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </motion.div>
                  ) : generatedImage ? (
                    // Generated Image
                    <motion.div
                      key="image"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute inset-0"
                    >
                      <ImageWithFallback
                        src={generatedImage}
                        alt="Generated goods design"
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Download Button Overlay */}
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDownload}
                        className="absolute bottom-4 right-4 p-3 rounded-full text-white transition-all"
                        style={{
                          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                          boxShadow: '0 8px 24px -8px rgba(16, 185, 129, 0.6)'
                        }}
                      >
                        <Download className="w-6 h-6" strokeWidth={2} />
                      </motion.button>
                    </motion.div>
                  ) : (
                    // Empty State
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center"
                    >
                      <motion.div
                        animate={{
                          y: [0, -10, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <ImageIcon className={`w-20 h-20 mb-4 ${
                          darkMode ? 'text-[#64748B]' : 'text-[#9CA3AF]'
                        }`} strokeWidth={1.5} />
                      </motion.div>
                      <p className={`text-base font-medium ${
                        darkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'
                      }`}>
                        디자인을 입력하면
                      </p>
                      <p className={`text-base font-medium ${
                        darkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'
                      }`}>
                        AI가 굿즈를 만들어드려요!
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Info Box */}
              {generatedImage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-4 rounded-[16px] ${
                    darkMode 
                      ? 'bg-[#10B981]/10 border-2 border-[#10B981]/30' 
                      : 'bg-[#D1FAE5] border-2 border-[#10B981]/50'
                  }`}
                >
                  <p className={`text-sm font-medium flex items-start gap-2 ${
                    darkMode ? 'text-[#6EE7B7]' : 'text-[#065F46]'
                  }`}>
                    <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    완성됐어요! 오른쪽 하단 버튼으로 굿즈 이미지를 저장해보세요.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Bottom Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`mt-6 p-6 rounded-[20px] ${
            darkMode 
              ? 'bg-[#6366F1]/10 border-2 border-[#6366F1]/30' 
              : 'bg-[#EEF2FF] border-2 border-[#C7D2FE]'
          }`}
        >
          <div className="flex items-start gap-3">
            <Sparkles className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              darkMode ? 'text-[#A5B4FC]' : 'text-[#6366F1]'
            }`} strokeWidth={2} />
            <div>
              <h4 className={`text-sm font-bold mb-1 ${
                darkMode ? 'text-[#A5B4FC]' : 'text-[#6366F1]'
              }`}>
                💡 AI 굿즈 만들기 팁
              </h4>
              <p className={`text-xs ${
                darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'
              }`}>
                구체적인 설명일수록 더 좋은 결과물이 나와요! 인물, 시대상, 색상 등을 자세히 써보세요.
                예: "이순신 장군이 거북선 위에서 파란 하늘을 배경으로 당당히 서 있는 모습"
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
