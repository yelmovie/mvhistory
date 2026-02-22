import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Trophy, Medal, Award, ArrowLeft, Star, Home,
  Crown, Flame, Zap, Edit3, CheckCircle, AlertCircle, RotateCcw, TrendingUp
} from "lucide-react";
import {
  loadLeaderboard,
  submitScore,
  validateName,
  getCutoffScore,
  getLevel,
  getExpInLevel,
  getLevelTitle,
  getLevelColor,
  SCORE_PER_LEVEL,
  type LeaderboardEntry,
} from "../utils/leaderboard";
import { t, type Lang } from "../utils/i18n";

interface LeaderboardProps {
  onClose: () => void;
  onHome?: () => void;
  userScore: number;
  scoreSource?: "quiz" | "chat";
  characterName?: string;
  period?: string;
  prefilledName?: string;
  lang?: Lang;
}

// ── 1~5위 순위 스타일 ──────────────────────────────────────────
const RANK_STYLES = [
  { border: "border-amber-300",  bg: "from-amber-50 to-yellow-50",   textColor: "text-amber-700",  ringColor: "ring-amber-400"  },
  { border: "border-slate-300",  bg: "from-slate-50 to-gray-50",     textColor: "text-slate-700",  ringColor: "ring-slate-400"  },
  { border: "border-orange-300", bg: "from-orange-50 to-amber-50",   textColor: "text-orange-700", ringColor: "ring-orange-400" },
  { border: "border-purple-300", bg: "from-purple-50 to-violet-50",  textColor: "text-purple-700", ringColor: "ring-purple-400" },
  { border: "border-blue-300",   bg: "from-blue-50 to-sky-50",       textColor: "text-blue-700",   ringColor: "ring-blue-400"   },
];

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="w-5 h-5 text-amber-500 fill-amber-400" />;
  if (rank === 2) return <Trophy className="w-5 h-5 text-slate-400 fill-slate-300" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-orange-500 fill-orange-400" />;
  if (rank === 4) return <Award className="w-4 h-4 text-purple-500" />;
  return <Star className="w-4 h-4 text-blue-500 fill-blue-400" />;
}

// ── 레벨 배지 컴포넌트 ─────────────────────────────────────────
function LevelBadge({ level, size = "md" }: { level: number; size?: "sm" | "md" | "lg" }) {
  const color = getLevelColor(level);
  const sizes = {
    sm: "text-[10px] px-1.5 py-0.5 rounded-lg",
    md: "text-xs px-2 py-0.5 rounded-xl",
    lg: "text-sm px-3 py-1 rounded-xl font-black",
  };
  return (
    <span className={`${color.bg} text-white font-bold ${sizes[size]} inline-flex items-center gap-1 shadow-sm flex-shrink-0`}>
      <Zap className={size === "lg" ? "w-3.5 h-3.5" : "w-2.5 h-2.5"} />
      Lv.{level}
    </span>
  );
}

// ── EXP 진행 바 ────────────────────────────────────────────────
function ExpBar({ score, size = "md" }: { score: number; size?: "sm" | "md" }) {
  const level = getLevel(score);
  const exp = getExpInLevel(score);
  const pct = Math.round((exp / SCORE_PER_LEVEL) * 100);
  const color = getLevelColor(level);
  const heightClass = size === "sm" ? "h-1" : "h-1.5";

  return (
    <div className="w-full">
      <div className={`${heightClass} bg-gray-100 rounded-full overflow-hidden`}>
        <motion.div
          className={`h-full rounded-full ${color.bg}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ── 불꽃 파티클 ────────────────────────────────────────────────
function FireParticle({ i }: { i: number }) {
  return (
    <motion.div
      className="absolute text-xs pointer-events-none select-none"
      style={{ left: `${10 + i * 20}%`, top: "100%" }}
      animate={{ y: [-20, -60, -80], opacity: [1, 0.6, 0], scale: [1, 0.6, 0] }}
      transition={{ duration: 1.5 + i * 0.2, repeat: Infinity, delay: i * 0.3 }}
    >
      {["🔥", "⭐", "✨", "💫", "🌟"][i % 5]}
    </motion.div>
  );
}

const BAD_NAME_PATTERN = /[<>'";&]/;

export function Leaderboard({
  onClose,
  onHome,
  userScore,
  scoreSource = "quiz",
  characterName,
  period,
  prefilledName = "",
  lang = 'ko',
}: LeaderboardProps) {
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [playerName, setPlayerName] = useState(prefilledName);
  const [phase, setPhase] = useState<"input" | "result">("input");
  const [nameError, setNameError] = useState("");
  const [submitResult, setSubmitResult] = useState<{
    saved: boolean;
    rank: number | null;
    levelUp: boolean;
    newLevel: number;
    prevLevel: number;
  } | null>(null);

  // 내 레벨 정보
  const myLevel   = getLevel(userScore);
  const myExp     = getExpInLevel(userScore);
  const myTitle   = getLevelTitle(myLevel);
  const myColor   = getLevelColor(myLevel);
  const expPct    = Math.round((myExp / SCORE_PER_LEVEL) * 100);
  const toNextLvl = SCORE_PER_LEVEL - myExp;

  useEffect(() => {
    setBoard(loadLeaderboard());
  }, []);

  const cutoff   = getCutoffScore();
  const maxScore = board.length > 0 ? board[0].score : Math.max(userScore, 1);
  const qualifies = board.length < 5 || userScore > cutoff;

  const handleNameChange = (v: string) => {
    setPlayerName(v);
    if (nameError) setNameError("");
  };

  const handleRegister = () => {
    const { valid, error } = validateName(playerName);
    if (!valid) { setNameError(error ?? "올바른 이름을 입력해주세요"); return; }
    if (BAD_NAME_PATTERN.test(playerName)) { setNameError("사용할 수 없는 문자가 포함되어 있어요"); return; }

    const result = submitScore({
      name: playerName.trim(),
      score: userScore,
      source: scoreSource,
      characterName,
      period,
      registeredAt: new Date().toISOString(),
    });

    setSubmitResult(result);
    setBoard(result.board);
    setPhase("result");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* ── 헤더 ─────────────────────────────────── */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/80 border border-gray-200 shadow-md text-gray-700 font-bold text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              뒤로
            </motion.button>
            {onHome && (
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={onHome}
                className="p-2.5 rounded-2xl bg-indigo-500 text-white shadow-md"
              >
                <Home className="w-4 h-4" />
              </motion.button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Trophy className="w-7 h-7 text-amber-500 fill-amber-400" />
            </motion.div>
            <div>
              <h2 className="text-xl font-black text-gray-800">{t(lang, 'lbTitle')}</h2>
              <p className="text-xs text-gray-500">{lang === 'ko' ? 'TOP 5 레벨 게시판' : 'TOP 5 Level Board'}</p>
            </div>
          </div>
          <div className="w-24" />
        </div>

        {/* ── 내 점수 & 레벨 배너 ──────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative mb-4 overflow-hidden rounded-3xl p-5 text-white shadow-xl"
          style={{ background: "linear-gradient(135deg, #7C3AED 0%, #EC4899 60%, #F59E0B 100%)" }}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[0, 1, 2, 3, 4].map(i => <FireParticle key={i} i={i} />)}
          </div>

          <div className="relative">
            {/* 상단: 점수 + 레벨 배지 */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-white/70 text-xs font-semibold mb-0.5">
                  {scoreSource === "chat" ? `💬 ${characterName ?? (lang === 'ko' ? '역사 인물' : 'Historical Figure')} ${lang === 'ko' ? '대화 완료' : 'Chat Complete'}` : `📚 ${lang === 'ko' ? '퀴즈 완료' : 'Quiz Complete'}`}
                </p>
                <p className="text-4xl font-black tracking-tight">
                  {userScore.toLocaleString()}
                  <span className="text-base ml-1 font-bold opacity-75">점</span>
                </p>
              </div>
              {/* 레벨 정보 블록 */}
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-2xl">
                  <Zap className="w-4 h-4 fill-current" />
                  <span className="font-black text-lg">Lv.{myLevel}</span>
                </div>
                <span className="text-white/80 text-xs font-semibold">{myTitle}</span>
              </div>
            </div>

            {/* EXP 바 */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/70 font-semibold">
                  EXP {myExp.toLocaleString()} / {SCORE_PER_LEVEL.toLocaleString()}
                </span>
                <span className="text-white/60">
                  다음 레벨까지 {toNextLvl.toLocaleString()}점
                </span>
              </div>
              <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-white/90"
                  initial={{ width: 0 }}
                  animate={{ width: `${expPct}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                />
              </div>
            </div>

            {/* TOP5 진입 가능 여부 */}
            <div className="flex items-center justify-between mt-3">
              {qualifies ? (
                <span className="inline-flex items-center gap-1.5 bg-white/25 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black">
                  <TrendingUp className="w-3 h-3" />
                  TOP 5 진입 가능!
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold">
                  5위 기준: {cutoff.toLocaleString()}점
                </span>
              )}
              <span className="text-white/60 text-xs">{expPct}% 달성</span>
            </div>
          </div>
        </motion.div>

        {/* ── 이름 입력 / 등록 결과 ────────────────── */}
        <AnimatePresence mode="wait">
          {phase === "input" ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 bg-white border-2 border-indigo-100 rounded-3xl p-4 shadow-lg"
            >
              <div className="flex items-center gap-2 mb-3">
                <Edit3 className="w-4 h-4 text-indigo-500" />
                <h3 className="font-black text-gray-800">{t(lang, 'registerName')}</h3>
                <span className="text-xs text-gray-400 ml-auto">{lang === 'ko' ? '최대 10자 · 욕설 금지' : 'Max 10 chars · No offensive language'}</span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={playerName}
                  onChange={e => handleNameChange(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleRegister()}
                  placeholder={lang === 'ko' ? '닉네임을 입력하세요 ✏️' : 'Enter your nickname ✏️'}
                  maxLength={10}
                  className={`w-full px-4 py-3 rounded-2xl border-2 text-sm font-semibold focus:outline-none transition-all ${
                    nameError
                      ? "border-red-400 bg-red-50 focus:ring-4 focus:ring-red-100"
                      : "border-indigo-200 bg-indigo-50/50 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold">
                  {playerName.length}/10
                </span>
              </div>

              <AnimatePresence>
                {nameError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 mt-2 text-red-500 text-xs font-semibold"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    {nameError}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-2 mt-3">
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={handleRegister}
                  disabled={!playerName.trim()}
                  className="flex-1 py-3 rounded-2xl text-white font-black text-sm shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #6366F1, #EC4899)" }}
                >
                  <Trophy className="w-4 h-4" />
                  {t(lang, 'registerBtn')}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setPhase("result")}
                  className="px-4 py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold text-sm"
                >
                  {lang === 'ko' ? '건너뛰기' : 'Skip'}
                </motion.button>
              </div>
              <p className="text-center text-xs text-gray-400 mt-2">
                💡 {lang === 'ko' ? '같은 이름 등록 시 더 높은 점수가 자동 유지돼요' : 'Same name registration keeps the higher score automatically'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4"
            >
              {submitResult?.saved && submitResult.rank ? (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-3xl p-4 text-center shadow-lg"
                >
                  <motion.div
                    animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-4xl mb-1.5"
                  >
                    {submitResult.rank <= 3 ? ["🥇", "🥈", "🥉"][submitResult.rank - 1] : "🎉"}
                  </motion.div>
                  <p className="font-black text-emerald-700 text-lg">{submitResult.rank}위 등록 완료!</p>
                  <p className="text-emerald-600 text-sm mt-1">
                    <strong>{playerName}</strong>님 — <LevelBadge level={submitResult.newLevel} size="md" /> 획득!
                  </p>
                  {/* 레벨업 축하 */}
                  {submitResult.levelUp && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.4, type: "spring" }}
                      className="mt-2 inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-black"
                    >
                      🎊 레벨 업! Lv.{submitResult.prevLevel} → Lv.{submitResult.newLevel}
                    </motion.div>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setPhase("input")}
                    className="mt-2.5 flex items-center gap-1.5 mx-auto text-xs text-emerald-600 font-semibold"
                  >
                    <RotateCcw className="w-3 h-3" />
                    이름 수정하기
                  </motion.button>
                </motion.div>
              ) : submitResult?.saved === false ? (
                <div className="bg-gray-50 border border-gray-200 rounded-3xl p-4 text-center text-sm text-gray-600">
                  <p className="font-bold mb-1">아쉽게도 TOP 5에 들지 못했어요 😢</p>
                  <p>5위 기준: <strong>{cutoff.toLocaleString()}점</strong> — 더 높은 점수에 도전해보세요!</p>
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 게시판 목록 ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-gray-100 rounded-3xl p-5 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-gray-800 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              실시간 순위
            </h3>
            <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-semibold">
              TOP 5
            </span>
          </div>

          {board.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-5xl mb-3">🏆</div>
              <p className="text-gray-500 text-sm font-semibold">아직 기록이 없어요!</p>
              <p className="text-gray-400 text-xs mt-1">첫 번째 전설이 되어보세요</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {board.map((entry, idx) => {
                const style  = RANK_STYLES[idx] ?? RANK_STYLES[4];
                const lColor = getLevelColor(entry.level);
                const isMe   = phase === "result" && submitResult?.saved && entry.name === playerName.trim();
                const entryExp = getExpInLevel(entry.score);
                const entryExpPct = Math.round((entryExp / SCORE_PER_LEVEL) * 100);

                return (
                  <motion.div
                    key={`${entry.name}-${entry.score}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.07 }}
                    className={`relative rounded-2xl border-2 shadow-md transition-all overflow-hidden ${
                      isMe
                        ? `bg-gradient-to-r ${style.bg} ${style.border} ring-2 ring-offset-1 ${style.ringColor}`
                        : `bg-gradient-to-r ${style.bg} ${style.border}`
                    }`}
                  >
                    {/* 1위 왕관 */}
                    {idx === 0 && (
                      <motion.div
                        className="absolute -top-1 -right-1"
                        animate={{ rotate: [-5, 5, -5], y: [0, -2, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <span className="text-lg">👑</span>
                      </motion.div>
                    )}

                    {/* 레벨 색상 인디케이터 (왼쪽 라인) */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                      style={{ background: lColor.glow }}
                    />

                    <div className="pl-4 pr-4 py-3">
                      {/* 메인 행: 순위아이콘 + 이름/레벨 + 점수 */}
                      <div className="flex items-center gap-3">
                        {/* 순위 아이콘 */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm border-2 ${style.border} flex-shrink-0`}>
                          <RankIcon rank={entry.rank} />
                        </div>

                        {/* 이름 + 레벨 + 출처 */}
                        <div className="flex-1 min-w-0">
                          {/* 이름 행 */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`font-black text-base truncate ${style.textColor}`}>
                              {entry.name}
                            </span>
                            <LevelBadge level={entry.level} size="sm" />
                            {isMe && (
                              <span className="flex items-center gap-0.5 text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">
                                <CheckCircle className="w-2.5 h-2.5" />
                                나
                              </span>
                            )}
                          </div>
                          {/* 칭호 + 출처 행 */}
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className={`text-[10px] font-semibold ${lColor.text}`}>
                              {getLevelTitle(entry.level)}
                            </span>
                            <span className="text-gray-300">·</span>
                            {entry.source === "chat" ? (
                              <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full font-semibold">
                                💬 {entry.characterName ?? "인물 대화"}
                              </span>
                            ) : (
                              <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-semibold">
                                📚 퀴즈
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 총점 */}
                        <div className="text-right flex-shrink-0">
                          <span className={`text-xl font-black ${style.textColor}`}>
                            {entry.score.toLocaleString()}
                          </span>
                          <p className="text-[10px] text-gray-400 font-semibold">총점</p>
                        </div>
                      </div>

                      {/* EXP 진행 바 */}
                      <div className="mt-2">
                        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                          <span className={`font-semibold ${lColor.text}`}>EXP {entryExp.toLocaleString()}/{SCORE_PER_LEVEL.toLocaleString()}</span>
                          <span>{entryExpPct}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${lColor.bg}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${entryExpPct}%` }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.1 }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* 빈 자리 (5위 미만) */}
              {board.length < 5 &&
                Array.from({ length: 5 - board.length }).map((_, i) => {
                  const rank = board.length + i + 1;
                  return (
                    <motion.div
                      key={`empty-${i}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: (board.length + i) * 0.07 }}
                      className="rounded-2xl p-3.5 border-2 border-dashed border-gray-200 bg-gray-50/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-gray-300 font-bold text-sm">{rank}</span>
                        </div>
                        <div>
                          <span className="text-gray-300 text-sm font-semibold italic">도전자를 기다리는 중...</span>
                          <div className="h-1 bg-gray-100 rounded-full mt-1.5 w-32" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          )}
        </motion.div>

        {/* ── 레벨 안내 ────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 bg-white/60 border border-gray-100 rounded-2xl p-3.5 shadow-sm"
        >
          <p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-violet-500" />
            레벨 시스템
          </p>
          <div className="grid grid-cols-3 gap-1.5 text-[10px] text-center">
            {[
              { lv: 1, title: "역사 새싹" },
              { lv: 2, title: "역사 입문자" },
              { lv: 3, title: "역사 학자" },
              { lv: 5, title: "역사 탐험가" },
              { lv: 7, title: "역사 마스터" },
              { lv: 10, title: "역사의 신" },
            ].map(({ lv, title }) => {
              const c = getLevelColor(lv);
              return (
                <div key={lv} className={`rounded-xl px-2 py-1.5 border ${c.border} bg-white`}>
                  <span className={`${c.bg} text-white text-[9px] font-bold px-1.5 py-0.5 rounded-lg inline-block mb-0.5`}>
                    Lv.{lv}
                  </span>
                  <p className={`font-semibold ${c.text} text-[9px]`}>{title}</p>
                </div>
              );
            })}
          </div>
          <p className="text-center text-[10px] text-gray-400 mt-2">
            ⚡ 10,000점마다 레벨 1 상승 · 퀴즈 & 역사 인물 대화로 점수 획득
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
