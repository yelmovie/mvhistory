import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Sparkles, Wand2, Download, Loader2, FileText, Mail, ExternalLink, ShoppingBag, Coffee, Shirt, Home } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface HistoryGoodsGeneratorProps {
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

type MockupType = 'ecobag' | 'mug' | 'tshirt';

export function HistoryGoodsGenerator({ onBack, onHome, darkMode = false }: HistoryGoodsGeneratorProps) {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedGoods, setGeneratedGoods] = useState<GeneratedGoods[]>([]);
  const [selectedGoods, setSelectedGoods] = useState<GeneratedGoods | null>(null);
  const [showProposal, setShowProposal] = useState(false);
  const [proposalContent, setProposalContent] = useState('');
  const [activeMockup, setActiveMockup] = useState<MockupType>('ecobag');

  const examplePrompts = [
    "세종대왕 캐릭터 인형",
    "거북선 모양 연필꽂이",
    "훈민정음 패턴 에코백",
    "불국사 석가탑 미니어처",
    "청자상감운학문매병 무드등",
    "한복 디자인 노트북 파우치"
  ];

  const handleGenerate = async () => {
    if (!description.trim() || isGenerating) return;

    setIsGenerating(true);

    // TODO: OpenAI DALL-E API 연동 예정
    // 현재는 시뮬레이션
    setTimeout(() => {
      const newGoods: GeneratedGoods = {
        id: Date.now().toString(),
        description: description,
        imageUrl: 'https://images.unsplash.com/photo-1603787080617-9f8ef2ec122a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMG1lcmNoYW5kaXNlJTIwZGVzaWduJTIwbW9ja3VwfGVufDF8fHx8MTc3MDg0MTI4NXww&ixlib=rb-4.1.0&q=80&w=1080',
        timestamp: new Date()
      };
      
      setGeneratedGoods(prev => [newGoods, ...prev]);
      setSelectedGoods(newGoods);
      setIsGenerating(false);
      setDescription('');
    }, 3000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleWriteProposal = () => {
    if (!selectedGoods) return;
    
    // AI로 제안서 생성 (간단한 템플릿)
    const proposal = `
# 역사 문화 굿즈 제안서

## 제품 개요
**제품명:** ${selectedGoods.description}
**생성일:** ${selectedGoods.timestamp.toLocaleString('ko-KR')}

## 제품 컨셉
우리나라의 소중한 역사와 문화유산을 현대적으로 재해석한 굿즈입니다.
초등학생들이 역사를 친근하게 느끼고 즐겁게 배울 수 있도록 디자인되었습니다.

## 타겟 고객
- 초등학생 및 청소년
- 역사와 문화에 관심 있는 일반인
- 외국인 관광객 (K-Culture 굿즈)

## 기대 효과
1. 역사 교육의 접근성 향상
2. 문화유산 대중화
3. 창의적 역사 콘텐츠 확산

## 브랜드 협업 제안
귀사의 브랜드 가치와 우리의 역사 문화 콘텐츠가 만나
의미 있는 협업을 제안드립니다.

---
💡 본 제안서는 AI로 생성되었으며, 구체적인 내용은 협의 후 보완 가능합니다.
    `.trim();
    
    setProposalContent(proposal);
    setShowProposal(true);
  };

  const handleSendEmail = () => {
    if (!selectedGoods) return;
    
    const subject = encodeURIComponent(`[브랜드 협업 제안] ${selectedGoods.description}`);
    const body = encodeURIComponent(`
안녕하세요,

역사 문화 굿즈 협업을 제안드립니다.

제품명: ${selectedGoods.description}

우리의 소중한 역사와 문화를 현대적으로 재해석한 굿즈로,
교육적 가치와 상업적 가치를 모두 갖춘 제품입니다.

자세한 내용은 첨부된 제안서를 참고해주시기 바랍니다.

감사합니다.
    `.trim());
    
    // 메일 클라이언트 열기
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleOpenMuseumShop = () => {
    window.open('https://www.museumshop.or.kr/kor/main.do', '_blank');
  };

  const mockupConfig = {
    ecobag: {
      name: '에코백',
      icon: ShoppingBag,
      backgroundUrl: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80',
      overlayStyle: {
        top: '35%',
        left: '50%',
        transform: 'translate(-50%, -50%) perspective(800px) rotateY(-2deg)',
        width: '40%',
        maxWidth: '280px',
        opacity: 0.9
      }
    },
    mug: {
      name: '머그컵',
      icon: Coffee,
      backgroundUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80',
      overlayStyle: {
        top: '45%',
        left: '50%',
        transform: 'translate(-50%, -50%) perspective(600px) rotateY(15deg)',
        width: '25%',
        maxWidth: '160px',
        borderRadius: '20px',
        opacity: 0.85
      }
    },
    tshirt: {
      name: '티셔츠',
      icon: Shirt,
      backgroundUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
      overlayStyle: {
        top: '42%',
        left: '50%',
        transform: 'translate(-50%, -50%) perspective(1000px) rotateX(-3deg)',
        width: '28%',
        maxWidth: '200px',
        opacity: 0.9
      }
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`${
          darkMode 
            ? 'bg-gray-900/80 border-gray-700/50' 
            : 'bg-white/80 border-white/50'
        } backdrop-blur-xl border-b shadow-sm sticky top-0 z-50`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl ${
                  darkMode 
                    ? 'bg-gray-800/60 border-gray-700/50' 
                    : 'bg-white/60 border-white/80'
                } backdrop-blur-xl border shadow-lg hover:shadow-xl transition-all`}
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">뒤로가기</span>
              </motion.button>

              {onHome && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onHome}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl ${
                    darkMode 
                      ? 'bg-purple-600/60 border-purple-500/50 hover:bg-purple-600/80' 
                      : 'bg-purple-500/60 border-purple-400/50 hover:bg-purple-500/80'
                  } backdrop-blur-xl border shadow-lg hover:shadow-xl transition-all`}
                  title="홈으로"
                >
                  <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Wand2 className={`w-5 h-5 ${
                darkMode ? 'text-purple-400' : 'text-purple-600'
              }`} />
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                AI 역사 굿즈 만들기
              </h1>
            </div>

            <div className="w-20 sm:w-32" />
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${
            darkMode 
              ? 'bg-gray-800/50 border-gray-700/50' 
              : 'bg-white/70 border-white/90'
          } backdrop-blur-2xl border-2 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8`}
        >
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className={`w-6 h-6 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
            <h2 className="text-xl sm:text-2xl font-bold">어떤 역사 굿즈를 만들고 싶나요?</h2>
          </div>
          <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            역사 인물, 유물, 건축물 등을 활용한 창의적인 굿즈를 설명해주세요. AI가 실사처럼 만들어드려요!
          </p>

          {/* Input Area */}
          <div className="space-y-4">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="예: 세종대왕 캐릭터가 그려진 귀여운 텀블러"
              className={`w-full px-4 sm:px-6 py-3 sm:py-4 rounded-2xl ${
                darkMode
                  ? 'bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400'
                  : 'bg-white/80 border-gray-200/50 text-gray-900 placeholder-gray-500'
              } border-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm sm:text-base resize-none h-32`}
            />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={!description.trim() || isGenerating}
              className={`w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>AI가 굿즈를 만들고 있어요...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  <span>AI로 만들기</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Example Prompts */}
          <div className="mt-6">
            <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              💡 예시 아이디어:
            </p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((prompt, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDescription(prompt)}
                  className={`px-4 py-2 rounded-xl text-sm ${
                    darkMode
                      ? 'bg-gray-700/50 border-gray-600/50 hover:bg-gray-700'
                      : 'bg-white/60 border-gray-200/50 hover:bg-white'
                  } border transition-all`}
                >
                  {prompt}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Generated Goods Gallery */}
        {generatedGoods.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${
              darkMode 
                ? 'bg-gray-800/50 border-gray-700/50' 
                : 'bg-white/70 border-white/90'
            } backdrop-blur-2xl border-2 rounded-3xl p-6 sm:p-8 shadow-2xl`}
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-6">생성된 굿즈</h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedGoods.map((goods) => (
                <motion.div
                  key={goods.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedGoods(goods)}
                  className={`${
                    darkMode 
                      ? 'bg-gray-700/50 border-gray-600/50' 
                      : 'bg-white/80 border-gray-200/50'
                  } border-2 rounded-2xl overflow-hidden cursor-pointer transition-all shadow-lg hover:shadow-2xl`}
                >
                  <div className="aspect-square overflow-hidden">
                    <ImageWithFallback
                      src={goods.imageUrl}
                      alt={goods.description}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <p className={`text-sm font-medium line-clamp-2 ${
                      darkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      {goods.description}
                    </p>
                    <p className={`text-xs mt-2 ${
                      darkMode ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      {goods.timestamp.toLocaleString('ko-KR')}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Selected Goods Detail Modal */}
        <AnimatePresence>
          {selectedGoods && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedGoods(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className={`${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                } border-2 rounded-3xl p-6 max-w-6xl w-full shadow-2xl max-h-[90vh] overflow-y-auto`}
              >
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Left: Original Design */}
                  <div>
                    <h3 className="text-xl font-bold mb-4">생성된 디자인</h3>
                    <div className="aspect-square overflow-hidden rounded-2xl mb-4">
                      <ImageWithFallback
                        src={selectedGoods.imageUrl}
                        alt={selectedGoods.description}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h4 className="font-bold mb-2">{selectedGoods.description}</h4>
                    <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      생성 시간: {selectedGoods.timestamp.toLocaleString('ko-KR')}
                    </p>
                  </div>

                  {/* Right: Mockup Preview */}
                  <div>
                    <h3 className="text-xl font-bold mb-4">제품 목업 미리보기</h3>
                    
                    {/* Mockup Tabs */}
                    <div className="flex gap-2 mb-4">
                      {(Object.keys(mockupConfig) as MockupType[]).map((type) => {
                        const config = mockupConfig[type];
                        const IconComponent = config.icon;
                        return (
                          <button
                            key={type}
                            onClick={() => setActiveMockup(type)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                              activeMockup === type
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                : darkMode
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <IconComponent className="w-4 h-4" />
                            <span className="text-sm">{config.name}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Mockup Display */}
                    <div className="aspect-square rounded-2xl overflow-hidden relative bg-gray-100 dark:bg-gray-900">
                      {/* Background Mockup Image */}
                      <ImageWithFallback
                        src={mockupConfig[activeMockup].backgroundUrl}
                        alt={`${mockupConfig[activeMockup].name} mockup`}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Overlay Design */}
                      <div
                        className="absolute"
                        style={mockupConfig[activeMockup].overlayStyle}
                      >
                        <ImageWithFallback
                          src={selectedGoods.imageUrl}
                          alt={selectedGoods.description}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>

                    <p className={`text-xs mt-3 text-center ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      💡 실제 제품은 다를 수 있습니다
                    </p>
                  </div>
                </div>
                
                {/* Action Buttons Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 mb-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    다운로드
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleWriteProposal}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold shadow-lg flex items-center justify-center gap-2"
                  >
                    <FileText className="w-5 h-5" />
                    제안서 쓰기
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendEmail}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold shadow-lg flex items-center justify-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    협업 메일 보내기
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleOpenMuseumShop}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold shadow-lg flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-5 h-5" />
                    뮤지엄샵
                  </motion.button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedGoods(null)}
                  className={`w-full px-6 py-3 rounded-2xl ${
                    darkMode
                      ? 'bg-gray-700 text-gray-200'
                      : 'bg-gray-200 text-gray-800'
                  } font-bold shadow-lg`}
                >
                  닫기
                </motion.button>

                <p className={`text-xs mt-4 text-center ${
                  darkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  💡 OpenAI DALL-E API 연동 후 실제 AI 생성 이미지가 표시됩니다
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Proposal Modal */}
        <AnimatePresence>
          {showProposal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProposal(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className={`${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                } border-2 rounded-3xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto shadow-2xl`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold">제안서</h2>
                  </div>
                  <button
                    onClick={() => setShowProposal(false)}
                    className={`p-2 rounded-xl transition-colors ${
                      darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                </div>

                <div className={`${
                  darkMode ? 'bg-gray-900/50' : 'bg-gray-50'
                } rounded-2xl p-6 mb-6`}>
                  <pre className={`whitespace-pre-wrap font-sans text-sm leading-relaxed ${
                    darkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>
                    {proposalContent}
                  </pre>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      navigator.clipboard.writeText(proposalContent);
                      alert('제안서가 클립보드에 복사되었습니다!');
                    }}
                    className="flex-1 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold shadow-lg"
                  >
                    📋 복사하기
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const blob = new Blob([proposalContent], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `제안서_${selectedGoods?.description || 'goods'}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex-1 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg"
                  >
                    💾 다운로드
                  </motion.button>
                </div>

                <p className={`text-xs mt-4 text-center ${
                  darkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  💡 제안서는 AI가 생성한 템플릿입니다. 실제 사용 시 내용을 수정하여 사용하세요.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
