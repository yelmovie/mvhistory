import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, Home, Star, Calendar, Sparkles, Crown, Castle, Book,
  Landmark, Clock, Lock, Search, X, Filter, RefreshCw,
  MessageCircle, Zap, Trophy, Mail, PartyPopper, Send, Key,
} from "lucide-react";
import type { Character } from "../data/quizData";
import { allCharacters } from "../data/charactersData";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { resolveCharacterImage } from "../utils/characterImageMap";

// ── 상수 ────────────────────────────────────────────────────────
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://ngvsfcekfzzykvcsjktp.supabase.co";
const SERVER_BASE = `${SUPABASE_URL}/functions/v1/make-server-48be01a5`;

const PERIOD_ORDER = ["고조선", "삼국시대", "고려", "조선", "근현대"];

const PERIOD_CONFIG: Record<
  string,
  { icon: typeof Crown; color: string; gradient: string; years: string; emoji: string }
> = {
  고조선: {
    icon: Crown,
    color: "#D97706",
    gradient: "linear-gradient(135deg, #92400E, #D97706)",
    years: "BC 2333 ~ BC 108",
    emoji: "🏛️",
  },
  삼국시대: {
    icon: Castle,
    color: "#10B981",
    gradient: "linear-gradient(135deg, #059669, #10B981)",
    years: "BC 57 ~ 935",
    emoji: "⚔️",
  },
  고려: {
    icon: Book,
    color: "#06B6D4",
    gradient: "linear-gradient(135deg, #0891B2, #06B6D4)",
    years: "918 ~ 1392",
    emoji: "📚",
  },
  조선: {
    icon: Landmark,
    color: "#EF4444",
    gradient: "linear-gradient(135deg, #DC2626, #F59E0B)",
    years: "1392 ~ 1897",
    emoji: "🏯",
  },
  근현대: {
    icon: Clock,
    color: "#6366F1",
    gradient: "linear-gradient(135deg, #1E40AF, #6366F1)",
    years: "1897 ~ 현재",
    emoji: "🌏",
  },
};

// ── 시대별 마스터 키 설정 ────────────────────────────────────────
const MASTER_KEY_CONFIG: Record<string, {
  keyEmoji: string;
  keyName: string;
  description: string;
  particleColors: string[];
  bgGradient: string;
  glowColor: string;
}> = {
  고조선: {
    keyEmoji: "🗝️",
    keyName: "고조선 황금 열쇠",
    description: "단군왕검의 지혜를 담은 고대의 황금 열쇠",
    particleColors: ["#D97706","#F59E0B","#FBBF24","#FCD34D","#92400E"],
    bgGradient: "linear-gradient(135deg, #78350F, #D97706, #FCD34D)",
    glowColor: "#D97706",
  },
  삼국시대: {
    keyEmoji: "⚔️",
    keyName: "삼국 전사의 열쇠",
    description: "고구려·백제·신라 세 나라의 기상을 담은 전사의 열쇠",
    particleColors: ["#10B981","#34D399","#6EE7B7","#059669","#065F46"],
    bgGradient: "linear-gradient(135deg, #064E3B, #10B981, #6EE7B7)",
    glowColor: "#10B981",
  },
  고려: {
    keyEmoji: "📖",
    keyName: "고려 청자 열쇠",
    description: "고려의 문화와 학문을 상징하는 청자빛 열쇠",
    particleColors: ["#06B6D4","#22D3EE","#67E8F9","#0891B2","#164E63"],
    bgGradient: "linear-gradient(135deg, #0C4A6E, #06B6D4, #67E8F9)",
    glowColor: "#06B6D4",
  },
  조선: {
    keyEmoji: "📜",
    keyName: "조선 홍익 열쇠",
    description: "조선의 유교 정신과 백성 사랑을 담은 홍익 열쇠",
    particleColors: ["#EF4444","#F59E0B","#FCA5A5","#DC2626","#7F1D1D"],
    bgGradient: "linear-gradient(135deg, #7F1D1D, #DC2626, #FCA5A5)",
    glowColor: "#EF4444",
  },
  근현대: {
    keyEmoji: "🌟",
    keyName: "근현대 독립 열쇠",
    description: "독립운동의 정신과 민족의 꿈을 담은 빛나는 열쇠",
    particleColors: ["#6366F1","#8B5CF6","#A78BFA","#1E40AF","#312E81"],
    bgGradient: "linear-gradient(135deg, #1E1B4B, #6366F1, #A78BFA)",
    glowColor: "#6366F1",
  },
};

const MASTER_KEY_STORAGE_KEY = "masterKeys_earned";

function getMasterKeysEarned(): Set<string> {
  try {
    const saved = localStorage.getItem(MASTER_KEY_STORAGE_KEY);
    return saved ? new Set<string>(JSON.parse(saved)) : new Set<string>();
  } catch { return new Set<string>(); }
}

function saveMasterKeyEarned(period: string) {
  const keys = getMasterKeysEarned();
  keys.add(period);
  localStorage.setItem(MASTER_KEY_STORAGE_KEY, JSON.stringify([...keys]));
}

// ── 시대별 총 인물 수 ────────────────────────────────────────────
function getPeriodTotal(period: string): number {
  return allCharacters.filter(c => c.period === period).length;
}

// 시대별 배경 폴백 이미지
const PERIOD_FALLBACK: Record<string, string> = {
  고조선: "https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=300&q=60",
  삼국시대: "https://images.unsplash.com/photo-1578469550956-0e16b69c6a3d?w=300&q=60",
  고려: "https://images.unsplash.com/photo-1583149577728-9ba4bb93b0b0?w=300&q=60",
  조선: "https://images.unsplash.com/photo-1693928105595-b323b02791ff?w=300&q=60",
  근현대: "https://images.unsplash.com/photo-1583562835057-b06c1c4d0c3f?w=300&q=60",
};

function getFallback(period: string) {
  for (const [key, url] of Object.entries(PERIOD_FALLBACK)) {
    if (period.includes(key)) return url;
  }
  return "https://images.unsplash.com/photo-1578648693974-9438ebc063bb?w=300&q=60";
}

// ── Props ────────────────────────────────────────────────────────
interface CharacterCollectionImprovedProps {
  onBack: () => void;
  onHome?: () => void;
  darkMode?: boolean;
  characters?: Character[];
  unlockedIds?: Set<string>; // App.tsx에서 관리하는 해금 ID Set
  onSelectCharacter?: (character: Character) => void;
}

// ══════════════════════════════════════════════════════════════
// 시대 마스터 키 획득 모달
// ══════════════════════════════════════════════════════════════
function PeriodMasterKeyModal({
  period,
  darkMode,
  onClose,
}: {
  period: string;
  darkMode: boolean;
  onClose: () => void;
}) {
  const conf = PERIOD_CONFIG[period];
  const keyConf = MASTER_KEY_CONFIG[period];
  if (!conf || !keyConf) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center p-4"
    >
      {/* 배경 */}
      <motion.div
        className="absolute inset-0 bg-black/85 backdrop-blur-lg"
        onClick={onClose}
      />

      {/* 파티클 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 60 }).map((_, i) => {
          const color = keyConf.particleColors[i % keyConf.particleColors.length];
          return (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: 4 + Math.random() * 8,
                height: 4 + Math.random() * 8,
                backgroundColor: color,
                left: `${10 + Math.random() * 80}%`,
                top: "50%",
              }}
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{
                opacity: [1, 1, 0],
                y: [0, -(150 + Math.random() * 250)],
                x: [(Math.random() - 0.5) * 160],
                rotate: Math.random() * 540,
                scale: [1, 1.4, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 1.2,
                delay: i * 0.04,
                ease: "easeOut",
                repeat: Infinity,
                repeatDelay: 1.5 + Math.random() * 2,
              }}
            />
          );
        })}
      </div>

      {/* 모달 */}
      <motion.div
        initial={{ scale: 0.5, y: 80, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.8, y: 30, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className={`relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl ${darkMode ? "bg-gray-900" : "bg-white"}`}
        style={{ boxShadow: `0 0 80px ${keyConf.glowColor}80, 0 30px 60px rgba(0,0,0,0.5)` }}
      >
        {/* 상단 헤더 */}
        <div
          className="relative pt-10 pb-8 px-6 text-center overflow-hidden"
          style={{ background: keyConf.bgGradient }}
        >
          {/* 배경 빛 줄기 */}
          <motion.div
            className="absolute inset-0"
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              background: `repeating-conic-gradient(${keyConf.glowColor}30 0deg, transparent 15deg, ${keyConf.glowColor}30 30deg)`,
            }}
          />

          {/* 빛 원 */}
          {[1, 2, 3].map(i => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2 rounded-full border"
              style={{ borderColor: `${keyConf.glowColor}60`, width: 60 * i, height: 60 * i, marginLeft: -30 * i, marginTop: -30 * i }}
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }}
            />
          ))}

          {/* 닫기 */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"
          >
            <X className="w-4 h-4" />
          </button>

          {/* 열쇠 애니메이션 */}
          <div className="relative z-10">
            {/* 자물쇠 → 열리는 모션 */}
            <div className="relative flex items-center justify-center mb-4">
              {/* 자물쇠 */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: [0, 1.2, 1], rotate: [-20, 5, 0] }}
                transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
                className="absolute"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl"
                  style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
                >
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: [0, -30, 0] }}
                    transition={{ delay: 0.9, duration: 0.5, ease: "easeInOut" }}
                  >
                    <Lock className="w-8 h-8 text-white/60" />
                  </motion.div>
                </div>
              </motion.div>

              {/* 열쇠가 위에서 내려와 잠금 해제 */}
              <motion.div
                initial={{ y: -120, x: 30, rotate: -45, opacity: 0 }}
                animate={{ y: 0, x: 0, rotate: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8, type: "spring", stiffness: 200 }}
                className="relative z-10"
              >
                <motion.div
                  animate={{
                    rotate: [0, 15, -10, 0],
                    scale: [1, 1.15, 1],
                  }}
                  transition={{ delay: 1.3, duration: 0.6, ease: "easeInOut" }}
                  className="text-6xl filter drop-shadow-2xl"
                >
                  {keyConf.keyEmoji}
                </motion.div>
              </motion.div>
            </div>

            {/* 잠금 해제 후 별 폭발 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i / 8) * 360;
                const rad = (angle * Math.PI) / 180;
                const dist = 55;
                return (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{ width: 4, height: 4 }}
                    initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      x: Math.cos(rad) * dist,
                      y: Math.sin(rad) * dist,
                      scale: [0, 1.5, 0],
                    }}
                    transition={{ delay: 1.4 + i * 0.05, duration: 0.7, ease: "easeOut" }}
                  >
                    <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                  </motion.div>
                );
              })}
            </div>

            {/* 뱃지 */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full mb-3"
            >
              <Key className="w-3.5 h-3.5 text-white" />
              <span className="text-white font-black text-xs">마스터 키 획득!</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-white text-xl font-black leading-tight"
            >
              {period} 마스터! 🎉
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-white/80 text-sm mt-1"
            >
              {period}의 모든 인물 카드를 획득했어요!
            </motion.p>
          </div>
        </div>

        {/* 하단 본문 */}
        <div className="px-6 py-5">
          {/* 열쇠 카드 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className={`relative rounded-2xl p-4 mb-4 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-100"}`}
            style={{ boxShadow: `inset 0 0 20px ${keyConf.glowColor}20` }}
          >
            <div className="flex items-center gap-3">
              {/* 열쇠 아이콘 */}
              <motion.div
                animate={{
                  rotate: [0, 8, -8, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="text-4xl flex-shrink-0"
              >
                {keyConf.keyEmoji}
              </motion.div>
              <div>
                <p
                  className="font-black text-base"
                  style={{ color: keyConf.glowColor }}
                >
                  {keyConf.keyName}
                </p>
                <p className={`text-xs leading-relaxed mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {keyConf.description}
                </p>
              </div>
            </div>

            {/* 획득 도장 */}
            <motion.div
              initial={{ scale: 0, rotate: -20, opacity: 0 }}
              animate={{ scale: 1, rotate: -8, opacity: 1 }}
              transition={{ delay: 1.0, type: "spring", stiffness: 300 }}
              className="absolute top-3 right-3 border-2 px-2 py-0.5 rounded text-xs font-black"
              style={{ borderColor: keyConf.glowColor, color: keyConf.glowColor }}
            >
              획득 ✓
            </motion.div>
          </motion.div>

          {/* 시대 완성 정보 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex items-center gap-2 mb-4"
          >
            <div
              className="flex-1 h-2.5 rounded-full overflow-hidden"
              style={{ background: `${keyConf.glowColor}20` }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: keyConf.bgGradient }}
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.9, duration: 1, ease: "easeOut" }}
              />
            </div>
            <span className="text-xs font-black" style={{ color: keyConf.glowColor }}>100% 완성!</span>
          </motion.div>

          {/* 닫기 버튼 */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full py-3 rounded-2xl text-white font-bold text-sm shadow-lg"
            style={{ background: keyConf.bgGradient }}
          >
            🗝️ 마스터 키 수령 완료!
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── 205장 완성 축하 모달 ─────────────────────────────────────────
function CompletionModal({
  darkMode,
  userId,
  onClose,
}: {
  darkMode: boolean;
  userId: string | null;
  onClose: () => void;
}) {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (sending || sent) return;
    setSending(true);
    try {
      await fetch(`${SERVER_BASE}/feedback/request-more`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId || "anonymous",
          message: message.trim() || "더 많은 문제를 원합니다!",
        }),
        signal: AbortSignal.timeout(6000),
      });
      setSent(true);
    } catch {
      setSent(true); // 실패해도 UI는 전송 완료로 표시
    } finally {
      setSending(false);
    }
  };

  // 파티클 색상
  const COLORS = ["#F59E0B","#EF4444","#10B981","#3B82F6","#8B5CF6","#EC4899","#06B6D4"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
    >
      {/* 배경 */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      {/* 파티클 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 80 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 6 + Math.random() * 8,
              height: 6 + Math.random() * 8,
              backgroundColor: COLORS[i % COLORS.length],
              top: "40%",
              left: `${10 + Math.random() * 80}%`,
            }}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{
              opacity: [1, 1, 0],
              y: [0, -(200 + Math.random() * 300)],
              x: [(Math.random() - 0.5) * 200],
              rotate: Math.random() * 720,
              scale: [1, 1.3, 0],
            }}
            transition={{
              duration: 2.5 + Math.random() * 1,
              delay: i * 0.03,
              ease: "easeOut",
              repeat: Infinity,
              repeatDelay: 2 + Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* 모달 본체 */}
      <motion.div
        initial={{ scale: 0.6, y: 60, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.8, y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        className={`relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl ${darkMode ? "bg-gray-900" : "bg-white"}`}
        style={{ boxShadow: "0 0 80px #F59E0B60, 0 30px 60px rgba(0,0,0,0.5)" }}
      >
        {/* 헤더 */}
        <div className="relative bg-gradient-to-br from-amber-500 via-yellow-400 to-orange-500 pt-10 pb-8 px-6 text-center overflow-hidden">
          {/* 배경 패턴 */}
          <motion.div
            className="absolute inset-0 opacity-20"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            style={{ background: "repeating-conic-gradient(rgba(255,255,255,0.2) 0%, transparent 5%)" }}
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>

          {/* 트로피 */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            className="text-7xl mb-3"
          >
            🏆
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full mb-3"
          >
            <PartyPopper className="w-4 h-4 text-white" />
            <span className="text-white font-black text-sm">역사 마스터 달성!</span>
            <PartyPopper className="w-4 h-4 text-white" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white text-2xl font-black"
          >
            205장 전부 획득! 🎉
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-white/85 text-sm mt-1"
          >
            모든 역사 인물 카드를 수집했어요!<br />정말 대단해요!
          </motion.p>
        </div>

        {/* 본문 */}
        <div className="px-6 py-5">
          {/* 개발자 연락 섹션 */}
          <div
            className={`rounded-2xl p-4 mb-4 ${darkMode ? "bg-gray-800" : "bg-amber-50"} border ${darkMode ? "border-amber-900/40" : "border-amber-200"}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-5 h-5 text-amber-500" />
              <p className={`font-black text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>
                개발자에게 연락하기
              </p>
            </div>
            <p className={`text-xs mb-3 leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              더 많은 퀴즈 문제와 카드를 원하시나요?<br />
              아래에 메시지를 남겨주세요. 개발자에게 전달됩니다!
            </p>

            {sent ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-2 py-3 px-4 rounded-xl bg-green-500/10 border border-green-500/30"
              >
                <span className="text-xl">✅</span>
                <p className="text-sm text-green-600 font-bold">전송 완료! 개발자에게 전달되었어요.</p>
              </motion.div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSend()}
                  placeholder="더 많은 문제를 내주세요!"
                  maxLength={200}
                  className={`flex-1 px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                      : "bg-white border-amber-200 text-gray-900 placeholder-gray-400"
                  }`}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={sending}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-sm flex items-center gap-1.5 disabled:opacity-60"
                >
                  {sending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  전송
                </motion.button>
              </div>
            )}
          </div>

          {/* 닫기 */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
          >
            컬렉션 계속 보기
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── 카드 상세 모달 ───────────────────────────────────────────────
function CardDetailModal({
  character,
  imageUrl,
  config,
  onClose,
  onChat,
  darkMode,
}: {
  character: Character;
  imageUrl: string;
  config: (typeof PERIOD_CONFIG)[string];
  onClose: () => void;
  onChat?: () => void;
  darkMode: boolean;
}) {
  // 인물 카드 이미지 경로 (public/characters/ 우선)
  const cardImgPath = `/characters/${
    { 고조선: "gojoseon", 삼국시대: "three-kingdoms", 고려: "goryeo", 조선: "joseon", 근현대: "modern" }[character.period] ?? ""
  }/${character.id}.png`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 40 }}
        transition={{ type: "spring", damping: 20 }}
        className={`w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl ${darkMode ? "bg-gray-900" : "bg-white"}`}
        onClick={e => e.stopPropagation()}
      >
        {/* 이미지 영역 */}
        <div
          className="relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${config.color}30, ${config.color}80)`,
            minHeight: "280px",
          }}
        >
          {/* 시대 배경 패턴 */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, ${config.color} 1px, transparent 1px),
                radial-gradient(circle at 80% 20%, ${config.color} 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />

          {/* 인물 이미지 - 카드와 동일하게 세로 전체 표시 */}
          <div className="flex items-center justify-center pt-8 pb-4 px-6 relative">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", damping: 18 }}
              className="relative"
              style={{
                width: "160px",
                height: "213px", // 3:4 비율 (카드와 동일)
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: `0 12px 40px -8px ${config.color}80, 0 0 0 3px ${config.color}60`,
              }}
            >
              <ImageWithFallback
                src={cardImgPath}
                alt={character.name}
                className="w-full h-full object-cover"
                fallbackSrc={imageUrl}
                fallbackEmoji={character.emoji ?? "👤"}
              />
              {/* 반짝이 */}
              <motion.div
                className="absolute top-2 right-2"
                animate={{ rotate: 360, scale: [1, 1.4, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 drop-shadow" style={{ color: config.color }} fill="currentColor" />
              </motion.div>
            </motion.div>
          </div>

          {/* 상단 닫기 */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>

          {/* 시대 뱃지 */}
          <div
            className="absolute top-3 left-3 px-3 py-1 rounded-full text-white text-xs font-bold shadow"
            style={{ background: config.gradient }}
          >
            {character.period}
          </div>
        </div>

        {/* 이름 + 역할 */}
        <div
          className="px-5 py-3"
          style={{ background: `linear-gradient(135deg, ${config.color}15, transparent)` }}
        >
          <h2
            className={`text-xl font-black leading-tight ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            {character.name.replace(/^[①-⑳㉑-㉟㊱-㊿]+\s*/, "")}
          </h2>
          <p className="text-sm font-semibold mt-0.5" style={{ color: config.color }}>
            {character.role}
          </p>
        </div>

        {/* 정보 영역 */}
        <div className="px-5 pb-5">
          <p className={`text-sm leading-relaxed mb-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            {character.description}
          </p>

          {/* 액션 버튼 */}
          {onChat ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onChat}
              className="w-full py-3.5 rounded-2xl text-white font-bold flex items-center justify-center gap-2 shadow-lg"
              style={{ background: config.gradient }}
            >
              <MessageCircle className="w-5 h-5" />
              {character.name.replace(/^[①-⑳㉑-㉟㊱-㊿]+\s*/, "")}과(와) 대화하기
            </motion.button>
          ) : (
            <div className={`w-full py-3 rounded-2xl text-center text-sm font-semibold ${darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
              🔒 퀴즈를 풀어 카드를 획득하면 대화할 수 있어요!
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── 인물 카드 ────────────────────────────────────────────────────
function CharacterCard({
  character,
  isUnlocked,
  imageUrl,
  config,
  darkMode,
  onClick,
}: {
  character: Character;
  isUnlocked: boolean;
  imageUrl: string;
  config: (typeof PERIOD_CONFIG)[string];
  darkMode: boolean;
  onClick: () => void;
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    if (!isUnlocked) return;
    if (isFlipped) {
      onClick();
    } else {
      setIsFlipped(true);
    }
  };

  return (
    <motion.div
      className="cursor-pointer flex flex-col gap-1"
      style={{ perspective: "1000px" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: isUnlocked ? -5 : 0 }}
      onClick={handleClick}
    >
      {/* 카드 본체 */}
      <motion.div
        className="relative w-full aspect-[3/4]"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* ── 앞면 ── */}
        <div
          className={`absolute inset-0 rounded-xl overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}
          style={{
            backfaceVisibility: "hidden",
            boxShadow: isUnlocked
              ? `0 6px 20px -4px ${config.color}60`
              : "0 2px 8px rgba(0,0,0,0.12)",
            border: isUnlocked ? `2px solid ${config.color}50` : "2px solid transparent",
          }}
        >
          {isUnlocked ? (
            /* 해금 카드 앞면 */
            <div className="w-full h-full flex flex-col">
              <div className="flex-1 relative overflow-hidden">
                <ImageWithFallback
                  src={imageUrl}
                  alt={character.name}
                  className="w-full h-full object-cover"
                  fallbackEmoji={character.emoji ?? "👤"}
                />
                {/* 반짝이 */}
                <motion.div
                  className="absolute top-1.5 right-1.5"
                  animate={{ rotate: 360, scale: [1, 1.4, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Sparkles className="w-3 h-3" style={{ color: config.color }} fill="currentColor" />
                </motion.div>
                {/* 탭 힌트 */}
                <motion.div
                  className="absolute bottom-1 right-1 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded-full"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-white text-[8px]">탭→정보</span>
                </motion.div>
              </div>
            </div>
          ) : (
            /* 잠금 카드 앞면 */
            <div className="w-full h-full relative overflow-hidden">
              <div className="absolute inset-0">
                <img
                  src={imageUrl || getFallback(character.period)}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{ filter: "blur(6px) grayscale(70%) brightness(0.35)", transform: "scale(1.1)" }}
                />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-1">
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? "bg-gray-700/80" : "bg-white/80"} shadow-md`}
                >
                  <Lock className={`w-4 h-4 ${darkMode ? "text-gray-300" : "text-gray-500"}`} />
                </motion.div>
                <p className="text-white/80 text-[9px] font-bold drop-shadow">미획득</p>
              </div>
            </div>
          )}
        </div>

        {/* ── 뒷면 (해금 카드만) ── */}
        {isUnlocked && (
          <div
            className={`absolute inset-0 rounded-xl overflow-hidden p-2 flex flex-col ${darkMode ? "bg-gray-800" : "bg-white"}`}
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              boxShadow: `0 6px 20px -4px ${config.color}60`,
              border: `2px solid ${config.color}50`,
            }}
          >
            <div className="px-2 py-1.5 rounded-lg mb-1.5 text-center" style={{ background: `${config.color}20` }}>
              <span className="text-base">{character.emoji ?? "👤"}</span>
              <p className={`text-[10px] font-black mt-0.5 leading-tight ${darkMode ? "text-white" : "text-gray-900"}`}>
                {character.name}
              </p>
            </div>
            <div className="flex-1 space-y-1 text-left overflow-hidden">
              <div>
                <p className={`text-[9px] font-bold ${darkMode ? "text-gray-500" : "text-gray-400"}`}>역할</p>
                <p className={`text-[9px] font-semibold leading-tight ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{character.role}</p>
              </div>
              {character.description && (
                <p className={`text-[9px] leading-tight ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {character.description.slice(0, 60)}...
                </p>
              )}
            </div>
            <button
              onClick={e => { e.stopPropagation(); onClick(); }}
              className="mt-1.5 w-full py-1 rounded-lg text-white text-[9px] font-bold"
              style={{ background: config.gradient }}
            >
              상세보기
            </button>
            <p className={`text-center text-[8px] mt-0.5 ${darkMode ? "text-gray-600" : "text-gray-400"}`}>탭→돌아가기</p>
          </div>
        )}
      </motion.div>

      {/* ── 카드 아래 이름 표시 ── */}
      <div className="text-center px-0.5">
        {isUnlocked ? (
          <>
            <p
              className="text-[10px] font-black truncate leading-tight"
              style={{ color: config.color }}
            >
              {character.name}
            </p>
            <p className={`text-[9px] truncate leading-tight ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              {character.role}
            </p>
          </>
        ) : (
          <>
            <p className={`text-[10px] font-bold truncate leading-tight blur-[3px] select-none ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              {character.name}
            </p>
            <p className={`text-[9px] truncate leading-tight ${darkMode ? "text-gray-600" : "text-gray-300"}`}>
              ???
            </p>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════
// 메인 컴포넌트
// ══════════════════════════════════════════════════════════════
export function CharacterCollectionImproved({
  onBack,
  onHome,
  darkMode = false,
  unlockedIds: externalUnlockedIds,
  onSelectCharacter,
}: CharacterCollectionImprovedProps) {
  // Props로 받은 unlockedIds가 있으면 사용, 없으면 localStorage 폴백
  const unlockedIds = externalUnlockedIds ?? (() => {
    try {
      const saved = localStorage.getItem('unlockedCharacterIds');
      return saved ? new Set<string>(JSON.parse(saved)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  })();

  const [imageCache, setImageCache] = useState<Record<string, string>>({});
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Character | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activePeriod, setActivePeriod] = useState<string>("전체");
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);
  const [loadingImage, setLoadingImage] = useState<string | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [masterKeyPopup, setMasterKeyPopup] = useState<string | null>(null); // 현재 표시 중인 시대 마스터 키

  // 현재 로그인 유저 ID (localStorage)
  const currentUserId = (() => {
    try {
      const u = localStorage.getItem("currentUser");
      return u ? JSON.parse(u)?.email || null : null;
    } catch { return null; }
  })();

  // 210장 완성 감지 (최초 1회만)
  const completionShownRef = useRef(false);
  useEffect(() => {
    if (!completionShownRef.current && unlockedIds.size >= allCharacters.length) {
      completionShownRef.current = true;
      const t = setTimeout(() => setShowCompletionModal(true), 800);
      return () => clearTimeout(t);
    }
  }, [unlockedIds.size]);

  // 시대별 마스터 키 감지 (아직 수령하지 않은 시대만)
  const masterKeyQueueRef = useRef<string[]>([]);
  const masterKeyCheckDoneRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    // 페이지 로드 시에는 이미 저장된 키는 표시하지 않음
    const alreadyEarned = getMasterKeysEarned();
    PERIOD_ORDER.forEach(period => {
      if (alreadyEarned.has(period)) {
        masterKeyCheckDoneRef.current.add(period);
      }
    });
  }, []);

  useEffect(() => {
    if (!masterKeyPopup) {
      // 시대별로 확인 (queue 방식: 이미 팝업 중이 아닐 때만)
      for (const period of PERIOD_ORDER) {
        if (masterKeyCheckDoneRef.current.has(period)) continue;
        const periodChars = allCharacters.filter(c => c.period === period);
        const unlockedInPeriod = periodChars.filter(c => unlockedIds.has(c.id)).length;
        if (unlockedInPeriod >= periodChars.length && periodChars.length > 0) {
          masterKeyCheckDoneRef.current.add(period);
          saveMasterKeyEarned(period);
          setMasterKeyPopup(period);
          break; // 한 번에 하나씩 표시
        }
      }
    }
  }, [unlockedIds, masterKeyPopup]);

  // ── 인물 이미지 로드 ──────────────────────────────────────────
  const loadImage = useCallback(
    async (char: Character) => {
      if (imageCache[char.id] || loadingImage === char.id) return;
      setLoadingImage(char.id);
      try {
        const res = await fetch(`${SERVER_BASE}/search-character-image`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ characterName: char.name, period: char.period }),
          signal: AbortSignal.timeout(6000),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.imageUrl) {
            setImageCache(prev => ({ ...prev, [char.id]: data.imageUrl }));
            return;
          }
        }
      } catch {
        // ignore
      }
      setImageCache(prev => ({ ...prev, [char.id]: getFallback(char.period) }));
    },
    [imageCache, loadingImage],
  );

  // ── 필터링 ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return allCharacters.filter(c => {
      const matchPeriod = activePeriod === "전체" || c.period.includes(activePeriod);
      const isUnlocked = unlockedIds.has(c.id);
      const matchUnlock = !showUnlockedOnly || isUnlocked;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.period.toLowerCase().includes(q);
      return matchPeriod && matchUnlock && matchSearch;
    });
  }, [activePeriod, showUnlockedOnly, searchQuery, unlockedIds]);

  // 시대별 그룹핑
  const grouped = useMemo(() => {
    const g: Record<string, Character[]> = {};
    filtered.forEach(c => {
      const period = c.period;
      if (!g[period]) g[period] = [];
      g[period].push(c);
    });
    return g;
  }, [filtered]);

  // 통계
  const totalCount = allCharacters.length;
  const unlockedCount = unlockedIds.size;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  // ── 카드 클릭 ─────────────────────────────────────────────────
  const handleCardClick = (char: Character) => {
    loadImage(char);
    setSelectedCard(char);
  };

  // ── 렌더 ──────────────────────────────────────────────────────
  const dark = darkMode;

  return (
    <div className={`min-h-screen ${dark ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}>

      {/* ── 상단 헤더 ── */}
      <div
        className={`sticky top-0 z-40 ${dark ? "bg-gray-900/95" : "bg-white/95"} backdrop-blur-xl border-b ${dark ? "border-gray-800" : "border-gray-200"} shadow-sm`}
      >
        <div className="max-w-6xl mx-auto px-4 py-3">
          {/* 내비게이션 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium ${dark ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200"}`}
              >
                <ArrowLeft className="w-4 h-4" />
                뒤로가기
              </motion.button>
              {onHome && (
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={onHome}
                  className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                >
                  <Home className="w-4 h-4" />
                </motion.button>
              )}
            </div>

            <h1 className="font-black text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              역사 인물 카드 컬렉션
            </h1>

            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className={`p-2 rounded-xl ${dark ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200"}`}
              title="새로고침"
            >
              <RefreshCw className="w-4 h-4" />
            </motion.button>
          </div>

          {/* 진행률 바 */}
          <div className={`rounded-2xl p-4 ${dark ? "bg-gray-800" : "bg-gradient-to-r from-purple-50 to-pink-50"} mb-3`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" fill="currentColor" />
                <span className={`font-bold text-sm ${dark ? "text-white" : "text-gray-800"}`}>
                  컬렉션 달성률
                </span>
                {isLoadingCards && (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <RefreshCw className="w-3 h-3 text-gray-400" />
                  </motion.div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>
                  {unlockedCount} / {totalCount}명
                </span>
                <span className="font-black text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {progressPercent}%
                </span>
              </div>
            </div>
            <div className={`w-full h-3 rounded-full overflow-hidden ${dark ? "bg-gray-700" : "bg-gray-200"}`}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #7C3AED, #DB2777)" }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </div>

            {/* 안내 */}
            <div className="flex items-start gap-2 mt-3">
              <Star className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" />
              <p className={`text-xs ${dark ? "text-gray-400" : "text-gray-600"}`}>
                <strong>퀴즈를 풀면</strong> 역사 인물 카드를 획득할 수 있어요! 잠긴 카드는 흐릿하게 미리 보여요.
                카드를 탭하면 상세 정보와 대화하기를 이용할 수 있어요.
              </p>
            </div>
          </div>

          {/* 검색 + 필터 */}
          <div className="flex gap-2 flex-wrap">
            <div className={`flex-1 min-w-48 flex items-center gap-2 px-3 py-2 rounded-xl ${dark ? "bg-gray-800" : "bg-gray-100"}`}>
              <Search className={`w-4 h-4 flex-shrink-0 ${dark ? "text-gray-400" : "text-gray-500"}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="인물 이름, 시대, 역할 검색..."
                className={`flex-1 bg-transparent text-sm focus:outline-none ${dark ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"}`}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowUnlockedOnly(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                showUnlockedOnly
                  ? "bg-purple-600 border-purple-600 text-white"
                  : dark
                    ? "bg-gray-800 border-gray-700 text-gray-300"
                    : "bg-white border-gray-200 text-gray-600"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              {showUnlockedOnly ? "해금 카드만" : "전체 보기"}
            </button>
          </div>

          {/* 시대 탭 */}
          <div className="flex gap-1.5 mt-2 overflow-x-auto scrollbar-hide pb-1">
            {["전체", ...PERIOD_ORDER].map(p => {
              const conf = PERIOD_CONFIG[p];
              const cnt = p === "전체"
                ? allCharacters.length
                : allCharacters.filter(c => c.period.includes(p)).length;
              const unlockedCnt = p === "전체"
                ? unlockedCount
                : allCharacters.filter(c => c.period.includes(p) && unlockedIds.has(c.id)).length;

              return (
                <button
                  key={p}
                  onClick={() => setActivePeriod(p)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activePeriod === p
                      ? "text-white shadow-md"
                      : dark
                        ? "bg-gray-800 text-gray-400 hover:bg-gray-700"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                  style={activePeriod === p && conf ? { background: conf.gradient } : undefined}
                >
                  {conf?.emoji ?? "🌐"} {p}
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activePeriod === p ? "bg-white/30" : dark ? "bg-gray-700" : "bg-gray-200"}`}>
                    {unlockedCnt}/{cnt}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 카드 목록 ── */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <Search className={`w-16 h-16 ${dark ? "text-gray-700" : "text-gray-300"}`} />
            <p className={`font-bold ${dark ? "text-gray-400" : "text-gray-500"}`}>
              {showUnlockedOnly ? "아직 획득한 인물이 없어요!" : `"${searchQuery}" 검색 결과 없음`}
            </p>
            {showUnlockedOnly && (
              <div className={`flex items-center gap-2 text-sm ${dark ? "text-gray-500" : "text-gray-400"}`}>
                <Zap className="w-4 h-4 text-amber-500" />
                퀴즈를 풀어서 인물 카드를 획득해보세요!
              </div>
            )}
            <button
              onClick={() => { setSearchQuery(""); setShowUnlockedOnly(false); setActivePeriod("전체"); }}
              className="text-sm text-purple-500 underline"
            >
              필터 초기화
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {PERIOD_ORDER.map(period => {
              const chars = grouped[period];
              if (!chars || chars.length === 0) return null;

              const conf = PERIOD_CONFIG[period];
              if (!conf) return null;

              const Icon = conf.icon;
              const unlockedInPeriod = chars.filter(c => unlockedIds.has(c.id)).length;

              return (
                <motion.section
                  key={period}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* 시대 헤더 */}
                  {(() => {
                    const isPeriodComplete = unlockedInPeriod >= chars.length && chars.length > 0;
                    const hasMasterKey = getMasterKeysEarned().has(period);
                    const keyConf = MASTER_KEY_CONFIG[period];
                    return (
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 relative"
                          style={{ background: conf.gradient }}
                        >
                          <Icon className="w-5 h-5 text-white" />
                          {/* 마스터 키 완성 표시 */}
                          {hasMasterKey && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center shadow-md"
                            >
                              <span className="text-[9px]">🗝️</span>
                            </motion.div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className={`text-lg font-black ${dark ? "text-white" : "text-gray-900"}`}>{period}</h2>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${dark ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
                              획득 {unlockedInPeriod} / {chars.length}
                            </span>
                            {/* 마스터 키 뱃지 */}
                            {hasMasterKey && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black text-white shadow-sm"
                                style={{ background: keyConf?.bgGradient ?? conf.gradient }}
                              >
                                <Key className="w-2.5 h-2.5" />
                                마스터 키
                              </motion.div>
                            )}
                            {/* 완성 직전 강조 */}
                            {!hasMasterKey && isPeriodComplete && (
                              <motion.span
                                animate={{ opacity: [1, 0.4, 1] }}
                                transition={{ duration: 1.2, repeat: Infinity }}
                                className="text-[10px] font-bold text-amber-500"
                              >
                                ✨ 완성!
                              </motion.span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className={`w-3 h-3 ${dark ? "text-gray-500" : "text-gray-400"}`} />
                            <span className={`text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>{conf.years}</span>
                          </div>
                        </div>

                        {/* 시대 진행률 */}
                        <div className="flex items-center gap-2">
                          <div className={`w-20 h-1.5 rounded-full overflow-hidden ${dark ? "bg-gray-800" : "bg-gray-200"}`}>
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: hasMasterKey ? "linear-gradient(90deg,#F59E0B,#FBBF24)" : conf.gradient }}
                              initial={{ width: 0 }}
                              animate={{ width: `${(unlockedInPeriod / chars.length) * 100}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                          </div>
                          <span
                            className="text-xs font-black"
                            style={{ color: hasMasterKey ? "#F59E0B" : (dark ? "#9CA3AF" : "#6B7280") }}
                          >
                            {Math.round((unlockedInPeriod / chars.length) * 100)}%
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 구분선 */}
                  <div
                    className="h-0.5 rounded-full mb-4 opacity-30"
                    style={{ background: conf.gradient }}
                  />

                  {/* 카드 그리드 */}
                  <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-12 gap-2 sm:gap-3">
                    {chars.map((char, idx) => {
                      const isUnlocked = unlockedIds.has(char.id);
                      // public/characters/ 카드 이미지 최우선 → 로컬/캐시/외부 → 시대별 fallback
                      const periodFolder: Record<string, string> = {
                        고조선: "gojoseon", 삼국시대: "three-kingdoms",
                        고려: "goryeo", 조선: "joseon", 근현대: "modern",
                      };
                      const cardImg = periodFolder[char.period]
                        ? `/characters/${periodFolder[char.period]}/${char.id}.png`
                        : "";
                      const img = cardImg ||
                        resolveCharacterImage(char.id, char.period, char.imageUrl, imageCache) ||
                        getFallback(char.period);

                      return (
                        <motion.div
                          key={char.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.015, duration: 0.25 }}
                        >
                          <CharacterCard
                            character={char}
                            isUnlocked={isUnlocked}
                            imageUrl={img}
                            config={conf}
                            darkMode={dark}
                            onClick={() => {
                              loadImage(char);
                              handleCardClick(char);
                            }}
                          />
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.section>
              );
            })}
          </div>
        )}

        <div className="h-16" />
      </div>

      {/* ── 205장 완성 배너 버튼 (완성 시 항상 표시) ── */}
      <AnimatePresence>
        {unlockedIds.size >= allCharacters.length && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{ boxShadow: ["0 0 20px #F59E0B60", "0 0 40px #F59E0BA0", "0 0 20px #F59E0B60"] }}
              transition={{ duration: 2, repeat: Infinity }}
              onClick={() => setShowCompletionModal(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-black text-sm shadow-2xl"
              style={{ background: "linear-gradient(135deg, #F59E0B, #EF4444)" }}
            >
              <Trophy className="w-5 h-5 fill-current" />
              🏆 전체 카드 완성! 개발자에게 연락하기
              <Sparkles className="w-4 h-4 fill-current" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 카드 상세 모달 ── */}
      <AnimatePresence>
        {selectedCard && (
          <CardDetailModal
            character={selectedCard}
            imageUrl={
              (() => {
                const pf: Record<string, string> = {
                  고조선: "gojoseon", 삼국시대: "three-kingdoms",
                  고려: "goryeo", 조선: "joseon", 근현대: "modern",
                };
                return pf[selectedCard.period]
                  ? `/characters/${pf[selectedCard.period]}/${selectedCard.id}.png`
                  : resolveCharacterImage(selectedCard.id, selectedCard.period, selectedCard.imageUrl, imageCache) || getFallback(selectedCard.period);
              })()
            }
            config={PERIOD_CONFIG[selectedCard.period] ?? PERIOD_CONFIG["조선"]}
            onClose={() => setSelectedCard(null)}
            onChat={
              unlockedIds.has(selectedCard.id) && onSelectCharacter
                ? () => {
                    setSelectedCard(null);
                    onSelectCharacter(selectedCard);
                  }
                : undefined
            }
            darkMode={dark}
          />
        )}
      </AnimatePresence>

      {/* ── 시대 마스터 키 획득 모달 ── */}
      <AnimatePresence>
        {masterKeyPopup && (
          <PeriodMasterKeyModal
            period={masterKeyPopup}
            darkMode={dark}
            onClose={() => setMasterKeyPopup(null)}
          />
        )}
      </AnimatePresence>

      {/* ── 205장 완성 축하 모달 ── */}
      <AnimatePresence>
        {showCompletionModal && (
          <CompletionModal
            darkMode={dark}
            userId={currentUserId}
            onClose={() => setShowCompletionModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
