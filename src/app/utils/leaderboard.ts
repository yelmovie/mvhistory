/**
 * leaderboard.ts
 * 전역(모든 사용자 공유) 점수 게시판 - localStorage 기반
 *
 * 저장 키: "global_leaderboard"
 * 구조: LeaderboardEntry[] (최대 TOP 5)
 *
 * 레벨 정책:
 *   - 10,000점마다 레벨 1씩 증가
 *   - 레벨 1 = 0~9,999점, 레벨 2 = 10,000~19,999점, ...
 *
 * 점수 종류:
 *   - 퀴즈 정답: 퀴즈 화면에서 적립 (기존)
 *   - 역사 인물 대화 완료: 300점 고정
 */

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  level: number;               // 레벨 (10,000점당 1 증가)
  expInLevel: number;          // 현재 레벨 내 경험치 (0~9,999)
  source: "quiz" | "chat" | "mixed";
  characterName?: string;
  period?: string;
  registeredAt: string;
}

export const SCORE_PER_LEVEL = 10_000;

/** 점수 → 레벨 계산 */
export function getLevel(score: number): number {
  return Math.floor(score / SCORE_PER_LEVEL) + 1;
}

/** 점수 → 현재 레벨 내 경험치 (0~9,999) */
export function getExpInLevel(score: number): number {
  return score % SCORE_PER_LEVEL;
}

/** 레벨에 따른 칭호 */
export function getLevelTitle(level: number): string {
  if (level >= 10) return "역사의 신";
  if (level >= 7)  return "역사 마스터";
  if (level >= 5)  return "역사 탐험가";
  if (level >= 3)  return "역사 학자";
  if (level >= 2)  return "역사 입문자";
  return "역사 새싹";
}

/** 레벨 색상 (Tailwind className 반환) */
export function getLevelColor(level: number): { bg: string; text: string; border: string; glow: string } {
  if (level >= 10) return { bg: "bg-gradient-to-r from-red-500 to-orange-500", text: "text-red-600", border: "border-red-400", glow: "#EF4444" };
  if (level >= 7)  return { bg: "bg-gradient-to-r from-violet-500 to-purple-500", text: "text-violet-600", border: "border-violet-400", glow: "#7C3AED" };
  if (level >= 5)  return { bg: "bg-gradient-to-r from-amber-400 to-yellow-500", text: "text-amber-600", border: "border-amber-400", glow: "#F59E0B" };
  if (level >= 3)  return { bg: "bg-gradient-to-r from-blue-500 to-indigo-500", text: "text-blue-600", border: "border-blue-400", glow: "#3B82F6" };
  if (level >= 2)  return { bg: "bg-gradient-to-r from-emerald-400 to-teal-500", text: "text-emerald-600", border: "border-emerald-400", glow: "#10B981" };
  return { bg: "bg-gradient-to-r from-gray-400 to-slate-500", text: "text-gray-600", border: "border-gray-300", glow: "#6B7280" };
}

const STORAGE_KEY = "global_leaderboard";
const MAX_ENTRIES = 5;

// 욕설/비속어 필터
const BAD_WORDS = [
  "씨발", "시발", "개새", "병신", "미친", "존나", "ㅅㅂ", "ㅂㅅ", "ㄱㅅ",
  "fuck", "shit", "ass", "bitch", "damn", "crap",
  "지랄", "새끼", "놈", "년", "쓰레기", "죽어", "꺼져", "닥쳐",
  "바보", "멍청", "찐따", "장애", "거지", "똥", "후레",
];

export function containsBadWord(name: string): boolean {
  const lower = name.toLowerCase().replace(/\s/g, "");
  return BAD_WORDS.some(w => lower.includes(w.toLowerCase()));
}

export function validateName(name: string): { valid: boolean; error?: string } {
  const trimmed = name.trim();
  if (!trimmed) return { valid: false, error: "이름을 입력해주세요" };
  if (trimmed.length > 10) return { valid: false, error: "이름은 10자 이내로 입력해주세요" };
  if (containsBadWord(trimmed)) return { valid: false, error: "올바른 이름을 입력해주세요 (욕설 금지)" };
  if (/[<>'"&;]/.test(trimmed)) return { valid: false, error: "사용할 수 없는 문자가 포함되어 있어요" };
  return { valid: true };
}

/** 게시판 불러오기 - level 필드 자동 보정 포함 */
export function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LeaderboardEntry[];
    return parsed
      .filter(e => e.name && typeof e.score === "number")
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_ENTRIES)
      .map((e, i) => ({
        ...e,
        rank: i + 1,
        // 구버전 데이터 level 보정
        level: e.level ?? getLevel(e.score),
        expInLevel: e.expInLevel ?? getExpInLevel(e.score),
      }));
  } catch {
    return [];
  }
}

/** 새 점수 등록 (TOP5에 들면 저장) */
export function submitScore(entry: Omit<LeaderboardEntry, "rank" | "level" | "expInLevel">): {
  saved: boolean;
  rank: number | null;
  board: LeaderboardEntry[];
  levelUp: boolean;
  newLevel: number;
  prevLevel: number;
} {
  const current = loadLeaderboard();
  const minScore = current.length >= MAX_ENTRIES ? current[current.length - 1].score : -1;
  const qualifies = current.length < MAX_ENTRIES || entry.score > minScore;

  const newLevel   = getLevel(entry.score);
  const prevEntry  = current.find(e => e.name === entry.name);
  const prevLevel  = prevEntry ? prevEntry.level : 1;
  const levelUp    = newLevel > prevLevel;

  if (!qualifies) {
    return { saved: false, rank: null, board: current, levelUp: false, newLevel, prevLevel };
  }

  // 같은 이름 → 높은 점수만 유지
  const filtered = current.filter(e => e.name !== entry.name);
  const enriched: LeaderboardEntry = {
    ...entry,
    rank: 0,
    level: newLevel,
    expInLevel: getExpInLevel(entry.score),
  };
  const updated = [...filtered, enriched]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_ENTRIES)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    console.warn("[leaderboard] 저장 실패");
  }

  const myRank = updated.findIndex(e => e.name === entry.name) + 1;
  return { saved: true, rank: myRank > 0 ? myRank : null, board: updated, levelUp, newLevel, prevLevel };
}

/** 내 최고 점수 조회 */
export function getMyBestScore(name: string): LeaderboardEntry | null {
  const board = loadLeaderboard();
  return board.find(e => e.name === name) ?? null;
}

/** 5위 기준 점수 */
export function getCutoffScore(): number {
  const board = loadLeaderboard();
  if (board.length < MAX_ENTRIES) return 0;
  return board[board.length - 1].score;
}

/** 게시판 초기화 (테스트용) */
export function resetLeaderboard(): void {
  localStorage.removeItem(STORAGE_KEY);
}
