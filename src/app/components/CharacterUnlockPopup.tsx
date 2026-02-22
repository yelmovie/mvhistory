import { motion, AnimatePresence } from "motion/react";
import { X, Star, Sparkles, Trophy, MessageCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import type { Character } from "../data/quizData";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { resolveCharacterImage, getCharacterImageCandidates } from "../utils/characterImageMap";

// ── 시대별 색상 ──────────────────────────────────────────────────
const PERIOD_COLOR: Record<string, { gradient: string; color: string }> = {
  고조선: { gradient: "linear-gradient(135deg,#92400E,#D97706)", color: "#D97706" },
  삼국시대: { gradient: "linear-gradient(135deg,#059669,#10B981)", color: "#10B981" },
  고려: { gradient: "linear-gradient(135deg,#0891B2,#06B6D4)", color: "#06B6D4" },
  조선: { gradient: "linear-gradient(135deg,#DC2626,#F59E0B)", color: "#EF4444" },
  근현대: { gradient: "linear-gradient(135deg,#1E40AF,#6366F1)", color: "#6366F1" },
};

function getPeriodStyle(period: string) {
  for (const [key, val] of Object.entries(PERIOD_COLOR)) {
    if (period.includes(key)) return val;
  }
  return { gradient: "linear-gradient(135deg,#7C3AED,#DB2777)", color: "#7C3AED" };
}

// ── 콘페티 파티클 ─────────────────────────────────────────────────
const CONFETTI_COLORS = ["#F59E0B","#EF4444","#10B981","#3B82F6","#8B5CF6","#EC4899","#06B6D4","#FBBF24"];

function ConfettiParticle({ delay, color }: { delay: number; color: string }) {
  const x = (Math.random() - 0.5) * 400;
  const rotation = Math.random() * 720 - 360;
  const size = Math.random() * 8 + 6;
  const shape = Math.random() > 0.5 ? "50%" : "2px";
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: shape,
        top: "30%",
        left: "50%",
      }}
      initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
      animate={{
        opacity: [1, 1, 0],
        x,
        y: [0, -120, 300],
        rotate: rotation,
        scale: [1, 1.2, 0.8],
      }}
      transition={{
        duration: 2.2,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    />
  );
}

// ── 별 파티클 ─────────────────────────────────────────────────────
function StarBurst({ count = 16 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * 360;
        const dist = 80 + Math.random() * 60;
        const rad = (angle * Math.PI) / 180;
        const tx = Math.cos(rad) * dist;
        const ty = Math.sin(rad) * dist;
        return (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 pointer-events-none"
            initial={{ opacity: 1, x: 0, y: 0, scale: 0 }}
            animate={{ opacity: [1, 1, 0], x: tx, y: ty, scale: [0, 1.5, 0] }}
            transition={{ duration: 0.8, delay: 0.1 + i * 0.02, ease: "easeOut" }}
          >
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          </motion.div>
        );
      })}
    </>
  );
}

// ── 빛나는 광원 효과 ──────────────────────────────────────────────
function GlowRings({ color }: { color: string }) {
  return (
    <>
      {[1, 2, 3].map(i => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ border: `2px solid ${color}`, opacity: 0 }}
          animate={{ scale: [1, 1 + i * 0.5], opacity: [0.8, 0] }}
          transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity, repeatDelay: 1 }}
        />
      ))}
    </>
  );
}

// ── Props ─────────────────────────────────────────────────────────
interface CharacterUnlockPopupProps {
  isOpen: boolean;
  character: Character | null;
  onClose: () => void;
  darkMode?: boolean;
  reason?: "quiz" | "chat";
  correctCount?: number;
  onGoToCollection?: () => void;
}

export function CharacterUnlockPopup({
  isOpen,
  character,
  onClose,
  darkMode = false,
  reason = "quiz",
  correctCount,
  onGoToCollection,
}: CharacterUnlockPopupProps) {
  const [phase, setPhase] = useState<"reveal" | "show">("reveal");
  const [confettiList, setConfettiList] = useState<Array<{ id: number; color: string; delay: number }>>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen && character) {
      setPhase("reveal");
      // 콘페티 생성
      setConfettiList(
        Array.from({ length: 60 }, (_, i) => ({
          id: i,
          color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          delay: i * 0.025,
        }))
      );
      timerRef.current = setTimeout(() => setPhase("show"), 600);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isOpen, character]);

  if (!character) return null;

  const periodStyle = getPeriodStyle(character.period);
  const reasonText =
    reason === "quiz"
      ? correctCount
        ? `퀴즈 ${correctCount}개 정답 달성!`
        : "퀴즈 5개 정답 달성!"
      : "인물과 대화 완료!";

  const handleGoCollection = () => {
    onClose();
    onGoToCollection?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* 배경 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            onClick={onClose}
          />

          {/* 콘페티 */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {confettiList.map(p => (
              <ConfettiParticle key={p.id} delay={p.delay} color={p.color} />
            ))}
          </div>

          {/* 팝업 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className={`relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl ${
              darkMode ? "bg-gray-900" : "bg-white"
            }`}
            style={{ boxShadow: `0 0 60px ${periodStyle.color}60, 0 25px 50px rgba(0,0,0,0.4)` }}
          >
            {/* 상단 그라데이션 헤더 */}
            <div
              className="relative pt-8 pb-6 px-6 text-center overflow-hidden"
              style={{ background: periodStyle.gradient }}
            >
              {/* 별 폭발 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <StarBurst count={20} />
              </div>

              {/* 배경 패턴 */}
              <motion.div
                className="absolute inset-0 opacity-10"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                style={{
                  background: "repeating-linear-gradient(45deg, white 0px, white 1px, transparent 1px, transparent 12px)",
                }}
              />

              {/* 획득 뱃지 */}
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full mb-3"
              >
                <Trophy className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                <span className="text-white font-black text-sm">카드 획득!</span>
                <Trophy className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              </motion.div>

              {/* 제목 */}
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-white text-2xl font-black mb-1"
              >
                🎉 축하합니다!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-white/80 text-sm font-medium"
              >
                {reasonText}
              </motion.p>

              {/* 닫기 */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 카드 본체 */}
            <div className="px-6 py-5">
              {/* 카드 flip 등장 */}
              <motion.div
                className="relative mx-auto"
                style={{ width: 160, perspective: "800px" }}
                initial={{ rotateY: -180, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
              >
                {/* 광원 링 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    <GlowRings color={periodStyle.color} />
                  </div>
                </div>

                {/* 카드 */}
                <div
                  className="relative rounded-2xl overflow-hidden shadow-xl"
                  style={{
                    border: `3px solid ${periodStyle.color}`,
                    boxShadow: `0 0 30px ${periodStyle.color}60`,
                  }}
                >
                  {/* 이미지 - public/characters 경로 우선, 모든 확장자 순차 시도 */}
                  {(() => {
                    const primarySrc = resolveCharacterImage(character.id, character.period, character.imageUrl);
                    // 모든 확장자 후보 (webp, jpg, jpeg, png) 중 primary와 다른 것들
                    const candidates = getCharacterImageCandidates(character.id, character.period);
                    const fallbacks = candidates.filter(c => c !== primarySrc);
                    return (
                      <div className="aspect-[3/4] w-full">
                        <ImageWithFallback
                          src={primarySrc}
                          alt={character.name}
                          className="w-full h-full object-cover"
                          fallbackSrc={fallbacks}
                          fallbackEmoji={character.emoji ?? "👤"}
                        />
                      </div>
                    );
                  })()}
                  {/* 카드 하단 이름 */}
                  <div
                    className="absolute bottom-0 left-0 right-0 px-3 py-2 text-center"
                    style={{ background: periodStyle.gradient }}
                  >
                    <p className="text-white font-black text-sm">
                      {character.name.replace(/^[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳㉑㉒㉓㉔㉕㉖㉗㉘㉙㉚㉛㉜㉝㉞㉟㊱㊲㊳㊴㊵㊶㊷㊸㊹㊺㊻㊼㊽㊾㊿]\s*/, '')}
                    </p>
                    <p className="text-white/70 text-[10px]">{character.role}</p>
                  </div>
                  {/* 반짝이 효과 */}
                  <motion.div
                    className="absolute top-2 right-2"
                    animate={{ rotate: 360, scale: [1, 1.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                  </motion.div>
                </div>
              </motion.div>

              {/* 인물 정보 */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="mt-4 text-center"
              >
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-white mb-2"
                  style={{ background: periodStyle.gradient }}
                >
                  <span>{character.period}</span>
                  <span>·</span>
                  <span>{character.role}</span>
                </div>
                <p className={`text-xs leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {character.description?.slice(0, 80)}...
                </p>
              </motion.div>

              {/* 버튼 영역 */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="mt-5 space-y-2"
              >
                {onGoToCollection && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGoCollection}
                    className="w-full py-3 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg"
                    style={{ background: periodStyle.gradient }}
                  >
                    <Star className="w-4 h-4 fill-current" />
                    카드 컬렉션에서 확인하기
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className={`w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 ${
                    darkMode ? "bg-gray-800 text-gray-200 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  퀴즈 계속하기
                </motion.button>
              </motion.div>
            </div>

            {/* 하단 진행 힌트 */}
            <div
              className="px-6 py-3 text-center"
              style={{ background: `${periodStyle.color}15` }}
            >
              <p className={`text-[11px] ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                💡 퀴즈 5개 정답마다 새 카드를 획득해요!
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
