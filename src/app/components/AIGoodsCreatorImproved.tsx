import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, Sparkles, Wand2, Download, Loader2,
  ShoppingBag, Coffee, Shirt, Home,
  Image as ImageIcon, Palette, Zap, Star,
  AlertTriangle, RefreshCw, Settings, X, Info,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  getOpenAIApiKey,
  generateImage,
  translateGoodsPrompt,
  getDailyGenerationInfo,
  incrementDailyCount,
  canGenerateToday,
} from "../utils/openaiApi";

// ── 타입 ─────────────────────────────────────────────────────
interface AIGoodsCreatorImprovedProps {
  onBack: () => void;
  onHome?: () => void;
  darkMode?: boolean;
}

type GoodsType = "ecobag" | "mug" | "tshirt";

interface GeneratedItem {
  id: string;
  imageUrl: string;
  prompt: string;
  goodsType: GoodsType;
  timestamp: Date;
}

const DAILY_MAX = 3;

// ── 굿즈 타입 설정 ────────────────────────────────────────────
const GOODS_TYPES = [
  {
    id: "tshirt" as GoodsType,
    icon: Shirt,
    name: "티셔츠",
    color: "#6366F1",
    gradient: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
    dalleHint: "t-shirt graphic print design",
  },
  {
    id: "mug" as GoodsType,
    icon: Coffee,
    name: "머그컵",
    color: "#F59E0B",
    gradient: "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",
    dalleHint: "mug wrap-around illustration design",
  },
  {
    id: "ecobag" as GoodsType,
    icon: ShoppingBag,
    name: "에코백",
    color: "#10B981",
    gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    dalleHint: "tote bag front print design",
  },
];

// ── 예시 태그 ─────────────────────────────────────────────────
const EXAMPLE_TAGS = [
  { icon: "👑", text: "이순신 장군 디자인" },
  { icon: "🏯", text: "경복궁 일러스트" },
  { icon: "🎨", text: "한복 입은 세종대왕" },
  { icon: "⚔️", text: "삼국시대 전사" },
  { icon: "🌸", text: "조선 꽃무늬" },
  { icon: "🐉", text: "고려 청자 문양" },
  { icon: "📜", text: "훈민정음 서체" },
  { icon: "🗺️", text: "한반도 지도" },
];

// ── API 키 입력 모달 ──────────────────────────────────────────
function ApiKeyModal({
  onClose,
  darkMode,
}: {
  onClose: () => void;
  darkMode: boolean;
}) {
  const [key, setKey] = useState(localStorage.getItem("openai_api_key") || "");
  const save = () => {
    localStorage.setItem("openai_api_key", key.trim());
    onClose();
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9 }}
        className={`w-full max-w-sm rounded-[24px] p-6 ${darkMode ? "bg-[#1E293B]" : "bg-white"}`}
        style={{ boxShadow: "0 24px 48px -12px rgba(0,0,0,0.3)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-black flex items-center gap-2 ${darkMode ? "text-white" : "text-[#1F2937]"}`}>
            <Settings className="w-5 h-5 text-[#6366F1]" />
            OpenAI API 키 설정
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className={`text-sm mb-4 leading-relaxed ${darkMode ? "text-[#94A3B8]" : "text-[#6B7280]"}`}>
          DALL-E 3으로 이미지를 생성하려면 OpenAI API 키가 필요합니다.{" "}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noreferrer"
            className="text-[#6366F1] underline font-semibold"
          >
            여기서 발급 →
          </a>
        </p>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          placeholder="sk-..."
          className={`w-full px-4 py-3 rounded-[12px] border-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#6366F1] ${
            darkMode
              ? "bg-[#334155] border-[#475569] text-white placeholder-[#64748B]"
              : "bg-[#F9FAFB] border-[#E5E7EB] text-[#1F2937] placeholder-[#9CA3AF]"
          }`}
        />
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className={`flex-1 py-3 rounded-[12px] font-semibold text-sm ${
              darkMode ? "bg-[#334155] text-[#94A3B8]" : "bg-[#F3F4F6] text-[#6B7280]"
            }`}
          >
            취소
          </button>
          <button
            onClick={save}
            className="flex-1 py-3 rounded-[12px] font-bold text-sm text-white"
            style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
          >
            저장
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── 하루 제한 배너 ────────────────────────────────────────────
function DailyLimitBanner({
  count,
  remaining,
  resetAt,
  darkMode,
}: {
  count: number;
  remaining: number;
  resetAt: string;
  darkMode: boolean;
}) {
  const dots = Array.from({ length: DAILY_MAX });
  const isExhausted = remaining === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-[16px] p-4 border-2 ${
        isExhausted
          ? darkMode
            ? "bg-red-900/20 border-red-700/40"
            : "bg-red-50 border-red-200"
          : darkMode
          ? "bg-[#1E3A8A]/20 border-[#3B82F6]/30"
          : "bg-blue-50 border-blue-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {isExhausted ? (
            <AlertTriangle className="w-5 h-5 text-red-500" />
          ) : (
            <Info className="w-5 h-5 text-blue-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className={`text-sm font-black ${isExhausted ? "text-red-600" : darkMode ? "text-blue-300" : "text-blue-700"}`}>
              {isExhausted
                ? `⛔ 오늘의 생성 횟수를 모두 사용했습니다`
                : `🎨 하루 최대 ${DAILY_MAX}회까지 이미지 생성 가능`}
            </p>
          </div>
          <p className={`text-xs leading-relaxed ${isExhausted ? "text-red-500" : darkMode ? "text-blue-400" : "text-blue-600"}`}>
            {isExhausted
              ? `${resetAt} 초기화됩니다. 내일 다시 이용해 주세요! 🌅`
              : `오늘 ${count}회 사용 · ${remaining}회 남음 · ${resetAt} 초기화`}
          </p>
          {/* 도트 게이지 */}
          <div className="flex gap-1.5 mt-2">
            {dots.map((_, i) => (
              <div
                key={i}
                className={`w-6 h-2 rounded-full transition-all ${
                  i < count
                    ? isExhausted
                      ? "bg-red-500"
                      : "bg-blue-500"
                    : darkMode
                    ? "bg-[#334155]"
                    : "bg-blue-100"
                }`}
              />
            ))}
            <span className={`text-xs font-bold ml-1 ${isExhausted ? "text-red-500" : "text-blue-500"}`}>
              {count}/{DAILY_MAX}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════
// 메인 컴포넌트
// ══════════════════════════════════════════════════════════════
export function AIGoodsCreatorImproved({
  onBack,
  onHome,
  darkMode = false,
}: AIGoodsCreatorImprovedProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedGoodsType, setSelectedGoodsType] = useState<GoodsType>("tshirt");
  const [generationProgress, setGenerationProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [history, setHistory] = useState<GeneratedItem[]>([]);
  const [dailyInfo, setDailyInfo] = useState(getDailyGenerationInfo());
  const [revisedPrompt, setRevisedPrompt] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [hasApiKey, setHasApiKey] = useState(!!getOpenAIApiKey());

  // 날짜 정보 갱신
  useEffect(() => {
    setDailyInfo(getDailyGenerationInfo());
  }, []);

  const handleTagClick = (text: string) => {
    setPrompt((prev) => (prev.trim() ? `${prev}, ${text}` : text));
  };

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isGenerating) return;

    if (!hasApiKey) {
      setShowApiKeyModal(true);
      return;
    }

    if (!canGenerateToday()) {
      setErrorMessage("오늘의 생성 횟수(3회)를 모두 사용했습니다. 내일 다시 이용해 주세요!");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setErrorMessage(null);
    setGeneratedImage(null);
    setRevisedPrompt(null);

    const goodsType = GOODS_TYPES.find((g) => g.id === selectedGoodsType)!;

    try {
      // 1단계: 프롬프트 번역 (10~30%)
      setStatusMessage("🌏 프롬프트 번역 중...");
      const progressTimer = setInterval(() => {
        setGenerationProgress((p) => Math.min(p + 5, 28));
      }, 300);

      const englishPrompt = await translateGoodsPrompt(
        prompt,
        goodsType.dalleHint,
        getOpenAIApiKey(),
      );
      clearInterval(progressTimer);
      setGenerationProgress(30);

      // 2단계: DALL-E 이미지 생성 (30~95%)
      setStatusMessage("🎨 AI가 이미지를 그리는 중...");
      const paintTimer = setInterval(() => {
        setGenerationProgress((p) => Math.min(p + 3, 92));
      }, 800);

      const finalPrompt = `${englishPrompt}
Style requirements: flat illustration design, bold and vibrant colors, 
suitable for ${goodsType.dalleHint}, white or transparent background, 
no text or letters, clean graphic art style, Korean history theme.`;

      const result = await generateImage(finalPrompt, "1024x1024", "standard");
      clearInterval(paintTimer);
      setGenerationProgress(100);
      setStatusMessage("✅ 완성!");

      setGeneratedImage(result.url);
      setRevisedPrompt(result.revisedPrompt || null);

      // 카운트 증가 + 히스토리 저장
      incrementDailyCount();
      setDailyInfo(getDailyGenerationInfo());
      setHistory((prev) => [
        {
          id: Date.now().toString(),
          imageUrl: result.url,
          prompt,
          goodsType: selectedGoodsType,
          timestamp: new Date(),
        },
        ...prev.slice(0, 5),
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      setErrorMessage(msg);
      setGeneratedImage(null);
    } finally {
      setIsGenerating(false);
      setTimeout(() => setStatusMessage(""), 2000);
    }
  }, [prompt, isGenerating, hasApiKey, selectedGoodsType]);

  const handleDownload = async () => {
    if (!generatedImage) return;
    try {
      // CORS 이슈 우회: fetch → blob → download
      const res = await fetch(generatedImage);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `history-goods-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // fallback: 새 탭에서 열기
      window.open(generatedImage, "_blank");
    }
  };

  const dark = darkMode;
  const isExhausted = dailyInfo.remaining === 0;
  const canGenerate = !isGenerating && !!prompt.trim() && hasApiKey && !isExhausted;

  return (
    <div
      className={`min-h-screen transition-colors relative overflow-hidden ${
        dark ? "bg-[#0F172A]" : "bg-[#FEF7FF]"
      } p-6 lg:p-8`}
    >
      {/* ── 배경 그라디언트 ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          { pos: "-top-40 -left-40", color: "#6366F1", dur: 20 },
          { pos: "-bottom-40 -right-40", color: "#EC4899", dur: 25 },
          { pos: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2", color: "#F59E0B", dur: 30 },
        ].map((g, i) => (
          <motion.div
            key={i}
            className={`absolute w-80 h-80 rounded-full opacity-10 ${g.pos}`}
            style={{ background: `radial-gradient(circle, ${g.color} 0%, transparent 70%)` }}
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: g.dur, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* ── 헤더 ── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          {/* 네비게이션 */}
          <div className="flex items-center gap-2 mb-5">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className={`p-3 rounded-[16px] transition-colors ${
                dark ? "bg-[#1E293B] hover:bg-[#334155] text-white" : "bg-white hover:bg-[#F9FAFB] text-[#1F2937]"
              }`}
              style={{ boxShadow: "var(--shadow-md)" }}
            >
              <ArrowLeft className="w-6 h-6" strokeWidth={2} />
            </motion.button>
            {onHome && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onHome}
                className="p-3 rounded-[16px] text-white"
                style={{
                  background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                  boxShadow: "var(--shadow-primary)",
                }}
              >
                <Home className="w-6 h-6" strokeWidth={2} />
              </motion.button>
            )}
            <div className="flex-1" />
            {/* API 키 설정 버튼 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowApiKeyModal(true)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-[14px] text-sm font-semibold transition-all ${
                hasApiKey
                  ? dark
                    ? "bg-green-900/30 text-green-400 border border-green-700/40"
                    : "bg-green-50 text-green-700 border border-green-200"
                  : dark
                  ? "bg-red-900/30 text-red-400 border border-red-700/40"
                  : "bg-red-50 text-red-600 border border-red-200"
              }`}
            >
              <Settings className="w-4 h-4" />
              {hasApiKey ? "API 키 설정됨 ✓" : "API 키 미설정"}
            </motion.button>
          </div>

          {/* 타이틀 카드 */}
          <div
            className={`${dark ? "bg-[#1E293B]" : "bg-white"} rounded-[24px] p-6 relative overflow-hidden`}
            style={{ boxShadow: "var(--shadow-lg)" }}
          >
            <motion.div
              className="absolute top-4 right-4"
              animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="w-8 h-8 text-[#F59E0B]" fill="#F59E0B" />
            </motion.div>
            <motion.div
              className="absolute bottom-4 left-4"
              animate={{ rotate: [360, 0], scale: [1.2, 1, 1.2] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Palette className="w-7 h-7 text-[#EC4899]" />
            </motion.div>
            <div className="relative z-10 flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              >
                <Wand2 className={`w-9 h-9 ${dark ? "text-[#A5B4FC]" : "text-[#6366F1]"}`} strokeWidth={2} />
              </motion.div>
              <div>
                <h1 className={`text-2xl lg:text-3xl font-black ${dark ? "text-white" : "text-[#1F2937]"}`}>
                  AI 역사 굿즈 만들기
                </h1>
                <p className={`text-sm mt-0.5 ${dark ? "text-[#94A3B8]" : "text-[#6B7280]"}`}>
                  DALL-E 3으로 나만의 역사 굿즈를 만들어보세요! 🎨
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── 하루 제한 공지 배너 ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <DailyLimitBanner
            count={dailyInfo.count}
            remaining={dailyInfo.remaining}
            resetAt={dailyInfo.resetAt}
            darkMode={dark}
          />
        </motion.div>

        {/* ── API 키 없음 경고 ── */}
        <AnimatePresence>
          {!hasApiKey && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div
                className={`rounded-[16px] p-4 border-2 flex items-start gap-3 ${
                  dark ? "bg-orange-900/20 border-orange-700/40" : "bg-orange-50 border-orange-200"
                }`}
              >
                <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className={`text-sm font-bold ${dark ? "text-orange-300" : "text-orange-700"}`}>
                    OpenAI API 키가 필요합니다
                  </p>
                  <p className={`text-xs mt-0.5 ${dark ? "text-orange-400" : "text-orange-600"}`}>
                    DALL-E 3 이미지 생성에는 OpenAI API 키가 필요합니다.{" "}
                    <button
                      onClick={() => setShowApiKeyModal(true)}
                      className="underline font-semibold"
                    >
                      지금 설정하기 →
                    </button>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 메인 그리드 ── */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* 왼쪽: 입력 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-5"
          >
            {/* 굿즈 타입 선택 */}
            <div
              className={`${dark ? "bg-[#1E293B]" : "bg-white"} rounded-[20px] p-5`}
              style={{ boxShadow: "var(--shadow-md)" }}
            >
              <h3 className={`text-base font-bold mb-3 flex items-center gap-2 ${dark ? "text-white" : "text-[#1F2937]"}`}>
                <Star className="w-4 h-4 text-[#F59E0B]" fill="#F59E0B" />
                굿즈 종류 선택
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {GOODS_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedGoodsType === type.id;
                  return (
                    <motion.button
                      key={type.id}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedGoodsType(type.id)}
                      className={`p-4 rounded-[14px] transition-all flex flex-col items-center gap-2 ${
                        isSelected
                          ? "text-white"
                          : dark
                          ? "bg-[#334155] hover:bg-[#475569] text-white"
                          : "bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#1F2937]"
                      }`}
                      style={isSelected ? { background: type.gradient, boxShadow: `0 8px 24px -8px ${type.color}60` } : {}}
                    >
                      <Icon className="w-7 h-7" strokeWidth={2} />
                      <span className="text-sm font-bold">{type.name}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* 프롬프트 입력 */}
            <div
              className={`${dark ? "bg-[#1E293B]" : "bg-white"} rounded-[20px] p-5`}
              style={{ boxShadow: "var(--shadow-md)" }}
            >
              <h3 className={`text-base font-bold mb-3 flex items-center gap-2 ${dark ? "text-white" : "text-[#1F2937]"}`}>
                <Zap className="w-4 h-4 text-[#EC4899]" />
                디자인 프롬프트 입력
              </h3>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="원하는 굿즈 디자인을 한국어로 설명해주세요&#10;예: 이순신 장군이 거북선 위에서 당당히 서 있는 모습"
                className={`w-full h-28 px-4 py-3 rounded-[14px] border-2 text-sm resize-none transition-all ${
                  dark
                    ? "bg-[#334155] border-[#475569] text-white placeholder-[#94A3B8] focus:border-[#6366F1]"
                    : "bg-white border-[#D1D5DB] text-[#1F2937] placeholder-[#9CA3AF] focus:border-[#6366F1]"
                } focus:outline-none`}
              />
              <p className={`text-xs mt-1.5 ${dark ? "text-[#64748B]" : "text-[#9CA3AF]"}`}>
                {prompt.length}/200자 · 구체적일수록 더 좋은 결과가 나와요
              </p>

              {/* 예시 태그 */}
              <div className="mt-3">
                <p className={`text-xs font-bold mb-2 ${dark ? "text-[#64748B]" : "text-[#9CA3AF]"}`}>
                  예시 태그 클릭해서 추가하기
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {EXAMPLE_TAGS.map((tag, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleTagClick(tag.text)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        dark
                          ? "bg-[#334155] hover:bg-[#475569] text-white"
                          : "bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#1F2937]"
                      }`}
                    >
                      <span className="mr-1">{tag.icon}</span>
                      {tag.text}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* 생성 버튼 */}
              <motion.button
                whileHover={canGenerate ? { scale: 1.02 } : {}}
                whileTap={canGenerate ? { scale: 0.98 } : {}}
                onClick={handleGenerate}
                disabled={!canGenerate}
                className={`w-full mt-4 px-6 py-4 rounded-[14px] font-bold text-sm flex items-center justify-center gap-3 transition-all ${
                  !canGenerate
                    ? dark
                      ? "bg-[#334155] text-[#64748B] cursor-not-allowed"
                      : "bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed"
                    : "text-white"
                }`}
                style={
                  canGenerate
                    ? {
                        background: "linear-gradient(135deg, #EC4899 0%, #F59E0B 100%)",
                        boxShadow: "0 8px 24px -8px rgba(236,72,153,0.6)",
                      }
                    : {}
                }
              >
                {isGenerating ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <Loader2 className="w-5 h-5" />
                    </motion.div>
                    <span>{statusMessage || `생성 중... ${generationProgress}%`}</span>
                  </>
                ) : isExhausted ? (
                  <>
                    <AlertTriangle className="w-5 h-5" />
                    오늘 생성 횟수 초과 (내일 초기화)
                  </>
                ) : !hasApiKey ? (
                  <>
                    <Settings className="w-5 h-5" />
                    API 키 설정 필요
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    AI로 굿즈 만들기 ({dailyInfo.remaining}회 남음)
                  </>
                )}
              </motion.button>

              {/* 진행 바 */}
              <AnimatePresence>
                {isGenerating && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3"
                  >
                    <div className={`h-1.5 rounded-full overflow-hidden ${dark ? "bg-[#334155]" : "bg-[#E5E7EB]"}`}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: "linear-gradient(90deg, #6366F1, #EC4899, #F59E0B)" }}
                        animate={{ width: `${generationProgress}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                    <p className={`text-xs mt-1 text-center ${dark ? "text-[#64748B]" : "text-[#9CA3AF]"}`}>
                      {statusMessage}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 오류 메시지 */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`mt-3 p-3 rounded-[12px] flex items-start gap-2 text-sm ${
                      dark ? "bg-red-900/30 border border-red-700/40" : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className={dark ? "text-red-300" : "text-red-700"}>{errorMessage}</span>
                    <button onClick={() => setErrorMessage(null)} className="ml-auto text-red-400 hover:text-red-600">
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 생성 히스토리 */}
            {history.length > 0 && (
              <div
                className={`${dark ? "bg-[#1E293B]" : "bg-white"} rounded-[20px] p-5`}
                style={{ boxShadow: "var(--shadow-md)" }}
              >
                <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${dark ? "text-white" : "text-[#1F2937]"}`}>
                  <RefreshCw className="w-4 h-4 text-[#6366F1]" />
                  오늘 생성한 굿즈
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {history.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setGeneratedImage(item.imageUrl)}
                      className="flex-shrink-0 w-16 h-16 rounded-[12px] overflow-hidden cursor-pointer border-2 border-transparent hover:border-[#6366F1] transition-all"
                    >
                      <img src={item.imageUrl} alt={item.prompt} className="w-full h-full object-cover" />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* 오른쪽: 미리보기 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div
              className={`${dark ? "bg-[#1E293B]" : "bg-white"} rounded-[20px] p-5`}
              style={{ boxShadow: "var(--shadow-md)" }}
            >
              <h3 className={`text-base font-bold mb-4 flex items-center gap-2 ${dark ? "text-white" : "text-[#1F2937]"}`}>
                <ImageIcon className="w-4 h-4 text-[#10B981]" />
                미리보기 화면
              </h3>

              {/* 미리보기 영역 */}
              <div
                className={`relative w-full aspect-square rounded-[16px] overflow-hidden ${
                  dark ? "bg-[#334155]" : "bg-[#F3F4F6]"
                }`}
              >
                <AnimatePresence mode="wait">
                  {isGenerating ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center"
                    >
                      <div className="relative w-28 h-28 mb-6">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="absolute inset-0 border-4 rounded-full"
                            style={{
                              borderColor:
                                i === 0 ? "#6366F1" : i === 1 ? "#EC4899" : "#F59E0B",
                              borderTopColor: "transparent",
                            }}
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "linear",
                              delay: i * 0.15,
                            }}
                          />
                        ))}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.div
                            animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
                            transition={{ duration: 3, repeat: Infinity }}
                          >
                            <Sparkles className="w-10 h-10 text-[#F59E0B]" fill="#F59E0B" />
                          </motion.div>
                        </div>
                      </div>
                      <p className={`text-base font-bold mb-1 ${dark ? "text-white" : "text-[#1F2937]"}`}>
                        AI가 그림을 그리는 중...
                      </p>
                      <p className={`text-sm ${dark ? "text-[#94A3B8]" : "text-[#6B7280]"}`}>
                        {statusMessage}
                      </p>
                      <div className={`w-2/3 h-2 rounded-full mt-4 overflow-hidden ${dark ? "bg-[#475569]" : "bg-[#E5E7EB]"}`}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: "linear-gradient(90deg, #6366F1, #EC4899, #F59E0B)" }}
                          animate={{ width: `${generationProgress}%` }}
                          transition={{ duration: 0.4 }}
                        />
                      </div>
                      <p className={`text-xs mt-2 ${dark ? "text-[#64748B]" : "text-[#9CA3AF]"}`}>
                        {generationProgress}%
                      </p>
                    </motion.div>
                  ) : generatedImage ? (
                    <motion.div
                      key="image"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0"
                    >
                      <ImageWithFallback
                        src={generatedImage}
                        alt="생성된 굿즈 디자인"
                        className="w-full h-full object-contain bg-white"
                      />
                      {/* 다운로드 버튼 */}
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDownload}
                        className="absolute bottom-4 right-4 p-3 rounded-full text-white"
                        style={{
                          background: "linear-gradient(135deg, #10B981, #059669)",
                          boxShadow: "0 8px 24px -8px rgba(16,185,129,0.6)",
                        }}
                        title="이미지 저장"
                      >
                        <Download className="w-5 h-5" strokeWidth={2} />
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8"
                    >
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <ImageIcon
                          className={`w-20 h-20 ${dark ? "text-[#475569]" : "text-[#D1D5DB]"}`}
                          strokeWidth={1}
                        />
                      </motion.div>
                      <p className={`text-sm text-center font-medium ${dark ? "text-[#64748B]" : "text-[#9CA3AF]"}`}>
                        왼쪽에서 굿즈 종류를 고르고<br />
                        디자인을 설명하면<br />
                        AI가 그림을 그려드려요! 🎨
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 생성 완료 정보 */}
              <AnimatePresence>
                {generatedImage && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 space-y-2"
                  >
                    <div
                      className={`p-3 rounded-[12px] ${
                        dark ? "bg-[#10B981]/10 border border-[#10B981]/30" : "bg-[#D1FAE5] border border-[#10B981]/40"
                      }`}
                    >
                      <p className={`text-xs font-medium flex items-center gap-1.5 ${dark ? "text-[#6EE7B7]" : "text-[#065F46]"}`}>
                        <Sparkles className="w-3.5 h-3.5" />
                        완성됐어요! 오른쪽 하단 ↓ 버튼으로 저장하세요.
                      </p>
                    </div>
                    {revisedPrompt && (
                      <details className="cursor-pointer">
                        <summary className={`text-xs px-1 ${dark ? "text-[#475569]" : "text-[#9CA3AF]"}`}>
                          AI가 수정한 프롬프트 보기
                        </summary>
                        <p className={`text-xs mt-1 p-2 rounded-lg leading-relaxed ${dark ? "text-[#64748B] bg-[#0F172A]" : "text-[#9CA3AF] bg-[#F9FAFB]"}`}>
                          {revisedPrompt}
                        </p>
                      </details>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* ── 하단 팁 ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`mt-6 p-5 rounded-[20px] ${
            dark ? "bg-[#6366F1]/10 border-2 border-[#6366F1]/30" : "bg-[#EEF2FF] border-2 border-[#C7D2FE]"
          }`}
        >
          <div className="flex items-start gap-3">
            <Sparkles className={`w-5 h-5 flex-shrink-0 mt-0.5 ${dark ? "text-[#A5B4FC]" : "text-[#6366F1]"}`} />
            <div>
              <h4 className={`text-sm font-bold mb-1 ${dark ? "text-[#A5B4FC]" : "text-[#6366F1]"}`}>
                💡 더 좋은 굿즈를 만드는 팁
              </h4>
              <ul className={`text-xs space-y-1 ${dark ? "text-[#CBD5E1]" : "text-[#6B7280]"}`}>
                <li>• 인물 이름과 특징을 함께 써주세요 (예: "이순신 장군, 갑옷, 거북선")</li>
                <li>• 색상을 지정하면 더 정확해요 (예: "파란색과 금색 배경")</li>
                <li>• 스타일도 지정해보세요 (예: "수채화풍", "만화풍", "일러스트")</li>
                <li>• 하루 {DAILY_MAX}회 무료 제공 · OpenAI API 키 필요</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── API 키 모달 ── */}
      <AnimatePresence>
        {showApiKeyModal && (
          <ApiKeyModal
            onClose={() => {
              setShowApiKeyModal(false);
              setHasApiKey(!!getOpenAIApiKey());
              setDailyInfo(getDailyGenerationInfo());
            }}
            darkMode={dark}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
