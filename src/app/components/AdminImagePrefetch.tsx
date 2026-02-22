/**
 * AdminImagePrefetch — prefetch and manage quiz images.
 *
 * Provides:
 *  - Bulk prefetch all quiz items (calls /prefetch for each, respecting concurrency)
 *  - Per-item "Swap image" button (cycles primary_url among alternates, no API call)
 *  - Progress display
 *
 * Usage: render inside any admin-only route/page.
 */

import { useState } from "react";
import { triggerPrefetch, swapQuizImage } from "../utils/quizImageService";
import { quizData } from "../data/quizData";

// Flatten all quiz items from all categories
const ALL_ITEMS = Object.values(quizData)
  .flat()
  .map((q) => ({ id: q.id, question: q.question, answer: q.answer, category: q.category }));

const CONCURRENCY = 3; // parallel prefetch workers

async function runPool<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number,
  onDone: (completed: number, total: number) => void,
): Promise<T[]> {
  const results: T[] = [];
  let index = 0;
  let completed = 0;
  const total = tasks.length;

  async function worker() {
    while (index < total) {
      const i = index++;
      const result = await tasks[i]();
      results[i] = result;
      onDone(++completed, total);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

interface ItemStatus {
  id: number;
  question: string;
  category: string;
  state: "idle" | "loading" | "done" | "error";
  primaryUrl?: string;
  provider?: string;
}

export function AdminImagePrefetch() {
  const [items, setItems] = useState<ItemStatus[]>(
    ALL_ITEMS.map((q) => ({ id: q.id, question: q.question, category: q.category, state: "idle" })),
  );
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [swapLoading, setSwapLoading] = useState<number | null>(null);

  const updateItem = (id: number, patch: Partial<ItemStatus>) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  const handleBulkPrefetch = async () => {
    setRunning(true);
    setProgress({ completed: 0, total: ALL_ITEMS.length });

    // Mark all idle
    setItems((prev) => prev.map((it) => ({ ...it, state: "idle" as const })));

    const tasks = ALL_ITEMS.map((item) => async () => {
      updateItem(item.id, { state: "loading" });
      const result = await triggerPrefetch(item);
      if (result) {
        updateItem(item.id, { state: "done", primaryUrl: result.primaryUrl, provider: result.provider });
      } else {
        updateItem(item.id, { state: "error" });
      }
      return result;
    });

    await runPool(tasks, CONCURRENCY, (completed, total) =>
      setProgress({ completed, total }),
    );

    setRunning(false);
  };

  const handleSwap = async (id: number) => {
    setSwapLoading(id);
    const result = await swapQuizImage(id);
    if (result) {
      updateItem(id, { primaryUrl: result.primaryUrl });
    }
    setSwapLoading(null);
  };

  const done = items.filter((it) => it.state === "done").length;
  const errors = items.filter((it) => it.state === "error").length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">이미지 사전 생성 (관리자)</h2>
      <p className="text-sm text-gray-500 mb-4">
        퀴즈 플레이 중 API 호출 없이 이미지가 즉시 표시됩니다. 전체 사전 생성 후 배포하세요.
      </p>

      {/* Progress bar */}
      {running && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>처리 중... {progress.completed}/{progress.total}</span>
            <span>{Math.round((progress.completed / Math.max(progress.total, 1)) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-indigo-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(progress.completed / Math.max(progress.total, 1)) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex gap-4 text-sm mb-4">
        <span className="text-green-600 font-semibold">✓ 완료: {done}</span>
        <span className="text-red-500 font-semibold">✗ 오류: {errors}</span>
        <span className="text-gray-500">전체: {ALL_ITEMS.length}</span>
      </div>

      {/* Actions */}
      <button
        onClick={handleBulkPrefetch}
        disabled={running}
        className="mb-6 px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold
          disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
      >
        {running ? "사전 생성 중..." : "전체 이미지 사전 생성 시작"}
      </button>

      {/* Item list */}
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white"
          >
            {/* Thumbnail */}
            <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              {item.primaryUrl ? (
                <img src={item.primaryUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                  {item.state === "loading" ? "⏳" : "—"}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-400 mb-0.5">
                #{item.id} · {item.category}
                {item.provider && (
                  <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium
                    ${item.provider === "google" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                    {item.provider}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-700 truncate">{item.question}</p>
            </div>

            {/* Status + Swap */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {item.state === "done" && (
                <button
                  onClick={() => handleSwap(item.id)}
                  disabled={swapLoading === item.id}
                  className="text-xs px-2 py-1 rounded-lg border border-gray-300 hover:bg-gray-50
                    disabled:opacity-50 transition-colors"
                  title="다른 이미지로 교체"
                >
                  {swapLoading === item.id ? "⏳" : "🔄 교체"}
                </button>
              )}
              <span className="text-lg" title={item.state}>
                {item.state === "idle" && "○"}
                {item.state === "loading" && "⏳"}
                {item.state === "done" && "✅"}
                {item.state === "error" && "❌"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
