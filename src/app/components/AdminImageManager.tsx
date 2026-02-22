import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, Upload, Trash2, CheckCircle, Image as ImageIcon,
  Search, ChevronDown, Eye, EyeOff, Download,
} from "lucide-react";
import { allCharacters } from "../data/charactersData";
import type { Character } from "../data/quizData";
import {
  saveCharacterImageToLocal,
  deleteCharacterImageFromLocal,
  getLocalImageIds,
} from "../utils/characterImageMap";

// ── 시대 목록 ─────────────────────────────────────────────────────
const PERIODS = ["전체", "고조선", "삼국시대", "고려", "조선", "근현대"];

const PERIOD_COLOR: Record<string, string> = {
  고조선: "#D97706",
  삼국시대: "#10B981",
  고려: "#06B6D4",
  조선: "#EF4444",
  근현대: "#6366F1",
};

// ── 카드 크기 (시대별) ────────────────────────────────────────────
// 고조선(5명): 최대 카드 / 삼국·고려·근현대(30~40명): 중형 카드 / 조선(100명): 소형 카드
const CARD_SIZES: Record<string, { w: number; h: number }> = {
  고조선: { w: 160, h: 210 },
  삼국시대: { w: 128, h: 170 },
  고려: { w: 128, h: 170 },
  조선: { w: 100, h: 134 },
  근현대: { w: 120, h: 160 },
};

// ── 유틸 ──────────────────────────────────────────────────────────
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function clipboardImageToDataUrl(): Promise<string | null> {
  try {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      const imageType = item.types.find(t => t.startsWith("image/"));
      if (imageType) {
        const blob = await item.getType(imageType);
        return fileToDataUrl(new File([blob], "paste.png", { type: imageType }));
      }
    }
  } catch {
    // 권한 없음
  }
  return null;
}

// ── 인물 이미지 카드 ──────────────────────────────────────────────
function CharacterImageCard({
  character,
  savedIds,
  onSave,
  onDelete,
}: {
  character: Character;
  savedIds: Set<string>;
  onSave: (id: string, dataUrl: string) => void;
  onDelete: (id: string) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasSaved = savedIds.has(character.id);
  const color = PERIOD_COLOR[character.period] ?? "#6366F1";
  const cardSize = CARD_SIZES[character.period] ?? { w: 112, h: 150 };

  // 저장된 이미지 미리보기 로드
  useEffect(() => {
    if (hasSaved) {
      const stored = localStorage.getItem(`char_img_${character.id}`);
      if (stored) setPreview(stored);
    } else {
      setPreview(null);
    }
  }, [hasSaved, character.id]);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files?.length) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) return;
    const dataUrl = await fileToDataUrl(file);
    setPreview(dataUrl);
    onSave(character.id, dataUrl);
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 2000);
  }, [character.id, onSave]);

  const handlePaste = useCallback(async () => {
    const dataUrl = await clipboardImageToDataUrl();
    if (dataUrl) {
      setPreview(dataUrl);
      onSave(character.id, dataUrl);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    }
  }, [character.id, onSave]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col gap-2 items-center"
    >
      {/* 카드 영역 */}
      <div
        className="relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer"
        style={{
          width: cardSize.w,
          height: cardSize.h,
          borderColor: isDragging ? color : hasSaved ? `${color}80` : "#E5E7EB",
          boxShadow: hasSaved ? `0 4px 16px ${color}40` : "none",
        }}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />

        {preview ? (
          <>
            <img src={preview} alt={character.name} className="w-full h-full object-cover" />
            {/* 저장 완료 오버레이 */}
            <AnimatePresence>
              {status === "saved" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/40"
                >
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-1"
            style={{ background: isDragging ? `${color}15` : "#F9FAFB" }}
          >
            <span className="text-3xl">{character.emoji ?? "👤"}</span>
            <Upload className="w-4 h-4 text-gray-400" />
            <span className="text-[9px] text-gray-400 text-center px-1">
              클릭 또는<br />드래그
            </span>
          </div>
        )}

        {/* 배지: 저장됨 */}
        {hasSaved && (
          <div
            className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: color }}
          >
            <CheckCircle className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* 이름 + 버튼 */}
      <div className="w-full text-center" style={{ width: cardSize.w }}>
        <p className="text-xs font-bold text-gray-800 truncate">{character.name}</p>
        <p className="text-[9px] text-gray-400 truncate mb-1">{character.role}</p>

        <div className="flex gap-1 justify-center">
          {/* 클립보드 붙여넣기 */}
          <button
            onClick={e => { e.stopPropagation(); handlePaste(); }}
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] bg-gray-100 hover:bg-gray-200 text-gray-600"
          >
            <ImageIcon className="w-2.5 h-2.5" />
            붙여넣기
          </button>

          {/* 삭제 */}
          {hasSaved && (
            <button
              onClick={e => {
                e.stopPropagation();
                setPreview(null);
                onDelete(character.id);
              }}
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] bg-red-50 hover:bg-red-100 text-red-500"
            >
              <Trash2 className="w-2.5 h-2.5" />
              삭제
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── 메인: AdminImageManager ───────────────────────────────────────
export default function AdminImageManager({ onBack }: { onBack: () => void }) {
  const [selectedPeriod, setSelectedPeriod] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [showOnlyEmpty, setShowOnlyEmpty] = useState(false);
  const [showStats, setShowStats] = useState(true);

  // 저장된 ID 목록 초기 로드
  useEffect(() => {
    setSavedIds(new Set(getLocalImageIds()));
  }, []);

  const handleSave = useCallback((id: string, dataUrl: string) => {
    saveCharacterImageToLocal(id, dataUrl);
    setSavedIds(prev => new Set([...prev, id]));
  }, []);

  const handleDelete = useCallback((id: string) => {
    deleteCharacterImageFromLocal(id);
    setSavedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  // 필터링된 인물 목록
  const filtered = allCharacters.filter(char => {
    const periodOk = selectedPeriod === "전체" || char.period === selectedPeriod;
    const searchOk = !searchQuery || char.name.includes(searchQuery) || char.role.includes(searchQuery);
    const emptyOk = !showOnlyEmpty || !savedIds.has(char.id);
    return periodOk && searchOk && emptyOk;
  });

  // 시대별 통계
  const stats = PERIODS.filter(p => p !== "전체").map(period => {
    const total = allCharacters.filter(c => c.period === period).length;
    const done = allCharacters.filter(c => c.period === period && savedIds.has(c.id)).length;
    return { period, total, done };
  });

  const totalDone = savedIds.size;
  const totalAll = allCharacters.length;

  // 모든 이미지 export (JSON 다운로드)
  const handleExportAll = () => {
    const data: Record<string, string> = {};
    getLocalImageIds().forEach(id => {
      const val = localStorage.getItem(`char_img_${id}`);
      if (val) data[id] = val;
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "character-images.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-black text-gray-900">인물 카드 이미지 관리</h1>
              <p className="text-xs text-gray-500">
                {totalDone}/{totalAll}개 등록됨 · 카드를 클릭하거나 이미지를 드래그하세요
              </p>
            </div>
            <button
              onClick={handleExportAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
            >
              <Download className="w-3.5 h-3.5" />
              전체 내보내기
            </button>
          </div>

          {/* 진행률 바 */}
          <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
            <motion.div
              className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${(totalDone / totalAll) * 100}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>

          {/* 통계 (토글) */}
          <button
            onClick={() => setShowStats(v => !v)}
            className="flex items-center gap-1 text-xs text-gray-500 mb-2"
          >
            {showStats ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            시대별 현황 {showStats ? "숨기기" : "보기"}
          </button>
          <AnimatePresence>
            {showStats && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {stats.map(s => (
                    <div
                      key={s.period}
                      className="text-center p-2 rounded-xl cursor-pointer hover:scale-105 transition-transform"
                      style={{
                        background: `${PERIOD_COLOR[s.period]}15`,
                        border: `1px solid ${PERIOD_COLOR[s.period]}30`,
                      }}
                      onClick={() => setSelectedPeriod(s.period)}
                    >
                      <p className="text-[10px] font-bold" style={{ color: PERIOD_COLOR[s.period] }}>
                        {s.period}
                      </p>
                      <p className="text-sm font-black text-gray-800">
                        {s.done}<span className="text-gray-400 font-normal">/{s.total}</span>
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                        <div
                          className="h-1 rounded-full"
                          style={{
                            width: `${(s.done / s.total) * 100}%`,
                            background: PERIOD_COLOR[s.period],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 필터 바 */}
          <div className="flex gap-2 flex-wrap items-center">
            {/* 검색 */}
            <div className="relative flex-1 min-w-32">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="인물 검색..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            {/* 시대 필터 */}
            <div className="flex gap-1 flex-wrap">
              {PERIODS.map(p => (
                <button
                  key={p}
                  onClick={() => setSelectedPeriod(p)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  style={
                    selectedPeriod === p
                      ? {
                          background: p === "전체" ? "#374151" : PERIOD_COLOR[p],
                          color: "white",
                        }
                      : { background: "#F3F4F6", color: "#6B7280" }
                  }
                >
                  {p}
                </button>
              ))}
            </div>

            {/* 빈 카드만 보기 */}
            <button
              onClick={() => setShowOnlyEmpty(v => !v)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                showOnlyEmpty ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              <EyeOff className="w-3 h-3" />
              미등록만
            </button>
          </div>
        </div>
      </div>

      {/* 카드 그리드 */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {/* 시대 구분 렌더링 */}
        {PERIODS.filter(p => p !== "전체").map(period => {
          if (selectedPeriod !== "전체" && selectedPeriod !== period) return null;
          const periodChars = filtered.filter(c => c.period === period);
          if (!periodChars.length) return null;

          const color = PERIOD_COLOR[period];
          const periodTotal = allCharacters.filter(c => c.period === period).length;
          const periodDone = allCharacters.filter(c => c.period === period && savedIds.has(c.id)).length;

          return (
            <div key={period} className="mb-10">
              {/* 섹션 헤더 */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="h-1 w-8 rounded-full"
                  style={{ background: color }}
                />
                <h2 className="text-base font-black text-gray-800">{period}</h2>
                <span className="text-xs text-gray-400">
                  {periodDone}/{periodTotal}개 등록
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-1">
                  <div
                    className="h-1 rounded-full transition-all"
                    style={{
                      width: `${(periodDone / periodTotal) * 100}%`,
                      background: color,
                    }}
                  />
                </div>
                {periodDone === periodTotal && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: color }}>
                    ✓ 완성
                  </span>
                )}
              </div>

              {/* 카드 그리드 */}
              <div className="flex flex-wrap gap-4">
                {periodChars.map(char => (
                  <CharacterImageCard
                    key={char.id}
                    character={char}
                    savedIds={savedIds}
                    onSave={handleSave}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Search className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">검색 결과가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
