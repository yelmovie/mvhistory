import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, RefreshCw, Trophy, Users, Star, BarChart2,
  Mail, ChevronDown, ChevronUp, Shield, AlertCircle, Download,
  TrendingUp, Award, MessageSquare, Image as ImageIcon,
} from "lucide-react";

// ── 상수 ──────────────────────────────────────────────────────────
const _SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://ngvsfcekfzzykvcsjktp.supabase.co";
// 서버 배포 전까지 비활성화
const SERVER_ENABLED = false;
const SERVER_BASE = SERVER_ENABLED ? `${_SUPABASE_URL}/functions/v1/make-server-48be01a5` : null;

// 개발자 비밀 코드 — 환경변수로 관리하거나 직접 입력
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || "mvhistory-admin-2025";

// ── 타입 ──────────────────────────────────────────────────────────
interface UserStat {
  userId: string;
  cardCount: number;
  percent: number;
}

interface FeedbackItem {
  userId: string;
  message: string;
  requestedAt: string;
}

interface StatsData {
  totalCards: number;
  totalUsers: number;
  completedUsers: number;
  completedUserIds: string[];
  topUsers: UserStat[];
  distribution: Record<string, number>;
  feedbackCount: number;
  feedbackList: FeedbackItem[];
}

// ── 막대 그래프 ────────────────────────────────────────────────────
function BarRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.max((value / max) * 100, value > 0 ? 4 : 0) : 0;
  return (
    <div className="flex items-center gap-3">
      <p className="text-xs font-bold text-gray-500 w-16 text-right flex-shrink-0">{label}</p>
      <div className="flex-1 h-7 bg-gray-100 rounded-lg overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-lg flex items-center px-2"
          style={{ background: color, minWidth: value > 0 ? 28 : 0 }}
        >
          {value > 0 && <span className="text-white text-[10px] font-black">{value}</span>}
        </motion.div>
      </div>
      <p className="text-xs font-bold text-gray-700 w-8">{value}명</p>
    </div>
  );
}

// ── 통계 카드 ─────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: typeof Trophy;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <p className="text-xs text-gray-500 font-semibold">{label}</p>
      </div>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────
interface AdminDashboardProps {
  onBack: () => void;
  onGoToImages?: () => void;
}

export function AdminDashboard({ onBack, onGoToImages }: AdminDashboardProps) {
  const [authState, setAuthState] = useState<"input" | "loading" | "ok" | "error">("input");
  const [secretInput, setSecretInput] = useState("");
  const [data, setData] = useState<StatsData | null>(null);
  const [loadError, setLoadError] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = useCallback(async (secret: string) => {
    setAuthState("loading");
    setLoadError("");
    if (!SERVER_BASE) {
      setAuthState("error");
      setLoadError("서버가 아직 배포되지 않았습니다. 로컬 데이터만 사용 가능합니다.");
      return;
    }
    try {
      const res = await fetch(`${SERVER_BASE}/admin/completion-stats`, {
        headers: {
          "X-Admin-Secret": secret,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(12000),
      });
      if (res.status === 401) {
        setAuthState("error");
        setLoadError("비밀 코드가 올바르지 않습니다.");
        return;
      }
      if (!res.ok) throw new Error(`서버 오류: ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "알 수 없는 오류");
      setData(json.data);
      setAuthState("ok");
      setLastUpdated(new Date());
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (authState !== "error") {
        setLoadError(`데이터를 불러오지 못했습니다: ${msg}`);
        setAuthState("error");
      }
    }
  }, [authState]);

  const handleLogin = () => {
    if (!secretInput.trim()) return;
    fetchStats(secretInput.trim());
  };

  const handleRefresh = () => {
    if (secretInput) fetchStats(secretInput);
  };

  const exportCSV = () => {
    if (!data) return;
    const rows = [
      ["userId", "카드수", "달성률(%)"],
      ...data.topUsers.map(u => [u.userId, u.cardCount, u.percent]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mvhistory-stats-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const DIST_COLORS: Record<string, string> = {
    "0-24%":  "#E5E7EB",
    "25-49%": "#FCD34D",
    "50-74%": "#34D399",
    "75-99%": "#60A5FA",
    "100%":   "#F59E0B",
  };

  const maxDist = data ? Math.max(...Object.values(data.distribution), 1) : 1;
  const completionRate = data && data.totalUsers > 0
    ? ((data.completedUsers / data.totalUsers) * 100).toFixed(1)
    : "0";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            <h1 className="font-black text-lg text-gray-900">개발자 대시보드</h1>
          </div>
          {onGoToImages && (
            <button
              onClick={onGoToImages}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
            >
              <ImageIcon className="w-4 h-4" />
              이미지 관리
            </button>
          )}
          {authState === "ok" && (
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
            >
              <RefreshCw className="w-4 h-4" />
              새로고침
            </button>
          )}
          {authState !== "ok" && <div className="w-20" />}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* ── 로그인 ── */}
        <AnimatePresence mode="wait">
          {authState !== "ok" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden"
            >
              {/* 상단 색상 바 */}
              <div className="h-2 bg-gradient-to-r from-indigo-600 to-purple-600" />
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-indigo-600" />
                </div>
                <h2 className="text-xl font-black text-gray-900 mb-2">개발자 인증</h2>
                <p className="text-sm text-gray-500 mb-6">
                  이 페이지는 개발자 전용입니다.<br />비밀 코드를 입력해주세요.
                </p>

                <div className="flex gap-2 max-w-sm mx-auto">
                  <input
                    type="password"
                    value={secretInput}
                    onChange={e => setSecretInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                    placeholder="비밀 코드 입력..."
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleLogin}
                    disabled={authState === "loading"}
                    className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm disabled:opacity-60 flex items-center gap-2"
                  >
                    {authState === "loading" ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      "입장"
                    )}
                  </motion.button>
                </div>

                {loadError && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 max-w-sm mx-auto"
                  >
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-600">{loadError}</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── 통계 대시보드 ── */}
          {authState === "ok" && data && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* 업데이트 시각 */}
              {lastUpdated && (
                <p className="text-xs text-gray-400 text-right">
                  마지막 업데이트: {lastUpdated.toLocaleString("ko-KR")}
                </p>
              )}

              {/* ── 핵심 지표 카드 ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                  icon={Users}
                  label="전체 학습자"
                  value={data.totalUsers}
                  sub="카드 수령 경험"
                  color="#6366F1"
                />
                <StatCard
                  icon={Trophy}
                  label="210장 완성자"
                  value={data.completedUsers}
                  sub={`완성율 ${completionRate}%`}
                  color="#F59E0B"
                />
                <StatCard
                  icon={Star}
                  label="전체 카드 수"
                  value={`${data.totalCards}장`}
                  sub="수집 가능 인물"
                  color="#10B981"
                />
                <StatCard
                  icon={MessageSquare}
                  label="추가 요청 수"
                  value={data.feedbackCount}
                  sub="개발자 연락"
                  color="#EF4444"
                />
              </div>

              {/* ── 수집률 분포 ── */}
              <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-black text-gray-900">카드 수집률 분포</h3>
                  <span className="ml-auto text-xs text-gray-400">{data.totalUsers}명 기준</span>
                </div>
                <div className="space-y-3">
                  {Object.entries(data.distribution).map(([label, count]) => (
                    <BarRow
                      key={label}
                      label={label}
                      value={count}
                      max={maxDist}
                      color={DIST_COLORS[label] || "#6366F1"}
                    />
                  ))}
                </div>
              </div>

              {/* ── 210장 완성자 목록 ── */}
              {data.completedUsers > 0 && (
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => setShowCompleted(v => !v)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-500" />
                      <h3 className="font-black text-gray-900">
                        210장 완성자 목록
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                        {data.completedUsers}명
                      </span>
                    </div>
                    {showCompleted ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  <AnimatePresence>
                    {showCompleted && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-4 space-y-2">
                          {data.completedUserIds.map((uid, i) => (
                            <div key={uid} className="flex items-center gap-3 py-2 px-3 rounded-xl bg-amber-50 border border-amber-100">
                              <span className="text-lg">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏅"}</span>
                              <p className="text-sm font-bold text-gray-800 flex-1 truncate">{uid}</p>
                              <span className="text-xs font-black text-amber-600">210/210</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* ── TOP 20 학습자 ── */}
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-black text-gray-900">TOP 20 학습자</h3>
                  </div>
                  <button
                    onClick={exportCSV}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    CSV
                  </button>
                </div>
                <div className="divide-y divide-gray-50">
                  {data.topUsers.slice(0, 20).map((u, i) => (
                    <div key={u.userId} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                          i === 0 ? "bg-amber-100 text-amber-700" :
                          i === 1 ? "bg-gray-200 text-gray-700" :
                          i === 2 ? "bg-orange-100 text-orange-700" :
                          "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {i + 1}
                      </div>
                      <p className="text-sm text-gray-700 flex-1 truncate font-medium">{u.userId}</p>
                      <div className="flex items-center gap-2">
                        {/* 미니 게이지 */}
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${u.percent}%` }}
                            transition={{ duration: 0.6, delay: i * 0.04 }}
                            className="h-full rounded-full"
                            style={{
                              background: u.percent >= 100
                                ? "linear-gradient(90deg,#F59E0B,#EF4444)"
                                : "linear-gradient(90deg,#6366F1,#8B5CF6)",
                            }}
                          />
                        </div>
                        <span className={`text-xs font-black w-14 text-right ${u.percent >= 100 ? "text-amber-600" : "text-indigo-600"}`}>
                          {u.cardCount}/{data.totalCards}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── 피드백 목록 ── */}
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setShowFeedback(v => !v)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-pink-500" />
                    <h3 className="font-black text-gray-900">학습자 요청 메시지</h3>
                    <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 text-xs font-bold">
                      {data.feedbackCount}건
                    </span>
                  </div>
                  {showFeedback ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                <AnimatePresence>
                  {showFeedback && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 space-y-2 max-h-80 overflow-y-auto">
                        {data.feedbackList.length === 0 ? (
                          <p className="text-sm text-gray-400 text-center py-4">아직 요청이 없습니다.</p>
                        ) : (
                          data.feedbackList.map((f, i) => (
                            <div key={i} className="p-3 rounded-xl bg-pink-50 border border-pink-100">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-bold text-pink-700 truncate">{f.userId}</p>
                                <p className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
                                  {new Date(f.requestedAt).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </p>
                              </div>
                              <p className="text-sm text-gray-700">{f.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── 안내 ── */}
              <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
                <p className="text-xs text-indigo-700 leading-relaxed">
                  <strong>비밀 코드 변경:</strong> Supabase Edge Function 환경변수 <code className="bg-indigo-100 px-1 rounded">ADMIN_SECRET</code>을 수정하거나,
                  프론트엔드 환경변수 <code className="bg-indigo-100 px-1 rounded">VITE_ADMIN_SECRET</code>을 설정하세요.<br />
                  기본값: <code className="bg-indigo-100 px-1 rounded">mvhistory-admin-2025</code>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
