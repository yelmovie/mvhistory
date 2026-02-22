/**
 * Quiz image service — instant-read architecture.
 *
 * During gameplay: calls /by-item (pure DB read, no API) → instant.
 * Background prefetch: calls /prefetch (Google Search, stored once).
 * No AI image generation during gameplay.
 */

const _rawSupabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ?? "https://ngvsfcekfzzykvcsjktp.supabase.co";
const SUPABASE_URL = _rawSupabaseUrl.replace(/\/functions\/v1.*$/, "").replace(/\/$/, "");
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";
const FUNCTIONS_BASE = `${SUPABASE_URL}/functions/v1/make-server-48be01a5`;

// ---------------------------------------------------------------------------
// Fallback images by category (shown before DB resolves)
// ---------------------------------------------------------------------------
const CATEGORY_FALLBACKS: Record<string, string> = {
  고조선: "https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=1024&q=80",
  청동기시대: "https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=1024&q=80",
  철기시대: "https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=1024&q=80",
  부여: "https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=1024&q=80",
  삼국시대: "https://images.unsplash.com/photo-1578469550956-0e16b69c6a3d?w=1024&q=80",
  고구려: "https://images.unsplash.com/photo-1583149577728-9ba4bb93b0b0?w=1024&q=80",
  백제: "https://images.unsplash.com/photo-1578469550956-0e16b69c6a3d?w=1024&q=80",
  신라: "https://images.unsplash.com/photo-1578469550956-0e16b69c6a3d?w=1024&q=80",
  통일신라: "https://images.unsplash.com/photo-1578469550956-0e16b69c6a3d?w=1024&q=80",
  고려: "https://images.unsplash.com/photo-1583149577728-9ba4bb93b0b0?w=1024&q=80",
  고려시대: "https://images.unsplash.com/photo-1583149577728-9ba4bb93b0b0?w=1024&q=80",
  조선: "https://images.unsplash.com/photo-1693928105595-b323b02791ff?w=1024&q=80",
  조선시대: "https://images.unsplash.com/photo-1693928105595-b323b02791ff?w=1024&q=80",
  근현대: "https://images.unsplash.com/photo-1583562835057-b06c1c4d0c3f?w=1024&q=80",
  인물: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1024&q=80",
};
const DEFAULT_FALLBACK =
  "https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=1024&q=80";

export function getFallbackImageUrl(category?: string): string {
  if (!category) return DEFAULT_FALLBACK;
  for (const [key, url] of Object.entries(CATEGORY_FALLBACKS)) {
    if (category.includes(key) || key.includes(category)) return url;
  }
  return DEFAULT_FALLBACK;
}

// ---------------------------------------------------------------------------
// Era / topic mapping
// ---------------------------------------------------------------------------
interface EraInfo { era: string; topic: string }

const CATEGORY_TO_ERA: Record<string, EraInfo> = {
  고조선:   { era: "고조선",        topic: "고조선 문명" },
  청동기시대: { era: "고조선",       topic: "청동기 문화" },
  철기시대: { era: "삼국시대 이전",  topic: "철기 문화" },
  부여:     { era: "삼국시대 이전",  topic: "부여 왕국" },
  옥저:     { era: "삼국시대 이전",  topic: "옥저" },
  동예:     { era: "삼국시대 이전",  topic: "동예" },
  삼한:     { era: "삼국시대 이전",  topic: "삼한" },
  고구려:   { era: "삼국시대",       topic: "고구려" },
  백제:     { era: "삼국시대",       topic: "백제" },
  신라:     { era: "삼국시대",       topic: "신라" },
  삼국시대: { era: "삼국시대",       topic: "삼국 문화" },
  통일신라: { era: "통일신라",       topic: "통일신라 불교 문화" },
  발해:     { era: "통일신라",       topic: "발해" },
  고려:     { era: "고려시대",       topic: "고려 문화" },
  고려시대: { era: "고려시대",       topic: "고려 문화" },
  조선:     { era: "조선시대",       topic: "조선 유교 문화" },
  조선시대: { era: "조선시대",       topic: "조선 유교 문화" },
  근현대:   { era: "근현대",         topic: "한국 근현대사" },
  인물:     { era: "조선시대",       topic: "역사 인물" },
};

export function categoryToEraInfo(category?: string): EraInfo {
  if (!category) return { era: "한국 역사", topic: "한국 문화" };
  if (CATEGORY_TO_ERA[category]) return CATEGORY_TO_ERA[category];
  for (const [key, info] of Object.entries(CATEGORY_TO_ERA)) {
    if (category.includes(key) || key.includes(category)) return info;
  }
  return { era: "한국 역사", topic: category };
}

// ---------------------------------------------------------------------------
// Keyword extraction (used when building prefetch requests)
// ---------------------------------------------------------------------------
const HISTORICAL_KEYWORD_MAP: Array<{ kr: string; keywords: string[] }> = [
  { kr: "고조선",   keywords: ["고조선", "단군"] },
  { kr: "단군",     keywords: ["단군왕검", "고조선"] },
  { kr: "고구려",   keywords: ["고구려", "광개토대왕"] },
  { kr: "백제",     keywords: ["백제", "석탑"] },
  { kr: "신라",     keywords: ["신라", "불국사"] },
  { kr: "통일신라", keywords: ["통일신라", "석굴암"] },
  { kr: "고려",     keywords: ["고려", "청자"] },
  { kr: "세종",     keywords: ["세종대왕", "훈민정음", "한글"] },
  { kr: "한글",     keywords: ["한글", "훈민정음"] },
  { kr: "불국사",   keywords: ["불국사", "석가탑"] },
  { kr: "첨성대",   keywords: ["첨성대", "신라"] },
  { kr: "석굴암",   keywords: ["석굴암", "불상"] },
  { kr: "거북선",   keywords: ["거북선", "이순신"] },
  { kr: "이순신",   keywords: ["이순신", "거북선", "임진왜란"] },
  { kr: "독립",     keywords: ["독립운동", "만세"] },
  { kr: "3.1운동",  keywords: ["3.1운동", "독립"] },
  { kr: "임진왜란", keywords: ["임진왜란", "조선"] },
  { kr: "팔만대장경", keywords: ["팔만대장경", "고려"] },
  { kr: "청자",     keywords: ["고려청자", "청자"] },
  { kr: "백자",     keywords: ["조선백자", "백자"] },
  { kr: "경복궁",   keywords: ["경복궁", "궁궐"] },
  { kr: "훈민정음", keywords: ["훈민정음", "세종대왕"] },
  { kr: "금속활자", keywords: ["금속활자", "직지"] },
  { kr: "무용총",   keywords: ["무용총", "고구려", "벽화"] },
  { kr: "살수대첩", keywords: ["살수대첩", "을지문덕"] },
  { kr: "황산벌",   keywords: ["황산벌", "계백"] },
];

export function extractKeywordsFromText(text: string, category?: string): string[] {
  const found: string[] = [];
  for (const { kr, keywords } of HISTORICAL_KEYWORD_MAP) {
    if (text.includes(kr)) {
      found.push(...keywords);
      if (found.length >= 4) break;
    }
  }
  if (found.length === 0 && category) found.push(category);
  return [...new Set(found)].slice(0, 4);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface QuizImageResult {
  primaryUrl: string;
  alt1Url?: string | null;
  alt2Url?: string | null;
  provider?: string;
  prefetched: boolean;
  /** @deprecated use primaryUrl */
  publicUrl: string;
}

// ---------------------------------------------------------------------------
// INSTANT READ — returns category-based fallback immediately (no API call)
// ---------------------------------------------------------------------------
/**
 * Returns a category-based fallback image instantly.
 * No external API calls during gameplay.
 */
export async function getQuizImageInstant(item: {
  id: number | string;
  question: string;
  answer?: string;
  category?: string;
  imagePrompt?: string;
}): Promise<QuizImageResult> {
  const fallback = getFallbackImageUrl(item.category);
  return { primaryUrl: fallback, publicUrl: fallback, prefetched: false };
}

// ---------------------------------------------------------------------------
// BACKGROUND PREFETCH — no-op stubs (API removed, kept for import compat)
// ---------------------------------------------------------------------------
export async function triggerPrefetch(_item: {
  id: number | string;
  question: string;
  answer?: string;
  category?: string;
  imagePrompt?: string;
}): Promise<{ primaryUrl: string; provider: string } | null> {
  return null;
}

export function prefetchUpcoming(
  _items: Array<{ id: number | string; question: string; answer?: string; category?: string }>,
  _count = 5,
) {
  // no-op: prefetch endpoints removed
}

// ---------------------------------------------------------------------------
// Admin: swap image — no-op stub
// ---------------------------------------------------------------------------
export async function swapQuizImage(_quizItemId: string | number): Promise<{
  primaryUrl: string;
  alt1Url: string | null;
  alt2Url: string | null;
} | null> {
  return null;
}

// ---------------------------------------------------------------------------
// Legacy compat — kept so existing imports don't break
// ---------------------------------------------------------------------------
export interface QuizImageRequest {
  quizItemId?: string | number;
  era: string;
  topic: string;
  keywords: string[];
  styleHints?: string;
}

/** @deprecated Use getQuizImageInstant instead */
export async function getQuizImage(req: QuizImageRequest): Promise<{ publicUrl: string; status: string; source?: string }> {
  const fallback = DEFAULT_FALLBACK;
  try {
    if (req.quizItemId) {
      const res = await fetch(
        `${FUNCTIONS_BASE}/quiz-image/by-item?quizItemId=${encodeURIComponent(String(req.quizItemId))}`,
        { headers: { Authorization: `Bearer ${ANON_KEY}` }, signal: AbortSignal.timeout(4_000) },
      );
      if (res.ok) {
        const d = await res.json();
        if (d.primaryUrl) return { publicUrl: d.primaryUrl, status: "ready", source: d.provider };
      }
    }
  } catch { /* ignore */ }
  return { publicUrl: fallback, status: "fallback" };
}

/** @deprecated Use getQuizImageInstant instead */
export async function getQuizImageFromItem(item: {
  id: number | string;
  question: string;
  answer?: string;
  category?: string;
  imagePrompt?: string;
}): Promise<{ publicUrl: string; status: string; source?: string }> {
  const r = await getQuizImageInstant(item);
  return { publicUrl: r.primaryUrl, status: r.prefetched ? "ready" : "fallback", source: r.provider };
}
